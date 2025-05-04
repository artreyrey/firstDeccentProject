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
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCNVoM7hQ6a1zcP5zDITcdmUKlfs6lcDBY",
    authDomain: "login-form-783e1.firebaseapp.com",
    projectId: "login-form-783e1",
    storageBucket: "login-form-783e1.firebasestorage.app",
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

// Initialize profile - FIXED
async function initializeUserProfile(user) {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        firstName: '',
        middleName: '',
        lastName: '',
        email: user.email,
        photoURL: user.photoURL || null,
        course: '',
        year: '',
        role: '',
        profileComplete: false, // Initialize as false
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
}

// Profile management - FIXED
async function displayUserProfile(user) {
    try {
        console.log(`Loading profile for: ${user.uid}`);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Retrieved user data:", userData);
            
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
                photoURL: userData.photoURL || user.photoURL,
                profileComplete: userData.profileComplete || false
            });

            // Show edit button if profile is incomplete
            editButton.style.display = userData.profileComplete ? "none" : "flex";
        } else {
            console.log("No document found, creating new one");
            await initializeUserProfile(user);
            // Get fresh data after creation
            const newDoc = await getDoc(doc(db, "users", user.uid));
            updateDisplay({
                name: "User",
                email: user.email,
                course: newDoc.data().course || 'Not specified',
                year: newDoc.data().year || 'Not specified',
                role: newDoc.data().role || 'Not specified',
                photoURL: user.photoURL,
                profileComplete: false
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
    
    // Update profile picture if available
    if (photoURL) {
        profilePictureDisplay.src = photoURL;
        profilePictureEdit.src = photoURL;
    } else {
        // Fallback to default image
        const defaultImage = "https://cdn-icons-png.flaticon.com/512/10928/10928539.png";
        profilePictureDisplay.src = defaultImage;
        profilePictureEdit.src = defaultImage;
    }

    // Update UI based on completion status
    if (profileComplete) {
        // Profile is complete - you could add visual indicators here
        console.log("Profile is complete");
    } else {
        // Profile is incomplete - you could add visual indicators here
        console.log("Profile is incomplete");
    }
}

// Save profile to Firebase - FIXED
async function saveProfile() {
    const user = auth.currentUser;
    if (!user) {
        alert("No user signed in");
        return false;
    }

    try {
        // Get current data first
        const currentDoc = await getDoc(doc(db, "users", user.uid));
        const currentData = currentDoc.exists() ? currentDoc.data() : {};
        
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

        // Determine if profile is complete (all fields filled)
        const isProfileComplete = firstName && lastName && course && year && role;

        const updates = {
            firstName: firstName,
            middleName: middleName, // Middle name is optional
            lastName: lastName,
            course: course,
            year: year,
            role: role,
            profileComplete: isProfileComplete, // Set based on validation
            updatedAt: serverTimestamp()
        };

        console.log("Saving updates:", updates);
        await updateDoc(doc(db, "users", user.uid), updates);
        
        // Verify the save
        const savedDoc = await getDoc(doc(db, "users", user.uid));
        console.log("Verified save:", savedDoc.data());
        
        return true;
    } catch (error) {
        console.error("Save error:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
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

async function finishEditing(save) {
    if (save) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
        
        try {
            const success = await saveProfile();
            if (!success) {
                // If save failed, stay in edit mode
                return;
            }
            
            // Only update UI after successful save
            updateDisplay({
                name: combineName(
                    editFirstName.value.trim(),
                    editMiddleInitial.value.trim(),
                    editLastName.value.trim()
                ),
                email: displayEmail.textContent,
                course: editCourse.value || "Not specified",
                year: editYear.value || "Not specified",
                role: editRole.value || "Not specified"
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

// Auth state listener - FIXED
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