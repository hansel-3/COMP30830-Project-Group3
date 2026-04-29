import { my_map } from "./index.js";
import { displayDetailedBikes} from "./display_bikes.js";

const infoWindow = new google.maps.InfoWindow();

// function to display infoWindow
export function displayInfw(dyn, station){

  let content = `
        <div class="infw_div">
          <p class="infw_title">Station ${station.number}: ${station.name}</p>
          <div class="bike_summary">
              <p class="infw_status"> ${dyn.status}</p>
              <p class="infw_count">${dyn.available_bikes}<i class="fa-solid fa-bicycle"></i></p>
              <p class="infw_count">${dyn.available_stands}<i class="fa-solid fa-square-parking"></i></p>
          </div>
          <button class="more_info_btn">More Information</button> 
        </div>
      `;
  infoWindow.addListener("domready", () => {
        const btn = document.querySelector(".more_info_btn");
        if(btn) {
            btn.onclick = () => displayDetailedBikes(dyn, station);
        };
      });
  infoWindow.setContent(content);
  infoWindow.setPosition({lat: station.lat, lng: station.lng});
  infoWindow.open(my_map);
}