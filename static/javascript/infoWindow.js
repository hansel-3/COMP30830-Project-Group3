import { myMap } from "./index.js";
import { displayDetailedBikes} from "./displayBikes.js";
import { infoWindow } from "./index.js";

/**
 * Opens InfoWindow popup containing live station information
 * 
 * Opens detailed station information via displayDetailedBikes()
 * @param {Object} dynamicData Live station information (bike/stand availability, station status)
 * @param {Object} staticData Static station information (station name, number)
 * @returns {void}
 */
export function displayInfoWindow(dynamicData, staticData){

  // define infoWindow content
  let content = `
        <div class="infw_div">
          <p class="infw_title">Station ${staticData.number}: ${staticData.name}</p>
          <div class="bike_summary">
              <p class="infw_status"> ${dynamicData.status}</p>
              <p class="infw_count">${dynamicData.available_bikes}<i class="fa-solid fa-bicycle"></i></p>
              <p class="infw_count">${dynamicData.available_stands}<i class="fa-solid fa-square-parking"></i></p>
          </div>
          <button class="more_info_btn">More Information</button> 
        </div>
      `;
  // add listener when infoWindow exists in DOM
  infoWindow.addListener("domready", () => {
        const btn = document.querySelector(".more_info_btn");
        if(btn) {
            btn.onclick = () => displayDetailedBikes(dynamicData, staticData);
        };
      });
  // set infoWindow properties
  infoWindow.setContent(content);
  infoWindow.setPosition({lat: staticData.lat, lng: staticData.lng});
  infoWindow.open(myMap);
}