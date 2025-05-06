import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { collection, getDocs, getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCNVoM7hQ6a1zcP5zDITcdmUKlfs6lcDBY",
    authDomain: "login-form-783e1.firebaseapp.com",
    projectId: "login-form-783e1",
    storageBucket: "login-form-783e1.firebasestorage.com",
    messagingSenderId: "598925515666",
    appId: "1:598925515666:web:5acb6fa146b160cca47f4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const courseSelect = document.getElementById('course-select');
const yearSelect = document.getElementById('year-select');
const roleSelect = document.getElementById('role-select');
const membersList = document.getElementById('members-list');

// Cache for loaded members
let allMembers = [];

// Initialize the members module
export async function initMembersModule() {
    try {
        console.log("Initializing members module...");
        
        // Add "All" options programmatically
        addAllOption(courseSelect);
        addAllOption(yearSelect);
        addAllOption(roleSelect);
        
        // Load all members initially
        await loadAllMembers();
        
        // Set up event listeners for immediate filtering
        courseSelect.addEventListener('change', applyFilters);
        yearSelect.addEventListener('change', applyFilters);
        roleSelect.addEventListener('change', applyFilters);
        
        console.log("Members module initialized successfully");
    } catch (error) {
        console.error("Initialization error:", error);
        showErrorMessage(`Initialization failed: ${error.message}`);
    }
}

function addAllOption(selectElement) {
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All';
    selectElement.insertBefore(allOption, selectElement.firstChild);
}

// Load all members from Firestore
async function loadAllMembers() {
    try {
        console.log("Loading members from Firestore...");
        const querySnapshot = await getDocs(collection(db, "users"));
        
        console.log(`Found ${querySnapshot.size} members`);
        
        allMembers = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log(`Processing member ${doc.id}:`, data);
            
            // Normalize role by replacing spaces with colons for consistent filtering
            const role = data.role || '';
            const normalizedRole = role.replace(/ /g, ':');
            
            // Determine if member is an officer
            const isOfficer = role.toLowerCase().includes('officer');
            
            return {
                id: doc.id,
                firstName: data.firstName || '',
                middleName: data.middleName || '',
                lastName: data.lastName || '',
                course: data.course || '',
                year: data.year || '',
                role: role,
                normalizedRole: normalizedRole,
                isOfficer: isOfficer,
                // Create sortable name for alphabetical sorting
                sortName: `${data.lastName || ''}, ${data.firstName || ''} ${data.middleName ? data.middleName.charAt(0) + '.' : ''}`.trim()
            };
        });
        
        applyFilters(); // Display initial results
    } catch (error) {
        console.error("Error loading members:", error);
        showErrorMessage(`Failed to load members: ${error.message}`);
        throw error;
    }
}

// Apply filters based on current selections
function applyFilters() {
    try {
        const courseFilter = courseSelect.value;
        const yearFilter = yearSelect.value;
        const roleFilter = roleSelect.value;
        
        console.log(`Applying filters - Course: ${courseFilter}, Year: ${yearFilter}, Role: ${roleFilter}`);
        
        // Filter members
        let filteredMembers = allMembers.filter(member => {
            const courseMatch = !courseFilter || member.course === courseFilter;
            const yearMatch = !yearFilter || member.year === yearFilter;
            
            // Special handling for "Officer" filter
            let roleMatch;
            if (roleFilter === 'Officer') {
                roleMatch = member.isOfficer;
            } else if (!roleFilter) {
                roleMatch = true;
            } else {
                roleMatch = member.normalizedRole === roleFilter;
            }
            
            return courseMatch && yearMatch && roleMatch;
        });
        
        // Sort members alphabetically by last name, then first name
        filteredMembers.sort((a, b) => a.sortName.localeCompare(b.sortName));
        
        console.log(`Found ${filteredMembers.length} matching members`);
        displayMembers(filteredMembers);
    } catch (error) {
        console.error("Error applying filters:", error);
        showErrorMessage(`Filtering error: ${error.message}`);
    }
}

// Display filtered members
function displayMembers(members) {
    try {
        membersList.innerHTML = '';
        
        if (members.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-members';
            noResults.textContent = 'No members match your filters';
            membersList.appendChild(noResults);
            return;
        }
        
        // Create header row (only if it doesn't exist)
        if (!document.querySelector('.members-list-header')) {
            const headerRow = document.createElement('div');
            headerRow.className = 'members-list-header';
            headerRow.innerHTML = `
                <div class="header-number">#</div>
                <div class="header-name">Name</div>
                <div class="header-course">Course</div>
                <div class="header-year">Year</div>
                <div class="header-role">Role</div>
            `;
            membersList.appendChild(headerRow);
        }
        
        // Add each member with numbering
        members.forEach((member, index) => {
            const memberElement = document.createElement('div');
            memberElement.className = 'member-item';
            
            // Format name as "Lastname, Firstname M."
            const formattedName = `${member.lastName}, ${member.firstName}${member.middleName ? ' ' + member.middleName.charAt(0) + '.' : ''}`;
            
            memberElement.innerHTML = `
                <div class="member-number">${index + 1}</div>
                <div class="member-name">${formattedName}</div>
                <div class="member-course">${member.course || 'Not specified'}</div>
                <div class="member-year">${member.year || 'Not specified'}</div>
                <div class="member-role">${member.role || 'Not specified'}</div>
            `;
            
            membersList.appendChild(memberElement);
        });
    } catch (error) {
        console.error("Error displaying members:", error);
        showErrorMessage(`Display error: ${error.message}`);
    }
}

// Show error message
function showErrorMessage(message = 'Error loading members. Please try again.') {
    membersList.innerHTML = `
        <div class="error-message">
            ${message}
            <button onclick="window.location.reload()">Retry</button>
        </div>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing members module");
    initMembersModule().catch(error => {
        console.error("Unhandled error in members module:", error);
    });
});