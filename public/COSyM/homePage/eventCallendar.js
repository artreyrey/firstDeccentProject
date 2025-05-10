import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, onValue, update, set, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getFirestore, doc, getDoc, collection, serverTimestamp, query, where, getDocs,Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
const eventInputContainer = document.querySelector('.event-input');
const addBtnContainer = document.querySelector('.add-btn');
const doneBtnContainer = document.querySelector('.done-btn');
const starRatingContainer = document.querySelector('.star-rating-container');

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

// Add this to handle auth errors
auth.onAuthStateChanged((user) => {
    if (!user) {
        signInAnonymously(auth).catch(error => {
            console.error("Auto sign-in failed:", error);
        });
    }
});

// Check auth state and user role
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Check user role from Firestore
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            if (userDoc.exists()) {
                userRole = userDoc.data().role || 'student';
                console.log(`User is signed in as ${userRole}`);
                updateUIForRole();
                
                // If user is student, hide create event UI
                if (userRole === 'student') {
                    eventInputContainer.style.display = 'none';
                    addBtnContainer.style.display = 'none';
                }
            }
        } catch (error) {
            console.error("Error getting user role:", error);
            // Default to student if there's an error
            userRole = 'student';
            updateUIForRole();
        }
    } else {
        // Sign in anonymously but default to student role
        signInAnonymously(auth)
            .then(() => {
                console.log("Signed in anonymously");
                userRole = 'student';
                updateUIForRole();
            })
            .catch((error) => {
                console.error("Error signing in:", error);
                userRole = 'student';
                updateUIForRole();
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

// Modal controls
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
            currentRating = index + 1;
            updateStarRating(currentRating);
            submitRating(selectedEventId, currentRating);
        }
    });
});

// Event creation
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
        // Ensure user is authenticated
        if (!auth.currentUser) {
            await signInAnonymously(auth);
        }
        
        // Check role again in case it changed
        if (userRole === 'student') {
            throw new Error("Students cannot create events");
        }
        
        const eventData = {
            title: title,
            description: link,
            date: selectedDate,
            createdBy: auth.currentUser.uid
        };
        
        const eventId = await createEvent(eventData);
        
        // Refresh the display
        resetEventForm();
        renderCalendar(currentMonth, currentYear);
        displayEventsForDate(selectedDate);
        
        // Close modal after successful creation
        eventModal.style.display = 'none';
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
    doneBtnContainer.style.display = isStudent ? 'none' : 'block';
    starRatingContainer.style.display = isStudent ? 'block' : 'none';
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
    
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = formatDateKey(date);
    
    // Check for events on this day
    checkDayEvents(date, dayElement);
    
    if (!isOtherMonth) {
        dayElement.addEventListener('click', () => {
        document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
        dayElement.classList.add('selected');
        selectedDate = new Date(currentYear, currentMonth, day); // Create new Date object
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
        
        // Query RTDB directly for events on this date
        const eventsRef = ref(database, 'events');
        const snapshot = await get(eventsRef);
        
        if (snapshot.exists()) {
            const allEvents = snapshot.val();
            let eventsOnThisDay = [];
            let totalRating = 0;
            let ratedEventsCount = 0;
            
            // Find events for this date
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
                
                // Add event indicator
                const indicator = document.createElement('div');
                indicator.classList.add('event-indicator');
                dayElement.appendChild(indicator);
                
                // Show average rating if available
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
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-indicator');
        errorElement.textContent = '!';
        errorElement.title = error.message;
        dayElement.appendChild(errorElement);
    }
}

function openEventModal(date) {
    if (!date || !(date instanceof Date)) {
        console.error("Invalid date provided to openEventModal");
        return;
    }
    selectedDate = date;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    modalDateElement.textContent = date.toLocaleDateString('en-US', options);
    
    displayEventsForDate(date);
    eventModal.style.display = 'flex';
    eventTitleInput.focus();
}

async function displayEventsForDate(date) {
    eventsListElement.innerHTML = '<div class="no-events">Loading events...</div>';
    
    try {
        const dateKey = formatDateKey(date);
        
        // Query both Firestore and RTDB for consistency
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        // Firestore query
        const q = query(
            collection(firestore, "events"),
            where("date", ">=", Timestamp.fromDate(startDate)),
            where("date", "<=", Timestamp.fromDate(endDate)),
            orderBy("date", "asc")
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            eventsListElement.innerHTML = '';
            
            for (const doc of querySnapshot.docs) {
                const eventData = doc.data();
                // Get RTDB data
                const rtdbSnapshot = await get(ref(database, eventData.rtdbPath));
                const rtdbData = rtdbSnapshot.val();
                
                const eventElement = document.createElement('div');
                eventElement.classList.add('event-item');
                eventElement.dataset.eventId = doc.id;
                
                let eventHTML = `
                    <div class="event-content">
                        <strong>${eventData.title}</strong>
                        <p><a href="${eventData.description}" target="_blank">View Document</a></p>
                `;
                
                if (rtdbData) {
                    eventHTML += `
                        <div class="event-rating">
                            ${rtdbData.averageRating ? rtdbData.averageRating.toFixed(1) : '0.0'} 
                            <i class="fas fa-star"></i>
                            (${rtdbData.ratingCount || 0} ratings)
                        </div>
                    `;
                }
                
                if (userRole === 'officer') {
                    eventHTML += `<button class="complete-btn">Mark Complete</button>`;
                }
                
                eventHTML += `</div>`;
                eventElement.innerHTML = eventHTML;
                
                if (userRole === 'officer') {
                    eventElement.querySelector('.complete-btn').addEventListener('click', () => {
                        markEventAsComplete(doc.id);
                    });
                }
                
                eventsListElement.appendChild(eventElement);
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

async function createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.classList.add('event-item');
    eventElement.dataset.eventId = event.id;
    
    let eventHTML = `
        <div class="event-content">
            <strong>${event.title}</strong>
            <p><a href="${event.description}" target="_blank">View Document</a></p>
    `;
    
    if (userRole === 'officer') {
        eventHTML += `<button class="complete-btn">Mark Complete</button>`;
    }
    
    eventHTML += `</div>`;
    eventElement.innerHTML = eventHTML;
    
    if (userRole === 'officer') {
        eventElement.querySelector('.complete-btn').addEventListener('click', () => {
            markEventAsComplete(event.id);
        });
    }
    
    return eventElement;
}

async function displayEventRatings(eventId, rtdbPath) {
    if (!rtdbPath) return;
    
    const eventRef = ref(database, rtdbPath);
    onValue(eventRef, (snapshot) => {
        const eventData = snapshot.val();
        if (eventData) {
            const eventElement = document.querySelector(`.event-item[data-event-id="${eventId}"]`);
            if (eventElement) {
                const ratingDisplay = eventElement.querySelector('.event-rating') || 
                    document.createElement('div');
                
                ratingDisplay.classList.add('event-rating');
                ratingDisplay.innerHTML = `
                    ${eventData.averageRating ? eventData.averageRating.toFixed(1) : '0.0'} 
                    <i class="fas fa-star"></i>
                    (${eventData.ratingCount || 0} ratings)
                `;
                
                if (!eventElement.querySelector('.event-rating')) {
                    eventElement.querySelector('.event-content').appendChild(ratingDisplay);
                }
                
                // Update main average display if this is the selected event
                if (selectedEventId === eventId) {
                    averageRatingValue.textContent = eventData.averageRating ? 
                        eventData.averageRating.toFixed(1) : '0.0';
                }
            }
        }
    });
}

function updateStarRating(rating) {
    document.querySelectorAll('.star-rating a').forEach((star, index) => {
        star.innerHTML = index < rating ? 
            '<i class="fas fa-star" style="color: gold;"></i>' : 
            '<i class="far fa-star"></i>';
    });
}

async function createEvent(eventData) {
    const user = auth.currentUser;
    if (!user) {
        // Force sign-in if not authenticated
        await signInAnonymously(auth);
    }
    
    // Check if user is student (after ensuring they're authenticated)
    if (userRole === 'student') {
        throw new Error("Unauthorized - Students cannot create events");
    }
    
    try {
        // Generate a unique ID for the event
        const eventId = generateUniqueId();
        
        // Create the RTDB event structure
        const rtdbEventPath = `events/${eventId}`;
        
        const newEvent = {
            title: eventData.title,
            link: eventData.description,
            date: eventData.date.getTime(),
            formattedDate: formatDateKey(eventData.date),
            ratings: {},
            averageRating: 0,
            ratingCount: 0,
            createdAt: Date.now(),
            createdBy: auth.currentUser.uid // Use current user after auth
        };

        // Create RTDB entry
        await set(ref(database, rtdbEventPath), newEvent);

        // Create Firestore document with reference to RTDB path
        await set(doc(firestore, 'events', eventId), {
            title: eventData.title,
            description: eventData.description,
            date: Timestamp.fromDate(new Date(eventData.date)),
            createdBy: auth.currentUser.uid,
            rtdbPath: rtdbEventPath,
            completed: false,
            createdAt: serverTimestamp()
        });
        
        return eventId;
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
}

// Helper function to generate unique ID
function generateUniqueId() {
    return 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

async function submitRating(eventId, ratingValue) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    if (userRole !== 'student') throw new Error("Unauthorized");
    
    try {
        // 1. Get the RTDB path from Firestore
        const eventDoc = await getDoc(doc(firestore, 'events', eventId));
        if (!eventDoc.exists()) throw new Error("Event not found");
        
        const rtdbPath = eventDoc.data().rtdbPath;
        const ratingRef = ref(database, `${rtdbPath}/ratings/${user.uid}`);

        // 2. Update rating in RTDB
        await set(ratingRef, ratingValue);

        // 3. Update average rating
        await updateAverageRating(rtdbPath);
        
        selectedEventId = eventId; // For UI updates
    } catch (error) {
        console.error("Rating submission failed:", error);
        throw error;
    }
}

async function updateAverageRating(rtdbPath) {
    const ratingsRef = ref(database, `${rtdbPath}/ratings`);
    const snapshot = await get(ratingsRef);
    const ratings = snapshot.val() || {};
    
    const values = Object.values(ratings);
    const sum = values.reduce((a, b) => a + b, 0);
    const count = values.length;
    const average = count > 0 ? sum / count : 0;
    
    // Update the event with new average and count
    await update(ref(database, rtdbPath), {
        averageRating: average,
        ratingCount: count
    });
}

async function markEventAsComplete(eventId) {
    try {
       if (userRole.toLowerCase() === 'student') {
            throw new Error("Unauthorized - Only officers can mark events as complete");
        }
        
        await update(doc(firestore, 'events', eventId), {
            completed: true,
            completedAt: serverTimestamp()
        });
        alert("Event marked as complete!");
        displayEventsForDate(selectedDate);
    } catch (error) {
        console.error("Error marking event complete:", error);
        alert("Failed to mark event complete");
    }
}

function resetEventForm() {
    eventTitleInput.value = '';
    eventLinkInput.value = '';
    currentRating = 0;
    updateStarRating(0);
    selectedEventId = null;
}

function formatDateKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}