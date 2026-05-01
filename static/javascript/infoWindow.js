import { myMap } from "./index.js";
import { displayDetailedBikes} from "./displayBikes.js";

// define infoWindow variable
const infoWindow = new google.maps.InfoWindow();

/**
 * Displays InfoWindow popup
 * 
 *    Sets content for infoWindow 
 *    Calls displayDetailedBikes() to display station information board side panel
 * 
 * @param {Object} currentData Live information for selected station
 * @param {Object} staticData Static information for selected station
 */
export function displayInfoWindow(currentData, staticData){
  // define content for infoWindow
  const content = `
        <div class="infw_div">
          <p class="infw_title">Station ${staticData.number}: ${staticData.name}</p>
          <div class="bike_summary">
              <p class="infw_status"> ${currentData.status}</p>
              <p class="infw_count">${currentData.available_bikes}<i class="fa-solid fa-bicycle"></i></p>
              <p class="infw_count">${currentData.available_stands}<i class="fa-solid fa-square-parking"></i></p>
          </div>
          <button class="more_info_btn">More Information</button> 
        </div>
      `;

  // wait for button to exist in DOM before applying its onclick function - opens detailed station information
  infoWindow.addListener("domready", () => {
        const button = document.querySelector(".more_info_btn");
        if(button) {
            button.onclick = () => displayDetailedBikes(currentData, staticData);
        };
      });
  // set content and position of infoWindow
  infoWindow.setContent(content);
  infoWindow.setPosition({lat: staticData.lat, lng: staticData.lng});
  infoWindow.open(myMap);
}