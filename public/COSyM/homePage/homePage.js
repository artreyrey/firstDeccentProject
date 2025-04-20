//displaying of signup/ login
//ibahin pang navigate ng home page.
const homeButton=document.getElementById('home-button');
const profileButton=document.getElementById('profile-button');
const membersButton=document.getElementById('members-button');
const fundsButton=document.getElementById('funds-button');
const eventsButton=document.getElementById('events-button');
const reviewsButton=document.getElementById('reviews-button');


const homeSection=document.getElementById('home-section');
const profileSection=document.getElementById('profile-section');
const membersSection=document.getElementById('members-section');
const fundsSection=document.getElementById('funds-section');
const eventsSection=document.getElementById('events-section');
const reviewsSection=document.getElementById('reviews-section');

homeSection.addEventListener('click',function(){
    homeSection.style.display="none"; //show home section
    profileSection.style.display="block";
    membersSection.style.display="block";
    fundsSection.style.display="block";
    eventsSection.style.display="block";
    reviewsSection.style.display="block";
})
profileSection.addEventListener('click', function(){
    homeSection.style.display="block";
    profileSection.style.display="none"; //show profile section
    membersSection.style.display="block";
    fundsSection.style.display="block";
    eventsSection.style.display="block";
    reviewsSection.style.display="block";
})
membersSection.addEventListener('click', function(){
    homeSection.style.display="block";
    profileSection.style.display="block";
    membersSection.style.display="none"; //show members section
    fundsSection.style.display="block";
    eventsSection.style.display="block";
    reviewsSection.style.display="block";
})

fundsSection.addEventListener('click', function(){
    homeSection.style.display="block";
    profileSection.style.display="block";
    membersSection.style.display="block";
    fundsSection.style.display="none"; //show funds section
    eventsSection.style.display="block";
    reviewsSection.style.display="block";
})

eventsSection.addEventListener('click', function(){
    homeSection.style.display="block";
    profileSection.style.display="block";
    membersSection.style.display="block";
    fundsSection.style.display="block";
    eventsSection.style.display="none"; //show events section
    reviewsSection.style.display="block";
})

reviewsSection.addEventListener('click', function(){
    homeSection.style.display="block";
    profileSection.style.display="block";
    membersSection.style.display="block";
    fundsSection.style.display="block";
    eventsSection.style.display="block";
    reviewsSection.style.display="none"; //show reviews section
})


//profile set up

//dapat may role muna bago ka makapag navigate ng home and profile 

//need ng animation sa pprofile muna para makita ng users, dapat required

//after making profile dapat

//if admin mashoshow yung ibang buttons if member makikita lang and searching.