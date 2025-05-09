import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, set, push, onChildAdded, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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
const eventTextInput = document.getElementById('event-text');
const starRating = document.getElementById('stars');

// Current date info
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;
let userRole = null; // 'officer' or 'student'
let currentRating = 0;

// Events storage
let events = {};

// Initialize calendar
renderCalendar(currentMonth, currentYear);

// Check auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        // In a real app, you would check the user's role from your database
        // For this example, we'll randomly assign a role
        userRole = Math.random() > 0.5 ? 'officer' : 'student';
        console.log(`User is signed in as ${userRole}`);
        
        // Load events
        loadEvents();
    } else {
        // User is signed out
        signInAnonymously(auth)
            .then(() => {
                console.log("Signed in anonymously");
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
});

addEventBtn.addEventListener('click', addEvent);
doneEventBtn.addEventListener('click', markEventAsDone);

// Star rating
document.querySelectorAll('.publisher-btn-star-one, .publisher-btn-star-two, .publisher-btn-star-three, .publisher-btn-star-four, .publisher-btn-star-five')
    .forEach((star, index) => {
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
    }
});

// Functions
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
    
    if (events[dateKey]) {
        // Highlight with orange if there are events
        dayElement.style.backgroundColor = 'rgba(255, 165, 0, 0.2)';
        
        // Show average rating if available
        if (events[dateKey].averageRating) {
            const ratingElement = document.createElement('div');
            ratingElement.classList.add('average-rating');
            ratingElement.innerHTML = `<i class="fas fa-star"></i> ${events[dateKey].averageRating.toFixed(1)}`;
            dayElement.appendChild(ratingElement);
        }
    }
    
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
    
    // Show/hide elements based on user role
    if (userRole === 'officer') {
        document.querySelector('.event-input').style.display = 'flex';
        document.querySelector('.add-btn').style.display = 'block';
    } else {
        document.querySelector('.event-input').style.display = 'none';
        document.querySelector('.add-btn').style.display = 'none';
    }
    
    eventModal.style.display = 'flex';
    eventTextInput.focus();
}

function displayEvents(dateKey) {
    eventsListElement.innerHTML = '';
    
    if (events[dateKey] && events[dateKey].events) {
        events[dateKey].events.forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.classList.add('event-item');
            
            let eventHTML = `
                <div>
                    <strong>${event.title}</strong>
                    <p><a href="${event.link}" target="_blank">View Document</a></p>
            `;
            
            if (event.rating) {
                eventHTML += `<p>Rating: ${event.rating}/5</p>`;
            }
            
            if (userRole === 'officer' && !event.completed) {
                eventHTML += `<button class="complete-btn" data-index="${index}">Mark as Complete</button>`;
            }
            
            eventHTML += `</div>`;
            
            eventElement.innerHTML = eventHTML;
            eventsListElement.appendChild(eventElement);
        });
        
        // Add event listeners to complete buttons
        document.querySelectorAll('.complete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                markEventAsComplete(dateKey, parseInt(e.target.dataset.index));
            });
        });
    }
}

function addEvent() {
    const eventTitle = eventTextInput.value.trim();
    if (!eventTitle) return;
    
    // In a real app, you would have a proper link input
    const eventLink = prompt("Please enter the document link:");
    if (!eventLink) return;
    
    const dateKey = formatDateKey(selectedDate);
    
    if (!events[dateKey]) {
        events[dateKey] = {
            events: [],
            averageRating: 0
        };
    }
    
    const newEvent = {
        title: eventTitle,
        link: eventLink,
        completed: false,
        timestamp: Date.now()
    };
    
    // Push to Firebase
    const eventsRef = ref(database, `events/${dateKey}/events`);
    const newEventRef = push(eventsRef);
    set(newEventRef, newEvent);
    
    // Update local state
    events[dateKey].events.push(newEvent);
    
    // Clear input
    eventTextInput.value = '';
    
    // Re-render calendar
    renderCalendar(currentMonth, currentYear);
}

function markEventAsComplete(dateKey, index) {
    if (events[dateKey] && events[dateKey].events[index]) {
        // Update in Firebase
        const updates = {};
        updates[`events/${dateKey}/events/${index}/completed`] = true;
        update(ref(database), updates);
        
        // Update local state
        events[dateKey].events[index].completed = true;
        
        // Show notification
        alert("Event marked as completed!");
        
        // Refresh display
        displayEvents(dateKey);
        renderCalendar(currentMonth, currentYear);
    }
}

function markEventAsDone() {
    const dateKey = formatDateKey(selectedDate);
    if (events[dateKey] && events[dateKey].events) {
        events[dateKey].events.forEach((event, index) => {
            if (!event.completed) {
                markEventAsComplete(dateKey, index);
            }
        });
    }
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
    if (events[dateKey] && events[dateKey].events) {
        // In a real app, you would save this to Firebase
        // For now, we'll just update local state
        const eventIndex = 0; // Assuming rating first event
        if (events[dateKey].events[eventIndex]) {
            events[dateKey].events[eventIndex].rating = currentRating;
            
            // Calculate new average rating
            const ratings = events[dateKey].events
                .filter(e => e.rating)
                .map(e => e.rating);
            
            if (ratings.length > 0) {
                events[dateKey].averageRating = ratings.reduce((a, b) => a + b) / ratings.length;
            }
            
            // Re-render calendar to show updated rating
            renderCalendar(currentMonth, currentYear);
        }
    }
}

function loadEvents() {
    const eventsRef = ref(database, 'events');
    onChildAdded(eventsRef, (snapshot) => {
        const dateKey = snapshot.key;
        events[dateKey] = snapshot.val();
        renderCalendar(currentMonth, currentYear);
    });
}

function formatDateKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}