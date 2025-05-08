import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, push, set, onChildAdded } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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
const database = getDatabase(app);

// DOM elements
const messageInput = document.getElementById('message');
const submitButton = document.getElementById('submitButton');
const messagesContainer = document.getElementById('chat-content'); // Changed to match your HTML
const currentDateElement = document.getElementById('date'); // Changed to match your HTML

// Generate random anonymous name
const getRandomName = () => {
  const adjectives = ["Happy", "Funny", "Clever", "Brave", "Gentle", "Lucky", "Wise"];
  const nouns = ["Penguin", "Tiger", "Dolphin", "Owl", "Fox", "Koala", "Panda"];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

// Store user's random name in sessionStorage
let username = sessionStorage.getItem('anonymousName') || getRandomName();
sessionStorage.setItem('anonymousName', username);

// Update the displayed name in the HTML
document.getElementById('replierFirstName').textContent = username;

// Update current date display
const updateCurrentDate = () => {
  const today = new Date();
  currentDateElement.textContent = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
};
updateCurrentDate();

// Send message function
const sendMessage = () => {
  const messageText = messageInput.value.trim();
  if (!messageText) {
    alert('Please enter a message');
    return;
  }

  console.log('Attempting to send message:', messageText);

  const timestamp = Date.now();
  const timeString = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const messagesRef = ref(database, 'messages');
  const newMessageRef = push(messagesRef);
  
  console.log('New message reference:', newMessageRef.key);

  set(newMessageRef, {
    message: messageText,
    sender: username,
    time: timeString,
    timestamp: timestamp
  }).then(() => {
    console.log('Message successfully written to database');
    messageInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }).catch((error) => {
    console.error("Error sending message:", error);
    alert('Failed to send message. Error: ' + error.message);
  });
};

// Display messages
const displayMessage = (messageData) => {
  try {
    console.log('Received message data:', messageData);
    
    // Add validation for required fields
    if (!messageData || !messageData.sender || !messageData.message) {
      console.error('Invalid message data:', messageData);
      return;
    }

  const messageDiv = document.createElement('div');
  const isCurrentUser = messageData.sender === username;
  messageDiv.className = `media ${isCurrentUser ? 'media-chat media-chat-reverse' : 'media media-chat'}`;

  // Format the time
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
  const lastMessage = messagesContainer.lastElementChild;
  if (!lastMessage || lastMessage.className.includes('media-meta-day')) {
    const dateDiv = document.createElement('div');
    dateDiv.className = 'media media-meta-day';
    dateDiv.textContent = new Date(messageData.timestamp).toLocaleDateString();
    messagesContainer.appendChild(dateDiv);
  }

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
  } catch (error) {
    console.error('Error displaying message:', error);
  }
};
  

// Event listeners
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

// Initial load - clear the container except for the date element
while (messagesContainer.children.length > 1) {
  messagesContainer.removeChild(messagesContainer.lastChild);
}

// try to see mistakes