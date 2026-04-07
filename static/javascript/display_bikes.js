


//LOAD GOOGLE CHARTS
try {
  google.charts.load("current", { packages: ["corechart", "bar"]});
} catch(error){
  console.log("Failed to load Charts", error)
}

// STATION LIST DISPLAY
export function displayStationList(stations){

  const list = document.getElementById("station_list");
  list.innerHTML = "";

  document.getElementById("station_list").style.display = "flex";
  document.getElementById("more_info_weather").style.display = "none";
  document.getElementById("more_info_bikes").style.display = "none";

  stations.forEach(entry => {
  let element = document.createElement("button");
  element.className = "station";
  let content = `
  <div>${entry.name}(${entry.station_id})</div>
  <div>${entry.available_bikes}<i class="fa-solid fa-bicycle"></i>   ${entry.available_stands}<i class="fa-solid fa-square-parking"></i></div>
  `
  element.innerHTML = content;
  document.getElementById("station_list").appendChild(element);
})
}


// DETAILED BIKE INFORMATION DISPLAY
export function displayDetailedBikes(station){

  document.getElementById("more_info_bikes").style.display = "block";
  document.getElementById("station_list").style.display = "none";
  document.getElementById("more_info_weather").style.display = "none";

  fetch("/api/external/jcdecaux/current")
  .then((response) => response.json())
  .then((data) => {
    let dynamic = data.stations.find(s => s.station_id === station.number || station.name === station.number)

    displayMoreInfo(dynamic, station)

    fetch(`/api/stations/${station.number || station.station_id}/history`)
    .then((response) => response.json())
    .then((history) => {
       let bikes_array = [];
        history.forEach((entry) => bikes_array.push(entry.available_bikes))

        let stands_array = [];
        history.forEach((entry) => stands_array.push(entry.available_bike_stands))

        google.charts.setOnLoadCallback(() => {
        drawChart("Bikes Available", history, bikes_array, "bike_chart1")
        drawChart("Free Stands", history, stands_array, "bike_chart2" )
    })
  })
})}


// BIKE INFORMATION FOR INFOWINDOW POPUP
export function displayCurrentBike(data) {
    var available_bikes = data.available_bikes;
    var available_stands = data.available_stands;
    var status = data.status;

    document.querySelector(".bike_summary").innerHTML = `
    <div>
    <p class="infw_status"> ${status}</p>
    </div>
    <div>
    <p><span class="count">${available_bikes}</span> <i class="fa-solid fa-bicycle"></i></p>
    <p><span class="count">${available_stands}</span> <i class="fa-solid fa-square-parking"></i></p>
    </div>`
}


function displayMoreInfo(dynamic, stat){

  document.getElementById("more_info_bikes").style.display = "block";

  document.getElementById("summary").innerHTML = `
  <div>
  <h3 class="title">Station ${stat.number}: ${stat.name}</h3>
  <p class="address">${stat.address}</p>
  <p class="status">${dynamic.status}</p>
  <p class="availability"> ${stat.bike_stands} Total Bike Stands</p>
  <p class="availability">${dynamic.available_bikes} Available Bikes <i class="fa-solid fa-bicycle"></i></p>
  <p class="availability">${dynamic.available_stands} Free Stands <i class="fa-solid fa-square-parking"></i></p>
  <div class="banner"></div>
  </div>
  </div>
  `;
}


function drawChart(axis_title, data, availability, div){
  const chartData = new google.visualization.DataTable();

  chartData.addColumn("datetime", "Time (Hour of Day)");
  chartData.addColumn("number", axis_title);
  chartData.addColumn({ type: "string", role: "style" });



  let i = 0;
  data.forEach((entry) => {
    let dateFixed = new Date(entry.hour_block.replace(" ", "T"));
    chartData.addRow([
      dateFixed,
      Number(availability[i]),
      'fill-color: #46bd50; fill-opacity: 0.7'
    ]);
    i++
  });

  const options = {
    backgroundColor: "white",
    hAxis: {
      title: "Time (Hour of Day)",
      format: "H",
    },
    vAxis: {
      title: axis_title,
      textPosition: "out",
      textStyle: { fontSize: 10, color: "black" },
      minValue: 0,
    },
    legend: { position: "none" },
    height: 400,
    width: 800,
    chartArea: {
      top: 20,
      bottom:100,
    }
    };


    const chart = new google.visualization.ColumnChart(
      document.getElementById(div)
    )
    chart.draw(chartData, options);
  }