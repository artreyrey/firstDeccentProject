  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import {getAuth, createUserWithEmailAndPassowrd, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-Auth.js";
  import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCNVoM7hQ6a1zcP5zDITcdmUKlfs6lcDBY",
    authDomain: "login-form-783e1.firebaseapp.com",
    projectId: "login-form-783e1",
    storageBucket: "login-form-783e1.firebasestorage.app",
    messagingSenderId: "598925515666",
    appId: "1:598925515666:web:b16534b6158c7232a47f4b"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // signup functions when clicked
  const signUp = document.getElementById('submitSignUp');
  
  signUp.addEventListener('click', (event)=>{
    event.preventDefault();
    // initialize values
    const email=document.getElementById('rEmail').value;
    const password=document.getElementById('rPassword').value;
    const firstName=document.getElementById('fName').value;
    const lastName=document.getElementById('lName').value;

    createUserWithEmailAndPassowrd(auth, email, password).then((userCredential)=>{
      const user=userCredential.user;
      const userData={
        email : email,
        firstName: firstName,
        lastName: lastName
      };
    })

  })