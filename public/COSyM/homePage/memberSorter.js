import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { db } from './profileSettingsModule.js';
import { collection, query, where, getDocs,getFirestore  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
    getAuth
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCNVoM7hQ6a1zcP5zDITcdmUKlfs6lcDBY",
    authDomain: "login-form-783e1.firebaseapp.com",
    projectId: "login-form-783e1",
    storageBucket: "login-form-783e1.appspot.com",
    messagingSenderId: "598925515666",
    appId: "1:598925515666:web:5acb6fa146b160cca47f4b"
};
// Initialize Firebase (do this once in your app)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Cache for loaded members to reduce Firestore reads
let allMembers = [];

export async function initMembersModule() {
    // Load all members initially
    await loadAllMembers();
    
    // Set up event listeners
    courseSelect.addEventListener('change', filterMembers);
    yearSelect.addEventListener('change', filterMembers);
    roleSelect.addEventListener('change', filterMembers);
}

async function loadAllMembers() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        allMembers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        applyFilters();
    } catch (error) {
        console.error("Error loading members:", error);
        showErrorMessage();
    }
}

function applyFilters() {
    const courseFilter = courseSelect.value;
    const yearFilter = yearSelect.value;
    const roleFilter = roleSelect.value;
    
    const filtered = allMembers.filter(member => {
        return (!courseFilter || courseFilter === "all" || member.course === courseFilter) &&
               (!yearFilter || yearFilter === "all" || member.year === yearFilter) &&
               (!roleFilter || roleFilter === "all" || member.role === roleFilter);
    });
    
    displayMembers(filtered);
}

function displayMembers(members) {
    membersList.innerHTML = '';
    
    if (members.length === 0) {
        membersList.innerHTML = '<div class="no-members">No members match your filters</div>';
        return;
    }
    
    members.forEach(member => {
        const memberElement = document.createElement('div');
        memberElement.className = 'member-item';
        memberElement.innerHTML = `
            <div class="member-name">${member.firstName} ${member.lastName}</div>
            <div class="member-course">${member.course || 'Not specified'}</div>
            <div class="member-year">${member.year || 'Not specified'}</div>
            <div class="member-role">${member.role || 'Not specified'}</div>
        `;
        membersList.appendChild(memberElement);
    });
}