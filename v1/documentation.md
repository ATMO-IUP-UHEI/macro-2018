---
title: Documentation
---
## Input data

- Meteorology: ECMWF ERA5
- Emissions:
    - Anthropogenic: (0.008° x 0.016°) TNO GHGco v4.1 2018 (personal communication Hugo Denier van den Gon, based on [[Super et al., 2020]](https://doi.org/10.5194/acp-20-1795-2020)) 
    - Biogenic: (0.008° x 0.016°) offline VPRM [J. Marshall, personal communication]
- Landuse:
    - non-urban: (250m x 250m) CORINE to USGS (corine2usgs_2012v2020_250m) [Breuer, 2021](https://doi.org/10.5281/zenodo.4432128)
    - urban: (100m x 100m) Local Climate Zones [using w2w v0.5.0](https://github.com/matthiasdemuzere/w2w/tree/30bbaa12032bcbf7ccebdcb4f775f28803416c58) [[Demuzere, 2022]](https://doi.org/10.5194/essd-14-3835-2022)
- Topography: (res cf. below) COP DEM [M. Galkowski, personal communication]

## Domain setup

| Domain no | Name         | Resolution | Extent  | Topography resolution | Grid nudging           | Zarr file                            |
|:----------|:-------------|:-----------|:--------|:----------------------|:-----------------------|:-------------------------------------|
| 1         | Europe       | 15km       | 156x171 | 30s                   | 3h Q, T, U,V above PBL | `/v1/wrfout_d01_2018.zarr`           |
| 2         | Germany      | 5km        | 226x271 | 30s                   | 3h Q, T, U,V above PBL | `/v1/wrfout_d02_2018[_from_04].zarr` |
| 3         | Rhine-Neckar | 1km        | 121x156 | 90m                   | -                      | `/v1/wrfout_d03_2018.zarr`           |
| 4         | Berlin       | 1km        | 176x171 | 90m                   | -                      | `/v1/wrfout_d04_2018.zarr`           |
| 5         | Rhine-Ruhr   | 1km        | 121x131 | 90m                   | -                      | `/v1/wrfout_d05_2018.zarr`           |
| 6         | Nuremberg    | 1km        | 121x131 | 90m                   | -                      | `/v1/wrfout_d06_2018.zarr`           |
| 7         | Munich       | 1km        | 121x131 | 90m                   | -                      | `/v1/wrfout_d07_2018.zarr`           |


## Variables

### WRF tracer fields

| Variable            | Species            | Emiss. type | Inventory | Source type    | Sectors                 |
|:--------------------|:-------------------|:------------|:----------|:---------------|:------------------------|
| CO2_TRAFFIC         | CO<sub>2</sub>     | fossil      | TNO       | area, point    | F1, F2, F3, F4, G, H, I |
| CO2_ANT             | CO<sub>2</sub>     | fossil      | TNO       | area           | all except TRAFFIC      |
| CO2_TST             | CO<sub>2</sub>     | fossil      | TNO       | point          | all except TRAFFIC      |
| CO2_BF              | CO<sub>2</sub>     | bio         | TNO       | area, point    | all                     |
| CO2_VPRM (+407 ppm) | CO<sub>2</sub>     | bio         | VPRM      | -              | -                       |
| CO_ANT              | CO                 | bio, fossil | TNO       | area, point    | all                     |

### Computational structure

The data in this deliverable is grouped in 4 seasons, which were computed in parallel (description cf. below).
Because of the parallel computation of multiple seasons, the concentration fields are not perfectly continuous at season start.
However, to ensure the highest possible continuity in tracer concentrations, each season's simulation was spun up for 1 week before the start of its valid data.
These seasons are then concatenated into the `zarr` files distributed via Swift.

| Seasons name | Valid data range  | Spinup range    |
|:-------------|:------------------|:----------------|
| winter       | 01.01. - 31.03.18 | -               |
| spring       | 01.04. - 30.06.18 | 26.03. - 01.04. |
| summer       | 01.07. - 30.09.18 | 25.06. - 01.07. |
| autumn       | 01.10. - 31.12.18 | 24.09. - 01.10. |

Within each season, in order to minimize deviations from real meteorological conditions, WRF was reinitialized from ERA5 data every 7 days.
