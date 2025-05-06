document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Dynamically import Firebase modules
        const [{ auth, db, onAuthStateChanged }, firestore] = await Promise.all([
            import('./profileSettingsModule.js'),
            import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js')
        ]);
        const { doc, getDoc, onSnapshot } = firestore;

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
        let unsubscribeProfileListener = null;

        // 1. Initialize page - force profile section first
        function initializePage() {
            // Hide all sections
            Object.values(sections).forEach(section => {
                section.style.display = 'none';
            });
            
            // Show profile section by default
            showSection('profile');
        }

        // 2. Check profile completion - improved with better error handling
        async function isProfileComplete(user) {
            if (!user) return false;

            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (!userDoc.exists()) {
                    console.log("User document doesn't exist");
                    return false;
                }
                
                const profileComplete = userDoc.data().profileComplete;
                console.log("Profile completion status:", profileComplete);
                return profileComplete === true;
            } catch (error) {
                console.error("Profile check error:", error);
                return false;
            }
        }

        // 3. Show section with completion check
        async function showSection(sectionName) {
            const user = auth.currentUser;
            const isComplete = await isProfileComplete(user);
            
            console.log(`Attempting to show ${sectionName}, profile complete: ${isComplete}`);
            
            // Always allow profile section
            if (sectionName !== 'profile' && !isComplete) {
                showNotification('Please complete your profile first');
                return showSection('profile'); // Force profile section
            }
            
            // Hide current section
            if (currentSection) {
                sections[currentSection].style.display = 'none';
                navButtons[currentSection].classList.remove('active');
            }
            
            // Show new section
            sections[sectionName].style.display = 'block';
            navButtons[sectionName].classList.add('active');
            currentSection = sectionName;
            
            // Update navigation buttons
            updateNavigationAccess(isComplete);
        }

        // 4. Update navigation buttons
        function updateNavigationAccess(isComplete) {
            Object.entries(navButtons).forEach(([name, button]) => {
                if (name !== 'profile') {
                    button.classList.toggle('disabled', !isComplete);
                }
            });
        }

        // 5. Show notification
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

        // Auth state listener
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("User authenticated:", user.uid);
                
                // Clean up previous listener if exists
                if (unsubscribeProfileListener) {
                    unsubscribeProfileListener();
                }
                
                initializePage();
                const complete = await isProfileComplete(user);
                updateNavigationAccess(complete);
                
                // Real-time listener for profile changes
                const userDocRef = doc(db, "users", user.uid);
                unsubscribeProfileListener = onSnapshot(userDocRef, (doc) => {
                    const isComplete = doc.exists() && doc.data().profileComplete === true;
                    console.log("Real-time profile update - complete:", isComplete);
                    updateNavigationAccess(isComplete);
                });

                // Watch for profile form submissions
                const profileForm = document.getElementById('editProfileForm');
                if (profileForm) {
                    profileForm.addEventListener('submit', () => {
                        setTimeout(async () => {
                            const updatedComplete = await isProfileComplete(user);
                            updateNavigationAccess(updatedComplete);
                        }, 500);
                    });
                }
            } else {
                console.log("User signed out");
                // Handle sign-out if needed
                if (unsubscribeProfileListener) {
                    unsubscribeProfileListener();
                    unsubscribeProfileListener = null;
                }
            }
        });

    } catch (error) {
        console.error("Initialization error:", error);
        alert("Failed to initialize application. Please refresh the page.");
    }
});