// Profile section edit and display connected to firebase database
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
    getFirestore, 
    doc, 
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


// Profile elements
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

// Error message element
const errorMessage = document.getElementById('errorMessage');

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

// Load user data from Firestore
async function loadUserData() {
    const user = auth.currentUser;
    if (!user) {
        console.error("No user signed in");
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Update display fields
            displayName.textContent = combineName(
                userData.firstName || '',
                userData.middleName || '',
                userData.lastName || ''
            );
            displayCourse.textContent = userData.course || '';
            displayYear.textContent = userData.year || '';
            displayRole.textContent = userData.role || '';
            displayEmail.textContent = user.email || '';
            
            // Store original values
            originalValues = {
                name: displayName.textContent,
                course: displayCourse.textContent,
                year: displayYear.textContent,
                role: displayRole.textContent,
                email: user.email || ''
            };
        } else {
            console.log("No user document found");
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        errorMessage.textContent = "Error loading profile data. Please try again.";
    }
}

// Check if all profile fields are completed
function isProfileComplete(userData) {
    return userData.firstName && 
           userData.lastName && 
           userData.course && 
           userData.year && 
           userData.role;
}

// Edit button click handler
editButton.addEventListener('click', function() {
    // Split the display name into parts for the edit form
    const nameParts = splitName(displayName.textContent);
    
    // Copy current display values to edit form
    editFirstName.value = nameParts.first;
    editMiddleInitial.value = nameParts.middle;
    editLastName.value = nameParts.last;
    editCourse.value = displayCourse.textContent;
    editYear.value = displayYear.textContent;
    editRole.value = displayRole.textContent;
    editEmail.value = displayEmail.textContent;
    editPass.value = ''; 
    
    // Clear any previous error messages
    errorMessage.textContent = '';
    
    // Switch modes
    editButton.style.display = "none";
    displayForm.style.display = "none";
    editForm.style.display = "flex";
});

// Save button click handler
saveButton.addEventListener('click', async function() {
    const user = auth.currentUser;
    if (!user) {
        errorMessage.textContent = "No user signed in";
        return;
    }

    // Validate password is entered
    if (!editPass.value) {
        errorMessage.textContent = "Please enter your password to save changes";
        return;
    }

    // Combine name parts for display
    const fullName = combineName(
        editFirstName.value.trim(),
        editMiddleInitial.value.trim(),
        editLastName.value.trim()
    );

    // Create credential for reauthentication
    const credential = EmailAuthProvider.credential(
        user.email,
        editPass.value
    );

    try {
        // Reauthenticate user
        await reauthenticateWithCredential(user, credential);
        
        // Prepare updated data in the required format
        const updatedData = {
            firstName: editFirstName.value.trim(),
            middleName: editMiddleInitial.value.trim(),
            lastName: editLastName.value.trim(),
            course: editCourse.value,
            year: editYear.value,
            role: editRole.value,
            updatedAt: new Date(),
            profileComplete: isProfileComplete({
                firstName: editFirstName.value.trim(),
                lastName: editLastName.value.trim(),
                course: editCourse.value,
                year: editYear.value,
                role: editRole.value
            })
        };

        // Update Firestore document
        await updateDoc(doc(db, "users", user.uid), updatedData);
        
        // Update display with edited values
        displayName.textContent = fullName;
        displayCourse.textContent = editCourse.value;
        displayYear.textContent = editYear.value;
        displayRole.textContent = editRole.value;
        displayEmail.textContent = editEmail.value;
        
        // Update original values
        originalValues = {
            name: fullName,
            course: editCourse.value,
            year: editYear.value,
            role: editRole.value,
            email: editEmail.value
        };
        
        // Switch back to display mode
        switchToDisplayMode();
        errorMessage.textContent = '';
    } catch (error) {
        console.error("Error saving profile:", error);
        errorMessage.textContent = "Error saving profile. Please check your password and try again.";
    }
});

// Cancel button click handler
cancelButton.addEventListener('click', function() {
    // Restore original values
    displayName.textContent = originalValues.name;
    displayCourse.textContent = originalValues.course;
    displayYear.textContent = originalValues.year;
    displayRole.textContent = originalValues.role;
    displayEmail.textContent = originalValues.email;
    
    // Switch back to display mode
    switchToDisplayMode();
    errorMessage.textContent = '';
});

// Helper function to switch to display mode
function switchToDisplayMode() {
    displayForm.style.display = "flex";
    editForm.style.display = "none";
    editButton.style.display = "flex";
}

// Initialize the page by loading user data when profile section is shown
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Only load data if we're on the profile section
            if (window.location.hash === '#profile' || 
                document.getElementById('profile-section').style.display === 'block') {
                loadUserData();
            }
        } else {
            // Redirect to login page or handle unauthorized access
            window.location.href = "login.html";
        }
    });
});