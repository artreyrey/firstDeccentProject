// This would be replaced with your actual Firebase/RTDB implementation
        document.addEventListener('DOMContentLoaded', function() {
            const editBtn = document.getElementById('editBtn');
            const editSection = document.getElementById('editSection');
            const cancelBtn = document.getElementById('cancelBtn');
            const saveBtn = document.getElementById('saveBtn');
            const eventSelect = document.getElementById('eventSelect');
            
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
            document.getElementById('endGoal').addEventListener('input', updateYearlyGoals);
            
            // Toggle edit section
            function toggleEditSection() {
                editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
                
                if (editSection.style.display === 'block') {
                    // Populate edit form with current data
                    document.getElementById('startDate').value = fundsData.startDate;
                    document.getElementById('endDate').value = fundsData.endDate;
                    document.getElementById('endGoal').value = fundsData.endGoal;
                    document.getElementById('documentation').value = fundsData.documentation;
                    document.getElementById('naToggle').checked = fundsData.isNA;
                    
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
                document.getElementById('endGoalDisplay').textContent = `₱${fundsData.endGoal.toLocaleString()}`;
                document.getElementById('goalPerYearDisplay').textContent = `₱${fundsData.goalPerYear.toLocaleString()}`;
                
                // Calculate overall unpaid
                let overallUnpaid = 0;
                for (const year in fundsData.years) {
                    overallUnpaid += fundsData.years[year].unpaid;
                }
                document.getElementById('overallUnpaidDisplay').textContent = `₱${overallUnpaid.toLocaleString()}`;
                
                // Update documentation
                document.getElementById('documentationText').textContent = 
                    fundsData.isNA ? 'N/A' : fundsData.documentation || 'No documentation available.';
                
                // Render chart
                renderYearChart();
            }
            
            // Render the display chart
            function renderYearChart() {
                const chartContainer = document.getElementById('yearChart');
                chartContainer.innerHTML = '';
                
                const years = ['CE 1st', 'CE 2nd', 'CE 3rd', 'CE 4th', 'CS 1st', 'CS 2nd', 'CS 3rd', 'CS 4th'];
                const yearKeys = ['ce1', 'ce2', 'ce3', 'ce4', 'cs1', 'cs2', 'cs3', 'cs4'];
                
                yearKeys.forEach((key, index) => {
                    const yearData = fundsData.years[key];
                    const percentage = (yearData.paid / fundsData.goalPerYear) * 100;
                    
                    const chartItem = document.createElement('div');
                    chartItem.className = 'chart-item';
                    chartItem.innerHTML = `
                        <div class="year">${years[index]}</div>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${percentage}%"></div>
                        </div>
                        <div class="amount">₱${yearData.paid.toLocaleString()} / ₱${fundsData.goalPerYear.toLocaleString()}</div>
                        <div class="amount">Unpaid: ₱${yearData.unpaid.toLocaleString()}</div>
                    `;
                    
                    chartContainer.appendChild(chartItem);
                });
            }
            
            // Render the edit chart
            function renderEditYearChart() {
                const chartContainer = document.getElementById('editYearChart');
                chartContainer.innerHTML = '';
                
                const years = ['CE 1st', 'CE 2nd', 'CE 3rd', 'CE 4th', 'CS 1st', 'CS 2nd', 'CS 3rd', 'CS 4th'];
                const yearKeys = ['ce1', 'ce2', 'ce3', 'ce4', 'cs1', 'cs2', 'cs3', 'cs4'];
                
                yearKeys.forEach((key, index) => {
                    const yearData = fundsData.years[key];
                    
                    const chartItem = document.createElement('div');
                    chartItem.className = 'chart-item';
                    chartItem.innerHTML = `
                        <div class="year">${years[index]}</div>
                        <div class="form-group">
                            <label>Paid Amount (₱)</label>
                            <input type="number" id="${key}Paid" value="${yearData.paid}" class="paid-input">
                        </div>
                    `;
                    
                    chartContainer.appendChild(chartItem);
                });
                
                // Add event listeners to paid inputs
                document.querySelectorAll('.paid-input').forEach(input => {
                    input.addEventListener('input', function() {
                        const yearKey = this.id.replace('Paid', '');
                        fundsData.years[yearKey].paid = parseFloat(this.value) || 0;
                        fundsData.years[yearKey].unpaid = fundsData.goalPerYear - fundsData.years[yearKey].paid;
                    });
                });
            }
            
            // Update yearly goals when end goal changes
            function updateYearlyGoals() {
                const endGoal = parseFloat(document.getElementById('endGoal').value) || 0;
                fundsData.goalPerYear = endGoal / 8;
                
                // Update unpaid amounts for all years
                for (const year in fundsData.years) {
                    fundsData.years[year].unpaid = fundsData.goalPerYear - fundsData.years[year].paid;
                }
            }
            
            // Save changes to "RTDB"
            function saveChanges() {
                // Get values from form
                fundsData.startDate = document.getElementById('startDate').value;
                fundsData.endDate = document.getElementById('endDate').value;
                fundsData.endGoal = parseFloat(document.getElementById('endGoal').value) || 0;
                fundsData.goalPerYear = fundsData.endGoal / 8;
                fundsData.documentation = document.getElementById('documentation').value;
                fundsData.isNA = document.getElementById('naToggle').checked;
                
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