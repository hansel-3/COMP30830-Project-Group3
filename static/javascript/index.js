import { getStations } from "./display_stations.js";
import { displayCurrentWeather } from "./display_weather.js";
import { toggle } from "./icon_design.js";

// wait for google maps script to finish loading
const waitForGoogleMaps = setInterval(() => { 
  if (window.google && google.maps) { 
    clearInterval(waitForGoogleMaps); 
    initMap(); 
  } }, 50);

// initiate map
export let my_map;
function initMap () {

    const dublin = {lat: 53.3498, lng: -6.2603};

    const mapElement = document.getElementById("map");
    if (!mapElement){
        console.error("Element with ID 'map' not found in the DOM");
        return;
    }
    console.log("Map element found");
    
    try {
        my_map = new google.maps.Map(mapElement, {
            zoom: 14.3,
            center: dublin,
            mapId: "b5f0c4195ff6ddeee8837853",
          });
        console.log("Map instance created successfully");

    } catch (error){
        console.error("Error when creating map instance", error);
        return;
    }
    getStations();
    displayCurrentWeather();
}  

// show availability button
document.getElementById("show_availability").addEventListener("click", () =>{
  toggle();
});

// cancel out of side panels
const list = document.querySelectorAll(".cancel_btn");
list.forEach(entry => {
  entry.addEventListener("click", () => {
    document.getElementById("weather_info_container").style.display = "none";
    document.getElementById("bike_info_container").style.display = "none";
    document.getElementById("station_list_container").style.display = "none";
})
})

document.getElementById("cancel_stns_btn").onclick = () => {
  document.getElementById("station_list_container").style.display = "none";
}

document.querySelector(".previous_btn").addEventListener("click", ()=> {
  document.getElementById("prediction_container").style.display = "none";
  document.getElementById("bike_info_container").style.display = "block";

})

// add functionality to logout button
document.getElementById("logout_btn").addEventListener("click", async () => {
  await fetch("/logout", { method: "GET" });
  window.location.href = "/login";
})

// make map function call global
window.initMap = initMap;


