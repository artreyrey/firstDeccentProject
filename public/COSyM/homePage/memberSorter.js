import { db } from './profileSettingsModule.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// DOM Elements
const courseSelect = document.getElementById('course-select');
const yearSelect = document.getElementById('year-select');
const roleSelect = document.getElementById('role-select');
const membersList = document.getElementById('members-list');

// Initialize the members module
export async function initMembersModule() {
    // Load initial members (all members)
    await filterMembers();
    
    // Add event listeners for filter changes
    courseSelect.addEventListener('change', filterMembers);
    yearSelect.addEventListener('change', filterMembers);
    roleSelect.addEventListener('change', filterMembers);
}

// Filter members based on selected criteria
async function filterMembers() {
    try {
        // Get selected filter values
        const courseFilter = courseSelect.value;
        const yearFilter = yearSelect.value;
        const roleFilter = roleSelect.value;
        
        // Create a query that filters based on selections
        let membersQuery = query(collection(db, "users"));
        
        // Add filters only if they're not set to "all" or default
        if (courseFilter && courseFilter !== "all") {
            membersQuery = query(membersQuery, where("course", "==", courseFilter));
        }
        
        if (yearFilter && yearFilter !== "all") {
            membersQuery = query(membersQuery, where("year", "==", yearFilter));
        }
        
        if (roleFilter && roleFilter !== "all") {
            membersQuery = query(membersQuery, where("role", "==", roleFilter));
        }
        
        // Execute the query
        const querySnapshot = await getDocs(membersQuery);
        
        // Clear existing members
        membersList.innerHTML = '';
        
        if (querySnapshot.empty) {
            membersList.innerHTML = '<div class="no-members">No members match your filters</div>';
            return;
        }
        
        // Process and display each member
        querySnapshot.forEach((doc) => {
            const member = doc.data();
            displayMember(member);
        });
        
    } catch (error) {
        console.error("Error filtering members:", error);
        membersList.innerHTML = '<div class="error-message">Error loading members</div>';
    }
}

// Display a single member in the list
function displayMember(member) {
    const memberElement = document.createElement('div');
    memberElement.className = 'member-item';
    
    // Combine first and last name
    const fullName = `${member.firstName} ${member.lastName}`;
    
    memberElement.innerHTML = `
        <div class="member-name">${fullName}</div>
        <div class="member-course">${member.course || 'Not specified'}</div>
        <div class="member-year">${member.year || 'Not specified'}</div>
        <div class="member-role">${member.role || 'Not specified'}</div>
    `;
    
    membersList.appendChild(memberElement);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMembersModule().catch(console.error);
});