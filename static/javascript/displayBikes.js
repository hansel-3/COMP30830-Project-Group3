import { displayPredictionDetails } from "./displayPrediction.js";
import { displayInfoWindow } from "./infoWindow.js";
import { searchList } from "./searchStationsList.js";
import { drawBikeChart, drawPieChart} from "./drawCharts.js";

// load google charts
try {
  google.charts.load("current", { packages: ["corechart", "bar"]});
} catch(error){
  console.log("Failed to load Charts", error);
}

/**
 * Displays list of bike stations in side panel
 * 
 * Each entry in the list is created as a clickable button which opens detailed information for selected station 
 * Calls searchList() to implement search function
 * @param {Array<Object>} dynamicData Live information for each station
 * @param {Array<Object>} staticData Static information for each station
 * @returns {void}
 */
export function displayStationList(dynamicData, staticData){
  // reset stations list
  let stationList = document.getElementById("station_list");
  stationList.innerHTML = "";

  // open stations list side panel
  document.getElementById("station_list_container").style.display = "block";
  setTimeout(() => {
    stationList.scrollTop = 0; // set scroll position to the top after opening div
  }, 20);

  // close all other side panels
  document.getElementById("weather_info_container").style.display = "none";
  document.getElementById("bike_info_container").style.display = "none";
  document.getElementById("prediction_container").style.display = "none";

  // create button for each station
  dynamicData.forEach(entry => {
  const element = document.createElement("button");
  element.className = "station";
  const content = `
  <div class="btn_title">Station ${entry.station_id}: ${entry.name}</div>
  <div>${entry.available_bikes}<i class="fa-solid fa-bicycle"></i> ${entry.available_stands}<i class="fa-solid fa-square-parking"></i></div>
  `;
  element.innerHTML = content;
  stationList.appendChild(element);

  const findStation = staticData.find(s => s.number === entry.station_id); // find selected station only
  element.onclick = ()=> {
    displayDetailedBikes(entry, findStation);
    displayInfoWindow(entry, findStation);
  };
});
// pass station buttons into station search function
const buttons = document.querySelectorAll(".station");
searchList(buttons);
};

/**
 * Opens side panel containing detailed information about selected station
 * 
 * Displays station-specific live information 
 * Fetches historical bike availability data for charts 
 * @param {Object} dynamicData Live information for selected station
 * @param {Object} staticData Static information for selected station
 * @returns {void}
 */
export function displayDetailedBikes(dynamicData, staticData){
  // open station information board side panel
  const div = document.getElementById("bike_info_container");
  div.style.display = "block";
   
  setTimeout(() => {
    div.scrollTop = 0; // set scroll position to the top
  }, 20);

  // close other side panels
  document.getElementById("station_list_container").style.display = "none";
  document.getElementById("weather_info_container").style.display = "none";
  
  // reset chart divs
  document.getElementById("bike_chart1").innerHTML = "";
  document.getElementById("bike_chart2").innerHTML = "";

  // display text content
  displayMoreInfo(dynamicData, staticData);

  // fetch historical data for charts
  fetch(`/api/stations/${staticData.number}/history`)
    .then((response) => response.json())
    .then((historicData) => {
          // collect dates(x-axis) and historic data for bike and stand availability(y-axis) for charts
          const xAxis = [], yAxisBikes = [], yAxisStands = [];
          historicData.forEach(entry => {
          const date = new Date(entry.hour_block.replace(" ", "T"));

          xAxis.push(date);
          yAxisBikes.push(Number(entry.available_bikes));
          yAxisStands.push(Number(entry.available_bike_stands));
        })
        // draw historic data charts
        google.charts.setOnLoadCallback(() => {
        drawBikeChart(xAxis, yAxisBikes, "No. of Bikes", "bike_chart1");
        drawBikeChart(xAxis, yAxisStands, "No. of Parking Spaces", "bike_chart2" );
    })
  }).catch((error) => console.log("Failed to fetch bike history data: ", error));
}


/**
 * Displays live information about selected station
 * 
 * Ensures correct grammar for text displayed
 * Calls drawPie() to display bike availability pie chart
 * @param {Object} dynamicData Live information about selected station
 * @param {Object} staticData Static information about selected station
 * @returns {void}
 */
function displayMoreInfo(dynamicData, staticData){
  // find banking status for station
  const card = staticData.banking;
  let cardPayment;
  if (card == 0){
    cardPayment = "No";
  } else if (card == 1){
    cardPayment = "Yes";
  };
 
  // alter grammar appropriately
  let bikesGrammar;
  if (dynamicData.available_bikes == 1){
    bikesGrammar = "Bike";
  } else{
    bikesGrammar = "Bikes";
  };

  let parkingGrammar;
  if (dynamicData.available_stands == 1){
    parkingGrammar = "Space";
  } else{
    parkingGrammar = "Spaces";
  };
  document.querySelector(".summary").innerHTML = 
 `
  <div class="summary_info">
  <h3 class="title">Station ${staticData.number}: ${staticData.name}</h3>
  <p class="address">${staticData.address}</p>
  <p class="status">${dynamicData.status}</p>
  <div>
    <p class="bike_details">${staticData.bike_stands} Total Bike Stands</p>
    <p class="bike_details">${dynamicData.available_bikes} ${bikesGrammar} Available</p>
    <p class="bike_details">${dynamicData.available_stands} Parking ${parkingGrammar}</p>
    <p class="bike_details">Card Accepted: ${cardPayment}</p>
  </div>
  <button class="open_predict_btn">View Bike Forecast</button>
  </div>
  `;

  // draw pie chart
  drawPieChart(dynamicData.available_bikes, dynamicData.available_stands, "pie_chart");

  // add functionilty to "view bike forecast" button - opens prediction side panel
  document.querySelector(".open_predict_btn").addEventListener("click", ()=>{
       displayPredictionDetails(staticData);
    })
};
