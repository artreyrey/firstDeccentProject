//Pag cinlick feature, mashoshow yung certain section
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

// responsiveness pagmaliit device
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const navLinks = document.querySelectorAll('.sidebar ul li a:not(#sign-out-button)');
    
    // Toggle sidebar
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking on any nav link (except Sign Out)
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
});


// Profile section edit adn display connected to
// Firebase configuration 
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} 
  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  import {getFirestore, setDoc, doc} 
  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCNVoM7hQ6a1zcP5zDITcdmUKlfs6lcDBY",
    authDomain: "login-form-783e1.firebaseapp.com",
    projectId: "login-form-783e1",
    storageBucket: "login-form-783e1.firebasestorage.app",
    messagingSenderId: "598925515666",
    appId: "1:598925515666:web:b16534b6158c7232a47f4b"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore();
  auth.languageCode = 'en';

//profile set up
const editButton = document.getElementById('editButton');
const saveButton = document.getElementById('saveProfileBtn');
const cancelButton = document.getElementById('cancelEditBtn');

const editForm = document.getElementById('editMode');
const displayForm = document.getElementById('displayMode');

// Form fields
const editName = document.getElementById('editName');
const editCourse = document.getElementById('editCourse');
const editYear = document.getElementById('editYear');
const editRole = document.getElementById('editRole');
const editEmail = document.getElementById('editEmail');
const editStatus = document.getElementById('editStatus');

// Display fields
const displayName = document.getElementById('displayName');
const displayCourse = document.getElementById('displayCourse');
const displayYear = document.getElementById('displayYear');
const displayRole = document.getElementById('displayRole');
const displayEmail = document.getElementById('displayEmail');
const displayStatus = document.getElementById('displayStatus');

// Edit button click handler
editButton.addEventListener('click', function() {
    // Copy current display values to edit form
    editName.value = displayName.textContent;
    editCourse.value = displayCourse.textContent;
    editYear.value = displayYear.textContent;
    editRole.value = displayRole.textContent;
    editEmail.value = displayEmail.textContent;
    editStatus.value = displayStatus.textContent;
    
    // Switch modes
    displayForm.style.display = "none";
    editForm.style.display = "flex";
});

// Save button click handler
saveButton.addEventListener('click', function() {
    // Update display with edited values
    displayName.textContent = editName.value;
    displayCourse.textContent = editCourse.value;
    displayYear.textContent = editYear.value;
    displayRole.textContent = editRole.value;
    displayEmail.textContent = editEmail.value;
    displayStatus.textContent = editStatus.value;
    
    // Switch back to display mode
    displayForm.style.display = "flex";
    editForm.style.display = "none";
    
    // Here you would typically add your Firebase save logic
    // saveToFirebase();
    // save the profile in the firebase too
});

// Cancel button click handler
cancelButton.addEventListener('click', function() {
    // Just switch back to display mode without saving
    displayForm.style.display = "flex";
    editForm.style.display = "none";
});


// profile fetching
//dapat may role muna bago ka makapag navigate ng home and profile 

//need ng animation sa pprofile muna para makita ng users, dapat required

//after making profile dapat

//if admin mashoshow yung ibang buttons if member makikita lang and searching.