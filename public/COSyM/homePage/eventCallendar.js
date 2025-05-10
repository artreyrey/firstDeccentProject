import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { collection, getDocs, getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getDatabase, ref, set, push, update, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNVoM7hQ6a1zcP5zDITcdmUKlfs6lcDBY",
  authDomain: "login-form-783e1.firebaseapp.com",
  databaseURL: "https://login-form-783e1-default-rtdb.firebaseio.com",
  projectId: "login-form-783e1",
  storageBucket: "login-form-783e1.appspot.com",
  messagingSenderId: "598925515666",
  appId: "1:598925515666:web:5acb6fa146b160cca47f4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM Elements
const monthYearElement = document.getElementById('month-year');
const daysContainer = document.getElementById('days-container');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const todayBtn = document.getElementById('today-btn');
const eventModal = document.getElementById('event-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalDateElement = document.getElementById('modal-date');
const eventsListElement = document.getElementById('events-list');
const addEventBtn = document.getElementById('add-event');
const doneEventBtn = document.getElementById('done-event');
const eventTitleInput = document.getElementById('event-title');
const eventLinkInput = document.getElementById('event-link');
const starRating = document.getElementById('stars');

// Current date info
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;
let userRole = 'student'; // Default to student
let currentRating = 0;
let selectedEventId = null;

// Initialize calendar
renderCalendar(currentMonth, currentYear);

// Check auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in - check their role
        checkUserRole(user.uid).then(role => {
            userRole = role;
            console.log(`User is signed in as ${userRole}`);
            
            // Load events
            loadEvents();
            
            // Update UI based on role
            updateUIForRole();
        });
    } else {
        // User is signed out - sign in anonymously as student
        signInAnonymously(auth)
            .then(() => {
                console.log("Signed in anonymously as student");
                userRole = 'student';
                updateUIForRole();
                loadEvents();
            })
            .catch((error) => {
                console.error("Error signing in anonymously:", error);
            });
    }
});

// Event listeners
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

todayBtn.addEventListener('click', () => {
    currentDate = new Date();
    currentMonth = currentDate.getMonth();
    currentYear = currentDate.getFullYear();
    renderCalendar(currentMonth, currentYear);
});

closeModalBtn.addEventListener('click', () => {
    eventModal.style.display = 'none';
    resetEventForm();
});

addEventBtn.addEventListener('click', addEvent);
doneEventBtn.addEventListener('click', markEventAsDone);

// Star rating
document.querySelectorAll('.star-rating a').forEach((star, index) => {
    star.addEventListener('click', (e) => {
        e.preventDefault();
        if (userRole === 'student') {
            currentRating = index + 1;
            updateStarRating(currentRating);
            saveRating();
        }
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        eventModal.style.display = 'none';
        resetEventForm();
    }
});

// Functions
async function checkUserRole(uid) {
    // In a real app, you would check the user's role from your database
    // For this example, we'll use a simple check
    try {
        const userRef = ref(database, `users/${uid}`);
        const snapshot = await onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            return userData && userData.role ? userData.role : 'student';
        }, { onlyOnce: true });
        
        // Default to student if role not found
        return 'student';
    } catch (error) {
        console.error("Error checking user role:", error);
        return 'student';
    }
}

function updateUIForRole() {
    if (userRole === 'officer') {
        // Show add event button and form fields
        document.querySelector('.event-input').style.display = 'flex';
        document.querySelector('.add-btn').style.display = 'block';
        document.querySelector('.done-btn').style.display = 'block';
    } else {
        // Hide add event button and form fields for students
        document.querySelector('.event-input').style.display = 'none';
        document.querySelector('.add-btn').style.display = 'none';
        document.querySelector('.done-btn').style.display = 'none';
    }
}

function renderCalendar(month, year) {
    // Update month/year display
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
    monthYearElement.textContent = `${monthNames[month]} ${year}`;
    
    // Clear previous days
    daysContainer.innerHTML = '';
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get days from previous month to display
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Create days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
        createDayElement(daysInPrevMonth - i, true);
    }
    
    // Create days for current month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = createDayElement(i, false);
        
        // Highlight today
        if (i === currentDate.getDate() && 
            month === currentDate.getMonth() && 
            year === currentDate.getFullYear()) {
            dayElement.classList.add('today');
        }
    }
    
    // Calculate days needed from next month
    const totalDaysDisplayed = firstDay + daysInMonth;
    const remainingDays = 7 - (totalDaysDisplayed % 7);
    
    // Create days from next month if needed
    if (remainingDays < 7) {
        for (let i = 1; i <= remainingDays; i++) {
            createDayElement(i, true);
        }
    }
}

function createDayElement(day, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('day');
    if (isOtherMonth) dayElement.classList.add('other-month');
    
    const dayNumber = document.createElement('div');
    dayNumber.classList.add('day-number');
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // Check for events
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = formatDateKey(date);
    const eventsRef = ref(database, `events/${dateKey}`);
    
    onValue(eventsRef, (snapshot) => {
        const eventsData = snapshot.val();
        
        // Clear previous event indicators
        dayElement.querySelectorAll('.event-indicator, .average-rating').forEach(el => el.remove());
        
        if (eventsData) {
            // Highlight with orange if there are active events
            const hasActiveEvents = Object.values(eventsData).some(
                event => !event.completed && new Date(event.timestamp) >= new Date()
            );
            
            if (hasActiveEvents) {
                dayElement.style.backgroundColor = 'rgba(255, 165, 0, 0.2)';
                
                // Add event indicator
                const eventIndicator = document.createElement('div');
                eventIndicator.classList.add('event-indicator');
                dayElement.appendChild(eventIndicator);
            }
            
            // Calculate and show average rating if available
            const ratings = Object.values(eventsData)
                .filter(event => event.rating)
                .map(event => event.rating);
            
            if (ratings.length > 0) {
                const averageRating = ratings.reduce((a, b) => a + b) / ratings.length;
                const ratingElement = document.createElement('div');
                ratingElement.classList.add('average-rating');
                ratingElement.innerHTML = `<i class="fas fa-star"></i> ${averageRating.toFixed(1)}`;
                dayElement.appendChild(ratingElement);
            }
        }
    }, { onlyOnce: true });
    
    if (!isOtherMonth) {
        dayElement.addEventListener('click', () => {
            // Remove previous selection
            document.querySelectorAll('.day.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Add selection to clicked day
            dayElement.classList.add('selected');
            
            // Set selected date and open modal
            selectedDate = new Date(currentYear, currentMonth, day);
            openEventModal(selectedDate);
        });
    }
    
    daysContainer.appendChild(dayElement);
    return dayElement;
}

function openEventModal(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    modalDateElement.textContent = date.toLocaleDateString('en-US', options);
    
    // Display events for this date
    const dateKey = formatDateKey(date);
    displayEvents(dateKey);
    
    eventModal.style.display = 'flex';
    eventTitleInput.focus();
}

function displayEvents(dateKey) {
    eventsListElement.innerHTML = '';
    const eventsRef = ref(database, `events/${dateKey}`);
    
    onValue(eventsRef, (snapshot) => {
        const eventsData = snapshot.val();
        eventsListElement.innerHTML = '';
        
        if (eventsData) {
            Object.entries(eventsData).forEach(([eventId, event]) => {
                if (!event.completed || new Date(event.timestamp) >= new Date()) {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('event-item');
                    eventElement.setAttribute('data-event-id', eventId);
                    
                    let eventHTML = `
                        <div class="event-content">
                            <strong>${event.title || 'No title'}</strong>
                            <p><a href="${event.link || '#'}" target="_blank">View Document</a></p>
                    `;
                    
                    if (event.rating) {
                        eventHTML += `<div class="event-rating">Rating: ${event.rating}/5</div>`;
                    }
                    
                    if (userRole === 'officer' && !event.completed) {
                        eventHTML += `<button class="complete-btn">Mark as Complete</button>`;
                    }
                    
                    eventHTML += `</div>`;
                    
                    eventElement.innerHTML = eventHTML;
                    eventsListElement.appendChild(eventElement);
                    
                    // Add event listener to complete button if it exists
                    const completeBtn = eventElement.querySelector('.complete-btn');
                    if (completeBtn) {
                        completeBtn.addEventListener('click', () => {
                            markEventAsComplete(dateKey, eventId);
                        });
                    }
                }
            });
        } else {
            eventsListElement.innerHTML = '<div class="no-events">No events for this date</div>';
        }
    });
}

function addEvent() {
    const eventTitle = eventTitleInput.value.trim();
    const eventLink = eventLinkInput.value.trim();
    
    if (!eventTitle || !eventLink) {
        alert('Please enter both title and document link');
        return;
    }
    
    const dateKey = formatDateKey(selectedDate);
    const newEvent = {
        title: eventTitle,
        link: eventLink,
        completed: false,
        timestamp: Date.now(),
        createdBy: userRole === 'officer' ? 'officer' : 'student'
    };
    
    // Push to Firebase
    const eventsRef = ref(database, `events/${dateKey}`);
    const newEventRef = push(eventsRef);
    set(newEventRef, newEvent)
        .then(() => {
            // Clear inputs
            resetEventForm();
            
            // Re-render calendar to show new event
            renderCalendar(currentMonth, currentYear);
        })
        .catch((error) => {
            console.error("Error adding event:", error);
            alert('Failed to add event: ' + error.message);
        });
}

function markEventAsComplete(dateKey, eventId) {
    if (!dateKey || !eventId) return;
    
    const updates = {};
    updates[`events/${dateKey}/${eventId}/completed`] = true;
    updates[`events/${dateKey}/${eventId}/completedAt`] = Date.now();
    
    update(ref(database), updates)
        .then(() => {
            alert("Event marked as completed!");
            displayEvents(dateKey);
            renderCalendar(currentMonth, currentYear);
        })
        .catch((error) => {
            console.error("Error marking event as complete:", error);
            alert('Failed to mark event as complete');
        });
}

function markEventAsDone() {
    const dateKey = formatDateKey(selectedDate);
    const eventsRef = ref(database, `events/${dateKey}`);
    
    onValue(eventsRef, (snapshot) => {
        const eventsData = snapshot.val();
        if (eventsData) {
            Object.keys(eventsData).forEach(eventId => {
                if (!eventsData[eventId].completed) {
                    markEventAsComplete(dateKey, eventId);
                }
            });
        }
    }, { onlyOnce: true });
}

function updateStarRating(rating) {
    const stars = document.querySelectorAll('.star-rating a');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.innerHTML = '<i class="fa fa-star" style="color: gold;"></i>';
        } else {
            star.innerHTML = '<i class="fa fa-star"></i>';
        }
    });
}

function saveRating() {
    const dateKey = formatDateKey(selectedDate);
    const eventsRef = ref(database, `events/${dateKey}`);
    
    onValue(eventsRef, (snapshot) => {
        const eventsData = snapshot.val();
        if (eventsData) {
            // For simplicity, we'll rate the first event on the date
            const eventId = Object.keys(eventsData)[0];
            if (eventId) {
                const updates = {};
                updates[`events/${dateKey}/${eventId}/rating`] = currentRating;
                updates[`events/${dateKey}/${eventId}/ratedBy`] = auth.currentUser.uid;
                
                update(ref(database), updates)
                    .then(() => {
                        console.log("Rating saved successfully");
                    })
                    .catch((error) => {
                        console.error("Error saving rating:", error);
                    });
            }
        }
    }, { onlyOnce: true });
}

function loadEvents() {
    // Events are loaded dynamically when dates are rendered
    // and when the modal is opened for a specific date
    console.log("Events will be loaded as needed");
}

function formatDateKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function resetEventForm() {
    eventTitleInput.value = '';
    eventLinkInput.value = '';
    currentRating = 0;
    updateStarRating(0);
    selectedEventId = null;
}