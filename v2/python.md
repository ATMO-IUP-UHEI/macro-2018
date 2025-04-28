---
  title: Access using Python
---
## Preparing your environment using Conda

In order to be able to access the S3 filesystem, you need the following packages to be available.
Save this as a file called `macro_access.yml` and then create a new conda environment using `conda env create -f macro_access.yml`.
```
name: macro_access
channels:
  - conda-forge
  - defaults
dependencies:
  - python=3.12
  - pip
  - xarray
  - zarr=2.18.5
  - s3fs
```
Now, activate the newly created environment using `conda activate macro_access`.

## Accessing the data

With the dependencies installed and the environment activated, we can access the data.
First we import the necessary packages and choose the data we want to look at:
```
import xarray as xr
domain = 4  # Berlin
blscheme = "MYJ"
```
More information regarding the domains can be found [here](documentation.md#domain-setup).
Then, we access the DKRZ S3 store using caching in order to reduce latency and traffic.
```
s3_path = f"s3://bb1170/public/MACRO-2018/{blscheme}/wrfout_d{domain:02d}.zarr"

s3_options = dict(
        anon=True,
        client_kwargs=dict(
            endpoint_url="https://s3.eu-dkrz-1.dkrz.cloud/"
        )
    )
cache_options = dict(
        cache_storage="/tmp/zarr_cache"
    )

# Open the datatree directly
ds = xr.open_datatree(
        f"simplecache::{s3_path}",
        engine="zarr",
        consolidated=True,
        storage_options=dict(
            s3=s3_options,
            simplecache=cache_options,
        )
    )
```
Finally we can use the remote data like it were on our computer locally.
The available WRF meteorology and tracer fields are described in the [documentation page](documentation.md#data-structure).