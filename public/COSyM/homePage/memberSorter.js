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
            ...doc.data()
        }));
        applyFilters(); // Display initial results
    } catch (error) {
        console.error("Error loading members:", error);
        showErrorMessage();
    }
}

// Apply filters based on current selections
function applyFilters() {
    const courseFilter = courseSelect.value;
    const yearFilter = yearSelect.value;
    const roleFilter = roleSelect.value;
    
    // Filter members based on selections
    const filteredMembers = allMembers.filter(member => {
        const matchesCourse = !courseFilter || member.course === courseFilter;
        const matchesYear = !yearFilter || String(member.year) === yearFilter;
        const matchesRole = !roleFilter || member.role === roleFilter;
        
        return matchesCourse && matchesYear && matchesRole;
    });
    
    displayMembers(filteredMembers);
}

// Display filtered members
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
            <div class="member-name">${member.firstName || ''} ${member.lastName || ''}</div>
            <div class="member-course">${getCourseDisplayName(member.course)}</div>
            <div class="member-year">${getYearDisplayName(member.year)}</div>
            <div class="member-role">${member.role || 'Not specified'}</div>
        `;
        membersList.appendChild(memberElement);
    });
}

// Helper function to display course names properly
function getCourseDisplayName(courseCode) {
    switch(courseCode) {
        case 'CE': return 'Bachelor of Science in Computer Engineering';
        case 'CS': return 'Bachelor of Science in Computer Science';
        default: return courseCode || 'Not specified';
    }
}

// Helper function to display year names properly
function getYearDisplayName(year) {
    switch(year) {
        case '1': return '1st Year';
        case '2': return '2nd Year';
        case '3': return '3rd Year';
        case '4': return '4th Year';
        case 'na': return 'N/A';
        default: return year || 'Not specified';
    }
}

// Show error message
function showErrorMessage() {
    membersList.innerHTML = '<div class="error-message">Error loading members. Please try again.</div>';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMembersModule().catch(console.error);
});