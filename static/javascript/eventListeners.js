import { displayStationList } from "./displayBikes.js";
import { displayDetailedWeather} from "./displayWeather.js";
import { toggleMarkers } from "./toggleMarkers.js";

/**
 * Adds event listeners to buttons iniatially present in DOM 
 */
export function addEventListeners(){
  stationsButton();
  weatherButton();
  toggleButton();
  cancelButton();
  logoutButton();
}

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
    });
  })
  .catch((error) => console.log("Error fetching current bike data.", error));
});
}

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
}

function toggleButton(){
  document.getElementById("show_availability").addEventListener("click", () =>{
      toggleMarkers();
    });
}

function cancelButton(){
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
  }

function logoutButton(){
  document.getElementById("logout_btn").addEventListener("click", async () => {
  await fetch("/logout", { method: "GET" });
  window.location.href = "/login";
})
}
    
