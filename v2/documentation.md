---
title: Documentation
---

## Input data

- Meteorology: ECMWF ERA5
- Emissions:
    - Anthropogenic:
        - Germany, BeNeLux, eastern France: (0.008° x 0.016°) TNO GHGco v4.1 2018 (personal communication Hugo Denier van den Gon, based on [[Super et al., 2020]](https://doi.org/10.5194/acp-20-1795-2020)) 
        - Elsewhere: (0.05° x 0.1°) TNO GHGco v4.0 2018 (personal communication Hugo Denier van den Gon, based on [[Super et al., 2020]](https://doi.org/10.5194/acp-20-1795-2020)) 
    - Biogenic:
        - `CO2_VPRM`: (0.008° x 0.016°) offline VPRM [J. Marshall, personal communication]
        - `CO2_VPRM_V2`: (1km x 1km) offline VPRM, new version [[T. Glauch, personal communication]](https://doi.org/10.5194/egusphere-2024-3692)
- Landuse:
    - non-urban: (250m x 250m) CORINE to USGS (corine2usgs_2012v2020_250m) [[Breuer, 2021]](https://doi.org/10.5281/zenodo.4432128)
    - urban: (100m x 100m) Local Climate Zones [using w2w v0.5.0](https://github.com/matthiasdemuzere/w2w/tree/30bbaa12032bcbf7ccebdcb4f775f28803416c58) [[Demuzere, 2022]](https://doi.org/10.5194/essd-14-3835-2022)
- Topography: (res cf. below) COP DEM [M. Galkowski, personal communication]

## Domain setup

| Domain no | Name         | Resolution | Extent  | Topography resolution | Grid nudging           | Zarr file                            |
|:----------|:-------------|:-----------|:--------|:----------------------|:-----------------------|:-------------------------------------|
| 1         | Europe       | 15km       | 156x171 | 30s                   | 3h Q, T, U,V above PBL | `[MYJ,YSU]/wrfout_d01.zarr`           |
| 2         | Germany      | 5km        | 226x271 | 30s                   | 3h Q, T, U,V above PBL | `[MYJ,YSU]/wrfout_d02.zarr` |
| 3         | Rhine-Neckar | 1km        | 121x156 | 90m                   | -                      | `[MYJ,YSU]/wrfout_d03.zarr`           |
| 4         | Berlin       | 1km        | 176x171 | 90m                   | -                      | `[MYJ,YSU]/wrfout_d04.zarr`           |
| 5         | Rhine-Ruhr   | 1km        | 121x131 | 90m                   | -                      | `[MYJ,YSU]/wrfout_d05.zarr`           |
| 6         | Nuremberg    | 1km        | 121x131 | 90m                   | -                      | `[MYJ,YSU]/wrfout_d06.zarr`           |
| 7         | Munich       | 1km        | 121x131 | 90m                   | -                      | `[MYJ,YSU]/wrfout_d07.zarr`           |


## Variables

### WRF tracer fields

The `BCK` fields using CAMS are initialized with CAMS concentrations and the beginning and the largest domain uses the CAMS concentration fields as boundary conditions.
The `VPRM` fields are offset by 407 ppm.

| Variable in dataset       | Species            | Emiss. type | Inventory  | Source type    | Sectors                 |
|:--------------------------|:-------------------|:------------|:-----------|:---------------|:------------------------|
| CO2_TRAFFIC               | CO<sub>2</sub>     | fossil      | TNO        | area, point    | F1, F2, F3, F4, G, H, I |
| CO2_AREA                  | CO<sub>2</sub>     | fossil      | TNO        | area           | all except TRAFFIC      |
| CO2_POINT                 | CO<sub>2</sub>     | fossil      | TNO        | point          | all except TRAFFIC      |
| CO2_BF                    | CO<sub>2</sub>     | bio         | TNO        | area, point    | all                     |
| CO2_VPRM (+407 ppm)       | CO<sub>2</sub>     | bio         | VPRM       | -              | -                       |
| CO2_VPRM_V2 (+407 ppm)    | CO<sub>2</sub>     | bio         | VPRM       | -              | -                       |
| CO2_BCK                   | CO<sub>2</sub>     | bio, fossil | CAMS conc. | all            | all                     |
| CO_ANT                    | CO                 | bio, fossil | TNO        | area, point    | all                     |
| CO_BCK                    | CO                 | bio, fossil | CAMS conc. | all            | all                     |

### Computed variables

The following variables are computed from some of the above WRF output fields.

| Display Name       | Variable in dataset       | Calculation                                               |
|:-------------------|:--------------------------|:----------------------------------------------------------|
| Anthropogenic CO2  | CO2_ANTHRO                | CO2_TRAFFIC + CO2_AREA + CO2_POINT + CO2_BF               |
| Total CO2          | CO2_TOTAL                 | CO2_ANTHRO + CO2_BCK + CO2_VPRM - 407.                    |
| Total CO2 (Bio v2) | CO2_TOTAL_V2              | CO2_ANTHRO + CO2_BCK + CO2_VPRM_V2 - 407.                 |
| Total CO           | CO_TOTAL                  | CO_ANT + CO_BCK                                           |
| Wind Speed         | wind_speed                | [metpy.calc.wind_speed](https://unidata.github.io/MetPy/latest/api/generated/metpy.calc.wind_speed.html)([wind_speed_north, wind_speed_east](https://github.com/xarray-contrib/xwrf/blob/7fa32f81a01f3b47fc319d8087c3bb6732240dcc/xwrf/postprocess.py#L201-L216))  |

### Computational structure

In order to minimize deviations from real meteorological conditions, WRF was reinitialized from ERA5 data every 7 days.
