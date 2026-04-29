// search for station function
export function searchList(buttons){
  const input = document.getElementById("search_input");
  input.value = "";

  input.addEventListener("input", (e) => {
    const user_input = e.target.value.toLowerCase().replace(/[^\w\s]/g, "");

    buttons.forEach(btn => {
      const title = btn.querySelector(".btn_title");
      const target = title.textContent.toLowerCase().replace(/[^\w\s]/g, "")

      if (target.includes(user_input)){
        btn.style.display = "block";
      } else {
        btn.style.display = "none";
      };
    });
  });
};