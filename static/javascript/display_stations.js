import { displayStationList} from "./display_bikes.js";
import { my_map } from "./index.js";
import { displayInfw } from "./infowindow.js";

// fetch current data when "view stations" is clicked
document.getElementById("station_btn").addEventListener("click", ()=>{
  fetch("/api/external/jcdecaux/current")
  .then((response) => response.json())
  .then((dynamic_info) => {
    
    const remove = dynamic_info.stations.find(s => s.station_id === 34); // remove station 34 as it is not in stations_static.json
    let dynamic_info_corrected = [];

    dynamic_info.stations.forEach(entry => {
      if (entry !== remove){
        dynamic_info_corrected.push(entry)
      }}
    );
    fetch("/api/stations")
    .then((response) => response.json())
    .then((static_info) => {
      displayStationList(dynamic_info_corrected, static_info);
    });
  })
  .catch((error) => console.log("Error fetching current bike data.", error));
});

// fetch static data for marker positioning
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

// fetch current data and store it - to display bike availability on markers
async function loadCurrentBike(){
  const response = await fetch("/api/external/jcdecaux/current");
  const data = await response.json();
  return data.stations;
}
const current_data = await loadCurrentBike();

// load AdvancedMarkerElement from google maps marker library
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

// add markers to stations
function addMarkers(stations){
  
  for (const station of stations){
    // create icon
    const icon = document.createElement("div");
    icon.className = "marker_icon";
    let station_found = current_data.find(s => s.station_id === station.number);
    let marker_text = station_found.available_bikes;
    icon.textContent = marker_text;

    // create marker
    const marker = new AdvancedMarkerElement({
      position: {
        lat: station.lat, 
        lng: station.lng,
      },
      map: my_map,
      content: icon
    });

    // add functionality to markers
    marker.addListener("gmp-click", () => {
    fetch("/api/external/jcdecaux/current")
    .then((response) => response.json())
    .then((data) => {

      const dynamic_data = data.stations.find(s => s.station_id === station.number);
      displayInfw(dynamic_data, station); //display infoWindow popup

      // close side panels
      document.getElementById("bike_info_container").style.display = "none";
      document.getElementById("prediction_container").style.display = "none";

    }).catch((error) => {
      console.error("Error fetching current data", error);
    });
    });
  };
};

