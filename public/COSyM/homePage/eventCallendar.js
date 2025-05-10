import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);

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
const averageRatingValue = document.getElementById('average-rating-value');

// Current date info
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;
let userRole = 'student'; // Default to student
let currentRating = 0;

// Initialize calendar
renderCalendar(currentMonth, currentYear);

// Check auth state and user role
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Check user role from Firestore
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            if (userDoc.exists()) {
                userRole = userDoc.data().role || 'student';
                console.log(`User is signed in as ${userRole}`);
            }
        } catch (error) {
            console.error("Error getting user role:", error);
        }
        
        // Update UI based on role
        updateUIForRole();
    } else {
        // User is signed out - sign in anonymously as student
        signInAnonymously(auth)
            .then(() => console.log("Signed in anonymously as student"))
            .catch((error) => console.error("Error signing in:", error));
    }
});

// Event listeners for calendar navigation
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

// Modal controls
closeModalBtn.addEventListener('click', () => {
    eventModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        eventModal.style.display = 'none';
    }
});

// Star rating interaction
document.querySelectorAll('.star-rating a').forEach((star, index) => {
    star.addEventListener('click', (e) => {
        e.preventDefault();
        if (userRole !== 'officer') { // Only students can rate
            currentRating = index + 1;
            updateStarRating(currentRating);
            saveRating();
        }
    });
});

// Functions
function updateUIForRole() {
    if (userRole === 'officer') {
        document.querySelector('.event-input').style.display = 'flex';
        document.querySelector('.add-btn').style.display = 'block';
        document.querySelector('.done-btn').style.display = 'block';
        document.querySelector('.star-rating-container').style.display = 'none';
    } else {
        document.querySelector('.event-input').style.display = 'none';
        document.querySelector('.add-btn').style.display = 'none';
        document.querySelector('.done-btn').style.display = 'none';
        document.querySelector('.star-rating-container').style.display = 'block';
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
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Create days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
        createDayElement(daysInPrevMonth - i, true);
    }
    
    // Create days for current month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = createDayElement(i, false);
        
        // Highlight today
        if (i === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
            dayElement.classList.add('today');
        }
    }
    
    // Create days from next month if needed
    const totalDaysDisplayed = firstDay + daysInMonth;
    const remainingDays = 7 - (totalDaysDisplayed % 7);
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
    
    // Check for events on this day
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = formatDateKey(date);
    const eventsRef = ref(database, `events/${dateKey}`);
    
    onValue(eventsRef, (snapshot) => {
        const eventsData = snapshot.val();
        
        // Clear previous indicators
        dayElement.querySelectorAll('.event-indicator, .average-rating').forEach(el => el.remove());
        
        if (eventsData) {
            // Check if there are active events
            const activeEvents = Object.values(eventsData).filter(
                event => !event.completed && new Date(event.timestamp) >= new Date()
            );
            
            if (activeEvents.length > 0) {
                dayElement.classList.add('has-event');
                
                // Calculate average rating
                const ratings = Object.values(eventsData)
                    .filter(event => event.rating)
                    .map(event => event.rating);
                
                if (ratings.length > 0) {
                    const averageRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
                    const ratingElement = document.createElement('div');
                    ratingElement.classList.add('average-rating');
                    ratingElement.innerHTML = `${averageRating} <i class="fas fa-star"></i>`;
                    dayElement.appendChild(ratingElement);
                }
            }
        }
    });
    
    if (!isOtherMonth) {
        dayElement.addEventListener('click', () => {
            document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
            dayElement.classList.add('selected');
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
    
    const dateKey = formatDateKey(date);
    displayEvents(dateKey);
    
    // Show modal
    eventModal.style.display = 'flex';
}

function displayEvents(dateKey) {
    eventsListElement.innerHTML = '<div class="no-events">Loading events...</div>';
    const eventsRef = ref(database, `events/${dateKey}`);
    
    onValue(eventsRef, (snapshot) => {
        const eventsData = snapshot.val();
        eventsListElement.innerHTML = '';
        
        if (eventsData) {
            let totalRating = 0;
            let ratingCount = 0;
            
            Object.entries(eventsData).forEach(([eventId, event]) => {
                if (!event.completed || new Date(event.timestamp) >= new Date()) {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('event-item');
                    
                    let eventHTML = `
                        <div class="event-content">
                            <strong>${event.title || 'No title'}</strong>
                            <p><a href="${event.link || '#'}" target="_blank">View Document</a></p>
                    `;
                    
                    if (event.rating) {
                        eventHTML += `<div class="event-rating">${event.rating.toFixed(1)} <i class="fas fa-star"></i></div>`;
                        totalRating += event.rating;
                        ratingCount++;
                    }
                    
                    eventHTML += `</div>`;
                    eventElement.innerHTML = eventHTML;
                    eventsListElement.appendChild(eventElement);
                }
            });
            
            // Update average rating display
            if (ratingCount > 0) {
                const averageRating = totalRating / ratingCount;
                averageRatingValue.textContent = averageRating.toFixed(1);
            } else {
                averageRatingValue.textContent = '0.0';
            }
        } else {
            eventsListElement.innerHTML = '<div class="no-events">No events for this date</div>';
            averageRatingValue.textContent = '0.0';
        }
    });
}

function updateStarRating(rating) {
    document.querySelectorAll('.star-rating a').forEach((star, index) => {
        if (index < rating) {
            star.innerHTML = '<i class="fas fa-star" style="color: gold;"></i>';
        } else {
            star.innerHTML = '<i class="far fa-star"></i>';
        }
    });
}

function saveRating() {
    if (!selectedDate || currentRating === 0) return;
    
    const dateKey = formatDateKey(selectedDate);
    const eventsRef = ref(database, `events/${dateKey}`);
    
    onValue(eventsRef, (snapshot) => {
        const eventsData = snapshot.val();
        if (eventsData) {
            // For simplicity, we'll update the first event's rating
            const eventId = Object.keys(eventsData)[0];
            if (eventId) {
                update(ref(database, `events/${dateKey}/${eventId}`), {
                    rating: currentRating,
                    ratedAt: Date.now(),
                    ratedBy: auth.currentUser.uid
                }).then(() => {
                    console.log("Rating saved successfully");
                }).catch((error) => {
                    console.error("Error saving rating:", error);
                });
            }
        }
    }, { onlyOnce: true });
}

function formatDateKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/* 
 * TODO: Implement event creation functionality
 * This will be added later when we connect to Firestore for event management
 * 
function addEvent() {
    // Will be implemented when we set up Firestore for events
}

function markEventAsComplete() {
    // Will be implemented when we set up Firestore for events
}
*/