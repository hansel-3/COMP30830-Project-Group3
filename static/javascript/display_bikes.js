import { setup_predict } from "./display_prediction.js";
import { displayInfw } from "./infowindow.js";
import { searchList } from "./search_list.js";

// load google charts
try {
  google.charts.load("current", { packages: ["corechart", "bar"]});
} catch(error){
  console.log("Failed to load Charts", error);
}

// open station list in side panel
export function displayStationList(dyn, stat){
  
  let list = document.getElementById("station_list");
  list.innerHTML = "";

  document.getElementById("station_list_container").style.display = "block";
  setTimeout(() => {
    list.scrollTop = 0; // set scroll position to the top after opening div
  }, 20);

  // close all other side panels
  document.getElementById("weather_info_container").style.display = "none";
  document.getElementById("bike_info_container").style.display = "none";
  document.getElementById("prediction_container").style.display = "none";

  // create button for each station
  dyn.forEach(entry => {
  let element = document.createElement("button");
  element.className = "station";
  let content = `
  <div class="btn_title">Station ${entry.station_id}: ${entry.name}</div>
  <div>${entry.available_bikes}<i class="fa-solid fa-bicycle"></i> ${entry.available_stands}<i class="fa-solid fa-square-parking"></i></div>
  `;
  element.innerHTML = content;
  list.appendChild(element);

  const static_station = stat.find(s => s.number === entry.station_id);
  element.onclick = ()=> {
    displayDetailedBikes(entry, static_station);
    displayInfw(entry, static_station);
  };
});
const buttons = document.querySelectorAll(".station");
searchList(buttons);
};


// display side panel for detailed bike information
export function displayDetailedBikes(dynamic, station){

  const div = document.getElementById("bike_info_container");
  div.style.display = "block";
   
  setTimeout(() => {
    div.scrollTop = 0; // set scroll position to the top after opening div
  }, 20);

  // close other side panels
  document.getElementById("station_list_container").style.display = "none";
  document.getElementById("weather_info_container").style.display = "none";
  
  // reset chart divs
  document.getElementById("bike_chart1").innerHTML = "";
  document.getElementById("bike_chart2").innerHTML = "";

  // display div content
  displayMoreInfo(dynamic, station);

  // fetch historical data for charts
  fetch(`/api/stations/${station.number}/history`)
    .then((response) => response.json())
    .then((history) => {
       let bikes_array = [];
        history.forEach((entry) => bikes_array.push(entry.available_bikes));

        let stands_array = [];
        history.forEach((entry) => stands_array.push(entry.available_bike_stands));

        google.charts.setOnLoadCallback(() => {
        drawChart("No. of Bikes", history, bikes_array, "bike_chart1");
        drawChart("No. of Parking Spaces", history, stands_array, "bike_chart2" );
    })
  }).catch((error) => console.log("failed to fetch bike history data.", error));
}

// first section of station information board in side panel
function displayMoreInfo(dynamic, stat){

  const card = stat.banking;
  let card_payment;
  if (card == 0){
    card_payment = "No";
  } else if (card == 1){
    card_payment = "Yes";
  };

  let grammar1;
  if (dynamic.available_bikes == 1){
    grammar1 = "Bike";
  } else{
    grammar1 = "Bikes";
  };

  let grammar2;
  if (dynamic.available_stands == 1){
    grammar2 = "Space";
  } else{
    grammar2 = "Spaces";
  };
  document.querySelector(".summary").innerHTML = 
 `
  <div class="summary_info">
  <h3 class="title">Station ${stat.number}: ${stat.name}</h3>
  <p class="address">${stat.address}</p>
  <p class="status">${dynamic.status}</p>
  <div>
    <p class="bike_details">${stat.bike_stands} Total Bike Stands</p>
    <p class="bike_details">${dynamic.available_bikes} ${grammar1} Available</p>
    <p class="bike_details">${dynamic.available_stands} Parking ${grammar2}</p>
    <p class="bike_details">Card Accepted: ${card_payment}</p>
  </div>
  <button class="open_predict_btn">View Bike Forecast</button>
  </div>
  `;
  drawPie(dynamic.available_bikes, dynamic.available_stands);

  document.querySelector(".open_predict_btn").addEventListener("click", ()=>{
     setup_predict(stat);
  });
};

function drawChart(axis_title, data, availability, div){
  const chartData = new google.visualization.DataTable();

  chartData.addColumn("datetime", "Time (Hour of Day)");
  chartData.addColumn("number", axis_title);

  data.forEach((entry, i) => {
    let date = new Date(entry.hour_block.replace(" ", "T"));
    chartData.addRow([
      date,
      Number(availability[i]),
    ]);
  });

  const options = {
    backgroundColor: "white",
    hAxis: {
      title: "Time (Hour of Day)",
      format: "HH a",
      gridlines: {color:"transparent"}
    },
    vAxis: {
      title: axis_title,
      textPosition: "out",
      textStyle: { fontSize: 10, color: "black" },
      minValue: 0,
    },
    legend: { position: "none" },
    height: 400,
    chartArea: {
      top: 20,
      bottom:100,
      width: 300
    },
    curveType:"function",
    colors: ["#4a8af2"],
    };

    const chart = new google.visualization.LineChart(
      document.getElementById(div)
    );
    chart.draw(chartData, options);
  };

function drawPie(bikes, stands){
  const pieData = new google.visualization.arrayToDataTable([
    ["type","count"],
    ["available bikes", bikes],
    ["parking spaces", stands]
  ]);

  let options = {
    legend: {position: "bottom"},
    colors: ["#4a8af2","#acc8f4"],
    width: 380,
    height:380,
    chartArea: {
      top: 30,
    }
  };

  let chart = new google.visualization.PieChart(
    document.getElementById("pie_chart")
  );
  chart.draw(pieData, options);
};