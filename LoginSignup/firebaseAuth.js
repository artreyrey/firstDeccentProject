import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = { /* Your config */ };
const app = initializeApp(firebaseConfig);

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (messageDiv) {
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(() => {
      messageDiv.style.opacity = 0;
    }, 5000);
  }
}

const signUp = document.getElementById('submitSignUp');
signUp?.addEventListener('click', (event) => {
  event.preventDefault();
  
  const email = document.getElementById('rEmail')?.value;
  const password = document.getElementById('rPassword')?.value;
  const firstName = document.getElementById('fName')?.value;
  const lastName = document.getElementById('lName')?.value;

  if (!email || !password || !firstName || !lastName) {
    showMessage('Please fill all fields!', 'signUpMessage');
    return;
  }

  const auth = getAuth(app);
  const db = getFirestore(app);

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userData = { email, firstName, lastName };
      
      setDoc(doc(db, "users", user.uid), userData)
        .then(() => {
          showMessage('Account Created!', 'signUpMessage');
          setTimeout(() => {
            window.location.href = 'loginSignup.html';
          }, 2000);
        })
        .catch((error) => {
          showMessage('Error saving user data', 'signUpMessage');
          console.error("Firestore error:", error);
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/email-already-in-use') {
        showMessage('Email already in use!', 'signUpMessage');
      } 
      else if (errorCode === 'auth/weak-password') {
        showMessage('Password must be 6+ characters', 'signUpMessage');
      }
      else {
        showMessage('Error: ' + error.message, 'signUpMessage');
      }
    });
});