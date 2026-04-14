import { displayCurrentBike, displayStationList, displayDetailedBikes } from "./display_bikes.js";
import { my_map } from "./index.js";

// FETCH CURRENT DATA WHEN "VIEW STATIONS" IS CLICKED
document.getElementById("station_btn").addEventListener("click", ()=>{
  fetch("/api/external/jcdecaux/current")
  .then((response) => response.json())
  .then((dynamic_info) => {

    fetch("/api/stations")
    .then((response) => response.json())
    .then((static_info) => {
      displayStationList(dynamic_info.stations, static_info)
    } )
  })
  .catch((error) => console.log("Error fetching current bike data.", error))
})



//GET STATIONS INFORMATION FROM DATABASE
export function getStations() {
    fetch("/api/stations")
    .then((response)=> {
        return response.json()})
        .then((data) => {
            console.log("fetch response: ", typeof data
            );addMarkers(data);
        })
        .catch((error) => {
            console.error("Error fetching stations: ", error);
        });
    }
  

//ADD MARKERS TO STATIONS
function addMarkers(stations){
  console.log(stations);
  const infoWindow = new google.maps.InfoWindow();


  for (const station of stations){
    var marker = new google.maps.Marker({
      position: {
        lat: station.lat, 
        lng: station.lng,
      },
      map: my_map,
      icon:{url:"/static/images/icon.png",
        scaledSize: new google.maps.Size(30, 30)
      },
    });

    // ADD FUNCTIONALITY TO MARKERS - OPEN DETAILED BIKE INFORMATION
    marker.addListener("click", () => {
    fetch("/api/external/jcdecaux/current")
    .then((response) => response.json())
    .then((data) => {

      const content = `
        <div style="width: 200px;">
          <p id="station_name">Station ${station.number}: ${station.name}</p>
          <div class="bike_summary"></div>
          <button class="more_info_btn">More Information</button>
        </div>
      `;

      infoWindow.setContent(content);
      infoWindow.setPosition({ lat: station.lat, lng: station.lng });
      infoWindow.open(my_map);

      document.getElementById("more_info_bikes").style.display = "none";

      const dynamic_data = data.stations.find(s => s.station_id === station.number);

      google.charts.setOnLoadCallback(() => displayCurrentBike(dynamic_data))

      infoWindow.addListener("domready", () => {
        const btn = document.querySelector(".more_info_btn")

        if(btn) {
            btn.onclick = () => displayDetailedBikes(dynamic_data, station)
        }
      })
    }).catch((error) => {
      console.error("Error fetching current data", error);
    });
    })
  }}

