
/**
 * Changes date format to be more user friendly
 * 
 * @param {Date} date Date to be changed
 * @returns {string} User-friendly version of date input
 */
function changeDateFormat(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  /**
   * Computes valid dates and times for user input
   * 
   * @returns {{lowerLimit: Date, upperLimit: Date, currentDate: Date, upperDateLimit:Date}} Lower and upper limits for valid dates/times
   */
function validDateAndTime(){
  // get current date and date five days ahead
  let currentDate = new Date();
  let upperDateLimit = new Date(currentDate);
  upperDateLimit.setDate(upperDateLimit.getDate() + 5);

  // round current time to next hour
  let lowerLimit = new Date(currentDate);
  lowerLimit.setHours(lowerLimit.getHours() + 1, 0, 0, 0);

  // find time five days from now and reset minutes to 0
  let upperLimit = new Date(currentDate);
  upperLimit.setDate(upperLimit.getDate() + 5);
  upperLimit.setMinutes(0, 0, 0);

  return {
    lowerLimit,
    upperLimit,
    currentDate,
    upperDateLimit
  }
}

/**
 * Opens prediction side panel to reveal prediction form
 * 
 *    Displays valid date and time inputs a user may enter
 *    Calls validateSubmission() to ensure requirements are met
 *    
 * @param {Object} station Static information for selected station
 */
export function displayPredictionDetails(station){
  // open prediction side panel
  document.getElementById("prediction_container").style.display = "flex";

  // close other side panels
  document.getElementById("weather_info_container").style.display = "none";
  document.getElementById("bike_info_container").style.display = "none";
  document.getElementById("station_list_container").style.display = "none";
  document.getElementById("prediction_result_div").style.display = "none";

  // hide error message
  document.getElementById("error").style.display = "none";
     
  // clear input values
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
 
  // display station name and address
  document.querySelector(".prediction_title").innerHTML = `Station ${station.number}: ${station.name}`;
  document.getElementById("prediction_address").innerHTML = station.address;

  // find valid dates and times
  let dateTimeLimits = validDateAndTime();

  // display valid dates to user
  document.getElementById("base").innerHTML = changeDateFormat(dateTimeLimits.currentDate);
  document.querySelectorAll(".limit").forEach(elem => elem.innerHTML = changeDateFormat(dateTimeLimits.upperDateLimit));

   // prefix hours with 0 if single digit
  let lowerLimitHours = dateTimeLimits.lowerLimit.getHours().toString().padStart(2, "0");
  let upperLimitHours = dateTimeLimits.upperLimit.getHours().toString().padStart(2, "0");

  // show valid times to user
  document.getElementById("valid_time_base").innerHTML = `${lowerLimitHours}:00`;
  document.getElementById("valid_time_limit").innerHTML = `${upperLimitHours}:00`;

  // validate submission
  document.getElementById("prediction_form").onsubmit = (e) => validateSubmission(e, station.number);
};


/**
 * Ensures user input satisfies valid dates and times
 * 
 * @param {Event} e Form submission event 
 * @param {number} stationNumber Station ID number for selected station 
 */
function validateSubmission(e, stationNumber){
  e.preventDefault(); // prevent page refresh on submission
  
  // collect user inputs
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value + ":00";

  // convert user input to date object
  let userInput = new Date(`${date} ${time}`);

  // capture upper and lower limits from validDateAndTime()
  const lowerLimit = validDateAndTime().lowerLimit;
  const upperLimit = validDateAndTime().upperLimit;

  // check if user input lies between the limits
  if (!(lowerLimit <= userInput && userInput <= upperLimit)){
    document.getElementById("error").innerHTML = "&#10071; Invalid date or time entry. Please check requirements (*).";
    document.getElementById("error").style.display = "block";
    document.getElementById("prediction_result_div").style.display = "none";
    return;
  } 
  predictAvailability(date, time, stationNumber);
}

/**
 * Predicts bike availability based on prediction model
 * 
 *    Fetches /predict API endpoint in backend
 * 
 * @param {string} date 
 * @param {string} time 
 * @param {number} stationNumber 
 */
function predictAvailability(date, time, stationNumber){
  fetch(`/predict?date=${date}&time=${time}&station_id=${stationNumber}`)
    .then((response) => response.json())
    .then((data) => {
      
      // ensure correct grammar for text displayed
      let bikeGrammar;
      let verbGrammar;
      
      if (data.predicted_available_bikes == 1){
        bikeGrammar = "bike";
        verbGrammar = "is";
      } else {
        bikeGrammar = "bikes";
        verbGrammar = "are";
      }

      document.getElementById("prediction_result_div").innerHTML = 
      `<p class="prediction_result">${data.predicted_available_bikes}</p>
      <p class="prediction_result_text">${bikeGrammar} ${verbGrammar} predicted to be available for your selected time.</p>
      `;
      document.getElementById("error").style.display = "none";
      document.getElementById("prediction_result_div").style.display = "flex";

    }).catch((error) => console.log("Something went wrong: ", error));
};



