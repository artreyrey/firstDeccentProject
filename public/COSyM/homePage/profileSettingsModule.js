
// Profile section edit adn display connected to firebase data base
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

// Form fields
const [editFirstName, editMiddleInitial, editLastName, editCourse, editYear, editRole] = [
    'editFirstName', 'editMiddleInitial', 'editLastName', 'editCourse', 'editYear', 'editRole'
].map(id => document.getElementById(id));

// Display fields
const [displayName, displayCourse, displayYear, displayRole, displayEmail] = [
    'displayName', 'displayCourse', 'displayYear', 'displayRole', 'displayEmail'
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

async function displayUserProfile(user) {
        try {
            console.log(`Loading profile for: ${user.uid}`);
            
            // Force fetch from server (bypass cache)
            const userDoc = await getDoc(doc(db, "users", user.uid), { source: 'server' });
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("Retrieved user data:", userData);
                
                // Ensure all fields exist in the document
                const completeUserData = {
                    firstName: userData.firstName || '',
                    middleName: userData.middleName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || user.email,
                    course: userData.course || 'Not specified',
                    year: userData.year || 'Not specified',
                    role: userData.role || 'Not specified',
                    profileComplete: userData.profileComplete || false
                };
                
                // Update the document if any critical fields are missing
                if (!userData.course || !userData.year || !userData.role) {
                    await updateDoc(doc(db, "users", user.uid), {
                        course: completeUserData.course,
                        year: completeUserData.year,
                        role: completeUserData.role
                    });
                }
                
                updateDisplay(completeUserData);
            } else {
                console.log("No document found, creating new one");
                await initializeUserProfile(user);
                updateDisplay({
                    name: "User",
                    email: user.email,
                    course: "Not specified",
                    year: "Not specified",
                    role: "Not specified"
                });
            }
        } catch (error) {
            console.error("Profile load error:", error);
            alert("Failed to load profile. Please try again.");
        }
    }
    
    // Modified initializeUserProfile to include all fields
    async function initializeUserProfile(user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            firstName: '',
            middleName: '',
            lastName: '',
            email: user.email,
            course: 'Not specified',
            year: 'Not specified',
            role: 'Not specified',
            profileComplete: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true });
    }
    
    function updateDisplay({name, email, course, year, role}) {
        displayName.textContent = name;
        displayEmail.textContent = email;
        displayCourse.textContent = course;
        displayYear.textContent = year;
        displayRole.textContent = role;
    }

// Save profile to Firebase
async function saveProfile() {
    const user = auth.currentUser;
    if (!user) {
        alert("No user signed in");
        return false;
    }

    try {
        const updates = {
            firstName: editFirstName.value.trim(),
            middleName: editMiddleInitial.value.trim(),
            lastName: editLastName.value.trim(),
            course: editCourse.value.trim(),
            year: editYear.value.trim(),
            role: editRole.value.trim(),
            profileComplete: true,
            updatedAt: serverTimestamp()  // Using server timestamp
        };

        if (!updates.firstName || !updates.lastName) {
            throw new Error("First and last names are required");
        }

        console.log("Attempting to save:", updates);
        await updateDoc(doc(db, "users", user.uid), updates);
        
        // Verify the save
        const savedDoc = await getDoc(doc(db, "users", user.uid));
        console.log("Verified save:", savedDoc.data());
        
        return true;
    } catch (error) {
        console.error("Save error details:", {
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

// Editing

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

// Auth state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayUserProfile(user);
    } else {
        updateDisplay({
            name: "",
            email: "",
            course: "",
            year: "",
            role: ""
        });
    }
});