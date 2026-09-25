---
layout: default
---

<video controls autoplay muted loop playsinline style="width: 100%; height: auto;">
  <source src="{{ '/assets/video/co2_total_video_dyn.mp4' | relative_url }}" type="video/mp4">
  Your browser does not support the video tag.
</video>


## General

This dataset contains one year of 1km resolved CO<sub>2</sub> and CO enhancement fields as well as meteorology for 5 metropolitan regions in Germany (Rhine-Neckar, Rhine-Ruhr, Berlin, Nuremberg, Munich).
These domains are embedded in the Germany domain at 5km resolution and the Europe domain at 15km resolution.
There are two simulations available using two different WRF boundary layer schemes: MYJ (Mellor-Yamada-Janjic) [Yanjic, 2002] and YSU (Yonsei University) [[Hong, 2006]](https://doi.org/10.1175/MWR3199.1).

- Contacts: <a class="enc" href="znvygb:yhxnf.cvym@vhc.hav-urvqryoret.qr">Lukas Pilz</a>, <a class="enc" href="znvygb:fnanz.ineqnt@hav-urvqryoret.qr">Sanam Vardag</a> ([GHG Simulation Group](https://www.iup.uni-heidelberg.de/de/forschung/atmosphaere/simulation-von-treibhausgasen-in-der-atmosphaere-vardag-gruppe), Institute of Environmental Physics, Heidelberg University)
- Contributors: Hugo Denier van der Gon, Theo Glauch, Julia Marshall
- Cite as: `Pilz, Lukas; Denier van der Gon, Hugo; Glauch, Theo; Marshall, Julia; Vardag, Sanam N. (2025). MACRO-2018 - High-Resolution Simulation of CO and CO2 concentrations over German Metropolitan Areas for 2018 using WRF-Chem. World Data Center for Climate (WDCC) at DKRZ. https://doi.org/10.26050/WDCC/MACRO-2018`
- Time period: 1.1.2018 - 31.12.2018
    - reinitialization every 7 days from ERA5 meteorology (12 hours spin up)

## Access/License

This work is licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0).
This dataset is published on the World Data Centre for Climate repository as [MACRO-2018](https://www.wdc-climate.de/ui/entry?acronym=MACRO-2018) under the DOI [10.26050/WDCC/MACRO-2018](https://doi.org/10.26050/WDCC/MACRO-2018).


## Acknowledgements

This work is part of the joint project ITMS, funded by the German BMBF under reference number 01LK2102D.
This work used resources of the Deutsches Klimarechenzentrum (DKRZ), allocated by the scientific steering committee (WLA) under project ID bb1170 and bm1400.
High resolution emission data as input for the model was prepared by TNO, the Netherlands following the description in [[Super et al. (2020)]](https://doi.org/10.5194/acp-20-1795-2020).


## References

```
Janjic, Z. I., 2002: Nonsingular Implementation of the Mellor–Yamada Level 2.5 Scheme in the NCEP Meso model, NCEP Office Note, No. 437, 61 pp.
```
```
Hong, S., Y. Noh, and J. Dudhia, 2006: A New Vertical Diffusion Package with an Explicit Treatment of Entrainment Processes. Mon. Wea. Rev., 134, 2318–2341, https://doi.org/10.1175/MWR3199.1.
```
```
Breuer, H. (2021). CORINE dataset for WRF-NoahMP model (v4.3, v4.2) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.4432128  
```
```
Demuzere, M., Kittner, J., Martilli, A., Mills, G., Moede, C., Stewart, I. D., van Vliet, J., and Bechtel, B.: A global map of local climate zones to support earth system modelling and urban-scale environmental science, Earth Syst. Sci. Data, 14, 3835–3873, https://doi.org/10.5194/essd-14-3835-2022, 2022. 
```
```
Super, I., Dellaert, S. N. C., Visschedijk, A. J. H., and Denier van der Gon, H. A. C.: Uncertainty analysis of a European high-resolution emission inventory of CO2 and CO to support inverse modelling and network design, Atmos. Chem. Phys., 20, 1795–1816, https://doi.org/10.5194/acp-20-1795-2020, 2020. 
```
