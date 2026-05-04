import { getStations } from "./displayStations.js";
import { displayCurrentWeather } from "./displayWeather.js";
import { setupEventListeners } from "./eventListeners.js";

// wait for google maps script to finish loading
const waitForGoogleMaps = setInterval(() => { 
  if (window.google && google.maps) { 
    clearInterval(waitForGoogleMaps); 
    initMap(); 
  }}, 30);
  
export let myMap;
export let infoWindow;
/**
   * Initializes Google Map on the website
   * 
   * Creates map centred on Dublin
   * Calls getStations() to fetch for station data
   * Calls displayCurrentWeather() to show live weather in top banner
   * Sets up button event listeners
   * @returns {void}
   */
function initMap() {
  // set Dublin coordinates
  const dublin = {lat: 53.3498, lng: -6.2603};

  // find div for map
  const mapElement = document.getElementById("map");
  if (!mapElement){
    console.error("Element with ID 'map' not found in the DOM");
    return;
  }
  console.log("Map element found");
    
  // create map instance
  try {
    myMap = new google.maps.Map(mapElement, {
    zoom: 14.3,
    center: dublin,
    mapId: "b5f0c4195ff6ddeee8837853",
  });
  console.log("Map instance created successfully");
} catch (error){
  console.error("Error when creating map instance", error);
  return;
}
// create reusable infoWindow variable
infoWindow = new google.maps.InfoWindow();

// get bike station data
getStations();

// display live weather in top banner
displayCurrentWeather();

// add event listeners to buttons in DOM
setupEventListeners();
} 
