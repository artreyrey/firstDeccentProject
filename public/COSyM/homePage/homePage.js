//displaying of signup/ login
//ibahin pang navigate ng home page.
document.addEventListener('DOMContentLoaded', function() {
    // Get all buttons and sections
    const homeButton = document.getElementById('home-button');
    const profileButton = document.getElementById('profile-button');
    const membersButton = document.getElementById('members-button');
    const fundsButton = document.getElementById('funds-button');
    const eventsButton = document.getElementById('events-button');
    const reviewsButton = document.getElementById('reviews-button');

    const homeSection = document.getElementById('home-section');
    const profileSection = document.getElementById('profile-section');
    const membersSection = document.getElementById('members-section');
    const fundsSection = document.getElementById('funds-section');
    const eventsSection = document.getElementById('events-section');
    const reviewsSection = document.getElementById('reviews-section');

    const navButtons = [homeButton, profileButton, membersButton, fundsButton, eventsButton, reviewsButton];
    const sections = [homeSection, profileSection, membersSection, fundsSection, eventsSection, reviewsSection];

    // 1. Initialize page - show only home section and highlight home button
    function initializePage() {
        // Hide all sections
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show home section
        homeSection.style.display = 'block';
        
        // Remove active class from all buttons
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Add active class to home button
        homeButton.classList.add('active');
    }

    // 2. Function to show a specific section and update active button
    function showSection(sectionToShow, buttonToActivate) {
        // Hide all sections
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show the requested section
        sectionToShow.style.display = 'block';
        
        // Remove active class from all buttons
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // 3. Add active class to clicked button
        buttonToActivate.classList.add('active');
    }

    // Set up event listeners for navigation buttons
    homeButton.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(homeSection, homeButton);
    });

    profileButton.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(profileSection, profileButton);
    });

    membersButton.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(membersSection, membersButton);
    });

    fundsButton.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(fundsSection, fundsButton);
    });

    eventsButton.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(eventsSection, eventsButton);
    });

    reviewsButton.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(reviewsSection, reviewsButton);
    });

    // Initialize the page
    initializePage();
});


//profile set up

//dapat may role muna bago ka makapag navigate ng home and profile 

//need ng animation sa pprofile muna para makita ng users, dapat required

//after making profile dapat

//if admin mashoshow yung ibang buttons if member makikita lang and searching.