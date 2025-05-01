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

// Main function to initialize the profile editor
async function initializeProfileEditor() {
    // Wait for DOM to be fully loaded
    await new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            document.addEventListener('DOMContentLoaded', resolve);
        }
    });

    // Get DOM elements with null checks
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveProfileBtn');
    const cancelButton = document.getElementById('cancelEditBtn');
    const editForm = document.getElementById('editMode');
    const displayForm = document.getElementById('displayMode');

    // Add debug logging
    console.log('Profile editor elements:', {
        editButton, saveButton, cancelButton, editForm, displayForm
    });

    if (!editButton || !saveButton || !cancelButton || !editForm || !displayForm) {
        console.error('Required elements not found!');
        return;
    }

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

    // Initialize modes using classList
    displayForm.classList.remove('hidden');
    editForm.classList.add('hidden');
    editButton.classList.remove('hidden');

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
                if (displayName) displayName.textContent = combineName(
                    userData.firstName || '',
                    userData.middleName || '',
                    userData.lastName || ''
                );
                if (displayCourse) displayCourse.textContent = userData.course || '';
                if (displayYear) displayYear.textContent = userData.year || '';
                if (displayRole) displayRole.textContent = userData.role || '';
                if (displayEmail) displayEmail.textContent = user.email || '';
                
                // Store original values
                originalValues = {
                    name: displayName?.textContent || '',
                    course: displayCourse?.textContent || '',
                    year: displayYear?.textContent || '',
                    role: displayRole?.textContent || '',
                    email: user.email || ''
                };
            } else {
                console.log("No user document found");
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            if (errorMessage) errorMessage.textContent = "Error loading profile data. Please try again.";
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
    editButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Edit button clicked');
        
        try {
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
            if (errorMessage) errorMessage.textContent = '';
            
            // Switch modes using classList
            editButton.classList.add('hidden');
            displayForm.classList.add('hidden');
            editForm.classList.remove('hidden');
            
            console.log('Successfully switched to edit mode');
        } catch (error) {
            console.error('Error in edit button handler:', error);
        }
    });

    // Save button click handler
    saveButton.addEventListener('click', async function() {
        const user = auth.currentUser;
        if (!user) {
            if (errorMessage) errorMessage.textContent = "No user signed in";
            return;
        }

        // Validate password is entered
        if (!editPass.value) {
            if (errorMessage) errorMessage.textContent = "Please enter your password to save changes";
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
            if (displayName) displayName.textContent = fullName;
            if (displayCourse) displayCourse.textContent = editCourse.value;
            if (displayYear) displayYear.textContent = editYear.value;
            if (displayRole) displayRole.textContent = editRole.value;
            if (displayEmail) displayEmail.textContent = editEmail.value;
            
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
            if (errorMessage) errorMessage.textContent = '';
        } catch (error) {
            console.error("Error saving profile:", error);
            if (errorMessage) errorMessage.textContent = "Error saving profile. Please check your password and try again.";
        }
    });

    // Cancel button click handler
    cancelButton.addEventListener('click', function() {
        // Restore original values
        if (displayName) displayName.textContent = originalValues.name;
        if (displayCourse) displayCourse.textContent = originalValues.course;
        if (displayYear) displayYear.textContent = originalValues.year;
        if (displayRole) displayRole.textContent = originalValues.role;
        if (displayEmail) displayEmail.textContent = originalValues.email;
        
        // Switch back to display mode
        switchToDisplayMode();
        if (errorMessage) errorMessage.textContent = '';
    });

    // Helper function to switch to display mode
    function switchToDisplayMode() {
        if (displayForm) displayForm.classList.remove('hidden');
        if (editForm) editForm.classList.add('hidden');
        if (editButton) editButton.classList.remove('hidden');
    }

    // Check if user is logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Only load data if we're on the profile section
            const profileSection = document.getElementById('profile-section');
            if (window.location.hash === '#profile' || 
                (profileSection && profileSection.style.display === 'block')) {
                loadUserData();
            }
        } else {
            // Redirect to login page or handle unauthorized access
            window.location.href = "login.html";
        }
    });

    console.log("Profile editor initialized successfully");
}

// Start the profile editor
initializeProfileEditor().catch(error => {
    console.error("Failed to initialize profile editor:", error);
});