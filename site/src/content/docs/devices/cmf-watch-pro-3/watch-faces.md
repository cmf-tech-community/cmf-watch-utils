---
title: Watch faces
description: Watch 3 Pro stock textures, custom face previews and checks for rendering changes.
---

Watch 3 Pro reference firmware 1.0.1.77 contains seven stock `.wfc` faces in
`res_d.bin` (file ID 13). These are distinct from the Watch Pro 2 WFDL examples.
Select Watch 3 Pro when exporting or browsing community faces.

## Preview a face

The [FMC catalog](https://fmc.tools) provides community faces.

In the [browser emulator](/emulator/watch-pro-3/), open **FMC watch faces**,
choose a face and select **Apply watch face**. For a file on your computer,
stop the virtual watch, choose the file under **Watch face**, and start it again.
Applying a face starts a new session with Duskscape replaced in virtual storage.
**Hard reset to stock** restores the bundled starting state.

For desktop, complete [First boot](/emulator/first-boot/#watch-3-pro-storage).
List community faces with:

```text
uv run cmf-watch-utils emu faces --profile wp3-stock
```

Add `--fmc-face ID` to your stock run command using an ID from that list, or add
`--watch-face FILE` with your local file path. These preview operations modify
virtual storage; they do not upload to a physical watch.

## Texture formats

A face contains images used for backgrounds, numbers and hands. Some stock images
store RGB565 color with a separate alpha channel for transparency. Others use
ETC2/EAC block compression. The QEMU renderer decodes these formats when the
stock application draws them.

Vive Lite and BriqBot exercise ETC2/EAC decoding. CitrusDash exercises filtered
alpha images and clipping, where drawing is restricted to a path. The generated
`wfc-index.txt` identifies packed stock textures; keep it with the matching
storage files. Missing or mismatched metadata can produce striped or corrupted
images even when the face otherwise loads.

## Check a rendering change

Compare both the stock picker preview and the selected face. They use different
drawing paths. Check hands, digits, transparency and edges, then switch to another
face and back. Record the firmware, runtime version, selected face and screenshot.

All seven normal stock faces were checked on Windows and in the browser.
Always-on variants and complete animation timing remain outside that result.
A rendered preview does not establish that a face fits or installs on hardware.
See [verification status](/devices/cmf-watch-pro-3/status/).
