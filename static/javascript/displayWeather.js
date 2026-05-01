import { drawWeatherChart } from "./drawCharts.js";

/**
 * Displays live weather information in top banner of webpage
 * 
 * Fetches current weather information from backend API
 * Displays live information and corresponding weather icon in the banner
 */
export function displayCurrentWeather(){
  fetch("/api/external/weather/current")
  .then((response) => response.json())
  .then((data) => {

    let iconCode;
    // find code for relevant weather icon
    const desc = data.weather.weather_desc.toLowerCase();
    if (desc.includes("clear sky")){
      iconCode = "01d";
    } else if (desc.includes("few clouds")){
      iconCode = "02d";
    } else if (desc.includes("scattered clouds")){
      iconCode = "03d";
    } else if (desc.includes("broken clouds")){
      iconCode = "04d";
    } else if (desc.includes("shower rain")){
      iconCode = "09d";
    } else if (desc.includes("rain") || desc.includes("drizzle")){
      iconCode = "10d";
    } else if (desc.includes("thunderstorm")){
      iconCode = "11d";
    } else if (desc.includes("snow")){
      iconCode = "13d";
    } else {
      iconCode = "50d";
    }

    const url = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // openweather url for weather icon image
    document.getElementById("temp").innerHTML = data.weather.temp.toFixed(1) + "&degC"; // display temperature in banner
    document.getElementById("icon").src = url;     // display weather icon in banner
    document.getElementById("weather_desc").innerHTML = data.weather.weather_desc; // display weather description in banner

  }).catch((error) => console.log("Failed to fetch weather data.", error));
};

/**
 * Displays detailed weather side panel featuring live and historic information
 * 
 * Displays live time and weather details
 * Displays historical weather charts (temperature, humidity, wind speed)
 * 
 * @param {Object} current Current weather information (temperature, location, weather description, humidity, pressure, wind)
 * @param {Array<Object>} historic  Historical daily weather information for charts
 */
export function displayDetailedWeather(current, historic){
  // open weather side panel 
  const div = document.getElementById("weather_info_container");
  div.style.display = "flex"; 
  setTimeout(() => {
    div.scrollTop = 0; // set scroll position to the top after opening div
  }, 20);

  // close other side panels
  document.getElementById("bike_info_container").style.display = "none";
  document.getElementById("station_list_container").style.display = "none";
  document.getElementById("prediction_container").style.display = "none";

  // display live time
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  document.getElementById("show_time").innerHTML = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");
  
  // display live weather details in main weather box
  document.getElementById("show_place").innerHTML = `<i class="fa-solid fa-location-arrow"></i> ` + current.location_name;
  document.getElementById("show_temp").innerHTML = current.temp.toFixed(1) + "&degC";
  document.getElementById("show_desc").innerHTML = current.weather_desc;

  // display further live weather details in sub boxes
  document.getElementById("weather_d").innerHTML = current.weather_main;
  document.getElementById("feels_like").innerHTML = current.feels_like.toFixed(1) + "&degC";
  document.getElementById("humidity").innerHTML = current.humidity + "%";
  document.getElementById("pressure").innerHTML = current.pressure + " hPa";
  document.getElementById("wind_deg").innerHTML = current.wind_deg + "&deg";
  document.getElementById("wind_speed").innerHTML = current.wind_speed + " m/s";
  
  // collect dates(x-axis) and historic temperature, humidity and wind speed data(y-axis) for charts
  const xAxis = [], yAxisTemp = [], yAxisHumidity = [], yAxisWindSpeed = [];

  historic.forEach(entry => {
    const date = new Date(entry.day_block.replace(" ", "T"));

     xAxis.push(date);
     yAxisTemp.push(Number(entry.temp));
     yAxisHumidity.push(Number(entry.humidity));
     yAxisWindSpeed.push(Number(entry.wind_speed));
  })

  // draw historic weather charts
  drawWeatherChart(xAxis, yAxisTemp, "Temperature (\u00B0C)", "weather_chart1");
  drawWeatherChart(xAxis, yAxisHumidity, "Humidity (%)", "weather_chart2");
  drawWeatherChart(xAxis, yAxisWindSpeed, "Wind Speed (m/s)", "weather_chart3");
}