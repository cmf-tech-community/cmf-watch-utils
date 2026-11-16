---
title: Firmware format
description: The 1.0.1.77 update container, application layout and stock watch-face resources.
---

## Firmware package

The `jx402_08` reference package is an outer AOTA containing a nested `TEMP.bin` AOTA. The stock package verifies at the container and file levels and rebuilds byte-for-byte. The seven extracted SDFS archives also rebuild byte-for-byte. This package supplies the application and resources. Bootloader, recovery and the boot-time partition table are outside the package.

```text
uv run fwkit info dumps/binaries/firmware/JX402_w3pro_V1.0.1.77.bin
uv run fwkit verify dumps/binaries/firmware/JX402_w3pro_V1.0.1.77.bin
uv run fwkit unpack dumps/binaries/firmware/JX402_w3pro_V1.0.1.77.bin work/wp3-aota
```

Run these offline from the checkout after [fetching the reference image](/dumps/#jx402_w3pro_v10177bin-stock-firmware). For the command reference see [fwkit](/tooling/fwkit/). Keep WP2 assumptions out of WP3 code unless the corresponding structures have been compared.

The reference package has no trailing A-GPS data. Do not require the Watch Pro 2
trailer when inspecting this build.

## Application image

| Field | Stock 1.0.1.77 |
|---|---|
| Format and architecture | ACTH, little-endian Thumb-2 |
| Load address | `0x10000000` |
| Vector table offset | `0x200` |
| Application size | 2,871,936 bytes |
| Initial stack pointer | `0x2ff9e340` |
| Reset vector | `0x10114b2d` |

In Ghidra, import the extracted app as a raw binary using `ARM:LE:32:Cortex` at the load address above. File offset `0x200` maps to `0x10000200`. Clear the Thumb bit when locating the reset instruction. The binary-analysis setup in the [Ghidra guide](/contributing/firmware-analysis/) is shared; its example function addresses are for Watch Pro 2.

## Watch-face resources

The reference package contains seven stock faces in `res_d.bin`. Their texture
formats, import workflow and rendering checks are covered in
[Watch faces](/devices/cmf-watch-pro-3/watch-faces/).
