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