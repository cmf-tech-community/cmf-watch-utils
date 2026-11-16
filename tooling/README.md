# fwkit

Offline toolkit for firmware containers and resources. Watch Pro 2 is the
reference for the format tables; Watch 3 Pro package differences are documented
in its [device reference](https://cmf.arnv.dev/devices/cmf-watch-pro-3/formats/).
Run commands from the repository root after `uv sync --locked`. Supply a local
firmware file at the example path or replace that path with your own.

```bash
uv run fwkit --help
uv run fwkit info   firmware/JX402_V1.0.0.73.bin
uv run fwkit verify firmware/JX402_V1.0.0.73.bin
```

## Modules

| Module | Handles |
|---|---|
| `fwkit.aota` | AOTA container: header, entry table, chunked partitions, rebuild |
| `fwkit.sdfs` | SDFS filesystem: parse, pack, pad to a fixed partition length |
| `fwkit.res` | RES string tables |
| `fwkit.picres` | picture resources and codecs (JPEG, LZ4 raw RGB888/RGB565) |
| `fwkit.sty` | STY UI bundles: scene table, node graph, add/delete scene |
| `fwkit.wfdl` | WFDL watch-face packages: TLV tree, resources, rebuild |
| `fwkit.ajs` | AJS animations: records, tile tables, JPEG frames, repack |
| `fwkit.act` | app.bin ACTH header |
| `fwkit.image` | image helpers |
| `fwkit.lz4` | LZ4 block helpers |
| `fwkit.png` | PNG encode/decode |

## Rules of thumb

1. Prove a byte-identical round-trip before editing a container.
2. Keep the original partition length when a partition is embedded in an AOTA image
   (`fwkit.sdfs.pad_to`).
3. Keep the model and firmware version with your results. Parsing an image does
   not establish that it can be flashed to another model.

Regression tests live in `../tooling/tests/selftest.py` and need a firmware image you provide.
