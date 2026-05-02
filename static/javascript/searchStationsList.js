
/**
 * Searches for station based on user input
 * 
 * Filters through stations list to find station that matches user input
 * @param {NodeListOf<HTMLElement>} buttons List of station button elements
 * @returns {void}
 */
export function searchList(buttons){
  // reset the list 
  const input = document.getElementById("search_input");
  input.value = "";

  // extract user input and modify - to lowercase, remove punctuation
  input.addEventListener("input", (e) => {
    const userInput = e.target.value.toLowerCase().replace(/[^\w\s]/g, "");

    buttons.forEach(btn => {
      // flter based on button title - station number and name
      const title = btn.querySelector(".btn_title");
      const target = title.textContent.toLowerCase().replace(/[^\w\s]/g, "");

      if (target.includes(userInput)){
        btn.style.display = "block";
      } else {
        btn.style.display = "none";
      };
    });
  });
};