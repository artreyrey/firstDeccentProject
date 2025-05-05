// Profile section edit and display connected to firebase database
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    updateDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider
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

// DOM elements
const editButton = document.getElementById('editButton');
const saveButton = document.getElementById('saveProfileBtn');
const cancelButton = document.getElementById('cancelEditBtn');
const editForm = document.getElementById('editMode');
const displayForm = document.getElementById('displayMode');

// Display fields (including profile picture display)
const [
    displayName, displayCourse, displayYear, displayRole, displayEmail, 
    profilePictureDisplay
] = [
    'displayName', 'displayCourse', 'displayYear', 'displayRole', 'displayEmail',
    'profilePictureDisplay'
].map(id => document.getElementById(id));
  
// Form edit fields (including profile picture edit)
const [
    editFirstName, editMiddleInitial, editLastName, editCourse, editYear, editRole,
    profilePictureEdit
] = [
    'editFirstName', 'editMiddleInitial', 'editLastName', 'editCourse', 'editYear', 'editRole',
    'profilePictureEdit'
].map(id => document.getElementById(id));

// Initialize UI
displayForm.style.display = "flex";
editForm.style.display = "none";
let originalValues = {};

// Name helper functions
const combineName = (first, middle, last) => 
    `${first}${middle ? ` ${middle.charAt(0)}.` : ''} ${last}`.trim();

const splitName = (fullName) => {
    const parts = fullName.split(' ');
    return parts.length >= 2 
        ? { first: parts[0], middle: parts[1]?.replace('.', ''), last: parts.slice(2).join(' ') }
        : { first: fullName, middle: '', last: '' };
};

// Initialize profile
async function initializeUserProfile(user) {
    const userRef = doc(db, "users", user.uid);
    const profileComplete = isProfileComplete({
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        photoURL: user.photoURL,
        course: '',
        year: '',
        role: ''
    });
    
    await setDoc(userRef, {
        firstName: user.displayName?.split(' ')[0] || '',
        middleName: '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        photoURL: user.photoURL || null,
        course: '',
        year: '',
        role: '',
        profileComplete: profileComplete,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
}

// Check if profile is complete
function isProfileComplete(userData) {
    return !!(
        userData.firstName && 
        userData.lastName && 
        userData.email && 
        userData.course && 
        userData.year && 
        userData.role
    );
}

// Profile management
async function displayUserProfile(user) {
    try {
        console.log(`Loading profile for: ${user.uid}`);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Retrieved user data:", userData);
            
            // Use Google photoURL if available, otherwise use stored one
            const photoURL = user.photoURL || userData.photoURL;
            
            updateDisplay({
                name: combineName(
                    userData.firstName || '',
                    userData.middleName || '',
                    userData.lastName || ''
                ),
                email: userData.email || user.email,
                course: userData.course || 'Not specified',
                year: userData.year || 'Not specified',
                role: userData.role || 'Not specified',
                photoURL: photoURL,
                profileComplete: userData.profileComplete || false
            });

            // Show edit button based on profile completion
            editButton.style.display = userData.profileComplete ? "flex" : "flex";
        } else {
            console.log("No document found, creating new one");
            await initializeUserProfile(user);
            // Get fresh data after creation
            const newDoc = await getDoc(doc(db, "users", user.uid));
            const newData = newDoc.data();
            
            updateDisplay({
                name: combineName(
                    newData.firstName || '',
                    newData.middleName || '',
                    newData.lastName || ''
                ),
                email: user.email,
                course: newData.course || 'Not specified',
                year: newData.year || 'Not specified',
                role: newData.role || 'Not specified',
                photoURL: user.photoURL || newData.photoURL,
                profileComplete: newData.profileComplete || false
            });
            
            // Show edit button for new profiles
            editButton.style.display = "flex";
        }
    } catch (error) {
        console.error("Profile load error:", error);
        alert("Failed to load profile. Please try again.");
    }
}

// update display
function updateDisplay({name, email, course, year, role, photoURL, profileComplete}) {
    displayName.textContent = name;
    displayEmail.textContent = email;
    displayCourse.textContent = course;
    displayYear.textContent = year;
    displayRole.textContent = role;
    
    // Update profile picture - prioritize Google photo if available
    if (photoURL) {
        // Ensure the URL is secure and add size parameter for Google photos
        let processedUrl = photoURL;
        if (photoURL.includes('googleusercontent.com') && !photoURL.includes('=')) {
            processedUrl = photoURL.replace(/(\/[^/]+)$/, '/s200$1');
        }
        profilePictureDisplay.src = processedUrl;
        profilePictureEdit.src = processedUrl;
    } else {
        // Fallback to default image
        const defaultImage = "https://cdn-icons-png.flaticon.com/512/10928/10928539.png";
        profilePictureDisplay.src = defaultImage;
        profilePictureEdit.src = defaultImage;
    }

}

// Save profile to Firebase
async function saveProfile() {
    const user = auth.currentUser;
    if (!user) {
        alert("No user signed in");
        return false;
    }

    try {
        // Trim all input values
        const firstName = editFirstName.value.trim();
        const middleName = editMiddleInitial.value.trim();
        const lastName = editLastName.value.trim();
        const course = editCourse.value.trim();
        const year = editYear.value.trim();
        const role = editRole.value.trim();

        // Validate all required fields
        if (!firstName) throw new Error("First name is required");
        if (!lastName) throw new Error("Last name is required");
        if (!course || course === "Not specified") throw new Error("Course is required");
        if (!year || year === "Not specified") throw new Error("Year is required");
        if (!role || role === "Not specified") throw new Error("Role is required");

        // Check if profile is complete
        const profileComplete = isProfileComplete({
            firstName,
            lastName,
            email: user.email,
            course,
            year,
            role
        });

        const updates = {
            firstName,
            middleName, // Middle name is optional
            lastName,
            course,
            year,
            role,
            profileComplete,
            updatedAt: serverTimestamp()
        };

        console.log("Saving updates:", updates);
        await updateDoc(doc(db, "users", user.uid), updates);
        
        return true;
    } catch (error) {
        console.error("Save error:", error);
        alert(`Save failed: ${error.message}`);
        return false;
    }
}

// UI mode management
function setEditMode(edit) {
    editForm.style.display = edit ? "flex" : "none";
    displayForm.style.display = edit ? "none" : "flex";
    editButton.style.display = edit ? "none" : "flex";
}

function startEditing() {
    originalValues = {
        name: displayName.textContent,
        course: displayCourse.textContent,
        year: displayYear.textContent,
        role: displayRole.textContent,
        email: displayEmail.textContent
    };

    const {first, middle, last} = splitName(displayName.textContent);
    editFirstName.value = first;
    editMiddleInitial.value = middle;
    editLastName.value = last;
    editCourse.value = displayCourse.textContent === "Not specified" ? "" : displayCourse.textContent;
    editYear.value = displayYear.textContent === "Not specified" ? "" : displayYear.textContent;
    editRole.value = displayRole.textContent === "Not specified" ? "" : displayRole.textContent;

    setEditMode(true);
}

// Validate profile form
function validateProfileForm() {
    const firstName = editFirstName.value.trim();
    const lastName = editLastName.value.trim();
    const course = editCourse.value.trim();
    const year = editYear.value.trim();
    const role = editRole.value.trim();

    if (!firstName) {
        alert("First name is required");
        editFirstName.focus();
        return false;
    }
    if (!lastName) {
        alert("Last name is required");
        editLastName.focus();
        return false;
    }
    if (!course || course === "Not specified") {
        alert("Course is required");
        editCourse.focus();
        return false;
    }
    if (!year || year === "Not specified") {
        alert("Year is required");
        editYear.focus();
        return false;
    }
    if (!role || role === "Not specified") {
        alert("Role is required");
        editRole.focus();
        return false;
    }

    return true;
}

// finish edit
async function finishEditing(save) {
    if (save) {
        // Validate form before saving
        if (!validateProfileForm()) {
            return; // Don't proceed if validation fails
        }

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
        
        try {
            const success = await saveProfile();
            if (!success) {
                // If save failed, stay in edit mode
                return;
            }
            
            // Only update UI after successful save
            const user = auth.currentUser;
            updateDisplay({
                name: combineName(
                    editFirstName.value.trim(),
                    editMiddleInitial.value.trim(),
                    editLastName.value.trim()
                ),
                email: user.email,
                course: editCourse.value,
                year: editYear.value,
                role: editRole.value,
                photoURL: user.photoURL || profilePictureDisplay.src,
                profileComplete: isProfileComplete({
                    firstName: editFirstName.value.trim(),
                    lastName: editLastName.value.trim(),
                    email: user.email,
                    course: editCourse.value,
                    year: editYear.value,
                    role: editRole.value
                })
            });
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Save";
            setEditMode(false);
        }
    } else {    
        // Cancel operation
        updateDisplay(originalValues);
        setEditMode(false);
    }
}

// Event listeners
editButton.addEventListener('click', startEditing);
saveButton.addEventListener('click', () => finishEditing(true));
cancelButton.addEventListener('click', () => finishEditing(false));

// Auth state listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User signed in:", user);
        try {
            // First ensure document exists
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                console.log("Creating new profile document");
                await initializeUserProfile(user);
            }
            
            // Then display profile with photo
            await displayUserProfile(user);
        } catch (error) {
            console.error("Auth state change error:", error);
        }
    } else {
        console.log("User signed out");
        updateDisplay({
            name: "",
            email: "",
            course: "",
            year: "",
            role: "",
            photoURL: ""
        });
    }
});