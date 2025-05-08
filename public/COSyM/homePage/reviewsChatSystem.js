import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, set, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const database = getDatabase(app);

// DOM elements
const messageInput = document.getElementById('message');
const submitButton = document.getElementById('submitButton');
const messagesContainer = document.getElementById('chat-content');
const currentDateElement = document.getElementById('current-date');
const replierFirstName = document.getElementById('replierFirstName');

// Track the last displayed date
let lastDisplayedDate = null;

// Generate random anonymous name
const getRandomName = () => {
  const adjectives = ["Happy", "Funny", "Clever", "Brave", "Gentle", "Lucky", "Wise"];
  const nouns = ["Penguin", "Tiger", "Dolphin", "Owl", "Fox", "Koala", "Panda"];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

// Initialize chat system
const initChatSystem = () => {
  // Verify all required elements exist
  if (!messageInput || !submitButton || !messagesContainer || !currentDateElement) {
    console.error('Missing required elements in HTML');
    return;
  }

  // Initialize username
  const username = sessionStorage.getItem('anonymousName') || getRandomName();
  sessionStorage.setItem('anonymousName', username);
  if (replierFirstName) {
    replierFirstName.textContent = username;
  }

  // Update current date
  updateCurrentDate();

  // Set up event listeners
  setupEventListeners(username);

  // Test Firebase connection
  testConnection();

  // Load existing messages
  loadExistingMessages(username);
};

// Load existing messages with proper date grouping
const loadExistingMessages = (username) => {
  // Clear the container first
  messagesContainer.innerHTML = '';
  // Reset the last displayed date
  lastDisplayedDate = null;
};

// Update current date display
const updateCurrentDate = () => {
  const today = new Date();
  currentDateElement.textContent = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Set up event listeners
const setupEventListeners = (username) => {
  const sendMessage = async () => {
    const messageText = messageInput.value.trim();
    if (!messageText) {
      alert('Please enter a message');
      return;
    }

    try {
      // Ensure authentication
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const timestamp = Date.now();
      const timeString = new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: 'numeric',  // Changed to 'numeric' for single digit hours
        minute: '2-digit',
        hour12: true
      }).toLowerCase();   // Convert to lowercase for "am/pm"

      const messagesRef = ref(database, 'messages');
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, {
        message: messageText,
        sender: username,
        time: timeString,
        timestamp: timestamp
      });

      messageInput.value = '';
      
    } catch (error) {
      console.error("Error sending message:", error);
      alert('Failed to send message: ' + error.message);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage();
  };

  submitButton.addEventListener('click', handleSendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(e);
    }
  });

  // Listen for new messages
  onChildAdded(ref(database, 'messages'), (snapshot) => {
    displayMessage(snapshot.val(), username);
  });
};

// Display messages with date header only once per day
const displayMessage = (messageData, username) => {
  if (!messageData || !messageData.sender || !messageData.message || !messageData.timestamp) {
    console.error('Invalid message data:', messageData);
    return;
  }

  const messageDate = new Date(messageData.timestamp);
  const currentDate = messageDate.toDateString(); // Gets date in "Day Mon DD YYYY" format

  // Only show date header if it's a new day
  if (currentDate !== lastDisplayedDate) {
    const formattedDate = messageDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const dateDiv = document.createElement('div');
    dateDiv.className = 'media media-meta-day';
    dateDiv.textContent = formattedDate;
    messagesContainer.appendChild(dateDiv);
    
    lastDisplayedDate = currentDate;
  }

  // Create message element
  const messageDiv = document.createElement('div');
  const isCurrentUser = messageData.sender === username;
  messageDiv.className = `media ${isCurrentUser ? 'media-chat media-chat-reverse' : 'media media-chat'}`;

  const timeElement = `<time datetime="${messageDate.toISOString()}">${messageData.time}</time>`;

  messageDiv.innerHTML = isCurrentUser
    ? `
      <div class="media-body">
        <p class="upcoming-message">${messageData.message}</p>
        <p class="time-stamp">${timeElement}</p>
      </div>
    `
    : `
      <p class="replier-first-name">${messageData.sender}</p>
      <img class="avatar" src="https://cdn-icons-png.flaticon.com/512/10928/10928539.png" alt="${messageData.sender}'s avatar">
      <div class="media-body">
        <p class="replier-message">${messageData.message}</p>
        <p class="time-stamp">${timeElement}</p>
      </div>
    `;

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTo({
    top: messagesContainer.scrollHeight,
    behavior: 'smooth'
  });
};

// Test Firebase connection
const testConnection = async () => {
  try {
    const testRef = ref(database, 'connection_test');
    await set(testRef, { 
      status: "connected", 
      timestamp: Date.now() 
    });
    console.log("✅ Database connection successful!");
  } catch (error) {
    console.error("❌ Connection failed:", error);
  }
};

// Start the chat system when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatSystem);
} else {
  initChatSystem();
}