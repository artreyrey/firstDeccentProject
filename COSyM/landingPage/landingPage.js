//for highlighting
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150; // Adjusts when the highlight activates
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                // Find the link that matches the current section
                let matchingLink = document.querySelector(`header nav a[href="#${id}"]`);
                if(matchingLink) {
                    matchingLink.classList.add('active');
                }
            });
        }
    });
};

/*hamburger menu */
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    const overlay = document.querySelector('.overlay');

    menuToggle.addEventListener('click', () => {
        navbar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Toggle between hamburger and X icon
        if (navbar.classList.contains('active')) {
            menuToggle.textContent = "✕"; 
        } else {
            menuToggle.textContent = "☰"; 
        }
    });

    overlay.addEventListener('click', () => {
        navbar.classList.remove('active');
        overlay.classList.remove('active');
        menuToggle.textContent = "☰"; // Revert to hamburger
    });

    // Close menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('active');
            overlay.classList.remove('active');
            menuToggle.textContent = "☰";
        });
    });
});



