  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup} 
  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  import {getFirestore, setDoc, doc} 
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
auth.languageCode = 'en';

// Function to show temporary messages (disappears after 5 seconds)
function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId); 
  messageDiv.style.display = "block"; 
  messageDiv.innerHTML = message; 
  messageDiv.style.opacity = 1; 
  setTimeout(function(){ messageDiv.style.opacity = 0; },5000); // Fade out after 5s
}

// SIGN UP BUTTON CODE
const signUp = document.getElementById('submitSignUp'); 
signUp.addEventListener('click', (event)=>{ // When clicked:
  event.preventDefault(); // Stop page from refreshing
  
  // Get user input values
  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const firstName = document.getElementById('fName').value;
  const lastName = document.getElementById('lName').value;

  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential)=>{
    const user = userCredential.user;
    const userData = { // Prepare user data to save
      email: email,
      firstName: firstName,
      lastName: lastName
    };
    showMessage('Account Created!', 'signUpMessage'); 
    
    // Save user data to database
    setDoc(doc(db, "users", user.uid), userData)
    .then(()=>{ window.location.href='loginSignup.html'; }) 
    .catch((error)=>{ console.error("Save error:", error); })
  })
  .catch((error)=>{ 
    if(error.code=='auth/email-already-in-use') {
      showMessage('Email already used!', 'signUpMessage');
    } else {
      showMessage('Signup failed', 'signUpMessage');
    }
  })
});

// SIGN IN BUTTON CODE
const signIn = document.getElementById('submitSignIn'); // Get login button
signIn.addEventListener('click', (event)=>{ 
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
    window.location.href = 'http://127.0.0.1:5500/public/COSyM/homePage/homePage.html'; // Go to homepage
  })

  .catch((error)=>{ // If login fails:
    if(error.code==='auth/invalid-credential') {
      showMessage('Wrong email/password', 'signInMessage');
    } else {
      showMessage('Login failed', 'signInMessage');
    }
  })
  
})

// fogot password
const resetLink = document.getElementById('reset');
resetLink.addEventListener('click', async (e) => {
  e.preventDefault(); // Prevent the default link behavior
  
  const email = document.getElementById('email').value.trim();
  
  if (!email) {
    showMessage('Please enter your email address', 'signInMessage');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showMessage('Password reset email sent! Check your inbox.', 'signInMessage');
  } catch (error) {
    console.error("Password reset error:", error);
    
    if (error.code === 'auth/user-not-found') {
      showMessage('No account found with this email', 'signInMessage');
    } else if (error.code === 'auth/invalid-email') {
      showMessage('Please enter a valid email address', 'signInMessage');
    } else {
      showMessage('Failed to send reset email. Please try again.', 'signInMessage');
    }
  }
});


// Google login
const googleAuth = async () => {
  const provider = new GoogleAuthProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Prepare user data for Firestore
    const userData = {
      email: user.email,
      firstName: user.displayName?.split(' ')[0] || '', // Extract first name
      lastName: user.displayName?.split(' ')[1] || '',  // Extract last name
      profilePicture: user.photoURL || '',
      course: "", // Initialize empty fields
      year: "",
      role: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      profileComplete: false,
      provider: 'google' // Track sign-in method
    };

    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), userData);
    
    // Store user ID and redirect
    localStorage.setItem('loggedInUserId', user.uid);
    window.location.href = 'http://127.0.0.1:5500/public/COSyM/homePage/homePage.html';
    
  } catch (error) {
    console.error("Google Auth Error:", error);
    const errorDiv = document.getElementById('signInMessage') || document.getElementById('signUpMessage');
    if (errorDiv) {
      showMessage('Google sign-in failed: ' + error.message, errorDiv.id);
    }
  }
};

// Connect to both Login and Signup Google Buttons
document.getElementById("google-login-btn")?.addEventListener("click", googleAuth);
document.getElementById("google-signup-btn")?.addEventListener("click", googleAuth);