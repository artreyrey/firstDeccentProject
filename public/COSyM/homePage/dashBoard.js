// Department Distribution Pie Chart
const deptChart = new Chart(
  document.getElementById('udsDepartmentChart').getContext('2d'),
  {
    type: 'pie',
    data: {
      labels: [
        'CE 1st Year', 'CE 2nd Year', 'CE 3rd Year', 'CE 4th Year',
        'CS 1st Year', 'CS 2nd Year', 'CS 3rd Year', 'CS 4th Year'
      ],
      datasets: [{
        data: [120, 95, 80, 65, 150, 130, 110, 90],
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
          '#FFEEAD', '#D4A5A5', '#A0CED9', '#F4E04D'
        ],
        borderWidth: 2,
        hoverOffset: 20
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 20,
            padding: 15,
            font: { size: 12 }
          }
        },
        tooltip: {
          bodyFont: { size: 14 },
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b);
              const value = context.parsed;
              const percentage = ((value * 100) / total).toFixed(1);
              return `${context.label}: ${percentage}% (${value} students)`;
            }
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      }
    }
  }
);

// Post Form Handling
document.getElementById('udsNewPostBtn').addEventListener('click', () => {
  document.getElementById('udsPostForm').style.display = 'block';
});

document.getElementById('udsNewPostForm').addEventListener('submit', (e) => {
  e.preventDefault();
  // Add post submission logic here
  document.getElementById('udsPostForm').style.display = 'none';
});