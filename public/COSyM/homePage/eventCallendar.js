// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
// import { collection, getDocs, getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
// const firebaseConfig = {
//     apiKey: "AIzaSyCNVoM7hQ6a1zcP5zDITcdmUKlfs6lcDBY",
//     authDomain: "login-form-783e1.firebaseapp.com",
//     projectId: "login-form-783e1",
//     storageBucket: "login-form-783e1.firebasestorage.com",
//     messagingSenderId: "598925515666",
//     appId: "1:598925515666:web:5acb6fa146b160cca47f4b"
// };

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // const db = getFirestore(app);
// // const auth = getAuth(app);


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
const eventTextInput = document.getElementById('event-text');

// Current date info
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;

// Events storage
let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};

// Initialize calendar
renderCalendar(currentMonth, currentYear);

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

eventTextInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addEvent();
    }
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
    
    if (events[dateKey] && events[dateKey].length > 0) {
        const eventDot = document.createElement('div');
        eventDot.classList.add('event-dot');
        dayElement.appendChild(eventDot);
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
    
    eventModal.style.display = 'flex';
    eventTextInput.focus();
}

function displayEvents(dateKey) {
    eventsListElement.innerHTML = '';
    
    if (events[dateKey] && events[dateKey].length > 0) {
        events[dateKey].forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.classList.add('event-item');
            eventElement.innerHTML = `
                <span>${event}</span>
                <span class="delete-btn" data-index="${index}">&times;</span>
            `;
            eventsListElement.appendChild(eventElement);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                deleteEvent(dateKey, parseInt(e.target.dataset.index));
            });
        });
    }
}

function addEvent() {
    const eventText = eventTextInput.value.trim();
    if (!eventText) return;
    
    const dateKey = formatDateKey(selectedDate);
    
    if (!events[dateKey]) {
        events[dateKey] = [];
    }
    
    events[dateKey].push(eventText);
    saveEvents();
    
    // Update display
    displayEvents(dateKey);
    
    // Update calendar to show event indicator
    renderCalendar(currentMonth, currentYear);
    
    // Clear input
    eventTextInput.value = '';
}

function deleteEvent(dateKey, index) {
    if (events[dateKey] && events[dateKey][index]) {
        events[dateKey].splice(index, 1);
        
        // Remove date key if no events left
        if (events[dateKey].length === 0) {
            delete events[dateKey];
        }
        
        saveEvents();
        displayEvents(dateKey);
        renderCalendar(currentMonth, currentYear);
    }
}

function formatDateKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function saveEvents() {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}