
/**
 * Draws bike/parking space availability graphs based on historic data
 * 
 * @param {Array<Date>} xData Historic dates for x-axis
 * @param {Array<number>} yData Historic bike/stands availability data for y-axis
 * @param {string} yTitle Descriptive title for y-axis 
 * @param {string} divID ID of target div HTML element
 * @returns {void}
 */
export function drawBikeChart(xData, yData, yTitle, divID){
  // create data table to store values
  const chartData = new google.visualization.DataTable();

  // add columns to data table - one for each axis
  chartData.addColumn("datetime", "Time (Hour of Day)");
  chartData.addColumn("number", yTitle);

  //ensure x-axis and y-axis have same number of elements
  if (xData.length === yData.length){
    for(let i = 0; i < xData.length; i++){
      // add row to data table for each x-y pair
      chartData.addRow([
        xData[i],
        yData[i]
      ])}
    } else {
      console.error(`Mismatch in X-data and Y-data count. Chart cannot be drawn: 
        X-data count = ${xData.length}; Y-data count = ${yData.length}.`
      )
      return;
    }
  // define properties of graph
  const options = {
    backgroundColor: "white",
    hAxis: {
      title: "Time (Hour of Day)",
      format: "HH a",
      gridlines: {color:"transparent"}
    },
    vAxis: {
      title: yTitle,
      textPosition: "out",
      textStyle: { fontSize: 10, color: "black" },
      minValue: 0,
    },
    legend: { position: "none" },
    height: 400,
    chartArea: {
      top: 20,
      bottom:100,
      width: 300
    },
    curveType:"function",
    colors: ["#4a8af2"],
    };

    // draw as line chart
    const chart = new google.visualization.LineChart(
      document.getElementById(divID)
    );
    chart.draw(chartData, options);
  };


/**
 * Draws pie chart showing ratio between available bikes and parking spaces
 * 
 * @param {number} bikes Number of avaialable bikes
 * @param {number} stands Number of available parking spaces
 * @param {string} divID ID of target div HTML element
 * @returns {void}
 */
export function drawPieChart(bikes, stands, divID){
  // create data table to store values
  const pieData = new google.visualization.arrayToDataTable([
    ["type", "count"],
    ["available bikes", bikes],
    ["parking spaces", stands]
  ]);

  // define properties of chart
  const options = {
    legend: {position: "bottom"},
    colors: ["#4a8af2","#acc8f4"],
    width: 380,
    height:380,
    chartArea: {
      top: 30,
    }
  };

  // draw as pie chart
  const chart = new google.visualization.PieChart(
    document.getElementById(divID)
  );
  chart.draw(pieData, options);
};

/**
 * Draws historic weather data for specified weather feature (temperature/ humidity/ wind speed)
 * 
 * @param {Array<Date>} xData Historic dates for x-axis
 * @param {Array<number>} yData Historic temperature/ humidity/ wind speed data for y-axis
 * @param {string} yTitle Descriptive title for y-axis 
 * @param {string} divID ID of target div HTML element
 * @returns {void}
 */
export function drawWeatherChart(xData, yData, yTitle, divID){ 
  // create data table to store values
  const chartData = new google.visualization.DataTable();

  // add columns to data table - one for each axis
  chartData.addColumn("date", "Day");
  chartData.addColumn("number", yTitle);

  //ensure x-axis and y-axis have same number of elements
  if (xData.length === yData.length){
    for (let i = 0; i < xData.length; i++){
      // add row to data table for each x-y pair
      chartData.addRow([
        xData[i],
        yData[i]
      ]);
    }
  }else {
    console.error(`Mismatch in X-data and Y-data count. Chart cannot be drawn: 
      X-data count = ${xData.length}; Y-data count = ${yData.length}.`)
      return;
  }
  // define properties of graph
  const options = {
    hAxis: {
      title: "Day",
      format: "MMM d",
      gridlines: {color:"transparent"},
      slantedText: true,
      slantedTextAngle: 30
    },
    vAxis: {
      title: yTitle,
      gridlines: {color:"transparent"},
      minValue: 0
    },
    height:400,
    legend: {position:"none"},
    backgroundColor: "transparent",
    curveType: "function",
    colors: ["#f9bf55"]
  };

  // draw as line chart
  const chart = new google.visualization.LineChart(
    document.getElementById(divID)
  );
  chart.draw(chartData, options);
};