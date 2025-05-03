
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
    onAuthStateChanged
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
async function initializeUserProfile(user) {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
        await setDoc(userRef, {
            firstName: '',
            middleName: '',
            lastName: '',
            email: user.email,
            course: '',
            year: '',
            role: '',
            profileComplete: false,
            createdAt: new Date()
        }, { merge: true });  // Use merge to prevent overwriting
    }
}


// Profile management
async function displayUserProfile(user) {
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.profileComplete) {
                updateDisplay({
                    name: combineName(userData.firstName, userData.middleName, userData.lastName),
                    email: userData.email || user.email,
                    course: userData.course,
                    year: userData.year,
                    role: userData.role
                });
            } else {
                // Handle incomplete profile
                await initializeUserProfile(user);
            }
        } else {
            await initializeUserProfile(user);
        }
    } catch (error) {
        console.error("Profile load error:", error);
        alert("Failed to load profile. Please try again.");
    }
}

function updateDisplay({name, email, course, year, role}) {
    displayName.textContent = name || "Not specified";
    displayEmail.textContent = email || "";
    displayCourse.textContent = course || "Not specified";
    displayYear.textContent = year || "Not specified";
    displayRole.textContent = role || "Not specified";
}

// Save profile to Firebase
async function saveProfile() {
    const user = auth.currentUser;
    if (!user) return false;

    try {
        const updates = {
            firstName: editFirstName.value.trim(),
            middleName: editMiddleInitial.value.trim(),
            lastName: editLastName.value.trim(),
            course: editCourse.value.trim(),
            year: editYear.value.trim(),
            role: editRole.value.trim(),
            profileComplete: true,
            updatedAt: new Date()
        };

        if (!updates.firstName || !updates.lastName) {
            throw new Error("First and last names are required");
        }

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