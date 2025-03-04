import { BasePlot, zarr } from "./base_plot.js";


class PlotV1 extends BasePlot {
  constructor() {
    super();
    // Set version-1–specific defaults
    this.currentVariable = "CO2_ANT";
    this.currentTimesURL = "";
    this.dom2IndexChange = 2160;
  }

  async assureCorrectDataIsLoaded(domain, newTime, scrubbing = false) {
    if (this.currentDomain === "2") {
      if (newTime >= this.dom2IndexChange) {
        if (!this.currentTimesURL.includes("from_04")) {
          if (scrubbing) {
            await this.fetchTimes();
          }
          else {
            this.arr = await this.fetchVariableData(this.currentVariable, this.currentDomain, newTime);
          }
        }
      }
      else {
        if (this.currentTimesURL.includes("from_04")) {
          if (scrubbing) {
            await this.fetchTimes();
          }
          else {
            this.arr = await this.fetchVariableData(this.currentVariable, this.currentDomain, newTime);
          }
        }
      }
    }
  }

  addListeners() {
    super.addListeners();
    this.dom.timeSlider.addEventListener("change", (event) => {
      this.assureCorrectDataIsLoaded(this.currentDomain, parseInt(event.target.value)).then(
        () => {
          this.currentIndex = parseInt(event.target.value);
          this.plotData(this.currentIndex, parseInt(this.dom.zslider.value));
        }
      );
    });
    this.dom.timeSlider.addEventListener("input", (event) => {
      this.assureCorrectDataIsLoaded(this.currentDomain, parseInt(event.target.value), true).then(
        () => {
          const timeValue = this.timesArray[this.fixTimeVariable(this.currentDomain, parseInt(event.target.value))];
          const layoutUpdate = { title: { text: `${this.currentVariable} at ${timeValue}`, y: 0.9 } };
          Plotly.relayout(this.dom.plotDiv, layoutUpdate);
        }
      );
    });
    this.dom.incrementTimeButton.addEventListener("click", () => {
      this.assureCorrectDataIsLoaded(this.currentDomain, this.currentIndex + 24).then(
        () => { this.incrementTime(); }
      );
    });
    this.dom.decrementTimeButton.addEventListener("click", () => {
      this.assureCorrectDataIsLoaded(this.currentDomain, this.currentIndex - 24).then(
        () => { this.decrementTime(); }
      );
    });
    this.dom.stepTimeForwardButton.addEventListener("click", () => {
      this.assureCorrectDataIsLoaded(this.currentDomain, this.currentIndex + 1).then(
        () => { this.stepForward(); }
      );
    });
    this.dom.stepTimeBackButton.addEventListener("click", () => {
      this.assureCorrectDataIsLoaded(this.currentDomain, this.currentIndex - 1).then(
        () => { this.stepBackward(); }
      );
    });
  }

  getUrl(domain, path, time) {
    if (domain === "2" && time >= this.dom2IndexChange) {
      return `${this.BASE_URL}/v1/wrfout_d0${domain}_2018_from_04.zarr/${path}/`;
    } else {
      return `${this.BASE_URL}/v1/wrfout_d0${domain}_2018.zarr/${path}/`;
    }
  }

  // In v1 the URL depends on the domain and time.
  async fetchVariableData(variable, domain, time) {
    await this.fetchTimes(); // ensure timesArray is populated
    const store = new zarr.FetchStore(this.getUrl(domain, variable, time));
    return await zarr.open(store, { kind: "array" });
  }

  async initialFetch() {
    this.arr = await this.fetchVariableData(this.currentVariable, this.currentDomain, this.currentIndex);
  }

  async fetchTimes() {
    this.currentTimesURL = this.getUrl(this.currentDomain, "Times", this.currentIndex)
    const timesStore = new zarr.FetchStore(this.currentTimesURL);
    this.times = await zarr.open(timesStore, { kind: "array" });
    const timevalues = await zarr.get(this.times, [null]);
    this.timesArray = [];
    for (let i = 0; i < timevalues.data.length; i++) {
      this.timesArray.push(timevalues.data.get(i).slice(0, -6));
    }
  }

  fixTimeVariable(domain, time) {
    if (domain === "2" && time >= this.dom2IndexChange) {
      return time - this.dom2IndexChange;
    } else {
      return time;
    }
  }

  initializePlot() {
    // v1 uses a fixed colorscale ("Electric") and the colorbar title depends on the variable.
    const initialData = [
      {
        z: [[]],
        type: "heatmap",
        colorscale: "Electric",
        colorbar: {
          title: {
            text: this.currentVariable === "CO_ANT" ? "CO concentration [ppm]" : "CO₂ concentration [ppm]",
            side: "right",
          },
        },
      },
    ];
    const initialLayout = {
      title: { text: `${this.currentVariable} at initial time`, y: 0.9 },
      xaxis: {
        visible: false,
        scaleanchor: "y",
        fixedrange: false,
      },
      yaxis: {
        visible: false,
        fixedrange: false,
      },
      margin: { t: 70, l: 0, r: 0, b: 0 },
      hovermode: false,
      height: 470,
    };
    Plotly.newPlot(this.dom.plotDiv, initialData, initialLayout);
    this.plotData(this.currentIndex, this.currentZVal);
  }

  async updatePlot() {
    // When variable or domain changes, fetch new data and replot.
    this.currentVariable = this.dom.variableDropdown.value;
    this.currentDomain = this.dom.domainDropdown.value;
    this.currentIndex = parseInt(this.dom.timeSlider.value);
    this.arr = await this.fetchVariableData(this.currentVariable, this.currentDomain, this.currentIndex);
    this.currentZVal = parseInt(this.dom.zslider.value);
    this.plotData(this.currentIndex, this.currentZVal);
  }

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
      const zVal = parseInt(this.dom.zslider.value || 0);
      this.plotData(this.currentIndex, zVal);
    }, speed);
  }

  async plotData(time, z) {
    time = this.fixTimeVariable(this.currentDomain, time);
    try {
      // Preload next 24 hours if the time meets the condition.
      this.preloadNextDayData(time, z);

      const view = await zarr.get(this.arr, [time, z, null, null]);
      const timeValue = this.timesArray[time];

      if (!view || !view.data || view.data.length === 0) {
        throw new Error("Empty data");
      }
      const array2D = this.reshapeTo2D(view);
      const update = { z: [array2D] };
      const layoutUpdate = { title: { text: `${this.currentVariable} at ${timeValue}`, y: 0.9 } };
      // Choose colorbar title based on the variable.
      const colorbarTitle = this.currentVariable === "CO_ANT" ? "CO concentration [ppm]" : "CO₂ concentration [ppm]";
      update.colorbar = { title: { text: colorbarTitle, side: "right" } };
      Plotly.update(this.dom.plotDiv, update, layoutUpdate);
    } catch (error) {
      console.error("Error plotting data:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const plotController = new PlotV1();
  plotController.initialize();
});
