import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { collection, getDocs, getFirestore, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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
            
            // Capitalize first letter of each name part
            const capitalize = (str) => str && str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            
            return {
                id: doc.id,
                firstName: capitalize(data.firstName) || '',
                middleName: capitalize(data.middleName) || '',
                lastName: capitalize(data.lastName) || '',
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
async function applyFilters() {
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
        await displayMembers(filteredMembers);
    } catch (error) {
        console.error("Error applying filters:", error);
        showErrorMessage(`Filtering error: ${error.message}`);
    }
}

// Display filtered members itulog next time
async function displayMembers(members) {
    try {
        membersList.innerHTML = '';
        
        if (members.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-members';
            noResults.textContent = 'No members match your filters';
            membersList.appendChild(noResults);
            return;
        }
        
        // Check admin status once at the start
        const isAdmin = await isAdminUser();
        
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
                ${isAdmin ? '<div class="header-actions">Actions</div>' : ''}
            `;
            membersList.appendChild(headerRow);
        }
        
        // Add each member with numbering
        members.forEach((member, index) => {
            const memberElement = document.createElement('div');
            memberElement.className = 'member-item';
            
            // Format name as "Lastname, Firstname M." with proper capitalization
            const formattedName = `${member.lastName}, ${member.firstName}${member.middleName ? ' ' + member.middleName.charAt(0) + '.' : ''}`;
            
            memberElement.innerHTML = `
                <div class="member-number">${index + 1}</div>
                <div class="member-name">${formattedName}</div>
                <div class="member-course">${member.course || 'Not specified'}</div>
                <div class="member-year">${member.year || 'Not specified'}</div>
                <div class="member-role">${member.role || 'Not specified'}</div>
                ${isAdmin ? 
                    `<div class="member-actions">
                        <button class="edit-member-btn" data-member-id="${member.id}">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                    </div>` 
                    : ''}
            `;
            
            membersList.appendChild(memberElement);
        });

        // Add event listeners to edit buttons if they exist
        if (isAdmin) {
            document.querySelectorAll('.edit-member-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const memberId = e.currentTarget.getAttribute('data-member-id');
                    editMember(memberId);
                });
            });
        }
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
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM fully loaded, initializing members module");
    try {
        // Wait for auth to be ready before initializing
        await auth.authStateReady();
        await initMembersModule();
    } catch (error) {
        console.error("Unhandled error in members module:", error);
    }
});
// print
document.getElementById('printButton').addEventListener('click', function() {
    // Get the current filtered members
    const filteredMembers = getCurrentFilteredMembers(); // You'll need to implement this
    
    // Create a print-friendly HTML string
    const printContent = `
        <html>
            <head>
                <title>Members List</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #f5f5f5; text-align: left; padding: 8px; }
                    td { padding: 8px; border-bottom: 1px solid #eee; }
                    .print-date { text-align: right; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <h1>Members List</h1>
                <div class="print-date">Printed on ${new Date().toLocaleDateString()}</div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Course</th>
                            <th>Year</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredMembers.map((member, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${member.lastName}, ${member.firstName} ${member.middleName ? member.middleName.charAt(0) + '.' : ''}</td>
                                <td>${member.course || 'N/A'}</td>
                                <td>${member.year || 'N/A'}</td>
                                <td>${member.role || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
});

// Helper function to get current filtered members
function getCurrentFilteredMembers() {
    // Implement this based on your existing filter logic
    // Should return the currently displayed members array
    return allMembers.filter(member => {
        // Your existing filter logic from applyFilters()
    });
}

// check if the user is no student
async function isAdminUser() {
    try {
        const user = auth.currentUser;
        
        if (!user) {
            console.log("No user logged in");
            return false;
        }
        
        // Get the user document from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            console.log("User document not found");
            return false;
        }
        
        const userData = userDoc.data();
        const userRole = (userData.role || '').toLowerCase().trim();
        
        // Return true if user is not a student
        return userRole !== 'student';
    } catch (error) {
        console.error("Error checking user role:", error);
        return false;
    }
}

// Edit member function
async function editMember(memberId) {
    try {
        // First check if user has permission to edit
        const canEdit = await isAdminUser();
        if (!canEdit) {
            alert("You don't have permission to edit members");
            return;
        }
        
        const member = allMembers.find(m => m.id === memberId);
        if (!member) {
            console.log("Member not found");
            return;
        }
        
        console.log("Editing member:", member);
        
        // Here you would typically:
        // 1. Open a modal/dialog
        // 2. Populate a form with member data
        // 3. Handle form submission to update Firestore
        
        // Example implementation:
        openEditModal(member);
    } catch (error) {
        console.error("Error editing member:", error);
        showErrorMessage("Failed to edit member");
    }
}