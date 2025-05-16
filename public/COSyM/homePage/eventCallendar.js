import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, onValue, update, set, get, remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
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
const eventTitleInput = document.getElementById('event-title');
const eventLinkInput = document.getElementById('event-link');
const starRating = document.getElementById('stars');
const averageRatingValue = document.getElementById('average-rating-value');
const eventInputContainer = document.querySelector('.event-input');
const addBtnContainer = document.querySelector('.add-btn');
const starRatingContainer = document.querySelector('.star-rating-container');
const completeEventBtn = document.getElementById('complete-event');

// Current date info
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;
let userRole = 'student';
let currentRating = 0;
let selectedEventId = null;

// Initialize calendar
renderCalendar(currentMonth, currentYear);

// Auth state handler
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            if (userDoc.exists()) {
                userRole = (userDoc.data().role || 'student').toLowerCase();
                updateUIForRole();
            } else {
                console.error("User document not found");
                alert("User profile not found. Please contact administrator.");
            }
        } catch (error) {
            console.error("Error getting user role:", error);
            alert("Error loading user profile. Please try again.");
        }
    } else {
        window.location.href = "/login.html";
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

window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        eventModal.style.display = 'none';
        resetEventForm();
    }
});

// Star rating interaction
document.querySelectorAll('.star-rating a').forEach((star, index) => {
    star.addEventListener('click', (e) => {
        e.preventDefault();
        if (userRole === 'student' && selectedEventId) {
            const eventElement = document.querySelector(`.event-item[data-event-id="${selectedEventId}"]`);
            if (eventElement && !eventElement.dataset.completed) {
                currentRating = index + 1;
                updateStarRating(currentRating);
                submitRating(selectedEventId, currentRating);
            }
        }
    });
});

completeEventBtn.addEventListener('click', async () => {
    if (!selectedEventId) return;
    
    try {
        if (userRole === 'student') {
            throw new Error("Students cannot complete events");
        }
        
        await update(ref(database, `events/${selectedEventId}`), {
            completed: true
        });
        
        displayEventsForDate(selectedDate);
        renderCalendar(currentMonth, currentYear);
        alert("Event marked as completed!");
    } catch (error) {
        console.error("Error completing event:", error);
        alert(`Failed to complete event: ${error.message}`);
    }
});

addEventBtn.addEventListener('click', async () => {
    const title = eventTitleInput.value.trim();
    const link = eventLinkInput.value.trim();
    
    if (!title || !link) {
        alert('Please enter both title and document link');
        return;
    }
    
    if (!selectedDate) {
        alert('Please select a date first');
        return;
    }
    
    try {
        if (!auth.currentUser) await signInAnonymously(auth);
        if (userRole === 'student') throw new Error("Students cannot create events");
        
        const eventData = {
            title: title,
            link: link,
            date: selectedDate,
            createdBy: auth.currentUser.uid,
            completed: false
        };
        
        const eventId = await createEvent(eventData);
        
        displayEventsForDate(selectedDate);
        renderCalendar(currentMonth, currentYear);
        
        eventModal.style.display = 'none';
        resetEventForm();
    } catch (error) {
        console.error("Event creation failed:", error);
        alert(`Failed to create event: ${error.message}`);
    }
});

// Functions
function updateUIForRole() {
    const isStudent = userRole === 'student';
    
    eventInputContainer.style.display = isStudent ? 'none' : 'flex';
    addBtnContainer.style.display = isStudent ? 'none' : 'block';
    starRatingContainer.style.display = isStudent ? 'block' : 'none';
    completeEventBtn.style.display = isStudent ? 'none' : 'block';
}

function renderCalendar(month, year) {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
    monthYearElement.textContent = `${monthNames[month]} ${year}`;
    
    daysContainer.innerHTML = '';
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    for (let i = firstDay - 1; i >= 0; i--) {
        createDayElement(daysInPrevMonth - i, true);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = createDayElement(i, false);
        
        if (i === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
            dayElement.classList.add('today');
        }
    }
    
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
    
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = formatDateKey(date);
    
    checkDayEvents(date, dayElement);
    
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

async function checkDayEvents(date, dayElement) {
    dayElement.querySelectorAll('.event-indicator, .average-rating').forEach(el => el.remove());
    
    try {
        const dateKey = formatDateKey(date);
        const eventsRef = ref(database, 'events');
        const snapshot = await get(eventsRef);
        
        if (snapshot.exists()) {
            const allEvents = snapshot.val();
            let eventsOnThisDay = [];
            let totalRating = 0;
            let ratedEventsCount = 0;
            
            for (const eventId in allEvents) {
                const event = allEvents[eventId];
                if (event.formattedDate === dateKey) {
                    eventsOnThisDay.push(event);
                    if (event.averageRating > 0) {
                        totalRating += event.averageRating;
                        ratedEventsCount++;
                    }
                }
            }
            
            if (eventsOnThisDay.length > 0) {
                dayElement.classList.add('has-event');
                
                const indicator = document.createElement('div');
                indicator.classList.add('event-indicator');
                dayElement.appendChild(indicator);
                
                if (ratedEventsCount > 0) {
                    const averageRating = (totalRating / ratedEventsCount).toFixed(1);
                    const ratingElement = document.createElement('div');
                    ratingElement.classList.add('average-rating');
                    ratingElement.innerHTML = `${averageRating} <i class="fas fa-star"></i>`;
                    dayElement.appendChild(ratingElement);
                }
            }
        }
    } catch (error) {
        console.error("Error checking day events:", error);
    }
}

function openEventModal(date) {
    if (!date) return;
    selectedDate = date;
    modalDateElement.textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    selectedEventId = null;
    currentRating = 0;
    updateStarRating(0);
    
    displayEventsForDate(date);
    eventModal.style.display = 'flex';
    
    if (userRole !== 'student') {
        eventTitleInput.focus();
    }
}

async function displayEventsForDate(date) {
    eventsListElement.innerHTML = '<div class="no-events">Loading events...</div>';
    
    try {
        const dateKey = formatDateKey(date);
        const eventsRef = ref(database, 'events');
        const snapshot = await get(eventsRef);
        
        if (snapshot.exists()) {
            const allEvents = snapshot.val();
            eventsListElement.innerHTML = '';
            
            const eventsOnDate = Object.entries(allEvents)
                .filter(([id, event]) => event.formattedDate === dateKey)
                .map(([id, event]) => ({ id, ...event }));
            
            if (eventsOnDate.length > 0) {
                eventsOnDate.forEach(event => {
                    const eventElement = createEventElement(event);
                    eventsListElement.appendChild(eventElement);
                });
            } else {
                eventsListElement.innerHTML = '<div class="no-events">No events scheduled</div>';
            }
        } else {
            eventsListElement.innerHTML = '<div class="no-events">No events scheduled</div>';
        }
        averageRatingValue.textContent = '0.0';
    } catch (error) {
        console.error("Event load error:", error);
        eventsListElement.innerHTML = `
            <div class="error-message">
                Error loading events<br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

function createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.classList.add('event-item');
    eventElement.dataset.eventId = event.id;
    if (event.completed) {
        eventElement.dataset.completed = 'true';
        eventElement.classList.add('completed-event');
    }
    
    const avgRating = event.averageRating ? Math.round(event.averageRating * 10) / 10 : 0;
    const ratingCount = event.ratingCount || 0;
    
    let eventHTML = `
        <div class="event-content">
            <strong>${event.title}</strong>
            <p><a href="${event.link}" target="_blank">View Document</a></p>
            <div class="event-rating">
                ${avgRating} <i class="fas fa-star"></i>
                (${ratingCount} ${ratingCount === 1 ? 'rating' : 'ratings'})
            </div>
    `;
    
    if (userRole !== 'student') {
        eventHTML += `
            <div class="event-actions">
                <button class="delete-btn">Delete Event</button>
            </div>
        `;
    }
    
    eventHTML += `</div>`;
    eventElement.innerHTML = eventHTML;
    
    if (userRole !== 'student') {
        eventElement.querySelector('.delete-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm("Are you sure you want to delete this event?")) {
                await deleteEvent(event.id);
            }
        });
    }
    
    eventElement.addEventListener('click', () => {
        selectedEventId = event.id;
        averageRatingValue.textContent = avgRating;
        
        if (auth.currentUser && event.ratings && event.ratings[auth.currentUser.uid]) {
            currentRating = event.ratings[auth.currentUser.uid];
            updateStarRating(currentRating);
        } else {
            currentRating = 0;
            updateStarRating(0);
        }
        
        // Show complete button only for non-students and if event isn't completed
        completeEventBtn.style.display = (userRole !== 'student' && !event.completed) ? 'block' : 'none';
    });
    
    return eventElement;
}

async function deleteEvent(eventId) {
    try {
        if (userRole === 'student') {
            throw new Error("Unauthorized - Students cannot delete events");
        }
        
        await remove(ref(database, `events/${eventId}`));
        
        displayEventsForDate(selectedDate);
        renderCalendar(currentMonth, currentYear);
        
        alert("Event deleted successfully!");
    } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event: " + error.message);
    }
}

async function createEvent(eventData) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    if (userRole === 'student') throw new Error("Unauthorized - Students cannot create events");
    
    try {
        const eventId = generateUniqueId();
        
        const newEvent = {
            title: eventData.title,
            link: eventData.link,
            date: eventData.date.getTime(),
            formattedDate: formatDateKey(eventData.date),
            ratings: {},
            averageRating: 0,
            ratingCount: 0,
            createdAt: Date.now(),
            createdBy: user.uid,
            completed: false
        };

        // Only set the event in database
        await set(ref(database, `events/${eventId}`), newEvent);
        
        return eventId;
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
}

async function submitRating(eventId, ratingValue) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please sign in to rate events");
        return;
    }
    
    if (userRole !== 'student') {
        alert("Only students can rate events");
        return;
    }
    
    try {
        const eventRef = ref(database, `events/${eventId}`);
        const snapshot = await get(eventRef);
        
        if (!snapshot.exists()) {
            throw new Error("Event not found");
        }
        
        const eventData = snapshot.val();
        
        if (eventData.completed) {
            throw new Error("Cannot rate completed events");
        }
        
        // Create updates object
        const updates = {};
        updates[`ratings/${user.uid}`] = ratingValue;
        
        // Calculate new average rating
        const ratings = {...eventData.ratings, [user.uid]: ratingValue};
        const ratingValues = Object.values(ratings);
        const newAverage = ratingValues.reduce((sum, val) => sum + val, 0) / ratingValues.length;
        
        updates['averageRating'] = newAverage;
        updates['ratingCount'] = ratingValues.length;
        
        // Apply updates
        await update(eventRef, updates);
        
        selectedEventId = eventId;
        displayEventsForDate(selectedDate);
        
    } catch (error) {
        console.error("Rating submission failed:", error);
        alert("Failed to submit rating: " + error.message);
    }
}

function updateStarRating(rating) {
    document.querySelectorAll('.star-rating a').forEach((star, index) => {
        star.innerHTML = index < rating ? 
            '<i class="fas fa-star" style="color: gold;"></i>' : 
            '<i class="far fa-star"></i>';
    });
}

function resetEventForm() {
    eventTitleInput.value = '';
    eventLinkInput.value = '';
    currentRating = 0;
    updateStarRating(0);
    selectedEventId = null;
    completeEventBtn.style.display = 'none';
}

function formatDateKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function generateUniqueId() {
    return 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}