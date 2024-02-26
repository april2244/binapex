const ctx = document.getElementById("priceChart").getContext("2d");
const priceChart = new Chart(ctx, {
  type: "line",
  data: {
    datasets: [
      {
        label: "Price",
        data: [],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "second",
        },
        display: true,
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Price",
        },
      },
    },
  },
});
let alertprice=null;
let prevPrice = null; // Variable to store the previous price
let prevColor = "#070707";
let color= null;

async function fetchDataAndPlot() {
  try {
    // Fetch JSON data
    const response = await fetch(
      "https://api.binance.com/api/v3/ticker/price?symbol=MOBUSDT"
    );
    // Check if response is successful
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    // Parse response as JSON
    const data = await response.json();
    const price = parseFloat(data["price"]);
    color = prevColor; // Use previous color by default
     // Variable to store the previous color
 
    if (prevPrice !== null) {
      color =
        price > prevPrice
          ? "#00ff00"
          : price < prevPrice
          ? "#ff0000"
          : prevColor; 
         // Green for increase, red for decrease, previous color if equal
    }
    prevPrice = price;
    prevColor = color; // Update prevColor for the next iteration

    document.getElementById("demo").innerHTML = price;
    document.getElementById("price").style.backgroundColor = color;
    if (document.getElementById("playSoundCheckbox").checked && prevPrice > 1.001*alertprice) {
      // Play the alert sound if the checkbox is checked and conditions are met
      document.getElementById("alertSound").play();
    }
    if (document.getElementById("playSoundCheckbox").checked && prevPrice < 0.999*alertprice) {
      // Play the alert sound if the checkbox is checked and conditions are met
      document.getElementById("alertSound2").play();
    }
    // Log the price
    console.log(data);
    // Update the chart

    const now = new Date();
    const maxDataPoints = 100;
    if (priceChart.data.datasets[0].data.length > maxDataPoints) {
      priceChart.data.datasets[0].data.shift(); // Remove the oldest data point
    }
    priceChart.data.datasets[0].data.push({ x: now, y: price });

    priceChart.update();
  } catch (error) {
    console.error("There was a problem fetching the data:", error);
  }
}

setInterval(fetchDataAndPlot, 1000); // Update chart every second
fetchDataAndPlot(); // Initial call to fetch data and plot
document.getElementById("playSoundCheckbox").addEventListener("change", function() {
  const alertSound = document.getElementById("alertSound");
  const alertSound2 = document.getElementById("alertSound2");

  if (this.checked) {
    // Stop and reset the audio if the checkbox is unchecked
    alertSound.play();
    alertSound2.play();
    alertSound.currentTime = 0;
        alertSound.currentTime = 0;

    alertprice=prevPrice;
    document.getElementById("alertprice").innerHTML=alertprice;
  }
});