import { myMap } from "./index.js";
import { displayInfoWindow } from "./infoWindow.js";

/**
 * Fetches static station data from backend API
 * 
 *    Calls addMarkers() to add markers to stations upon successful fetching
 */
export function getStations() {
    fetch("/api/stations")
    .then((response)=> {
        return response.json()})
        .then((data) => {
            addMarkers(data);
        })
        .catch((error) => {
            console.error("Error fetching stations: ", error);
        });
    };

/**
 * Fetches live station information from JCDecaux API
 * 
 * @async
 * @returns {Promise-<Array>} Array of objects, each object contains live information about a station
 */
async function loadCurrentBike(){
  const response = await fetch("/api/external/jcdecaux/current");
  const data = await response.json();
  return data.stations;
}
// store the return value of loadCurrentBike()
const currentStationData = await loadCurrentBike();

// load AdvancedMarkerElement from google maps marker library
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");


/**
 * Adds interactive markers to all Dublin Bike stations
 * 
 *    Creates custom icon for each marker
 *    Markers positioned at station's coordinates
 *    Click listener added to markers to fetch live data from JCDecaux API
 *    Displays infoWindow popup
 * 
 * @param {Array<Object>} stations Array of objects, each object contains static information about a station
 */
function addMarkers(stations){
  for (const station of stations){
    // create custom icon
    const icon = document.createElement("div");
    icon.className = "marker_icon";
    let findStation = currentStationData.find(s => s.station_id === station.number);
    let markerText = findStation.available_bikes;
    icon.textContent = markerText;

    // create marker
    const marker = new AdvancedMarkerElement({
      position: {
        lat: station.lat, 
        lng: station.lng,
      },
      map: myMap,
      content: icon  // add custom icon to marker
    });

    // add functionality to markers - opens infoWindow
    marker.addListener("gmp-click", () => {
    fetch("/api/external/jcdecaux/current")
    .then((response) => response.json())
    .then((data) => {

      const currentData = data.stations.find(s => s.station_id === station.number);
      displayInfoWindow(currentData, station); //display infoWindow popup

      // close side panels
      document.getElementById("bike_info_container").style.display = "none";
      document.getElementById("prediction_container").style.display = "none";

    }).catch((error) => {
      console.error("Error fetching current data", error);
    });
    });
  };
};

