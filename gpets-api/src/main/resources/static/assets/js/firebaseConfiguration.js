// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEqI4Pz8pfvXiRnWKis0d7Wyz7f_qC8o4",
  authDomain: "fir-auth-gpets.firebaseapp.com",
  projectId: "fir-auth-gpets",
  storageBucket: "fir-auth-gpets.firebasestorage.app",
  messagingSenderId: "64476547112",
  appId: "1:64476547112:web:eeed71cdb9fe6ae8144d1d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

console.log(app);