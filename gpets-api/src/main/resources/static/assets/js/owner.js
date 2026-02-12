// 📁 owners.js - COMPLETAMENTE SEPARADO de googleLogin.js
import { auth } from "./firebaseConfiguration.js";

// ✅ FUNCIÓN PARA REGISTRAR/ACTUALIZAR PERFIL
export async function registrarPerfilDueno(datosPerfil) {
    try {
        // 1. Obtener usuario ACTUAL (Firebase lo recupera de IndexedDB)
        const user = auth.currentUser;
        if (!user) {
            throw new Error("No hay usuario autenticado");
        }

        // 2. Obtener token FRESCO (Firebase usa el refreshToken automáticamente)
        const token = await user.getIdToken();
        console.log("✅ Token obtenido para:", user.email);

        // 3. Enviar a tu backend con el token en HEADER
        const response = await fetch('/api/owners', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                telefono: datosPerfil.telefono,
                direccion: datosPerfil.direccion,
                ciudad: datosPerfil.ciudad,
                displayName: datosPerfil.displayName || user.displayName,
                fotoUrl: datosPerfil.fotoUrl || user.photoURL
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Perfil registrado:", data);
            return { success: true, data };
        } else {
            throw new Error(data.message || "Error al registrar perfil");
        }

    } catch (error) {
        console.error("❌ Error:", error);
        return { success: false, error: error.message };
    }
}

// ✅ FUNCIÓN PARA OBTENER PERFIL DEL DUEÑO
export async function obtenerMiPerfil() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("No autenticado");

        const token = await user.getIdToken();

        const response = await fetch(/api/owners/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return await response.json();

    } catch (error) {
        console.error("❌ Error:", error);
        throw error;
    }
}