# 🐾 Gpets - Sistema de Gestión de Mascotas

![Java](https://img.shields.io/badge/Java-17-red)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.10-green)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20Database-orange)
![Docker](https://img.shields.io/badge/Docker-✓-blue)
![Docker Compose](https://img.shields.io/badge/Docker%20Compose-✓-blue)

## 👨‍💻 Autor
**Sergio Rosas**  
Desarrollador Full Stack | Java | Spring Boot | JavaScript | React | Angular | Azure | SQL 
📍 [Lima, Perú]  
🔗 [LinkedIn](https://www.linkedin.com/in/slrosasp/) | 🐙 [GitHub](https://github.com/slrosasp)   
📧 slrosasp@gmail.com

## 📋 Descripción
**Gpets** es una aplicación web para la gestión de mascotas y sus dueños.  
Permite el registro de usuarios con Google, administración de perfiles y un CRUD completo de mascotas con ubicación geográfica.

**Arquitectura:** Backend Spring Boot + Frontend integrado en `/static` + Firebase Realtime Database + Docker

---

## 🚀 Tecnologías Utilizadas

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Backend** | Java + Spring Boot | 17 / 3.5.10 |
| **Frontend** | HTML, Tailwind CSS, JavaScript | - |
| **Base de Datos** | Firebase Realtime Database | - |
| **Autenticación** | Firebase Auth (Google Sign-In) | - |
| **Contenedores** | Docker + Docker Compose | - |
| **Build** | Maven | 3.8+ |

---

## ⚙️ Configuración del Proyecto

### 1️⃣ Requisitos Previos
- Java 17+
- Maven 3.8+
- Docker y Docker Compose (opcional, para contenedores)
- Cuenta de [Firebase](https://console.firebase.google.com/)

### 2️⃣ Configuración de Firebase

| Paso | Acción |
|------|--------|
| 1 | Crear proyecto en [Firebase Console](https://console.firebase.google.com/) |
| 2 | Habilitar **Authentication** → **Google Sign-In** |
| 3 | Crear **Realtime Database** en modo prueba |
| 4 | Generar clave privada para el **SDK de Firebase Admin**: Descripcion General⚙️ → Cuentas de servicio |
| 5 | Te llevara a la pestaña Configuracion de Proyecto, selecciona Java → **Generar nueva clave privada** |
| 6 | Se descargará un archivo .json con un nombre similar a: `proj-gptes-prueba-firebase-adminsdk-fbsvc-xxxxx.json`
| 7 | Renombrar el archivo descargado con el nombre `firebase-service-account.json`
| 8 | Mover el archivo a la ruta exacta: `gpets-api/src/main/resources/`

### 3️⃣ Configuración de Fronted

| Paso | Acción |
|------|--------|
| 1 | En Firebase Console, ve a Descripción general del proyecto |
| 2 | Haz clic en Agregar app → Selecciona Web (</>) |
| 3 | Registra la app con un nombre (ej: "gpets-frontend") |
| 4 | Copia el objeto firebaseConfig que te muestra Firebase |
| 5 | Abre el archivo: gpets-api/src/main/resources/static/js/firebase-config.js (o la ruta donde esté) |
| 6 | Reemplaza TODO el objeto firebaseConfig con el que copiaste de tu proyecto |

📌 Ejemplo de cómo debe quedar la const firebaseConfig en el archivo firebase-config.js :

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

⚠️ IMPORTANTE: El projectId debe coincidir con el que aparece en tu archivo firebase-service-account.json.

### 4️⃣ Variables de Entorno

```bash
# 1. Clonar el repositorio
git clone https://github.com/slrosasp/gpets-project.git
cd gpets-project

# 2. Asegúrate de estar en la raíz del proyecto
pwd
# Debe mostrar: .../gpets-project

# 3. Crea el archivo .env desde el ejemplo
cp .env.example .env

# 4. Edita .env con la URL de tu Realtime Database de Firebase
#    (usando notepad, code, o tu editor favorito)
notepad .env

# 5. Ejemplo (REEMPLAZA con tu URL de tu Realtime Database real):
# FIREBASE_DB_URL=https://tu-proyecto-default-rtdb.firebaseio.com

# 6. Guarda los cambios
```


### 5️⃣ Dockerizar la Aplicación 🐳

📌 Ejecutar con Docker Compose (RECOMENDADO)

- Desde la raíz del proyecto
```bash
docker-compose up --build
```

### 6️⃣Listo, la API está en: http://localhost:8080
```
## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción | Request Body | Response | Autenticación |
|--------|----------|-------------|--------------|----------|---------------|
| 🟢 POST | `/api/owners` | Registrar/completar perfil del dueño | `OwnerDto` | `{ message, uid }` | 🔐 **Token Google** |
| 🔵 GET  | `/api/owners/me` | Obtener perfil del dueño actual | `-` | `OwnerDto` | 🔐 **Token Google** |
| 🔵 GET  | `/api/pets` | Listar mascotas (filtro por `?ownerId=`) | `-` | `List<PetDto>` | 🔐 **Token Google** |
| 🔵 GET  | `/api/pets/{id}` | Obtener detalle de una mascota | `-` | `PetDto` | 🔐 **Token Google** |
| 🟢 POST | `/api/pets` | Registrar nueva mascota | `PetDto` | `{ message, id }` | 🔐 **Token Google** |
| 🟡 PUT  | `/api/pets/{id}` | Actualizar mascota | `PetDto` | `{ message }` | 🔐 **Token Google** |
| 🔴 DELETE | `/api/pets/{id}` | Eliminar mascota | `-` | `{ message }` | 🔐 **Token Google** |
```