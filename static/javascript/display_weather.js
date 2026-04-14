
//DISPLAY WEATHER INFORMATION
export function displayCurrentWeather(){
  let icon_code;

  fetch("/api/external/weather/current")
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("temp").innerHTML = data.weather.temp.toFixed(1) + "&degC";

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

    const url = `https://openweathermap.org/img/wn/${icon_code}@2x.png`
    document.getElementById("icon").src = url;

    document.getElementById("weather_desc").innerHTML = data.weather.weather_desc
  })
  .catch((error) => console.log("Failed to fetch weather data", error))
}


// ADD FUNCTIONALITY TO "VIEW WEATHER" BUTTON - DISPLAY MORE DETAILED INFORMATION
document.getElementById("weather_btn").addEventListener("click", ()=> {

  document.getElementById("more_info_bikes").style.display = "none";
  document.getElementById("station_list").style.display = "none";
  document.getElementById("more_info_weather").style.display = "flex";

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
})

})

// GET CURRENT TIME
const now = new Date();
const hours = now.getHours();
const minutes = now.getMinutes();
document.getElementById("show_time").innerHTML = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");


// GET CURRENT TEMPERATURE & WEATHER DESCRIPTION 
fetch("/api/external/weather/current")
.then((response) => response.json())
.then((data) => {
  
  document.getElementById("show_place").innerHTML = `<i class="fa-solid fa-location-arrow"></i> ` + data.weather.location_name;
  document.getElementById("show_temp").innerHTML = data.weather.temp.toFixed(1) + "&degC";
  document.getElementById("show_desc").innerHTML = data.weather.weather_desc;
  
}).catch((error) => console.log("Failed to fetch current weather data.", error))

// GET EXTRA WEATHER INFORMATION
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


function drawWeatherChart(feature, data, values, div){ 
  const chartData = new google.visualization.DataTable();

  chartData.addColumn("date", "Day")
  chartData.addColumn("number", feature)

  let i =0;
  data.forEach(entry => {
    let dateFixed = new Date(entry.day_block.replace(" ", "T"));
    chartData.addRow([
      dateFixed,
      Number(values[i]), 
    ])
    i++
  });

  const option = {
    hAxis: {
      title: "Day",
      format: "MMM d",
      gridlines: {color:"transparent"}
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
    colors: ["#f4d294"]
   
  };

  const chart = new google.visualization.LineChart(
    document.getElementById(div)
  )

  chart.draw(chartData, option)
}

