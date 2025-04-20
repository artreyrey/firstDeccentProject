//displaying of signup/ login
//ibahin pang navigate ng home page.
const signUpButton=document.getElementById('signUpButton');
const signInButton=document.getElementById('signInButton');
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
//need ng animation para makapagset ng profile
//after making profile dapat

//if admin or 