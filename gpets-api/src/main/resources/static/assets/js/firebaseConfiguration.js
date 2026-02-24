// Agregamos Firebase a nuestra aplicacion web //

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-Nv9VoVQ5Hy-EsukgvSrvrHq-KP5ot3w",
  authDomain: "proj-gptes-prueba.firebaseapp.com",
  databaseURL: "https://proj-gptes-prueba-default-rtdb.firebaseio.com",
  projectId: "proj-gptes-prueba",
  storageBucket: "proj-gptes-prueba.firebasestorage.app",
  messagingSenderId: "478244852271",
  appId: "1:478244852271:web:bc9c79452c8ad4fd3bacda"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);



// Agregamos Authentication de Firebase //

import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js"

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

console.log(app);