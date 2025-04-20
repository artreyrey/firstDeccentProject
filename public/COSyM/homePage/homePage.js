//displaying of signup/ login
//ibahin pang navigate ng home page.
const homeButton=document.getElementById('signUpButton');
const profileButton=document.getElementById('signInButton');
const membersButton=document.getElementById('signInButton');
const fundsButton=document.getElementById('signInButton');
const eventsButton=document.getElementById('signInButton');
const reviewsButton=document.getElementById('signInButton');


const signInForm=document.getElementById('signIn');
const signUpForm=document.getElementById('signup');

signUpButton.addEventListener('click',function(){
    signInForm.style.display="none";
    signUpForm.style.display="block";
})
signInButton.addEventListener('click', function(){
    signInForm.style.display="block";
    signUpForm.style.display="none";
})


//profile set up

//dapat may role muna bago ka makapag navigate ng home and profile 

//need ng animation sa pprofile muna para makita ng users, dapat required

//after making profile dapat

//if admin mashoshow yung ibang buttons if member makikita lang and searching.