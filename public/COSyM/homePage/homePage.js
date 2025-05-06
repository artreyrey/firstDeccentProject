document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navButtons = {
        home: document.getElementById('home-button'),
        profile: document.getElementById('profile-button'),
        members: document.getElementById('members-button'),
        funds: document.getElementById('funds-button'),
        events: document.getElementById('events-button'),
        reviews: document.getElementById('reviews-button')
    };

    const sections = {
        home: document.getElementById('home-section'),
        profile: document.getElementById('profile-section'),
        members: document.getElementById('members-section'),
        funds: document.getElementById('funds-section'),
        events: document.getElementById('events-section'),
        reviews: document.getElementById('reviews-section')
    };

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'profile-notification';
    document.body.appendChild(notification);

    // Track current section
    let currentSection = null;

    // 1. Initialize page - show profile section first
    function initializePage() {
        // Hide all sections
        Object.values(sections).forEach(section => {
            section.style.display = 'none';
        });
        
        // Show profile section by default
        showSection('profile');
    }

    // 2. Show section
    function showSection(sectionName) {
        // Hide current section
        if (currentSection) {
            sections[currentSection].style.display = 'none';
            navButtons[currentSection].classList.remove('active');
        }
        
        // Show new section
        sections[sectionName].style.display = 'block';
        navButtons[sectionName].classList.add('active');
        currentSection = sectionName;
    }

    // 3. Show notification (optional)
    function showNotification(message) {
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => notification.style.display = 'none', 3000);
    }

    // Event listeners for navigation
    Object.entries(navButtons).forEach(([sectionName, button]) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(sectionName);
        });
    });

    // Initialize the page
    initializePage();
});