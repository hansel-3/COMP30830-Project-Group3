import { displayStationList } from "./displayBikes.js";
import { displayDetailedWeather} from "./displayWeather.js";
import { toggleMarkers } from "./toggleMarkers.js";

/**
 * Adds event listeners to buttons iniatially present in DOM 
 * @returns {void}
 */
export function setupEventListeners(){
  stationsButton();
  weatherButton();
  toggleButton();
  cancelButton();
  logoutButton();
}

/**
 * Opens stations list in a side panel
 * 
 * Fetches live station information from JCDecaux API
 * Fetches static station information
 * @returns {void}
 */
function stationsButton(){
  document.getElementById("station_btn").addEventListener("click", ()=>{
  fetch("/api/external/jcdecaux/current")
  .then((response) => response.json())
  .then((currentInfo) => {
    
    const invalidStation = currentInfo.stations.find(s => s.station_id === 34); // remove station 34 as it is not in stations_static.json
    const currentInfoCorrected = [];

    currentInfo.stations.forEach(entry => {
      if (entry !== invalidStation){
        currentInfoCorrected.push(entry)
      }}
    );
    fetch("/api/stations")
    .then((response) => response.json())
    .then((staticInfo) => {
      displayStationList(currentInfoCorrected, staticInfo);
    }).catch((error) => console.log("Error fetching stations data: ", error));
  }).catch((error) => console.log("Error fetching current bike data: ", error));
});
};

/**
 * Opens weather side panel
 * 
 * Fetches live and historic weather information
 * Calls displayDetailedWeather() to display weather information
 * @returns {void}
 */
function weatherButton(){
  document.getElementById("weather_btn").addEventListener("click", ()=> {
  fetch("/api/external/weather/current")
  .then((response) => response.json())
  .then((currentData) => {

    fetch("/api/weather/history")
      .then((response) => response.json())
      .then((historicData) => {

        displayDetailedWeather(currentData.weather, historicData)

      }).catch(error => console.log("Failed to fetch historic weather data: ",error));
  }).catch((error) => console.log("Failed to fetch current weather data.", error));
});
};

/**
 * Toggles the display of map markers to show live bike availability
 * @returns {void}
 */
function toggleButton(){
  document.getElementById("show_availability").addEventListener("click", () =>{
      toggleMarkers();
    });
}

/**
 * Triggers the closing of side panels
 * @returns {void}
 */
function cancelButton(){
  const list = document.querySelectorAll(".cancel_btn");
  list.forEach(entry => {
    entry.addEventListener("click", () => {
      document.getElementById("weather_info_container").style.display = "none";
      document.getElementById("bike_info_container").style.display = "none";
      document.getElementById("station_list_container").style.display = "none";
    });
  });

  document.getElementById("cancel_stns_btn").onclick = () => {
    document.getElementById("station_list_container").style.display = "none";
  };

  // redirects back to station information board div
  document.querySelector(".previous_btn").addEventListener("click", ()=> {
    document.getElementById("prediction_container").style.display = "none";
    document.getElementById("bike_info_container").style.display = "block";
  });
  };

/**
 * Cancels user's current session
 * Redirects to login page
 * @returns {void}
 */
function logoutButton(){
  document.getElementById("logout_btn").addEventListener("click", async () => {
  await fetch("/logout", { method: "GET" });
  window.location.href = "/login";
});
};

    
