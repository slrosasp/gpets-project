package com.github.slrosasp.gpets.controller;

import com.github.slrosasp.gpets.dto.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.database.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/owners")
public class OwnersController {

    @Autowired
    private FirebaseAuth firebaseAuth;

    @Autowired
    private DatabaseReference firebaseDatabase;

    // ===========================================
    // POST /api/owners - Registrar/completar perfil del dueño
    // ===========================================
    @PostMapping
    public CompletableFuture<ResponseEntity<?>> registerOwner(@RequestBody OwnerDto ownerDto, @RequestHeader("Authorization") String authHeader) {

        return CompletableFuture.supplyAsync(() -> {
            try {
                String token = authHeader.replace("Bearer ", "");
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
                String uid = decodedToken.getUid();
                String email = decodedToken.getEmail();
                String nombre = decodedToken.getName() != null ? decodedToken.getName() : ownerDto.getDisplayName();

                System.out.println("✅ POST /api/owners - Registrando dueño: " + email);

                DatabaseReference duenoRef = firebaseDatabase.child("owners").child(uid);

                CompletableFuture<ResponseEntity<?>> future = new CompletableFuture<>();

                duenoRef.addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        Map<String, Object> duenoData = new HashMap<>();

                        duenoData.put("uid", uid);
                        duenoData.put("email", email);
                        duenoData.put("nombre", nombre);
                        duenoData.put("fotoUrl", ownerDto.getFotoUrl() != null ? ownerDto.getFotoUrl() : decodedToken.getPicture());

                        duenoData.put("telefono", ownerDto.getTelefono());
                        duenoData.put("fechaNacimiento", ownerDto.getFechaNacimiento());
                        duenoData.put("direccion", ownerDto.getDireccion());
                        duenoData.put("ciudad", ownerDto.getCiudad());
                        duenoData.put("pais", ownerDto.getPais());
                        duenoData.put("codigoPostal", ownerDto.getCodigoPostal());
                        duenoData.put("fechaRegistro", snapshot.exists() ? snapshot.child("fechaRegistro").getValue() : System.currentTimeMillis());
                        duenoData.put("ultimoAcceso", System.currentTimeMillis());
                        duenoData.put("perfilCompleto", true);

                        if (!snapshot.exists()) {
                            duenoData.put("mascotas", new HashMap<>());
                        }

                        duenoRef.setValue(duenoData, (error, ref) -> {
                            if (error == null) {
                                Map<String, String> response = Map.of(
                                        "message", "Perfil de dueño registrado exitosamente",
                                        "uid", uid
                                );
                                future.complete(ResponseEntity.ok(response));
                            } else {
                                future.completeExceptionally(error.toException());
                            }
                        });
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {
                        future.completeExceptionally(error.toException());
                    }
                });

                return future.join();

            } catch (FirebaseAuthException e) {
                System.err.println("Token inválido: " + e.getMessage());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token de Firebase inválido");
            }
        });
    }

    // ===========================================
    // GET /api/owners/me - Obtener perfil del dueño actual
    // ===========================================
    @GetMapping("/me")
    public CompletableFuture<ResponseEntity<?>> getMyProfile(@RequestHeader("Authorization") String authHeader) {

        return CompletableFuture.supplyAsync(() -> {
            try{
                String token = authHeader.replace("Bearer ", "");
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
                String uid = decodedToken.getUid();

                System.out.println("✅ GET /api/owners/me - Cargando perfil de: " + uid);

                DatabaseReference duenoRef = firebaseDatabase.child("owners").child(uid);
                CompletableFuture<ResponseEntity<?>> future = new CompletableFuture<>();

                duenoRef.addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        if(snapshot.exists()){

                            Map<String, Object> ownerData = new HashMap<>();

                            ownerData.put("uid", uid);
                            ownerData.put("email", snapshot.child("email").getValue(String.class));
                            ownerData.put("nombre", snapshot.child("nombre").getValue(String.class));
                            ownerData.put("fotoUrl", snapshot.child("fotoUrl").getValue(String.class));
                            ownerData.put("telefono", snapshot.child("telefono").getValue(String.class));
                            ownerData.put("fechaNacimiento", snapshot.child("fechaNacimiento").getValue(String.class));
                            ownerData.put("direccion", snapshot.child("direccion").getValue(String.class));
                            ownerData.put("ciudad", snapshot.child("ciudad").getValue(String.class));
                            ownerData.put("pais", snapshot.child("pais").getValue(String.class));
                            ownerData.put("codigoPostal", snapshot.child("codigoPostal").getValue(String.class));

                            ownerData.put("emailNotifications",
                                    snapshot.child("emailNotifications").getValue(Boolean.class) != null ?
                                            snapshot.child("emailNotifications").getValue(Boolean.class) : false);
                            ownerData.put("smsNotifications",
                                    snapshot.child("smsNotifications").getValue(Boolean.class) != null ?
                                            snapshot.child("smsNotifications").getValue(Boolean.class) : false);
                            ownerData.put("promoEmails",
                                    snapshot.child("promoEmails").getValue(Boolean.class) != null ?
                                            snapshot.child("promoEmails").getValue(Boolean.class) : false);

                            ownerData.put("fechaRegistro", snapshot.child("fechaRegistro").getValue());
                            ownerData.put("ultimoAcceso", snapshot.child("ultimoAcceso").getValue());
                            ownerData.put("perfilCompleto",
                                    snapshot.child("perfilCompleto").getValue(Boolean.class) != null ?
                                            snapshot.child("perfilCompleto").getValue(Boolean.class) : true);

                            future.complete(ResponseEntity.ok(ownerData));

                        }else{
                            System.out.println("⚠️ Perfil no encontrado para: " + uid);
                            future.complete(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                    .body(Map.of("message", "Perfil no encontrado")));
                        }
                    }

                    @Override
                    public void onCancelled(DatabaseError error){
                        System.err.println("Error en Firebase: " + error.getMessage());
                        future.completeExceptionally(error.toException());
                    }
                });

                return future.join();

            }catch (FirebaseAuthException e){
                System.err.println("Token inválido: " + e.getMessage());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido");
            }
        });
    }
}
