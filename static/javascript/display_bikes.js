


//LOAD GOOGLE CHARTS
try {
  google.charts.load("current", { packages: ["corechart", "bar"]});
} catch(error){
  console.log("Failed to load Charts", error)
}

// STATION LIST DISPLAY
export function displayStationList(dyn, stat){

  const list = document.getElementById("station_list");
  list.innerHTML = "";

  document.getElementById("station_list").style.display = "flex";
  document.getElementById("more_info_weather").style.display = "none";
  document.getElementById("more_info_bikes").style.display = "none";

  dyn.forEach(entry => {
  let element = document.createElement("button");
  element.className = "station";
  let content = `
  <div>s${entry.station_id}: ${entry.name}</div>
  <div>${entry.available_bikes}<i class="fa-solid fa-bicycle"></i>   ${entry.available_stands}<i class="fa-solid fa-square-parking"></i></div>
  `
  element.innerHTML = content;
  document.getElementById("station_list").appendChild(element);

  const test = stat.find(s => s.number === entry.station_id)
  element.onclick = ()=> displayDetailedBikes(entry, test)
})
}


// DETAILED BIKE INFORMATION DISPLAY
export function displayDetailedBikes(dynamic, station){

  document.getElementById("more_info_bikes").style.display = "block";
  document.getElementById("station_list").style.display = "none";
  document.getElementById("more_info_weather").style.display = "none";

  document.getElementById("bike_chart1").innerHTML = "";
  document.getElementById("bike_chart2").innerHTML = "";

  displayMoreInfo(dynamic, station)

    fetch(`/api/stations/${station.number}/history`)
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
  }).catch((error) => console.log("failed to fetch bike history data.", error))
}


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

// BIKE INFORMATION IN SIDE PANEL
function displayMoreInfo(dynamic, stat){

  document.getElementById("more_info_bikes").style.display = "block";
  
  document.getElementById("summary").innerHTML = `
  <div class="summary_info">
  <h3 class="title">Station ${stat.number}: ${stat.name}</h3>
  <p class="address">${stat.address}</p>
  <p class="status">${dynamic.status}</p>
  <p class="availability"> ${stat.bike_stands} Total Bike Stands</p>
  <p class="availability">${dynamic.available_bikes} Available Bikes <i class="fa-solid fa-bicycle"></i></p>
  <p class="availability">${dynamic.available_stands} Free Stands <i class="fa-solid fa-square-parking"></i></p>
  </div>
  <div id="pie"></div>
  `;

  drawPie(dynamic.available_bikes, dynamic.available_stands);
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
      'fill-color: #3450d0; fill-opacity: 0.8'
    ]);
    i++
  });

  const options = {
    backgroundColor: "white",
    hAxis: {
      title: "Time (Hour of Day)",
      format: "H",
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
    }
    };


    const chart = new google.visualization.ColumnChart(
      document.getElementById(div)
    );
    chart.draw(chartData, options);
  }

function drawPie(bikes, stands){
  const pieData = new google.visualization.arrayToDataTable([
    ["type","count"],
    ["available bikes", bikes],
    ["available stands", stands]
  ]);
  
  let options ={
    title: "Bike Availability",
    legend: {position: "bottom"},
    colors: ["#6080d6","#d98b50"],
    width:450,
    height:450
  };

  let chart = new google.visualization.PieChart(
    document.getElementById("pie")
  );
  chart.draw(pieData, options);
  }