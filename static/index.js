var my_map;

function initMap() {
  console.log("initMap function called.")

  const dublin = {lat: 53.3498, lng: -6.2603}
  console.log("Dublin coordinates set")

  const mapElement = document.getElementById("map");
  if (!mapElement){
    console.error("Element with ID 'map' not found in the DOM");
    return;
  }
  console.log("Map element found")

  try {
    my_map = new google.maps.Map(mapElement, {
      zoom: 11,
      center: dublin
    });
    console.log("Map instance created successfully");
  } catch (error){
    console.error("Error when creating map instance", error);
    return;
  }

  const marker = new google.maps.Marker({
  position: dublin,
  map: my_map,
  })

  getStations();
}

function getStations() {
  fetch("/api/stations")
  .then((response)=> {
    return response.json()})
    .then((data) => {
      console.log("fetch response", typeof data
      );
      addMarkers(data);
    })
    .catch((error) => {
      console.error("Error fetching stations: ", error);
    });
  }

google.charts.load("current", { packages: ["corechart"]});

function addMarkers(stations){
  console.log(stations);

  for (const station of stations){
    var marker = new google.maps.Marker({
      position: {
        lat: station.lat, //*** check if stations.position_lat/lng ***
        lng: station.lng,
      },
      map: my_map,
      title: station.name,
      station_number: station.number,
    });

    const infoWindow = new google.maps.InfoWindow();

    marker.addListener("click", ()=> {
      const content = `
      <div>
      <h3>${station.name}</h3>
      <p><strong>Address:</strong>${station.address || "N/A"}</p>
      <p><strong>Available Bike Stands:</strong>${station.bike_stands || "N/A"}</p>
      <div id="chart_div_${station.number}" style="width: 300px; height: 200px;"></div>
     </div>
     `
     infoWindow.setContent(content);
     infoWindow.open(my_map, marker);

     fetch(`/api/stations/${station.number}/history`)
     .then((response) => response.json())
     .then((data) => {
      google.charts.setOnLoadCallback(() => drawChart(data, station.number));
    }).catch((error) => {
      console.error(`Error fetching data for station ${station.number}:`, error);
    });
  });
  }}

function drawChart(data, stationID){
  const chartData = new google.visualization.DataTable();

  chartData.addColumn("datetime", "Time");
  chartData.addColumn("number", "Available Bikes");
  chartData.addColumn("number", "Free Stands");

  data.forEach((entry) => {
    chartData.addRow([
      new Date(entry.last_update),
      entry.available_bikes,
      entry.available_bike_stands,
    ]);
  });

  const options = {
    title: `Available Bikes at Station ${stationID}`,
    hAxis: {
      title: "Time",
      format: "HH:mm",
    },
    vAxis: {
      title: "Available Bikes",
    },
    curveType: "function",
    legend: { position: "bottom" },
    width: 400,
    height: 250,
    };

    const chart = new google.visualization.LineChart(
      document.getElementById(`chart_div_${stationID}`)
    );

    chart.draw(chartData, options);
  }

  window.initMap = initMap;
