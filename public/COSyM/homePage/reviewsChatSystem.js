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

// Generate random anonymous name
const getRandomName = () => {
  const adjectives = ["Happy", "Funny", "Clever", "Brave", "Gentle", "Lucky", "Wise"];
  const nouns = ["Penguin", "Tiger", "Dolphin", "Owl", "Fox", "Koala", "Panda"];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

// Initialize chat system
const initChatSystem = () => {
  // Verify all required elements exist
  if (!messageInput || !submitButton || !messagesContainer || !currentDateElement || !replierFirstName) {
    console.error('Missing required elements in HTML');
    return;
  }

  // Set up user
  let username = sessionStorage.getItem('anonymousName') || getRandomName();
  sessionStorage.setItem('anonymousName', username);
  replierFirstName.textContent = username;

  // Update current date
  updateCurrentDate();

  // Set up event listeners
  setupEventListeners();

  // Test Firebase connection
  testConnection();
};

// Update current date display
const updateCurrentDate = () => {
  const today = new Date();
  currentDateElement.textContent = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Set up event listeners
const setupEventListeners = () => {
  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
  });

  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  // Listen for new messages
  onChildAdded(ref(database, 'messages'), (snapshot) => {
    displayMessage(snapshot.val());
  });
};

// Send message function
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
    const timeString = new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const messagesRef = ref(database, 'messages');
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      message: messageText,
      sender: username,
      time: timeString,
      timestamp: timestamp
    });

    messageInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
  } catch (error) {
    console.error("Error sending message:", error);
    alert('Failed to send message: ' + error.message);
  }
};

// Display messages
const displayMessage = (messageData) => {
  if (!messageData || !messageData.sender || !messageData.message) {
    console.error('Invalid message data:', messageData);
    return;
  }

  const messageDiv = document.createElement('div');
  const isCurrentUser = messageData.sender === username;
  messageDiv.className = `media ${isCurrentUser ? 'media-chat media-chat-reverse' : 'media media-chat'}`;

  const timeElement = `<time datetime="${new Date(messageData.timestamp).toISOString()}">${messageData.time}</time>`;

  if (isCurrentUser) {
    messageDiv.innerHTML = `
      <div class="media-body">
        <p class="upcoming-message">${messageData.message}</p>
        <p class="time-stamp">${timeElement}</p>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <p class="replier-first-name">${messageData.sender}</p>
      <img class="avatar" src="https://cdn-icons-png.flaticon.com/512/10928/10928539.png">
      <div class="media-body">
        <p class="replier-message">${messageData.message}</p>
        <p class="time-stamp">${timeElement}</p>
      </div>
    `;
  }

  // Add date separator if needed
  const lastMessage = messagesContainer.querySelector('.media:not(.media-meta-day)');
  if (!lastMessage) {
    const dateDiv = document.createElement('div');
    dateDiv.className = 'media media-meta-day';
    dateDiv.textContent = new Date(messageData.timestamp).toLocaleDateString();
    messagesContainer.appendChild(dateDiv);
  }

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
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