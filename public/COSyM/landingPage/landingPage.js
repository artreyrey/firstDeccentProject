// Navigation when click will go to that id
const highlightActiveNav = () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('header nav a');
    const scrollPosition = window.scrollY;
  
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
  
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => link.classList.remove('active'));
        const currentLink = document.querySelector(`header nav a[href="#${sectionId}"]`);
        currentLink?.classList.add('active');
      }
    });
  };
  
  // Mobile menu functionality
  const initMobileMenu = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    const overlay = document.querySelector('.overlay');
    const navLinks = document.querySelectorAll('.nav-link');
  
    const toggleMenu = () => {
      navbar.classList.toggle('active');
      overlay.classList.toggle('active');
      menuToggle.textContent = navbar.classList.contains('active') ? "✕" : "☰";
    };
  
    const closeMenu = () => {
      navbar.classList.remove('active');
      overlay.classList.remove('active');
      menuToggle.textContent = "☰";
    };
  
    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);
    navLinks.forEach(link => link.addEventListener('click', closeMenu));
  };
  
  // Initialize everything when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('scroll', highlightActiveNav);
    initMobileMenu();
  });