---
title: Access using Python
---

## Preparing your environment using Conda

In order to be able to access the OpenStack Swift filesystem, you need a number of packages to be available.
Save the following as a file called `macro_access.yml` and then create a new conda environment using `conda env create -f macro_access.yml`.
```
name: macro_access
channels:
  - conda-forge
  - defaults
dependencies:
  - python=3.12
  - pip
  - xarray
  - zarr=2.18
  - dask
  - fsspec
  - pip:
      - attrs
      - swiftspec
```
Now, activate the newly created environment using `conda activate macro_access`.

## Accessing the data

With the dependencies installed and the environment activated, we can access the data.
First we import the necessary packages:
```
import xarray as xr
from zarr.storage import FSStore, LRUStoreCache
```
Then, we generate a cached filestore from the Objects in the DKRZ OpenStack Swift.
More information regarding the domains can be found [here](documentation.md).
```
domain = 4  # Berlin
url = f"swift://swift.dkrz.de/dkrz_cf06e856-7ed9-4f16-9ffb-3c5526e68a9c/MACRO-2018/v1/wrfout_d{domain:02d}_2018.zarr"

store_nocache = FSStore(url)
store_cached = LRUStoreCache(store_nocache, max_size=2**30)
ds = xr.open_zarr(store_cached)
```
Finally we can use the remote data like it were on our computer locally.
The available WRF meteorology and tracer fields are described in the [documentation page](documentation.md).