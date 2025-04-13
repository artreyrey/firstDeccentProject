  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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
  // Initialize Firebase with our project settings
const app = initializeApp(firebaseConfig);

// Function to show temporary messages (disappears after 5 seconds)
function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId); // Find message box in HTML
  messageDiv.style.display = "block"; // Make it visible
  messageDiv.innerHTML = message; // Put message text inside
  messageDiv.style.opacity = 1; // Make fully visible
  setTimeout(function(){ messageDiv.style.opacity = 0; },5000); // Fade out after 5s
}

// SIGN UP BUTTON CODE
const signUp = document.getElementById('submitSignUp'); // Get signup button
signUp.addEventListener('click', (event)=>{ // When clicked:
  event.preventDefault(); // Stop page from refreshing
  
  // Get user input values
  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const firstName = document.getElementById('fName').value;
  const lastName = document.getElementById('lName').value;

  const auth = getAuth(); // Get Firebase auth service
  const db = getFirestore(); // Get Firestore database

  // Create user account with email/password
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential)=>{ // If successful:
    const user = userCredential.user; // Get new user info
    const userData = { // Prepare user data to save
      email: email,
      firstName: firstName,
      lastName: lastName
    };
    showMessage('Account Created!', 'signUpMessage'); // Show success
    
    // Save user data to database
    setDoc(doc(db, "users", user.uid), userData)
    .then(()=>{ window.location.href='loginSignup.html'; }) // Go to login page
    .catch((error)=>{ console.error("Save error:", error); }) // Log errors
  })
  .catch((error)=>{ // If signup fails:
    if(error.code=='auth/email-already-in-use') {
      showMessage('Email already used!', 'signUpMessage');
    } else {
      showMessage('Signup failed', 'signUpMessage');
    }
  })
});

// SIGN IN BUTTON CODE
const signIn = document.getElementById('submitSignIn'); // Get login button
signIn.addEventListener('click', (event)=>{ // When clicked:
  event.preventDefault(); // Stop page refresh
  
  // Get login credentials
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const auth = getAuth(); // Get auth service

  // Try to log in
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential)=>{ // If successful:
    showMessage('Login successful!', 'signInMessage'); // Show message
    localStorage.setItem('loggedInUserId', userCredential.user.uid); // Remember user
    window.location.href = 'http://127.0.0.1:5500/homePage/homePage.html'; // Go to homepage
  })
  .catch((error)=>{ // If login fails:
    if(error.code==='auth/invalid-credential') {
      showMessage('Wrong email/password', 'signInMessage');
    } else {
      showMessage('Login failed', 'signInMessage');
    }
  })
  
})

// Function to check if user is logged in (call this on homePage.html)
function checkAuth() {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user && !localStorage.getItem('loggedInUserId')) {
    window.location.href = 'loginSignup.html'; // Redirect to login if not authenticated
  }
}