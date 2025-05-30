import { BasePlot, zarr } from "./base_plot.js";

class PlotV2 extends BasePlot {
  constructor() {
    super();
    this.BASE_URL = "https://s3.eu-dkrz-1.dkrz.cloud/bb1170/public/MACRO-2018";
    // Set version-2–specific defaults
    this.currentVariable = "CO2_TOTAL";
    this.chunkSize = 48;
    this.currentBLScheme = "MYJ"; // additional parameter for v2
    this.statsMap = {
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
  }

  // Helper to build full URL in v2.
  getUrl(blscheme, domain, path) {
    return `${this.BASE_URL}/${blscheme}/wrfout_d0${domain}.zarr/${path}`;
  }

  populateDOM() {
    super.populateDOM();
    this.dom.blschemeDropdown = document.getElementById("blschemeDropdown");
    this.spinner = document.getElementById("spinner");
  }

  addListeners() {
    super.addListeners();
    this.dom.blschemeDropdown.addEventListener("change", this.updatePlot.bind(this));
  }

  async fetchVariableData(variable, blscheme, domain) {
    // In v2 we always use the same URL pattern.
    this.spinner.style.display = "block";
    try {
      const store = new zarr.FetchStore(this.getUrl(blscheme, domain, variable) + "/");
      return await zarr.open(store, { kind: "array" });
    } catch (error) {
      console.error("Error fetching variable data:", error);
      throw error;
    }
    finally {
      this.spinner.style.display = "none";
    }
  }

  async initialFetch() {
    await this.fetchTimes();
    [this.arr, this.min, this.max] = await Promise.all([
      this.fetchVariableData(
        this.currentVariable, this.currentBLScheme, this.currentDomain
      ),
      this.fetchStatsData(
        this.currentVariable, this.currentBLScheme, this.currentDomain, "min"
      ),
      this.fetchStatsData(
        this.currentVariable, this.currentBLScheme, this.currentDomain, this.statsMap[this.currentVariable] || "max"
      ),
    ]);
  }

  async fetchTimes() {
    this.spinner.style.display = "block";
    try {
      // In v2, we fetch times from the "Times/" path.
      const timesStore = new zarr.FetchStore(this.getUrl(this.currentBLScheme, this.currentDomain, "Times/"));
      this.times = await zarr.open(timesStore, { kind: "array" });
      const timeValues = await zarr.get(this.times, [null]);
      // Build timesArray (e.g. slicing off the last 6 characters)
      this.timesArray = Array.from(timeValues.data, (val) => val.slice(0, -6));
    } catch (error) {
      console.error("Error fetching times:", error);
      throw error;
    } finally {
      this.spinner.style.display = "none";
    }
  }

  initializePlot() {
    // For v2 the colorscale and colorbar title are determined dynamically.
    const initialScale = this.getColorscale(this.currentVariable);
    const initialTitle = this.getColorbarTitle(this.currentVariable);
    const initialData = [
      {
        z: [[]],
        type: "heatmap",
        colorscale: initialScale,
        colorbar: { title: { text: initialTitle, side: "right" } },
      },
    ];
    const initialLayout = {
      title: { text: `${this.currentVariable} at initial time`, y: 0.9 },
      xaxis: { visible: false, scaleanchor: "y", fixedrange: false },
      yaxis: { visible: false, fixedrange: false },
      margin: { t: 70, l: 0, r: 0, b: 0 },
      hovermode: false,
      height: 470,
    };
    Plotly.newPlot(this.dom.plotDiv, initialData, initialLayout);
    this.plotData(this.currentIndex, this.currentZVal);
  }

  // Methods for determining colorscale and colorbar title in v2.
  getVarPrefix(variable) {
    return variable.split("_")[0];
  }
  getColorscale(variable) {
    // For example purposes, use mappings (could be extended)
    const colorscaleMap = {
      CO2_VPRM: "RdBu",
      CO2_VPRM_V2: "RdBu",
    };
    const colorscaleFallback = {
      CO2: "Electric",
      CO: "Electric",
    };
    return (
      colorscaleMap[variable] ||
      colorscaleFallback[this.getVarPrefix(variable)] ||
      "Hot"
    );
  }
  getColorbarTitle(variable) {
    const colorbarTitle = {
      CO2: "CO₂ concentration [ppm]",
      CO: "CO concentration [ppm]",
      wind: "wind speed [m/s]",
    };
    return colorbarTitle[this.getVarPrefix(variable)] || "Variable";
  }

  async fetchStatsData(variable, blscheme, domain, stat) {
    this.spinner.style.display = "block";
    try {
      const store = new zarr.FetchStore(
        this.getUrl(blscheme, domain, `stats/${variable}_${stat}`) + "/"
      );
      return await zarr.open(store, { kind: "array" });
    } catch (error) {
      console.error("Error fetching variable data:", error);
      throw error;
    }
    finally {
      this.spinner.style.display = "none";
    }
  }

  async updatePlot() {
    let blscheme_changed = this.dom.blschemeDropdown.value !== this.currentBLScheme;
    let domain_changed = this.dom.domainDropdown.value !== this.currentDomain;
    if (blscheme_changed || domain_changed) {
      await this.fetchTimes();
    }

    this.currentBLScheme = this.dom.blschemeDropdown.value;
    this.currentVariable = this.dom.variableDropdown.value;
    this.currentDomain = this.dom.domainDropdown.value;

    [this.arr, this.min, this.max] = await Promise.all([
      this.fetchVariableData(
        this.currentVariable,
        this.currentBLScheme,
        this.currentDomain
      ),
      this.fetchStatsData(
        this.currentVariable,
        this.currentBLScheme,
        this.currentDomain,
        "min"
      ),
      this.fetchStatsData(
        this.currentVariable,
        this.currentBLScheme,
        this.currentDomain,
        this.statsMap[this.currentVariable] || "max"
      )
    ]);

    this.plotData(this.currentIndex, this.currentZVal);
  }

  makeColorbarSymmetric(min, max) {
    const absMax = Math.max(Math.abs(407. - min), Math.abs(max - 407.));
    return [407. - absMax, 407. + absMax];
  }

  async plotData(time, z) {
    try {
      // Preload next day data if conditions are met.
      this.preloadNextDayData(time, z);

      // Fetch view, _min, and _max concurrently.
      let [view, _min, _max] = await Promise.all([
        zarr.get(this.arr, [time, z, null, null]),
        zarr.get(this.min, [Math.floor(time / 24), z]),
        zarr.get(this.max, [Math.floor(time / 24), z])
      ]);
      const timeValue = this.timesArray[time];

      if (!view || !view.data || view.data.length === 0) {
        throw new Error("Empty data");
      }

      // Process the view into a 2D array.
      const array2D = this.reshapeTo2D(view);

      // Prepare the new trace update.
      const newTrace = {
        z: [array2D],
        colorscale: this.getColorscale(this.currentVariable),
        colorbar: {
          title: {
            text: this.getColorbarTitle(this.currentVariable),
            side: "right"
          }
        }
      };

      if (time % 24 === 0) {
        if (this.getColorscale(this.currentVariable).includes("RdBu")) {
          [_min, _max] = this.makeColorbarSymmetric(_min, _max);
        }
        newTrace.zmin = _min;
        newTrace.zmax = _max;
      }

      // Build a fresh layout update.
      const newLayout = {
        title: { text: `${this.currentVariable} at ${timeValue}`, y: 0.9 }
      };

      Plotly.update(this.dom.plotDiv, newTrace, newLayout);

    } catch (error) {
      if (error.message.includes("index out of bounds")) {
        alert("Could not find data for the selected time. Maximum available time is " + this.timesArray[this.timesArray.length -1]);
        if (this.isPlaying) {
          togglePlay();
        }
        this.currentIndex = this.timesArray.length - 1;
        this.dom.timeSlider.value = this.currentIndex;
        this.plotData(this.currentIndex, this.currentZVal);
      } else {
        console.error("Error plotting data:", error);
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const plotController = new PlotV2();
  plotController.initialize();
});