
export function setup_predict(station){

  // open/close relavant divs
  document.getElementById("prediction_container").style.display = "flex";
  document.getElementById("weather_info_container").style.display = "none";
  document.getElementById("bike_info_container").style.display = "none";
  document.getElementById("station_list_container").style.display = "none";
  document.getElementById("prediction_result_div").style.display = "none";
  document.getElementById("error").style.display = "none";
     
  // clear input values
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
 
  // display station name and address
  const titles = document.querySelectorAll(".title");
  titles.forEach(title => {
    title.innerHTML = `Station ${station.number}: ${station.name}`;
  });
  document.getElementById("pdct_div_add").innerHTML = station.address;

  // get date for today and 5 days from now
  let base = new Date();
  let limit = new Date();
  limit.setDate(limit.getDate() + 5);

  // round time to hour
  let now = new Date();

  if (now.getMinutes() >= 0){
      now.setHours(now.getHours() + 1);
    }
  now.setMinutes(0, 0, 0);
  const base1 = now;

  // add 0 if hour is single digit
  let base1_hours = base1.getHours().toString().padStart(2, "0");
  let limit1_hours = base.getHours().toString().padStart(2, "0");
  
  // change format of date to be user friendly 
  document.getElementById("base").innerHTML = changeFormat(base);
  document.querySelectorAll(".limit").forEach(elem => {
    elem.innerHTML = changeFormat(limit);
  });

  // show valid dates and times to user
  document.getElementById("valid_time_base").innerHTML = `${base1_hours}:00`;
  document.getElementById("valid_time_limit").innerHTML = `${limit1_hours}:00`;

  // update dates and time on submission of form
  document.getElementById("prediction_form").onsubmit = (e) => {
    e.preventDefault();
    
    // collect user's inputs
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value + ":00";

    // convert user input to date object
    let date_inputed = new Date(`${date} ${time}`);
 
    // round times to hour
    now = new Date();

    if (now.getMinutes() >= 0){
      now.setHours(now.getHours() + 1);
    }
    now.setMinutes(0, 0, 0)
    const base2 = now;
    let base2_hours = base2.getHours().toString().padStart(2, "0");

    let limit2 = new Date();
    limit2.setDate(base2.getDate() + 5);

    if (limit2.getMinutes() > 0){
      limit2.setMinutes(0, 0, 0);
    }
    let limit2_hours = limit2.getHours().toString().padStart(2, "0");

    // display valid times to user
    document.getElementById("valid_time_base").innerHTML = `${base2_hours}:00`;
    document.getElementById("valid_time_limit").innerHTML = `${limit2_hours}:00`;


    // check if user's input satisfies valid dates and times
    if (!(base2 <= date_inputed && date_inputed <= limit2)){

      document.getElementById("error").innerHTML = "&#10071; Invalid date or time entry. Please check requirements (*).";
      document.getElementById("error").style.display = "block";
      document.getElementById("prediction_result_div").style.display = "none";
      return;
    } 
    predict(date, time, station);
  }
};

// change date format function
function changeFormat(date) {

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

// fetch prediction api
function predict(d, t, station){
  
  fetch(`/predict?date=${d}&time=${t}&station_id=${station.number}`)
    .then((response) => response.json())
    .then((data) => {
      
      let grammar1;
      let grammar2;
      
      if (data.predicted_available_bikes == 1){
        grammar1 = "bike";
        grammar2 = "is";
      } else {
        grammar1 = "bikes";
        grammar2 = "are";
      }

      document.getElementById("prediction_result_div").innerHTML = 
      `<p class="prediction_result">${data.predicted_available_bikes}</p>
      <p class="prediction_result_text">${grammar1} ${grammar2} predicted to be available for your selected time.</p>
      `;

      document.getElementById("error").style.display = "none";
      document.getElementById("prediction_result_div").style.display = "flex";

    }).catch((error) => console.log("Something went wrong. ", error));
};



