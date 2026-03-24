
var map;
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
  fetch("/stations")
  .then(( response)=> {
    return response.json()})
    .then((data) => {
      console.log("fetch response", typeof data
      );
      addMarkers(data);
    })
    .catch((error) => {
      console.error("Error fetching stations", error);
    });
  }

  function addMarkers(stations){
    console.log(stations);
    for (const station of stations){
      var marker = new google.maps.Marker({
        position: {
          lat: stations.position_lat,
          lng: stations.position_lng,
        },
        map: map,
        title: station.name,
        station_number: station.number,

      })
    }
  }


window.initMap = initMap