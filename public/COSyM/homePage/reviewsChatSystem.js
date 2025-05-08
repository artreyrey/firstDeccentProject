  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import {getAuth} 
  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  import {getFirestore, set, ref, push, child, onValue} 
  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCNVoM7hQ6a1zcP5zDITcdmUKlfs6lcDBY",
    authDomain: "login-form-783e1.firebaseapp.com",
    projectId: "login-form-783e1",
    storageBucket: "login-form-783e1.firebasestorage.app",
    messagingSenderId: "598925515666",
    appId: "1:598925515666:web:5acb6fa146b160cca47f4b"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();
const database = getDatabase(app);
auth.languageCode = 'en';

// elements
const message = document.getElementById('message').value;
const username = document.getElementById('username').value;
const time = document.getElementById('time').value;
const date = document.getElementById('date').value;
const userProfile = document.getElementById('userProfile').value;

// button
const submitButton = document.getElementById("submitButton").value;

submitButton.addEventListener('click',(e)=>{
  
});


