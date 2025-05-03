
// Profile section edit adn display connected to firebase data base
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    updateDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
    getAuth,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCNVoM7hQ6a1zcP5zDITcdmUKlfs6lcDBY",
    authDomain: "login-form-783e1.firebaseapp.com",
    projectId: "login-form-783e1",
    storageBucket: "login-form-783e1.appspot.com",
    messagingSenderId: "598925515666",
    appId: "1:598925515666:web:5acb6fa146b160cca47f4b"
};

// Initialize services
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth(app);
auth.languageCode = 'en';

//profile set up
const editButton = document.getElementById('editButton');
const saveButton = document.getElementById('saveProfileBtn');
const cancelButton = document.getElementById('cancelEditBtn');

const editForm = document.getElementById('editMode');
const displayForm = document.getElementById('displayMode');

// Edit form fields
const editFirstName = document.getElementById('editFirstName');
const editMiddleInitial = document.getElementById('editMiddleInitial');
const editLastName = document.getElementById('editLastName'); 
const editCourse = document.getElementById('editCourse');
const editYear = document.getElementById('editYear');
const editRole = document.getElementById('editRole');
const editEmail = document.getElementById('editEmail');
const editPass = document.getElementById('editPass');

// Display fields
const displayName = document.getElementById('displayName');
const displayCourse = document.getElementById('displayCourse');
const displayYear = document.getElementById('displayYear');
const displayRole = document.getElementById('displayRole');
const displayEmail = document.getElementById('displayEmail');

// Initialize modes
displayForm.style.display = "flex";
editForm.style.display = "none";

// Store original values when entering edit mode
let originalValues = {};

// Helper function to combine name parts
function combineName(first, middle, last) {
    return `${first} ${middle ? middle + ' ' : ''}${last}`;
}

// Helper function to split full name into parts
function splitName(fullName) {
    const parts = fullName.split(' ');
    if (parts.length === 3) {
        return {
            first: parts[0],
            middle: parts[1],
            last: parts[2]
        };
    } else if (parts.length === 2) {
        return {
            first: parts[0],
            middle: '',
            last: parts[1]
        };
    }
    return {
        first: fullName,
        middle: '',
        last: ''
    };
}



// Edit button click handler
editButton.addEventListener('click', function() {//prompt: When the user clicked the edit button they would be allowed to edit their information. 
    // Store current values before editing
    originalValues = {
        name: displayName.textContent,
        course: displayCourse.textContent,
        year: displayYear.textContent,
        role: displayRole.textContent,
        email: displayEmail.textContent
    };
    
    // Split the display name into parts for the edit form
    const nameParts = splitName(displayName.textContent);
    
    // Copy current display values to edit form
    editFirstName.value = nameParts.first;
    editMiddleInitial.value = nameParts.middle;
    editLastName.value = nameParts.last;
    editCourse.value = displayCourse.textContent;
    editYear.value = displayYear.textContent;
    editRole.value = displayRole.textContent;
    
    // Switch modes
    editButton.style.display = "none";
    displayForm.style.display = "none";
    editForm.style.display = "flex";
});

// Save button click handler
saveButton.addEventListener('click', function() {//prompt: if they clicked save after editing their information, the users document in the firebase would be edited. In order to save and finish the edit, the user should input their password, if it is right then it will be saved and in return will be the new display. 
    // Combine name parts for display
    const fullName = combineName(
        editFirstName.value.trim(),
        editMiddleInitial.value.trim(),
        editLastName.value.trim()
    );
    
    // Update display with edited values
    displayName.textContent = fullName;
    displayCourse.textContent = editCourse.value;
    displayYear.textContent = editYear.value;
    displayRole.textContent = editRole.value;
    displayEmail.textContent = editEmail.value;
    // how to display an item from ducument in firebase website 

    
    // Switch back to display mode
    switchToDisplayMode();
    
    // Here you would typically add your Firebase save logic

    //put an updaet class here.
    

});

// Cancel button click handler
cancelButton.addEventListener('click', function() { //prompt: If the user cliked edit and then cancel, there should be no changes implemented in the document and in return there would be no changes in the display.
    // Restore original values
    displayName.textContent = originalValues.name;
    displayCourse.textContent = originalValues.course;
    displayYear.textContent = originalValues.year;
    displayRole.textContent = originalValues.role;
    displayEmail.textContent = originalValues.email;
    
    // Switch back to display mode
    switchToDisplayMode();
});

// Helper function to switch to display mode
function switchToDisplayMode() { //prompt: I wanted the details of the user current signed in in my website to be shown in the screen by getting the information from the document in the firebase.
    displayForm.style.display = "flex";
    editForm.style.display = "none";
    editButton.style.display = "flex";
}
//prompt:when all details are completed, the profileComplete in the firebase document should be true

