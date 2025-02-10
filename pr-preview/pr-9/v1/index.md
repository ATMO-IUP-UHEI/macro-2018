<link rel="stylesheet" href="{{ '/assets/css/v1.css' | relative_url }}">
<div id="fullplot">
  <div id="container">
    <div id="controls">
      <div id="dropdown-controls">
        <div id="domain-container">
          <label for="domainDropdown">Domain:</label>
          <select id="domainDropdown">
            <option value="1">Europe</option>
            <option value="2">Germany</option>
            <option value="3">Rhine-Neckar</option>
            <option value="4">Berlin</option>
            <option value="5">Rhine-Ruhr</option>
            <option value="6">Nuremberg</option>
            <option value="7">Munich</option>
          </select>
        </div>
        <div id="variable-container">
          <label for="variableDropdown">Variable:</label>
          <select id="variableDropdown">
            <option value="CO2_ANT">CO2 Area Sources</option>
            <option value="CO2_TST">CO2 Point Sources</option>
            <option value="CO2_TRAFFIC">CO2 Traffic</option>
            <option value="CO2_BF">CO2 Biofuel</option>
            <option value="CO2_VPRM">CO2 Biogenic</option>
            <option value="CO_ANT">CO Anthro</option>
          </select>
        </div>
      </div>
      <div id="zslider-container">
        <label id="zlabel" for="zslider">Z Slice: 0</label>
        <div id="zslider-inner">
          <input type="range" id="zslider" min="0" max="40" value="0" step="1" list="ztickmarks">
          <datalist id="ztickmarks">
            <option value="40" label="40"></option>
            <option value="35" label="35"></option>
            <option value="30" label="30"></option>
            <option value="25" label="25"></option>
            <option value="20" label="20"></option>
            <option value="15" label="15"></option>
            <option value="10" label="10"></option>
            <option value="5" label="5"></option>
            <option value="0" label="0"></option>
          </datalist>
        </div>
      </div>
    </div>
    <div id="myDiv"></div>
  </div>
  <div id="timeWidget">
    <input type="range" id="timeSlider" min="0" max="8760" value="0" step="24" list="tickmarks">
    <datalist id="tickmarks">
      <option value="0" label="Jan"></option>
      <option value="744" label="Feb"></option>
      <option value="1416" label="Mar"></option>
      <option value="2160" label="Apr"></option>
      <option value="2880" label="May"></option>
      <option value="3624" label="Jun"></option>
      <option value="4344" label="Jul"></option>
      <option value="5088" label="Aug"></option>
      <option value="5832" label="Sep"></option>
      <option value="6552" label="Oct"></option>
      <option value="7296" label="Nov"></option>
      <option value="8016" label="Dec"></option>
      <option value="8760" label="2019"></option>
    </datalist>
    <div id="timeWidget-buttons">
      <button id="decreaseSpeedButton" class="fa fa-minus"></button>
      <button id="decrementTimeButton" class="fa fa-fast-backward"></button>
      <button id="stepTimeBackButton" class="fa fa-step-backward"></button>
      <button id="playButton" class="fa fa-play"></button>
      <button id="stepTimeForwardButton" class="fa fa-step-forward"></button>
      <button id="incrementTimeButton" class="fa fa-fast-forward"></button>
      <button id="increaseSpeedButton" class="fa fa-plus"></button>
    </div>
  </div>
</div>

<script type="module" src="{{ '/assets/scripts/plot_v1.js' | relative_url }}"></script>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="{{ '/assets/scripts/decoder.js' | relative_url}}" defer></script>


## General

This dataset contains one year of CO<sub>2</sub> and CO enhancement fields for 5 metropolitan regions in Germany (Rhine-Neckar, Rhine-Ruhr, Berlin, Nuremberg, Munich) at 1km resolution.
These domains are embedded in the Germany domain at 5km resolution and the Europe domain at 15km resolution.

- Contributors: <a class="enc" href="znvygb:yhxnf.cvym@vhc.hav-urvqryoret.qr">Lukas Pilz</a>, <a class="enc" href="znvygb:fnanz.ineqnt@hav-urvqryoret.qr">Sanam Vardag</a> ([GHG Simulation Group](https://www.iup.uni-heidelberg.de/de/forschung/atmosphaere/simulation-von-treibhausgasen-in-der-atmosphaere-vardag-gruppe), Institute of Environmental Physics, Heidelberg University)
- Time period: 1.1.2018 - 31.12.2018
    - computed in 4 seasons (cf. [Documentation](documentation.md))
    - reinitialization every 7 days from ERA5 meteorology (12 hours spin up)


## Access/License

This work is licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0).


## Acknowledgements

This work is part of the joint project ITMS, funded by the German BMBF under reference number 01LK2102D.
This work used resources of the Deutsches Klimarechenzentrum (DKRZ), allocated by the scientific steering committee (WLA) under project ID bb1170 and bm1400.
High resolution emission data as input for the model was prepared by TNO, the Netherlands following the description in [[Super et al. (2020)]](https://doi.org/10.5194/acp-20-1795-2020).


## References

```
Breuer, H. (2021). CORINE dataset for WRF-NoahMP model (v4.3, v4.2) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.4432128  
```
```
Demuzere, M., Kittner, J., Martilli, A., Mills, G., Moede, C., Stewart, I. D., van Vliet, J., and Bechtel, B.: A global map of local climate zones to support earth system modelling and urban-scale environmental science, Earth Syst. Sci. Data, 14, 3835–3873, https://doi.org/10.5194/essd-14-3835-2022, 2022. 
```
```
Super, I., Dellaert, S. N. C., Visschedijk, A. J. H., and Denier van der Gon, H. A. C.: Uncertainty analysis of a European high-resolution emission inventory of CO2 and CO to support inverse modelling and network design, Atmos. Chem. Phys., 20, 1795–1816, https://doi.org/10.5194/acp-20-1795-2020, 2020. 
```
