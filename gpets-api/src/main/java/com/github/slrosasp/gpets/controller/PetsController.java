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

import java.util.*;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/pets")
public class PetsController {

    @Autowired
    private FirebaseAuth firebaseAuth;

    @Autowired
    private DatabaseReference firebaseDatabase;

    // ===========================================
    // GET /api/pets - Obtener todas las mascotas
    // GET /api/pets?ownerId=uid123 - Filtrar por dueño
    // ===========================================
    @GetMapping
    public CompletableFuture<ResponseEntity<?>> getPets(@RequestParam(required = false) String ownerId, @RequestHeader("Authorization") String authHeader) {

        return CompletableFuture.supplyAsync(() -> {
            try {

                String token = authHeader.replace("Bearer ", "");
                firebaseAuth.verifyIdToken(token);

                DatabaseReference petsRef = firebaseDatabase.child("pets");
                CompletableFuture<ResponseEntity<?>> future = new CompletableFuture<>();

                if (ownerId != null && !ownerId.isEmpty()) {

                    Query query = petsRef.orderByChild("ownerId").equalTo(ownerId);
                    query.addListenerForSingleValueEvent(new ValueEventListener() {
                        @Override
                        public void onDataChange(DataSnapshot snapshot) {
                            List<Map<String, Object>> pets = new ArrayList<>();
                            for (DataSnapshot petSnapshot : snapshot.getChildren()) {
                                Map<String, Object> pet = (Map<String, Object>) petSnapshot.getValue();
                                pet.put("id", petSnapshot.getKey());
                                pets.add(pet);
                            }
                            future.complete(ResponseEntity.ok(pets));
                        }

                        @Override
                        public void onCancelled(DatabaseError error) {
                            future.completeExceptionally(error.toException());
                        }
                    });
                } else {
                    petsRef.limitToFirst(50).addListenerForSingleValueEvent(new ValueEventListener() {
                        @Override
                        public void onDataChange(DataSnapshot snapshot) {
                            List<Map<String, Object>> pets = new ArrayList<>();
                            for (DataSnapshot petSnapshot : snapshot.getChildren()) {
                                Map<String, Object> pet = (Map<String, Object>) petSnapshot.getValue();
                                pet.put("id", petSnapshot.getKey());
                                pets.add(pet);
                            }
                            future.complete(ResponseEntity.ok(pets));
                        }

                        @Override
                        public void onCancelled(DatabaseError error) {
                            future.completeExceptionally(error.toException());
                        }
                    });
                }

                return future.join();

            } catch (FirebaseAuthException e) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido");
            }
        });
    }

    // ===========================================
    // GET /api/pets/{id} - Obtener mascota por ID
    // ===========================================
    @GetMapping("/{id}")
    public CompletableFuture<ResponseEntity<?>> getPetById(@PathVariable String id, @RequestHeader("Authorization") String authHeader) {

        return CompletableFuture.supplyAsync(() -> {
            try {
                String token = authHeader.replace("Bearer ", "");
                firebaseAuth.verifyIdToken(token);

                DatabaseReference petRef = firebaseDatabase.child("pets").child(id);
                CompletableFuture<ResponseEntity<?>> future = new CompletableFuture<>();

                petRef.addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        if (snapshot.exists()) {
                            Map<String, Object> pet = (Map<String, Object>) snapshot.getValue();
                            pet.put("id", snapshot.getKey());
                            future.complete(ResponseEntity.ok(pet));
                        } else {
                            future.complete(ResponseEntity.notFound().build());
                        }
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {
                        future.completeExceptionally(error.toException());
                    }
                });

                return future.join();

            } catch (FirebaseAuthException e) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido");
            }
        });
    }


    // ===========================================
    // POST /api/pets - Registrar nueva mascota
    // ===========================================
    @PostMapping
    public CompletableFuture<ResponseEntity<?>> createPet(@RequestBody PetDto petDto, @RequestHeader("Authorization") String authHeader) {

        return CompletableFuture.supplyAsync(() -> {
            try {
                String token = authHeader.replace("Bearer ", "");
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
                String uid = decodedToken.getUid();

                // Validar que el dueño autenticado es el propietario de la mascota
                if (!uid.equals(petDto.getOwnerId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "No puedes registrar mascotas para otro dueño");
                }

                // Verificar que el dueño existe
                DatabaseReference ownerRef = firebaseDatabase.child("owners").child(uid);
                CompletableFuture<ResponseEntity<?>> future = new CompletableFuture<>();

                ownerRef.addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot ownerSnapshot) {
                        if (!ownerSnapshot.exists()) {
                            future.complete(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("error", "El dueño no existe. Registra tu perfil primero")));
                            return;
                        }

                        // Crear nueva mascota
                        DatabaseReference petsRef = firebaseDatabase.child("pets");
                        String petId = petsRef.push().getKey();
                        DatabaseReference petRef = petsRef.child(petId);

                        Map<String, Object> petData = new HashMap<>();
                        petData.put("ownerId", petDto.getOwnerId());
                        petData.put("nombre", petDto.getNombre());
                        petData.put("especie", petDto.getEspecie());
                        petData.put("raza", petDto.getRaza());
                        petData.put("edad", petDto.getEdad());
                        petData.put("color", petDto.getColor());
                        petData.put("peso", petDto.getPeso());
                        petData.put("fotoUrl", petDto.getFotoUrl());
                        petData.put("latitud", petDto.getLatitud());
                        petData.put("longitud", petDto.getLongitud());
                        petData.put("createdAt", System.currentTimeMillis());
                        petData.put("updatedAt", System.currentTimeMillis());

                        petRef.setValue(petData, (error, ref) -> {
                            if (error == null) {
                                Map<String, String> response = Map.of(
                                        "message", "Mascota registrada exitosamente",
                                        "id", petId
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
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido");
            }
        });
    }



    // ===========================================
    // PUT /api/pets/{id} - Actualizar mascota
    // ===========================================
    @PutMapping("/{id}")
    public CompletableFuture<ResponseEntity<?>> updatePet(@PathVariable String id, @RequestBody PetDto petDto, @RequestHeader("Authorization") String authHeader) {

        return CompletableFuture.supplyAsync(() -> {
            try {
                String token = authHeader.replace("Bearer ", "");
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
                String uid = decodedToken.getUid();

                DatabaseReference petRef = firebaseDatabase.child("pets").child(id);
                CompletableFuture<ResponseEntity<?>> future = new CompletableFuture<>();

                petRef.addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        if (!snapshot.exists()) {
                            future.complete(ResponseEntity.notFound().build());
                            return;
                        }

                        // Verificar que la mascota pertenece al dueño autenticado
                        String ownerId = snapshot.child("ownerId").getValue(String.class);
                        if (!uid.equals(ownerId)) {
                            future.complete(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body(Map.of("error", "No puedes modificar mascotas de otro dueño")));
                            return;
                        }

                        Map<String, Object> updates = new HashMap<>();

                        if (petDto.getNombre() != null) updates.put("nombre", petDto.getNombre());
                        if (petDto.getEspecie() != null) updates.put("especie", petDto.getEspecie());
                        if (petDto.getRaza() != null) updates.put("raza", petDto.getRaza());
                        if (petDto.getEdad() != null) updates.put("edad", petDto.getEdad());
                        if (petDto.getColor() != null) updates.put("color", petDto.getColor());
                        if (petDto.getPeso() != null) updates.put("peso", petDto.getPeso());
                        if (petDto.getFotoUrl() != null) updates.put("fotoUrl", petDto.getFotoUrl());
                        if (petDto.getLatitud() != null) updates.put("latitud", petDto.getLatitud());
                        if (petDto.getLongitud() != null) updates.put("longitud", petDto.getLongitud());

                        updates.put("updatedAt", System.currentTimeMillis());

                        petRef.updateChildren(updates, (error, ref) -> {
                            if (error == null) {
                                future.complete(ResponseEntity.ok(Map.of(
                                        "message", "Mascota actualizada exitosamente"
                                )));
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
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido");
            }
        });
    }

    // ===========================================
    // DELETE /api/pets/{id} - Eliminar mascota
    // ===========================================
    @DeleteMapping("/{id}")
    public CompletableFuture<ResponseEntity<?>> deletePet(@PathVariable String id, @RequestHeader("Authorization") String authHeader) {

        return CompletableFuture.supplyAsync(() -> {
            try {
                String token = authHeader.replace("Bearer ", "");
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
                String uid = decodedToken.getUid();

                DatabaseReference petRef = firebaseDatabase.child("pets").child(id);
                CompletableFuture<ResponseEntity<?>> future = new CompletableFuture<>();

                petRef.addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        if (!snapshot.exists()) {
                            future.complete(ResponseEntity.notFound().build());
                            return;
                        }

                        String ownerId = snapshot.child("ownerId").getValue(String.class);
                        if (!uid.equals(ownerId)) {
                            future.complete(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body(Map.of("error", "No puedes eliminar mascotas de otro dueño")));
                            return;
                        }

                        petRef.removeValue((error, ref) -> {
                            if (error == null) {
                                future.complete(ResponseEntity.ok(Map.of(
                                        "message", "Mascota eliminada exitosamente"
                                )));
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
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido");
            }
        });
    }

}