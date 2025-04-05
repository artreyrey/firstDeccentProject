/*-- pagnagsscroll magiiba kulay ng hover ng current section--*/

let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150; /*-- masmaaga umilaw habang di pa fully nasscroll--*/
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {/*-- check kung nasa current boundary ang section--*/
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']') /*-- Finds the link whose href contains the current section's ID and adds 'active' class to it--*/
            });
        };
    });
};
