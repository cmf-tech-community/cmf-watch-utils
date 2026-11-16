---
title: Firmware and watch faces
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

## Application image

| Field | Stock 1.0.1.77 |
|---|---|
| Format and architecture | ACTH, little-endian Thumb-2 |
| Load address | `0x10000000` |
| Vector table offset | `0x200` |
| Application size | 2,871,936 bytes |
| Initial stack pointer | `0x2ff9e340` |
| Reset vector | `0x10114b2d` |

In Ghidra, import the extracted app as a raw binary using `ARM:LE:32:Cortex` at the load address above. File offset `0x200` maps to `0x10000200`. Clear the Thumb bit when locating the reset instruction. The binary-analysis setup in the [Ghidra guide](/devices/cmf-watch-pro-2/guides/ghidra/) is shared; its example function addresses are for Watch Pro 2.

## Watch-face resources

Seven stock faces were recovered as `.wfc` resources in `res_d.bin` (file ID 13). The stock update also contains a populated `res_b.bin`. They use a different resource format from the [Watch Pro 2 WFDL examples](/devices/cmf-watch-pro-2/formats/watchface/). Watch 3 Pro stock captures include packed RGB565 with alpha and ETC2/EAC textures. Vive Lite and BriqBot exercise ETC2/EAC decoding; CitrusDash exercises filtered and path-clipped alpha draws. Test the selected face in the picker and on the watch face itself because those views use different drawing paths.

For a face from [Facemaker Central](https://github.com/cmf-tech-community/fmc), select the model before browsing or exporting. In the browser, choose the face through **FMC watch faces** or select a compatible file under **Watch face**. Applying it starts a new virtual session with Duskscape replaced. See the [emulator file workflow](/emulator/#watch-faces-and-custom-firmware) for desktop and browser inputs. A virtual render does not establish that a package fits or installs on hardware.
