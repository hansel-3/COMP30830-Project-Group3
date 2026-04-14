import { getStations } from "./stations.js";
import { displayCurrentWeather } from "./display_weather.js";

//INITIATE THE MAP 
export var my_map;
function initMap() {
    console.log("initMap function called.")

    const dublin = {lat: 53.3498, lng: -6.2603}
    console.log("Dublin coordinates set")

    const mapElement = document.getElementById("map");
    if (!mapElement){
        console.error("Element with ID 'map' not found in the DOM");
        return;
    }
    console.log("Map element found")
    
    try {
        my_map = new google.maps.Map(mapElement, {
            zoom: 14.3,
            center: dublin,
            styles: [
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
]
        });
        console.log("Map instance created successfully");
    } catch (error){
        console.error("Error when creating map instance", error);
        return;
    }
    
    getStations();
}




const waitForGoogleMaps = setInterval(() => {
    if (window.google && google.maps) {
        clearInterval(waitForGoogleMaps);
        initMap();
    }
}, 50);  


// DISPLAY CURRENT WEATHER INFORMATION IN THE HEADER
displayCurrentWeather()


// ADD FUNCTIONALITY TO LOGOUT BUTTON
document.getElementById("logout").addEventListener("click", async () => {
  await fetch("/logout", { method: "GET" });
  window.location.href = "/login";
})


// MAKE MAP FUNCTION GLOBAL
window.initMap = initMap;


