import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, update, set, get, remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
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



document.addEventListener('DOMContentLoaded', function() {
            const editBtn = document.getElementById('fundsEditBtn');
            const editSection = document.getElementById('fundsEditSection');
            const cancelBtn = document.getElementById('fundsCancelBtn');
            const saveBtn = document.getElementById('fundsSaveBtn');
            const eventSelect = document.getElementById('fundsEventSelect');
            
            // Sample data - replace with your RTDB data
            let fundsData = {
                eventId: '',
                startDate: '',
                endDate: '',
                endGoal: 0,
                goalPerYear: 0,
                documentation: '',
                isNA: false,
                years: {
                    ce1: { paid: 0, unpaid: 0 },
                    ce2: { paid: 0, unpaid: 0 },
                    ce3: { paid: 0, unpaid: 0 },
                    ce4: { paid: 0, unpaid: 0 },
                    cs1: { paid: 0, unpaid: 0 },
                    cs2: { paid: 0, unpaid: 0 },
                    cs3: { paid: 0, unpaid: 0 },
                    cs4: { paid: 0, unpaid: 0 }
                }
            };
            
            // Check if user is non-student (admin) - implement your actual auth check
            const isNonStudent = true; // This would come from your auth system
            if (isNonStudent) {
                editBtn.style.display = 'flex';
            }
            
            // Event listeners
            editBtn.addEventListener('click', toggleEditSection);
            cancelBtn.addEventListener('click', toggleEditSection);
            saveBtn.addEventListener('click', saveChanges);
            eventSelect.addEventListener('change', loadEventData);
            
            // End goal input should update yearly goals
            document.getElementById('fundsEndGoal').addEventListener('input', updateYearlyGoals);
            
            // Toggle edit section
            function toggleEditSection() {
                editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
                
                if (editSection.style.display === 'block') {
                    // Populate edit form with current data
                    document.getElementById('fundsStartDate').value = fundsData.startDate;
                    document.getElementById('fundsEndDate').value = fundsData.endDate;
                    document.getElementById('fundsEndGoal').value = fundsData.endGoal;
                    document.getElementById('fundsDocumentation').value = fundsData.documentation;
                    document.getElementById('fundsNaToggle').checked = fundsData.isNA;
                    
                    updateYearlyGoals();
                    renderEditYearChart();
                }
            }
            
            // Load event data when selected
            function loadEventData() {
                const eventId = eventSelect.value;
                if (!eventId) return;
                
                // Here you would fetch data from RTDB based on eventId
                // This is just a simulation
                fundsData = {
                    eventId: eventId,
                    startDate: '2025-01-01',
                    endDate: '2025-01-06',
                    endGoal: 80000,
                    goalPerYear: 10000,
                    documentation: 'Funds will be used for venue rental, equipment, and prizes.',
                    isNA: false,
                    years: {
                        ce1: { paid: 7500, unpaid: 2500 },
                        ce2: { paid: 10000, unpaid: 0 },
                        ce3: { paid: 5000, unpaid: 5000 },
                        ce4: { paid: 8000, unpaid: 2000 },
                        cs1: { paid: 9500, unpaid: 500 },
                        cs2: { paid: 6000, unpaid: 4000 },
                        cs3: { paid: 10000, unpaid: 0 },
                        cs4: { paid: 7000, unpaid: 3000 }
                    }
                };
                
                updateDisplay();
            }
            
            // Update display with current data
            function updateDisplay() {
                // Update summary
                document.getElementById('fundsEndGoalDisplay').textContent = `₱${fundsData.endGoal.toLocaleString()}`;
                document.getElementById('fundsGoalPerYearDisplay').textContent = `₱${fundsData.goalPerYear.toLocaleString()}`;
                
                // Calculate overall unpaid
                let overallUnpaid = 0;
                for (const year in fundsData.years) {
                    overallUnpaid += fundsData.years[year].unpaid;
                }
                document.getElementById('fundsOverallUnpaidDisplay').textContent = `₱${overallUnpaid.toLocaleString()}`;
                
                // Update documentation
                document.getElementById('fundsDocumentationText').textContent = 
                    fundsData.isNA ? 'N/A' : fundsData.documentation || 'No documentation available.';
                
                // Render chart
                renderYearChart();
            }
            
            // Render the display chart
            function renderYearChart() {
                const chartContainer = document.getElementById('fundsYearChart');
                chartContainer.innerHTML = '';
                
                const years = ['CE 1st', 'CE 2nd', 'CE 3rd', 'CE 4th', 'CS 1st', 'CS 2nd', 'CS 3rd', 'CS 4th'];
                const yearKeys = ['ce1', 'ce2', 'ce3', 'ce4', 'cs1', 'cs2', 'cs3', 'cs4'];
                
                yearKeys.forEach((key, index) => {
                    const yearData = fundsData.years[key];
                    const percentage = (yearData.paid / fundsData.goalPerYear) * 100;
                    
                    const chartItem = document.createElement('div');
                    chartItem.className = 'funds-chart-item';
                    chartItem.innerHTML = `
                        <div class="funds-year">${years[index]}</div>
                        <div class="funds-progress-bar">
                            <div class="funds-progress" style="width: ${percentage}%"></div>
                        </div>
                        <div class="funds-amount">₱${yearData.paid.toLocaleString()} / ₱${fundsData.goalPerYear.toLocaleString()}</div>
                        <div class="funds-amount">Unpaid: ₱${yearData.unpaid.toLocaleString()}</div>
                    `;
                    
                    chartContainer.appendChild(chartItem);
                });
            }
            
            // Render the edit chart
            function renderEditYearChart() {
                const chartContainer = document.getElementById('fundsEditYearChart');
                chartContainer.innerHTML = '';
                
                const years = ['CE 1st', 'CE 2nd', 'CE 3rd', 'CE 4th', 'CS 1st', 'CS 2nd', 'CS 3rd', 'CS 4th'];
                const yearKeys = ['ce1', 'ce2', 'ce3', 'ce4', 'cs1', 'cs2', 'cs3', 'cs4'];
                
                yearKeys.forEach((key, index) => {
                    const yearData = fundsData.years[key];
                    
                    const chartItem = document.createElement('div');
                    chartItem.className = 'funds-chart-item';
                    chartItem.innerHTML = `
                        <div class="funds-year">${years[index]}</div>
                        <div class="funds-form-group">
                            <label class="funds-label">Paid Amount (₱)</label>
                            <input type="number" id="${key}Paid" value="${yearData.paid}" class="funds-input funds-paid-input">
                        </div>
                    `;
                    
                    chartContainer.appendChild(chartItem);
                });
                
                // Add event listeners to paid inputs
                document.querySelectorAll('.funds-paid-input').forEach(input => {
                    input.addEventListener('input', function() {
                        const yearKey = this.id.replace('Paid', '');
                        fundsData.years[yearKey].paid = parseFloat(this.value) || 0;
                        fundsData.years[yearKey].unpaid = fundsData.goalPerYear - fundsData.years[yearKey].paid;
                    });
                });
            }
            
            // Update yearly goals when end goal changes
            function updateYearlyGoals() {
                const endGoal = parseFloat(document.getElementById('fundsEndGoal').value) || 0;
                fundsData.goalPerYear = endGoal / 8;
                
                // Update unpaid amounts for all years
                for (const year in fundsData.years) {
                    fundsData.years[year].unpaid = fundsData.goalPerYear - fundsData.years[year].paid;
                }
            }
            
            // Save changes to "RTDB"
            function saveChanges() {
                // Get values from form
                fundsData.startDate = document.getElementById('fundsStartDate').value;
                fundsData.endDate = document.getElementById('fundsEndDate').value;
                fundsData.endGoal = parseFloat(document.getElementById('fundsEndGoal').value) || 0;
                fundsData.goalPerYear = fundsData.endGoal / 8;
                fundsData.documentation = document.getElementById('fundsDocumentation').value;
                fundsData.isNA = document.getElementById('fundsNaToggle').checked;
                
                // Update unpaid amounts based on paid amounts
                for (const year in fundsData.years) {
                    const paidInput = document.getElementById(`${year}Paid`);
                    if (paidInput) {
                        fundsData.years[year].paid = parseFloat(paidInput.value) || 0;
                        fundsData.years[year].unpaid = fundsData.goalPerYear - fundsData.years[year].paid;
                    }
                }
                
                // Here you would actually save to RTDB
                console.log('Saving to RTDB:', fundsData);
                
                // Simulate successful save
                toggleEditSection();
                updateDisplay();
                
                alert('Changes saved successfully!');
            }
            
            // Initialize with no event selected
            updateDisplay();
        });