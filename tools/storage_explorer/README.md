# Storage Explorer

Editable sources for `/storage-explorer/watch-pro-2/` and its portable downloads.
The reviewed `data.json` contains reference metadata and aggregate evidence, not
firmware bytes, raw dumps, installed apps or personal record values. Stock
firmware version and package hash identify the resource inventory. Captured
device observations are kept separate from stock package contents.

From the repository root, rebuild with Python 3.12 or later:

```sh
python tools/storage_explorer/build.py
```

Alternatively, use the project's Python environment:

```sh
uv run --locked python tools/storage_explorer/build.py
```

The script uses only the Python standard library. It validates hierarchy sums,
IDs and explicit address bounds and writes the page and four reference downloads
to `site/public/storage-explorer/watch-pro-2/`. SVG and PNG posters are generated
in the browser. No watch connection, private dump, firmware extraction, network
request or vendor SDK is required to regenerate the site files. Normal Astro
builds copy the committed generated files and do not invoke Python.

Update sources here and regenerate the public files together. Do not hand-edit
generated HTML. Keep verification limits and evidence provenance when changing
labels; a known partition purpose does not establish factory contents, free
space or safe reuse. The JSON schema and Markdown come from
`reference_exports.py` and share the same hierarchy as the interactive page.

Lilex is distributed under SIL OFL 1.1; its license is in `assets/Lilex-OFL.txt`
and embedded in the HTML. Other downloadable files contain metadata only.

## Verification

From the repository root:

```sh
python -m unittest discover -s tests -p test_storage_explorer.py -v
```

The tests cover physical/logical accounting, all partition ranges and purposes,
the writable-storage evidence boundary, the captured resource-checksum warning,
and the distinction between exercise animations and watch faces. After a UI
change, also build the site, follow the storage-docs link to the explorer and
back, test Map/List and search, check narrow-screen layout, and exercise all
download formats. Open the downloaded HTML offline and check navigation and
re-export without network access.
