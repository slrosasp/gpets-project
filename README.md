# 🐾 Gpets - Sistema de Gestión de Mascotas

![Java](https://img.shields.io/badge/Java-17-red)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.10-green)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20Database-orange)
![Docker](https://img.shields.io/badge/Docker-✓-blue)
![Docker Compose](https://img.shields.io/badge/Docker%20Compose-✓-blue)

## 👨‍💻 Autor
**Sergio Rosas**  
Desarrollador Full Stack | Backend Java | Spring Boot | Angular | JavaScript  
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
| 4 | Generar clave privada: ⚙️ → Configuración → Cuentas de servicio → **Generar nueva clave privada** |
| 5 | Guardar el archivo como: `gpets-api/src/main/resources/firebase-service-account.json` |

### 3️⃣ Variables de Entorno

```bash
# Clonar el repositorio
git clone https://github.com/slrosasp/gpets-project.git
cd gpets-project

# Crear archivo de entorno desde el ejemplo
cp .env.example .env

# Editar .env con tu URL de Firebase
# Ejemplo:
# FIREBASE_DATABASE_URL=https://tu-proyecto-default-rtdb.firebaseio.com
```


# 🐳 Dockerizar la Aplicación

📌 Ejecutar con Docker Compose (RECOMENDADO)

- Desde la raíz del proyecto
```bash
docker-compose up --build
```

# Listo, la API está en: http://localhost:8080



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