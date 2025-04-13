// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Firebase settings (like an address to connect to your Firebase project)
const firebaseConfig = {
  apiKey: "AIzaSyCNVoM7hQ6a1zcP5zDITcdmUKlfs6lcDBY", // Unique key for your project
  authDomain: "login-form-783e1.firebaseapp.com",    // Where users log in
  projectId: "login-form-783e1",                     // Your Firebase project ID
  storageBucket: "login-form-783e1.firebasestorage.app", // For storing files (images, etc.)
  messagingSenderId: "598925515666",                 // For sending notifications
  appId: "1:598925515666:web:b16534b6158c7232a47f4b" // Unique app identifier
};

// Start Firebase with the given settings
const app = initializeApp(firebaseConfig);