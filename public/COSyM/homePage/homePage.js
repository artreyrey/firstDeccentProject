//displaying of signup/ login
//ibahin pang navigate ng home page.
// Get all buttons and sections
const homeButton = document.getElementById('home-button');
const profileButton = document.getElementById('profile-button');
const membersButton = document.getElementById('members-button'); // Fixed ID to match HTML
const fundsButton = document.getElementById('funds-button');
const eventsButton = document.getElementById('events-button');
const reviewsButton = document.getElementById('reviews-button');

const homeSection = document.getElementById('home-section');
const profileSection = document.getElementById('profile-section');
const membersSection = document.getElementById('members-section');
const fundsSection = document.getElementById('funds-section');
const eventsSection = document.getElementById('events-section');
const reviewsSection = document.getElementById('reviews-section');

// Hide all sections except home by default
function initializeSections() {
    homeSection.style.display = "block";
    profileSection.style.display = "none";
    membersSection.style.display = "none";
    fundsSection.style.display = "none";
    eventsSection.style.display = "none";
    reviewsSection.style.display = "none";
}

// Show only the selected section
function showSection(section) {
    const allSections = [homeSection, profileSection, membersSection, 
                        fundsSection, eventsSection, reviewsSection];
    
    allSections.forEach(sec => {
        sec.style.display = sec === section ? "block" : "none";
    });
}

// Add event listeners to buttons
homeButton.addEventListener('click', () => showSection(homeSection));
profileButton.addEventListener('click', () => showSection(profileSection));
membersButton.addEventListener('click', () => showSection(membersSection));
fundsButton.addEventListener('click', () => showSection(fundsSection));
eventsButton.addEventListener('click', () => showSection(eventsSection));
reviewsButton.addEventListener('click', () => showSection(reviewsSection));

// Initialize on page load
window.addEventListener('DOMContentLoaded', initializeSections);


//profile set up

//dapat may role muna bago ka makapag navigate ng home and profile 

//need ng animation sa pprofile muna para makita ng users, dapat required

//after making profile dapat

//if admin mashoshow yung ibang buttons if member makikita lang and searching.