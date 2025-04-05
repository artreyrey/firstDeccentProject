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

