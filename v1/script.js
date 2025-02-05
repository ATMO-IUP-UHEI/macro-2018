import * as zarr from "https://cdn.jsdelivr.net/npm/zarrita@next/+esm";

let playInterval;
let isPlaying = false;
let currentVariable = "CO2_ANT";
let currentDomain = "1";
let currentIndex = 0;
let speed = 500;
let arr, times, timesArray;

// Fetch and open the zarr array for the selected variable and domain
async function fetchVariableData(variable, domain, time) {
  let store
  if (domain === "2" && time > 90) {
    store = new zarr.FetchStore(`https://swift.dkrz.de/v1/dkrz_cf06e856-7ed9-4f16-9ffb-3c5526e68a9c/MACRO-2018/v1/wrfout_d0${domain}_2018_from_04.zarr/${variable}/`);
  } else {
    store = new zarr.FetchStore(`https://swift.dkrz.de/v1/dkrz_cf06e856-7ed9-4f16-9ffb-3c5526e68a9c/MACRO-2018/v1/wrfout_d0${domain}_2018.zarr/${variable}/`);
  }
  return await zarr.open(store, { kind: "array" });
}

// Update the variable and plot data
async function updatePlot() {
  currentVariable = document.getElementById('variableDropdown').value;
  currentDomain = document.getElementById('domainDropdown').value;
  arr = await fetchVariableData(currentVariable, currentDomain, currentIndex);
  plotData(arr, currentIndex, parseInt(document.getElementById('zslider').value));
}

// Reshape the zarr data to a 2D array
function reshapeTo2D(zarritaData) {
  const { data, shape } = zarritaData;
  const [rows, cols] = shape;
  let array2D = [];

  for (let i = 0; i < rows; i++) {
    array2D.push(Array.from(data.subarray(i * cols, (i + 1) * cols)));
  }

  return array2D;
}

// Plot the data for the given time and z index
async function plotData(arr, time, z) {
  try {
    // Check if time divisible by 12 (half day) and preload next 24 hours in background
    try {
      if (time % 12 === 0 && (time / 12) % 2 !== 0) {
        // preload next 24 hours in background
        zarr.get(arr, [time+24, z, null, null]);
      }
    } catch (error) {
      // ignore error
    }
    const view = await zarr.get(arr, [time, z, null, null]);
    const timeValue = timesArray[time];
    if (!view || !view.data || view.data.length === 0) {
      throw new Error("Empty data");
    }

    const array2D = reshapeTo2D(view);
    const update = { z: [array2D] };
    const layoutUpdate = { title: { text: `${currentVariable} at ${timeValue}`, y: 0.9 } };
    const colorbarTitle = currentVariable === "CO_ANT" ? "CO concentration [ppm]" : "CO₂ concentration [ppm]";
    update.colorbar = { title: { text: colorbarTitle, side: 'right' } };
    Plotly.restyle('myDiv', update);
    Plotly.relayout('myDiv', layoutUpdate);
  } catch (error) {
    if (error.message.includes("index out of bounds")) {
      fetchVariableData(currentVariable, currentDomain, time);
    }
    else {
      console.error("Error plotting data:", error);
    }
  }
}

// Initialize the plot with empty data
function initializePlot() {
  const initialData = [
    {
      z: [[]],
      type: 'heatmap',
      colorscale: 'Hot',
      colorbar: {
        title: {
          text: 'CO₂ concentration [ppm]',
          side: 'right'
        }
      }
    }
  ];
  const initialLayout = {
    title: { text: `${currentVariable} at initial time`, y: 0.9 },
    xaxis: {
      visible: false,
      scaleanchor: "y",
      fixedrange: false // Allow zooming without maintaining aspect ratio
    },
    yaxis: {
      visible: false,
      fixedrange: false // Allow zooming without maintaining aspect ratio
    },
    margin: { t: 70, l: 0, r: 0, b: 0 },
    hovermode: false, // Disable hover tools
    height: 470
  };
  Plotly.newPlot('myDiv', initialData, initialLayout);
}

function incrementTime() {
  const timeSlider = document.getElementById('timeSlider');
  if (isPlaying) {
      togglePlay();
  }
  timeSlider.value = parseInt(timeSlider.value) + 24;
  currentIndex = parseInt(timeSlider.value);
  plotData(arr, parseInt(timeSlider.value), parseInt(document.getElementById('zslider').value));
}

function decrementTime() {
  const timeSlider = document.getElementById('timeSlider');
  if (isPlaying) {
      togglePlay();
  }
  timeSlider.value = parseInt(timeSlider.value) - 24;
  currentIndex = parseInt(timeSlider.value);
  plotData(arr, parseInt(timeSlider.value), parseInt(document.getElementById('zslider').value));
}

function setPlaybackInterval(speed) {
  const timeSlider = document.getElementById('timeSlider');
  clearInterval(playInterval);
  playInterval = setInterval(() => {
    let currentValue = parseInt(timeSlider.value);
    currentIndex = currentValue;
    if (currentValue < parseInt(timeSlider.max)) {
      timeSlider.value = currentValue + 1;
    } else {
      timeSlider.value = timeSlider.min;
    }
    plotData(arr, parseInt(timeSlider.value), parseInt(document.getElementById('zslider').value));
  }, speed);
}

function increaseSpeed(event) {
  if (speed > 125) {
    speed -= 125;
    if (isPlaying) {
      setPlaybackInterval(speed);
    }
  }
  showFPS(event);
}

function decreaseSpeed(event) {
  speed += 125;
  if (isPlaying) {
    setPlaybackInterval(speed);
  }
  showFPS(event);
}

function showFPS(event) {
  let fps = Math.round(1000 / speed * 10) / 10;
  event.target.textContent = `${fps} fps`;
  // Sleep for 3 seconds to show the FPS value
  setTimeout(restoreButtonText, 2000, event);
}

function restoreButtonText(event) {
  if (event.target.id === 'increaseSpeedButton') {
    event.target.textContent = '+';
  } else if (event.target.id === 'decreaseSpeedButton') {
    event.target.textContent = '-';
  }
}

// Toggle play/pause functionality
function togglePlay() {
  const playButton = document.getElementById('playButton');
  const timeSlider = document.getElementById('timeSlider');
  if (isPlaying) {
    clearInterval(playInterval);
    playButton.innerHTML = '&#9658;';
    currentIndex = parseInt(timeSlider.value);
    timeSlider.step = 24; // Restore step to 24 when playback is stopped
  } else {
    timeSlider.step = 1; // Temporarily set step to 1 during playback
    timeSlider.value = currentIndex;
    playButton.innerHTML = '&#9208;';
    setPlaybackInterval(speed);
  }
  isPlaying = !isPlaying;
}

// Initialize the script
async function initialize() {
  arr = await fetchVariableData(currentVariable, currentDomain, 0);
  times = await zarr.open(new zarr.FetchStore("https://swift.dkrz.de/v1/dkrz_cf06e856-7ed9-4f16-9ffb-3c5526e68a9c/MACRO-2018/v1/wrfout_d01_2018.zarr/Times/"), { kind: "array" });
  let timevalues = await zarr.get(times, [null]);
  timesArray = [];
  for (let i = 0; i < timevalues.data.length; i++) {
    timesArray.push(timevalues.data.get(i).slice(0, -6));
  }

  initializePlot();
  plotData(arr, currentIndex, 0);

  document.getElementById('timeSlider').addEventListener('change', (event) => {
    currentIndex = parseInt(event.target.value);
    plotData(arr, parseInt(event.target.value), parseInt(document.getElementById('zslider').value));
  });
  document.getElementById('timeSlider').addEventListener('input', (event) => {
    const timeValue = timesArray[parseInt(event.target.value)];
    const layoutUpdate = { title: { text: `${currentVariable} at ${timeValue}`, y: 0.9 } };
    Plotly.relayout('myDiv', layoutUpdate);
  });
  document.getElementById('zslider').addEventListener('change', (event) => {
    document.getElementById('zlabel').innerHTML = "Z Slice: " + event.target.value.toString();
    plotData(arr, parseInt(document.getElementById('timeSlider').value), parseInt(event.target.value));
  });
}

document.addEventListener('DOMContentLoaded', initialize);

window.updatePlot = updatePlot;
window.togglePlay = togglePlay;
window.incrementTime = incrementTime;
window.decrementTime = decrementTime;
window.increaseSpeed = increaseSpeed;
window.decreaseSpeed = decreaseSpeed;
window.showFPS = showFPS;
window.restoreButtonText = restoreButtonText;
