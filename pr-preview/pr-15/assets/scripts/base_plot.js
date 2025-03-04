import * as zarr from "https://cdn.jsdelivr.net/npm/zarrita@next/+esm";

//////////////////////////
// Base Class
//////////////////////////

class BasePlot {
  constructor() {
    // Common state properties
    this.BASE_URL = "https://swift.dkrz.de/v1/dkrz_cf06e856-7ed9-4f16-9ffb-3c5526e68a9c/MACRO-2018";
    this.playInterval = null;
    this.isPlaying = false;
    this.currentVariable = ""; // to be set by derived class
    this.currentDomain = "1";   // to be set by derived class
    this.currentIndex = 0;
    this.currentZVal = 0;
    this.speed = 200;
    this.maxFPS = 20;
    this.minFPS = 1;
    this.arr = null;
    this.times = null;
    this.timesArray = [];
    this.dom = {}; // Will hold cached DOM elements
  }

  //////////////////////////
  // Common Helper Methods
  //////////////////////////

  // Reshape a flat zarr data array into a 2D array.
  reshapeTo2D(zarrData) {
    const { data, shape } = zarrData;
    const [rows, cols] = shape;
    const array2D = [];
    for (let i = 0; i < rows; i++) {
      array2D.push(Array.from(data.subarray(i * cols, (i + 1) * cols)));
    }
    return array2D;
  }

  //////////////////////////
  // Playback Controls (Common)
  //////////////////////////

  setPlaybackInterval(speed) {
    clearInterval(this.playInterval);
    const timeSlider = this.dom.timeSlider;
    this.playInterval = setInterval(() => {
      let currentValue = parseInt(timeSlider.value);
      this.currentIndex = currentValue;
      if (currentValue < parseInt(timeSlider.max)) {
        timeSlider.value = currentValue + 1;
      } else {
        timeSlider.value = timeSlider.min;
      }
      // Use the current z–slider value (or 0 if missing)
      this.currentZVal = parseInt(this.dom.zslider.value || 0);
      this.plotData(this.currentIndex, this.currentZVal);
    }, speed);
  }

  togglePlay() {
    const playButton = this.dom.playButton;
    const timeSlider = this.dom.timeSlider;
    if (this.isPlaying) {
      clearInterval(this.playInterval);
      playButton.classList = [];
      playButton.classList.add("fa", "fa-play");
      this.currentIndex = parseInt(timeSlider.value);
      timeSlider.step = 24; // restore step after stopping playback
    } else {
      timeSlider.step = 1; // finer control during playback
      timeSlider.value = this.currentIndex;
      playButton.classList = [];
      playButton.classList.add("fa", "fa-pause");
      this.setPlaybackInterval(this.speed);
    }
    this.isPlaying = !this.isPlaying;
  }

  incrementTime() {
    const timeSlider = this.dom.timeSlider;
    if (this.isPlaying) {
      this.togglePlay();
    }
    timeSlider.value = parseInt(timeSlider.value) + 24;
    this.currentIndex = parseInt(timeSlider.value);
    this.plotData(this.currentIndex, parseInt(this.dom.zslider.value));
  }

  decrementTime() {
    const timeSlider = this.dom.timeSlider;
    if (this.isPlaying) {
      this.togglePlay();
    }
    timeSlider.value = parseInt(timeSlider.value) - 24;
    this.currentIndex = parseInt(timeSlider.value);
    this.plotData(this.currentIndex, parseInt(this.dom.zslider.value));
  }

  speedToFPS(speed) {
    return Math.round(1000 / speed * 10) / 10;
  }

  FPStoSpeed(fps) {
    return Math.round(1000 / fps);
  }

  increaseSpeed(event) {
    let fps = this.speedToFPS(this.speed);
    fps = Math.min(fps + 2, this.maxFPS);
    this.speed = this.FPStoSpeed(fps);
    if (this.isPlaying) {
      this.setPlaybackInterval(this.speed);
    }
    this.showFPS(event);
  }

  stepForward() {
    if (this.isPlaying) {
      this.togglePlay();
    }
    this.dom.timeSlider.step = 1;
    this.dom.timeSlider.value = this.currentIndex + 1;
    this.currentIndex = parseInt(this.dom.timeSlider.value);
    this.dom.timeSlider.step = 24;
    this.plotData(this.currentIndex, this.currentZVal);
  }

  stepBackward() {
    if (this.isPlaying) {
      this.togglePlay();
    }
    if (this.currentIndex > 0) {
      this.dom.timeSlider.step = 1;
      this.dom.timeSlider.value = this.currentIndex - 1;
      this.currentIndex = parseInt(this.dom.timeSlider.value);
      this.dom.timeSlider.step = 24;
      this.plotData(this.currentIndex, this.currentZVal);
    }
  }

  decreaseSpeed(event) {
    let fps = this.speedToFPS(this.speed);
    fps = Math.max(fps - 2, this.minFPS);
    this.speed = this.FPStoSpeed(fps);
    if (this.isPlaying) {
      this.setPlaybackInterval(this.speed);
    }
    this.showFPS(event);
  }

  showFPS(event) {
    const fps = Math.round(Math.round((1000 / this.speed) * 10) / 10);
    event.target.classList = [];
    event.target.textContent = `${fps} fps`;
    setTimeout(() => this.restoreButtonText(event), 2000);
  }

  restoreButtonText(event) {
    event.target.textContent = "";
    if (event.target.id === "increaseSpeedButton") {
      event.target.classList.add("fa", "fa-plus");
    } else if (event.target.id === "decreaseSpeedButton") {
      event.target.classList.add("fa", "fa-minus");
    }
  }

  //////////////////////////
  // Base Initialization & Event Registration
  //////////////////////////

  populateDOM() {
    this.dom.variableDropdown = document.getElementById("variableDropdown");
    this.dom.domainDropdown = document.getElementById("domainDropdown");
    this.dom.timeSlider = document.getElementById("timeSlider");
    this.dom.zslider = document.getElementById("zslider");
    this.dom.playButton = document.getElementById("playButton");
    this.dom.zlabel = document.getElementById("zlabel");
    this.dom.plotDiv = document.getElementById("myDiv");
    this.dom.increaseSpeedButton = document.getElementById("increaseSpeedButton");
    this.dom.decreaseSpeedButton = document.getElementById("decreaseSpeedButton");
    this.dom.incrementTimeButton = document.getElementById("incrementTimeButton");
    this.dom.decrementTimeButton = document.getElementById("decrementTimeButton");
    this.dom.stepTimeBackButton = document.getElementById("stepTimeBackButton");
    this.dom.stepTimeForwardButton = document.getElementById("stepTimeForwardButton");
    this.dom.plotDiv = document.getElementById("myDiv");
  }

  addListeners() {
    this.dom.timeSlider.addEventListener("change", (event) => {
      this.currentIndex = parseInt(event.target.value);
      this.plotData(this.currentIndex, parseInt(this.dom.zslider.value));
    });
    this.dom.timeSlider.addEventListener("input", (event) => {
      const timeValue = this.timesArray[parseInt(event.target.value)];
      const layoutUpdate = { title: { text: `${this.currentVariable} at ${timeValue}`, y: 0.9 } };
      Plotly.relayout(this.dom.plotDiv, layoutUpdate);
    });
    this.dom.zslider.addEventListener("change", (event) => {
      this.dom.zlabel.innerHTML = "Z Slice: " + event.target.value;
      this.plotData(this.currentIndex, parseInt(event.target.value));
    });
    this.dom.variableDropdown.addEventListener("change", () => this.updatePlot());
    this.dom.domainDropdown.addEventListener("change", () => this.updatePlot());
    this.dom.increaseSpeedButton.addEventListener("click", (event) => this.increaseSpeed(event));
    this.dom.decreaseSpeedButton.addEventListener("click", (event) => this.decreaseSpeed(event));
    this.dom.incrementTimeButton.addEventListener("click", () => this.incrementTime());
    this.dom.decrementTimeButton.addEventListener("click", () => this.decrementTime());
    this.dom.stepTimeForwardButton.addEventListener("click", () => this.stepForward());
    this.dom.stepTimeBackButton.addEventListener("click", () => this.stepBackward());
    this.dom.playButton.addEventListener("click", () => this.togglePlay());
  }

  initialFetch() {
    // Derived classes must implement this method to fetch the initial data.
    throw new Error("initialFetch must be implemented in the derived class.");
  }

  async initialize() {
    // Cache common DOM elements (assumes the same IDs in both versions)
    this.populateDOM();

    // Derived classes are responsible for setting currentVariable/currentDomain and fetching the data store.
    await this.initialFetch();

    this.initializePlot();

    // Event listeners for playback and data update
    this.addListeners();
  }

  preloadNextDayData(time, z) {
    if (this.speedToFPS(this.speed) < 10 && time % 24 === 12) {
      // Fire-and-forget preload
      zarr.get(this.arr, [time + 24, z, null, null]).catch((err) => {
        if (!err.message.includes("index out of bounds")) {
          console.error(err);
        }
      });
    } else if (this.speedToFPS(this.speed) >= 10 && time % 24 === 0) {
      zarr.get(this.arr, [time + 24, z, null, null]).catch((err) => {
        if (!err.message.includes("index out of bounds")) {
          console.error(err);
        }
      });
    } else if (this.speedToFPS(this.speed) > 15 && time % 24 === 0) {
      zarr.get(this.arr, [time + 24, z, null, null]).catch((err) => {
        if (!err.message.includes("index out of bounds")) {
          console.error(err);
        }
      });
      zarr.get(this.arr, [time + 48, z, null, null]).catch((err) => {
        if (!err.message.includes("index out of bounds")) {
          console.error(err);
        }
      });
    }
  }

  //////////////////////////
  // Abstract Methods
  //////////////////////////
  // These methods must be implemented by each derived class.

  // Fetch the zarr data store for the selected variable/domain.
  async fetchVariableData(variable, domain, time) {
    throw new Error("fetchVariableData must be implemented in the derived class.");
  }

  // Fetch and fill the times array.
  async fetchTimes() {
    throw new Error("fetchTimes must be implemented in the derived class.");
  }

  // Initialize the Plotly plot.
  initializePlot() {
    throw new Error("initializePlot must be implemented in the derived class.");
  }

  // Update the plot after a change in variable/domain.
  async updatePlot() {
    throw new Error("updatePlot must be implemented in the derived class.");
  }

  // Plot the data for a given time and z–index.
  async plotData(time, z) {
    throw new Error("plotData must be implemented in the derived class.");
  }
}

export { BasePlot, zarr };