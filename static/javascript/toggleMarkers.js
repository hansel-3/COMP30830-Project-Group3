
/**
 * Toggle the display of markers to show bike availability for each station
 * 
 *    Applies/removes "show bikes" class to all markers
 *    Updates "Show Availability" button text
 */
export function toggleMarkers(){
  // apply toggle property to all markers
  document.querySelectorAll(".marker_icon").forEach(elem => {
  elem.classList.toggle("show_bikes");

  // alter text in "Show Availability" button to show appropriate text
  const div = document.getElementById("show_availability");
  if (elem.className == "marker_icon show_bikes"){
    div.innerHTML = "Hide Availability";
  } else if (elem.className == "marker_icon"){
    div.innerHTML = "Show Availability";
  };
});
};
