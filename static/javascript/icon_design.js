
// toggle bike availability on markers
export function toggle(){
  document.querySelectorAll(".marker_icon").forEach(elem => {
    elem.classList.toggle("show_bikes");
    const div = document.getElementById("show_availability");
    if (elem.className == "marker_icon show_bikes"){
      div.innerHTML = "Hide Availability";
    } else if (elem.className == "marker_icon"){
      div.innerHTML = "Show Availability";
    };
  });
};
