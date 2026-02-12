package com.github.slrosasp.gpets.config;


import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import java.io.FileInputStream;
import java.io.IOException;


@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.path:/app/firebase-service-account.json}")
    private String firebaseConfigPath;

    @Value("${firebase.database.url}")
    private String databaseUrl;

    @Bean
    public FirebaseAuth firebaseAuth() throws IOException {
        FirebaseApp app = getFirebaseApp();
        return FirebaseAuth.getInstance(app);
    }

    @Bean
    public DatabaseReference firebaseDatabase() throws IOException {
        FirebaseApp app = getFirebaseApp();
        return FirebaseDatabase.getInstance(app).getReference();
    }

    private FirebaseApp getFirebaseApp() throws IOException {
        try {
            System.out.println("🔥 Inicializando Firebase desde: " + firebaseConfigPath);

            FileInputStream serviceAccount = new FileInputStream(firebaseConfigPath);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl(databaseUrl)
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp app = FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase Admin SDK inicializado correctamente");
                return app;
            } else {
                System.out.println("ℹ️ Usando FirebaseApp existente");
                return FirebaseApp.getApps().get(0);
            }

        } catch (Exception e) {
            System.err.println("❌ Error inicializando Firebase: " + e.getMessage());
            System.err.println("📁 Path intentado: " + firebaseConfigPath);
            throw e;
        }
    }
}
