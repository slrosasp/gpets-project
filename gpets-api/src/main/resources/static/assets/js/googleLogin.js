import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { auth } from "/assets/js/firebaseConfiguration.js";
import { showMessage } from "/assets/js/showMessage.js";


const googleButton = document.querySelector("#googleLogin");
console.log("google buton: " + googleButton);


googleButton.addEventListener("click", async(e) => {
  e.preventDefault();

  const provider = new GoogleAuthProvider();

  try{
    // 1. Login con Google
    const credentials = await signInWithPopup(auth, provider);
    const user = credentials.user;
    console.log("Usuario autenticado:", user.email);
    console.log("UID:", user.uid);
  
    // 6. Mensaje de bienvenida
    showMessage("Bienvenido " + credentials.user.displayName + " lograste autenticarte mediante tu cuenta de google " + credentials.user.email, "success");

    // ✅ 3. Redirigir al dashboard
    window.location.href = './assets/html/dashboard.html';
    
    
  }catch(error) {
    console.error("Error completo:", error);
    showMessage("Error al autenticar con el servidor", "error");
    showMessage("Error al iniciar sesión: " + error.message, "error");
  }

});