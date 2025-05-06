import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { collection, query, where, getDocs, getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCNVoM7hQ6a1zcP5zDITcdmUKlfs6lcDBY",
    authDomain: "login-form-783e1.firebaseapp.com",
    projectId: "login-form-783e1",
    storageBucket: "login-form-783e1.appspot.com",
    messagingSenderId: "598925515666",
    appId: "1:598925515666:web:5acb6fa146b160cca47f4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const courseSelect = document.getElementById('course-select');
const yearSelect = document.getElementById('year-select');
const roleSelect = document.getElementById('role-select');
const membersList = document.getElementById('members-list');

// Cache for loaded members
let allMembers = [];

// Initialize the members module
export async function initMembersModule() {
    // Load all members initially
    await loadAllMembers();
    
    // Set up event listeners for immediate filtering
    courseSelect.addEventListener('change', applyFilters);
    yearSelect.addEventListener('change', applyFilters);
    roleSelect.addEventListener('change', applyFilters);
}

// Load all members from Firestore
async function loadAllMembers() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        allMembers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            firstName: doc.data().firstName || '',
            middleName: doc.data().middleName || '',
            lastName: doc.data().lastName || '',
            course: doc.data().course || '',
            year: doc.data().year || '',
            role: doc.data().role || ''
        }));
        applyFilters(); // Display initial results
    } catch (error) {
        console.error("Error loading members:", error);
        showErrorMessage();
    }
}

// Format name as "Lastname, Firstname M."
function formatName(member) {
    let firstName = member.firstName || '';
    let middleInitial = member.middleName ? `${member.middleName.charAt(0)}.` : '';
    let lastName = member.lastName || '';
    
    return `${lastName}, ${firstName} ${middleInitial}`.trim();
}

// Apply filters based on current selections
function applyFilters() {
    const courseFilter = courseSelect.value;
    const yearFilter = yearSelect.value;
    const roleFilter = roleSelect.value;
    
    // Filter members based on exact matches
    let filteredMembers = allMembers.filter(member => {
        const matchesCourse = !courseFilter || member.course === courseFilter;
        const matchesYear = !yearFilter || member.year === yearFilter;
        const matchesRole = !roleFilter || member.role === roleFilter;
        
        return matchesCourse && matchesYear && matchesRole;
    });
    
    // Sort members alphabetically by last name, then first name
    filteredMembers.sort((a, b) => {
        const nameA = `${a.lastName} ${a.firstName}`.toUpperCase();
        const nameB = `${b.lastName} ${b.firstName}`.toUpperCase();
        return nameA.localeCompare(nameB);
    });
    
    displayMembers(filteredMembers);
}

// Display filtered members with numbering
function displayMembers(members) {
    membersList.innerHTML = '';
    
    if (members.length === 0) {
        membersList.innerHTML = '<div class="no-members">No members match your filters</div>';
        return;
    }
    
    members.forEach((member, index) => {
        const memberElement = document.createElement('div');
        memberElement.className = 'member-item';
        memberElement.innerHTML = `
            <div class="member-number">${index + 1}.</div>
            <div class="member-name">${formatName(member)}</div>
            <div class="member-course">${member.course || 'Not specified'}</div>
            <div class="member-year">${member.year || 'Not specified'}</div>
            <div class="member-role">${member.role || 'Not specified'}</div>
        `;
        membersList.appendChild(memberElement);
    });
}

// Show error message
function showErrorMessage() {
    membersList.innerHTML = '<div class="error-message">Error loading members. Please try again.</div>';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMembersModule().catch(console.error);
});