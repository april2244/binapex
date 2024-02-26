let chartData = [];
let chart = null; // Declare chart variable outside the function
let lastCloseValue = null;
let prevCloseValue = null;
let interval="1m";
function changeColor(selectedLabel) {
  var labels = document.querySelectorAll('.label'); // Get all label elements
  labels.forEach(label => label.classList.remove('selected')); // Remove 'selected' class from all labels
  selectedLabel.classList.add('selected'); // Add 'selected' class to the selected label

  // Get the value of the selected label
  interval = selectedLabel.textContent;
  console.log(interval);
  // Call the desired function in another script with the selected value as an argument
  fetchDataAndUpdateChart(interval);
}
async function fetchDataAndUpdateChart(interval) {
  if (!chart) {
    return; // Exit function if chart is not initialized yet
  }


  const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=MOBUSDT&interval=${interval}&limit=100`);
  const data = await response.json();
  lastCloseValue = parseFloat(data[data.length - 1][4]);

  // Format the new data point
  const newDataPoint = data.map(item => ({
    x: new Date(item[0]),
    y: [parseFloat(item[1]), parseFloat(item[2]), parseFloat(item[3]), parseFloat(item[4])]
  }));

  // Add the new data point to the chartData array
  chartData.push(...newDataPoint);

  // Limit the number of data points to maxDataPoints
  const maxDataPoints = 100;
  if (chartData.length > maxDataPoints) {
    chartData.splice(0, chartData.length - maxDataPoints); // Remove the oldest data points
  }

  // Update the chart with the new data
  chart.updateSeries([{
    data: chartData
  }]);

  // Remove previous horizontal line annotation if it exists
  if (!chart.options.annotations || !chart.options.annotations.yaxis) {
    chart.options.annotations = {
      yaxis: []
    };
  } else if (chart.options.annotations.yaxis.length > 0) {
    chart.options.annotations.yaxis.pop();
  }

  // Add new horizontal line annotation for last close value
  chart.options.annotations.yaxis.push({
    y: lastCloseValue,
    borderColor: '#033FAF',
    label: {
      borderColor: '#0682F5',
      position: 'center',
      
      style: {
        color: '#fff',
        background: '#0F87F7',
        textAlign: 'center', // Align text to the left

        
      },
      text: 'Last Close: ' + lastCloseValue.toFixed(4)
    }
  });

  // Update the chart with the new annotations
  chart.updateOptions({
    annotations: chart.options.annotations
  });

  // Update the previous close value
  prevCloseValue = lastCloseValue;
}

// Initialize the chart and return a promise
async function initializeChart() {
  await fetchDataAndUpdateChart(); // Fetch initial data

  return new Promise((resolve, reject) => {
    chart = new ApexCharts(document.getElementById("chart"), {
      chart: {
        type: 'candlestick',
        height: 350,
        background:'#F9F9FA' ,
      },
      series: [{
        data: chartData
      }],
      xaxis: {
        type: 'datetime'
      },
      yaxis: {
        opposite: true // Display y-axis values on the right side
      },
      annotations: {
        yaxis: [] // Initialize empty array for annotations
      }
    });
    chart.render();
    resolve(); // Resolve the promise once the chart is initialized
  });
}

// Call initializeChart and then start fetching and updating data
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the chart upon page load
  initializeChart().then(() => {
    // Fetch and update chart data every second with the default interval
    setInterval(() => fetchDataAndUpdateChart(interval), 2000);
  }).catch(error => {
    console.error("Error initializing chart:", error);
  });
});
