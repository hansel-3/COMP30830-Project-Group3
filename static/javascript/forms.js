// ---signup form---
const form = document.querySelector("form");
const passwordInput = document.querySelector('input[name="password"]');

  form.addEventListener("submit", (e) => {
    if (passwordInput.value.length < 8) {
      e.preventDefault(); // prevents page reload upon submission

      // display message to user
      document.querySelector(".warning").style.display = "block";
      document.querySelector(".warning").innerHTML = "&#10071; Password must be at least 8 characters.";
    };
  });


// ---login form---
const { wrong_pw, wrong_cred } = window.FLASK_DATA || {}; // get variables from HTML 

// highlight input border for incorrect fields
if (wrong_pw){
  document.querySelector("input[name='password']").style.borderColor = "red";
};

if (wrong_cred){
  document.querySelector("input[name='username']").style.borderColor = "red";
  document.querySelector("input[name='password']").style.borderColor = "red";
};