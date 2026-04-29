
// open weather information side panel
export function displayCurrentWeather(){
  let icon_code;

  fetch("/api/external/weather/current")
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("temp").innerHTML = data.weather.temp.toFixed(1) + "&degC"; // display temperature in banner

    // find code for relevant weather icon
    const desc = data.weather.weather_desc.toLowerCase();
    if (desc.includes("clear sky")){
       icon_code = "01d";
    } else if (desc.includes("few clouds")){
      icon_code = "02d";
    } else if (desc.includes("scattered clouds")){
      icon_code = "03d";
    } else if (desc.includes("broken clouds")){
      icon_code = "04d";
    } else if (desc.includes("shower rain")){
      icon_code = "09d";
    } else if (desc.includes("rain") || desc.includes("drizzle")){
      icon_code = "10d";
    } else if (desc.includes("thunderstorm")){
      icon_code = "11d";
    } else if (desc.includes("snow")){
      icon_code = "13d";
    } else {
      icon_code = "50d";
    }

    const url = `https://openweathermap.org/img/wn/${icon_code}@2x.png`;
    document.getElementById("icon").src = url;     // display weather icon in banner

    document.getElementById("weather_desc").innerHTML = data.weather.weather_desc; // display weather description in banner

  }).catch((error) => console.log("Failed to fetch weather data.", error));
};

// add functionality to "view wether" button
document.getElementById("weather_btn").addEventListener("click", ()=> {

  const div = document.getElementById("weather_info_container");
  div.style.display = "flex"; 
  setTimeout(() => {
    div.scrollTop = 0; // set scroll position to the top after opening div
  }, 20);

  // close other side panels
  document.getElementById("bike_info_container").style.display = "none";
  document.getElementById("station_list_container").style.display = "none";
  document.getElementById("prediction_container").style.display = "none";
  
// fetch weather history for charts
fetch("/api/weather/history")
.then((response) => response.json())
.then((data) => {
  
  const temp = [];
  data.forEach((entry) => temp.push(entry.temp));

  const humidity = [];
  data.forEach((entry) => humidity.push(entry.humidity));

  const w_speed = [];
  data.forEach((entry) => w_speed.push(entry.wind_speed));

  drawWeatherChart("Temperature (\u00B0C)", data, temp, "weather_chart1");
  drawWeatherChart("Humidity (%)", data, humidity, "weather_chart2");
  drawWeatherChart("Wind Speed (m/s)", data, w_speed, "weather_chart3");
});
});

// get current time
const now = new Date();
const hours = now.getHours();
const minutes = now.getMinutes();
document.getElementById("show_time").innerHTML = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");


// fetch for current tempertaure and weather description
fetch("/api/external/weather/current")
.then((response) => response.json())
.then((data) => {
  
  document.getElementById("show_place").innerHTML = `<i class="fa-solid fa-location-arrow"></i> ` + data.weather.location_name;
  document.getElementById("show_temp").innerHTML = data.weather.temp.toFixed(1) + "&degC";
  document.getElementById("show_desc").innerHTML = data.weather.weather_desc;
  
}).catch((error) => console.log("Failed to fetch current weather data.", error));

// fetch for extra weather information
fetch("/api/external/weather/current")
.then((response) => response.json())
.then((data) => {

  document.getElementById("weather_d").innerHTML = data.weather.weather_main;
  document.getElementById("feels_like").innerHTML = data.weather.feels_like.toFixed(1) + "&degC";
  document.getElementById("humidity").innerHTML = data.weather.humidity + "%";
  document.getElementById("pressure").innerHTML = data.weather.pressure + " hPa";
  document.getElementById("wind_deg").innerHTML = data.weather.wind_deg + "&deg";
  document.getElementById("wind_speed").innerHTML = data.weather.wind_speed + " m/s";
}).catch((error) => console.log("Failed to fetch weather data", error));

// function to draw charts
function drawWeatherChart(feature, data, values, div){ 
  const chartData = new google.visualization.DataTable();

  chartData.addColumn("date", "Day");
  chartData.addColumn("number", feature);

  data.forEach((entry, i) => {
    let date = new Date(entry.day_block.replace(" ", "T"));
    chartData.addRow([
      date,
      Number(values[i]), 
    ]);
  });
  
  const option = {
    hAxis: {
      title: "Day",
      format: "MMM d ",
      gridlines: {color:"transparent"},
      slantedText: true,
      slantedTextAngle: 30
    },
    vAxis: {
      title: feature,
      gridlines: {color:"transparent"},
      minValue: 0
    },
    height:400,
    legend: {position:"none"},
    backgroundColor: "transparent",
    curveType: "function",
    colors: ["#f9bf55"]
  };

  const chart = new google.visualization.LineChart(
    document.getElementById(div)
  );
  chart.draw(chartData, option);
};

