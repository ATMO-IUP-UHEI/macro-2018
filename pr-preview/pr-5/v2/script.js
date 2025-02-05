import * as zarr from "https://cdn.jsdelivr.net/npm/zarrita@next/+esm";

let playInterval;
let isPlaying = false;
let currentVariable = "CO2_TOTAL";
let currentDomain = "1";
let currentIndex = 0;
let currentBLScheme = "MYJ";
let speed = 500;
let arr, times, timesArray, min, max;
let colorbarTitle = {
  CO2: "CO₂ concentration [ppm]",
  CO: "CO concentration [ppm]",
  wind: "wind speed [m/s]"
};
let colorscaleMap = {
  CO2_VPRM: "RdBu",
  CO2_VPRM_V2: "RdBu",
};
let colorscaleFallback = {
  CO2: "Electric",
  CO: "Electric",
};
let statsMap = {
  CO2_POINT: "q998",
  CO2_TRAFFIC: "q998",
  CO2_BF: "q998",
  CO2_ANTHRO: "q998",
  CO_TOTAL: "q998",
  CO2_BCK: "q95",
  CO2_AREA: "q95",
  CO2_VPRM: "q95",
  CO2_VPRM_V2: "q95",
  CO2_TOTAL: "q95",
  CO2_TOTAL_V2: "q95",
};

// Fetch and open the zarr array for the selected variable and domain
async function fetchVariableData(variable, blscheme, domain) {
  const store = new zarr.FetchStore(`https://swift.dkrz.de/v1/dkrz_cf06e856-7ed9-4f16-9ffb-3c5526e68a9c/MACRO-2018/v2/${blscheme}/wrfout_d0${domain}_2018.zarr/${variable}/`);
  await fillTimesArray(blscheme, domain);
  return await zarr.open(store, { kind: "array" });
}

async function fetchStatsData(variable, blscheme, domain, stat) {
  const store = new zarr.FetchStore(`https://swift.dkrz.de/v1/dkrz_cf06e856-7ed9-4f16-9ffb-3c5526e68a9c/MACRO-2018/v2/${blscheme}/wrfout_d0${domain}_2018.zarr/stats/${variable}_${stat}/`);
  return await zarr.open(store, { kind: "array" });
}

// Update the variable and plot data
async function updatePlot() {
  currentVariable = document.getElementById('variableDropdown').value;
  currentDomain = document.getElementById('domainDropdown').value;
  currentBLScheme = document.getElementById('blschemeDropdown').value;
  arr = await fetchVariableData(currentVariable, currentBLScheme, currentDomain);
  min = await fetchStatsData(currentVariable, currentBLScheme, currentDomain, "min");
  max = await fetchStatsData(currentVariable, currentBLScheme, currentDomain, statsMap[currentVariable] || "max");
  // preload if current index is between 12am and 12pm
  if (currentIndex / 24 - Math.floor(currentIndex / 24) > 0.5) {
    zarr.get(arr, [currentIndex, parseInt(document.getElementById('zslider').value), null, null]);
    zarr.get(arr, [currentIndex + 24, parseInt(document.getElementById('zslider').value), null, null]);
  }
  plotData(arr, currentIndex, parseInt(document.getElementById('zslider').value), min, max);
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
async function plotData(arr, time, z, min, max) {
  try {
    // Check if time divisible by 12 (half day) and preload next 24 hours in background
    let day = Number(time / 24);
    try {
      if (time % 12 === 0 && (time / 12) % 2 !== 0) {
        // preload next 24 hours in background
        zarr.get(arr, [time+24, z, null, null]);
      }
    } catch (error) {
      // ignore error
    }
    const view = await zarr.get(arr, [time, z, null, null]);
    const _min = await zarr.get(min, [day, z]);
    const _max = await zarr.get(max, [day, z]);
    const timeValue = timesArray[time];
    if (!view || !view.data || view.data.length === 0) {
      throw new Error("Empty data");
    }

    const array2D = reshapeTo2D(view);
    const scale = colorscaleMap[currentVariable] || colorscaleFallback[currentVariable.split("_")[0]] || "Hot";
    const update = { z: [array2D], colorscale: scale , zmin: _min, zmax: _max};
    const layoutUpdate = { title: { text: `${currentVariable} at ${timeValue}`, y: 0.9 } };
    const title = colorbarTitle[currentVariable.split("_")[0]] || "Variable";
    update.colorbar = { title: { text: title, side: 'right' } };
    Plotly.restyle('myDiv', update);
    Plotly.relayout('myDiv', layoutUpdate);
  } catch (error) {
    console.error("Error plotting data:", error);
    if (error.message.includes("index out of bounds")) {
      alert("Could not find data for the selected time. Maximum available time is " + timesArray[timesArray.length -1]);
      if (isPlaying) {
        togglePlay();
      }
    }
  }
}

// Initialize the plot with empty data
function initializePlot() {
  const scale = colorscaleMap[currentVariable] || colorscaleFallback[currentVariable.split("_")[0]] || "Hot";
  const title = colorbarTitle[currentVariable.split("_")[0]] || "Variable";
  const initialData = [
    {
      z: [[]],
      type: 'heatmap',
      colorscale: scale,
      colorbar: {
        title: {
          text: title,
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
    height: 470, // Set the height to 350px
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
  plotData(arr, parseInt(timeSlider.value), parseInt(document.getElementById('zslider').value), min, max);
}

function decrementTime() {
  const timeSlider = document.getElementById('timeSlider');
  if (isPlaying) {
      togglePlay();
  }
  timeSlider.value = parseInt(timeSlider.value) - 24;
  currentIndex = parseInt(timeSlider.value);
  plotData(arr, parseInt(timeSlider.value), parseInt(document.getElementById('zslider').value), min, max);
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
    plotData(arr, parseInt(timeSlider.value), parseInt(document.getElementById('zslider').value), min, max);
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
  // Sleep for 3 seconds to show the FPS value, then restore the original text
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

async function fillTimesArray(blscheme, domain) {
  times = await zarr.open(new zarr.FetchStore(`https://swift.dkrz.de/v1/dkrz_cf06e856-7ed9-4f16-9ffb-3c5526e68a9c/MACRO-2018/v2/${blscheme}/wrfout_d0${domain}_2018.zarr/Times/`), { kind: "array" });
  let timevalues = await zarr.get(times, [null]);
  timesArray = [];
  for (let i = 0; i < timevalues.data.length; i++) {
    timesArray.push(timevalues.data.get(i).slice(0, -6));
  }

}

// Initialize the script
async function initialize() {
  arr = await fetchVariableData(currentVariable, currentBLScheme, currentDomain);
  min = await fetchStatsData(currentVariable, currentBLScheme, currentDomain, "min");
  max = await fetchStatsData(currentVariable, currentBLScheme, currentDomain, statsMap[currentVariable] || "max");

  initializePlot();
  plotData(arr, currentIndex, 0, min, max);

  document.getElementById('timeSlider').addEventListener('change', (event) => {
    currentIndex = parseInt(event.target.value);
    plotData(arr, parseInt(event.target.value), parseInt(document.getElementById('zslider').value), min, max);
  });
  document.getElementById('timeSlider').addEventListener('input', (event) => {
    const timeValue = timesArray[parseInt(event.target.value)];
    const layoutUpdate = { title: { text: `${currentVariable} at ${timeValue}`, y: 0.9 } };
    Plotly.relayout('myDiv', layoutUpdate);
  });
  document.getElementById('zslider').addEventListener('change', (event) => {
    document.getElementById('zlabel').innerHTML = "Z Slice: " + event.target.value.toString();
    plotData(arr, parseInt(document.getElementById('timeSlider').value), parseInt(event.target.value), min, max);
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
