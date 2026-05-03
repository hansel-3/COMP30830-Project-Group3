
const { wrong_pw, wrong_cred } = window.FLASK_DATA || {}; // get variables from HTML 

// highlight input border for incorrect fields
if (wrong_pw){
  document.querySelector("input[name='password']").style.borderColor = "red";
};

if (wrong_cred){
  document.querySelector("input[name='username']").style.borderColor = "red";
  document.querySelector("input[name='password']").style.borderColor = "red";
};