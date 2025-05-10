import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, onValue, update, set, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
            }
        } catch (error) {
            console.error("Error getting user role:", error);
        }
    } else {
        // User is signed out - sign in anonymously as student
        signInAnonymously(auth)
            .then(() => {
                console.log("Signed in anonymously as student");
                userRole = 'student';
                updateUIForRole();
            })
            .catch((error) => console.error("Error signing in:", error));
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
    
    try {
        const eventData = {
            title: title,
            description: link,
            date: selectedDate,
            createdBy: auth.currentUser.uid
        };
        
        const eventId = await createEvent(eventData);
        console.log("Event created with ID:", eventId);
        
        resetEventForm();
        renderCalendar(currentMonth, currentYear);
        displayEventsForDate(selectedDate);
    } catch (error) {
        console.error("Error creating event:", error);
        alert('Failed to create event: ' + error.message);
    }
});


// check if user is signed in
onAuthStateChanged(auth, async (user) => {
    try {
        if (user) {
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            if (userDoc.exists()) {
                userRole = userDoc.data().role || 'student';
                console.log(`User is signed in as ${userRole}`);
                updateUIForRole();
            }
        } else {
            // Sign in anonymously
            await signInAnonymously(auth);
            userRole = 'student';
            updateUIForRole();
        }
    } catch (error) {
        console.error("Authentication error:", error);
        userRole = 'student';
        updateUIForRole();
    }
});

// Functions
function updateUIForRole() {
    const isOfficer = userRole === 'officer';
    eventInputContainer.style.display = isOfficer ? 'flex' : 'none';
    addBtnContainer.style.display = isOfficer ? 'block' : 'none';
    doneBtnContainer.style.display = isOfficer ? 'block' : 'none';
    starRatingContainer.style.display = isOfficer ? 'none' : 'block';
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
            selectedDate = date;
            openEventModal(date);
        });
    }
    
    daysContainer.appendChild(dayElement);
    return dayElement;
}

async function checkDayEvents(date, dayElement) {
    // Clear previous indicators
    dayElement.querySelectorAll('.event-indicator, .average-rating').forEach(el => el.remove());
    
    try {
        // Format date for query (ignoring time)
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        const q = query(
            collection(firestore, "events"),
            where("date", ">=", startDate),
            where("date", "<=", endDate)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            dayElement.classList.add('has-event');
            
            // Calculate average rating for all events on this day
            let totalRating = 0;
            let eventCount = 0;
            
            for (const doc of querySnapshot.docs) {
                const eventData = doc.data();
                if (eventData.rtdbRatingPath) {
                    try {
                        const ratingSnapshot = await get(ref(database, `${eventData.rtdbRatingPath}/average`));
                        if (ratingSnapshot.exists() && ratingSnapshot.val() > 0) {
                            totalRating += ratingSnapshot.val();
                            eventCount++;
                        }
                    } catch (error) {
                        console.error("Error getting rating for event:", eventData.id, error);
                    }
                }
            }
            
            if (eventCount > 0) {
                const averageRating = (totalRating / eventCount).toFixed(1);
                const ratingElement = document.createElement('div');
                ratingElement.classList.add('average-rating');
                ratingElement.innerHTML = `${averageRating} <i class="fas fa-star"></i>`;
                dayElement.appendChild(ratingElement);
            }
        }
    } catch (error) {
        console.error("Error checking day events:", error);
        // Add error indicator if needed
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-indicator');
        errorElement.textContent = '!';
        errorElement.title = 'Error loading events';
        dayElement.appendChild(errorElement);
    }
}

function openEventModal(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    modalDateElement.textContent = date.toLocaleDateString('en-US', options);
    
    displayEventsForDate(date);
    eventModal.style.display = 'flex';
    eventTitleInput.focus();
}

async function displayEventsForDate(date) {
    eventsListElement.innerHTML = '<div class="no-events">Loading events...</div>';
    
    try {
        // Format date for query
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        const q = query(
            collection(firestore, "events"),
            where("date", ">=", startDate),
            where("date", "<=", endDate),
            orderBy("date", "asc")
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            eventsListElement.innerHTML = '';
            
            for (const doc of querySnapshot.docs) {
                const eventData = doc.data();
                const eventElement = await createEventElement({
                    id: doc.id,
                    ...eventData
                });
                eventsListElement.appendChild(eventElement);
                
                // Get ratings for this event
                await displayEventRatings(doc.id, eventData.rtdbRatingPath);
            }
        } else {
            eventsListElement.innerHTML = '<div class="no-events">No events for this date</div>';
            averageRatingValue.textContent = '0.0';
        }
    } catch (error) {
        console.error("Error loading events:", error);
        eventsListElement.innerHTML = '<div class="error-message">Error loading events</div>';
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
    
    const ratingsRef = ref(database, `${rtdbPath}`);
    onValue(ratingsRef, (snapshot) => {
        const ratingsData = snapshot.val();
        if (ratingsData) {
            const eventElement = document.querySelector(`.event-item[data-event-id="${eventId}"]`);
            if (eventElement) {
                const ratingDisplay = eventElement.querySelector('.event-rating') || 
                    document.createElement('div');
                
                ratingDisplay.classList.add('event-rating');
                ratingDisplay.innerHTML = `
                    ${ratingsData.average ? ratingsData.average.toFixed(1) : '0.0'} 
                    <i class="fas fa-star"></i>
                    (${ratingsData.count || 0} ratings)
                `;
                
                if (!eventElement.querySelector('.event-rating')) {
                    eventElement.querySelector('.event-content').appendChild(ratingDisplay);
                }
                
                // Update main average display if this is the selected event
                if (selectedEventId === eventId) {
                    averageRatingValue.textContent = ratingsData.average ? ratingsData.average.toFixed(1) : '0.0';
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
    if (!user) throw new Error("Not authenticated");
    if (userRole !== 'officer') throw new Error("Unauthorized");
    
    // 1. First create RTDB entry for ratings
    const eventId = doc(collection(firestore, 'events')).id;
    const rtdbRatingPath = `eventRatings/${eventId}`;
    
    await set(ref(database, rtdbRatingPath), {
        ratings: {},
        average: 0,
        count: 0
    });
    
    // 2. Then create Firestore event with RTDB reference
    await set(doc(firestore, 'events', eventId), {
    title: eventData.title,
    description: eventData.description,
    date: serverTimestamp(),
    createdBy: user.uid,
    rtdbRatingPath: rtdbRatingPath,
    completed: false,
    createdAt: serverTimestamp()
});
    
    return eventId;
}

async function submitRating(eventId, ratingValue) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    if (userRole !== 'student') throw new Error("Unauthorized");
    
    // 1. Get the RTDB path from Firestore
    const eventDoc = await getDoc(doc(firestore, 'events', eventId));
    if (!eventDoc.exists()) throw new Error("Event not found");
    
    const rtdbPath = eventDoc.data().rtdbRatingPath;
    const ratingRef = ref(database, `${rtdbPath}/ratings/${user.uid}`);
    
    // 2. Update rating in RTDB
    await set(ratingRef, ratingValue);
    
    // 3. Update average
    await updateAverageRating(rtdbPath);
    
    // Set this as selected event for UI updates
    selectedEventId = eventId;
}

async function updateAverageRating(rtdbPath) {
    const ratingsRef = ref(database, `${rtdbPath}/ratings`);
    const snapshot = await get(ratingsRef);
    const ratings = snapshot.val() || {};
    
    const values = Object.values(ratings);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = values.length > 0 ? sum / values.length : 0;
    
    await update(ref(database, rtdbPath), {
        average: average,
        count: values.length
    });
}

async function markEventAsComplete(eventId) {
    try {
        if (userRole !== 'officer') throw new Error("Unauthorized");
        
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
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}