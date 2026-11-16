---
title: Use the browser emulator
description: Start a virtual watch, try watch faces, load custom firmware and return to stock.
---

The browser emulator runs a virtual watch. Its controls and uploaded files
change that virtual watch, not a physical watch nearby. Stock firmware and the
files needed for the first boot are included.

## Start a watch

1. Open [Watch Pro 2](/emulator/watch-pro-2/) or
   [Watch 3 Pro](/emulator/watch-pro-3/) in a recent desktop Chrome or Edge.
2. Wait for the initial download and startup. **Watch log** shows progress.
   The stock watch face should appear without pairing with Nothing X.
3. Click and drag on the display to tap and swipe. Use the round crown control
   for a press and the adjacent scroll control for rotation.

The model name above the watch switches to the other model's page. Choose the
model your files were made for. If startup fails, follow
[browser troubleshooting](/getting-started/troubleshooting/#the-browser-emulator-freezes-goes-black-or-has-broken-audio).

## Try a watch face

A watch face changes the clock screen. It is different from a firmware package,
which contains application code and possibly resources.

1. Open **FMC watch faces**. [FMC](https://fmc.tools) is the community watch-face catalog.
2. Search by name or author, or change the sort order.
3. Select a face and choose **Apply watch face**. The virtual watch restarts
   to load it; this restart is expected.
4. Check the selected face after startup. If the previous face is still selected,
   hold the watch display to open the stock face picker and inspect its choices.

For a downloaded face, stop emulation with the square control, choose the file
under **Watch face**, then use **Start emulation**. Use a face intended for the
selected model. A successful preview does not guarantee installation on hardware.

## Load custom firmware

First read the download's description. The `.bin` extension alone does not tell
you what a file contains. If the author does not identify its model and file
type, ask before choosing an input.

| Download | Input to use |
|---|---|
| AOTA firmware/update package | **Firmware package** |
| Raw application, usually `app.bin` | **Raw application files → Application image** |
| Companion resources, usually `sdfs.bin` | **Raw application files → Application resources**, alongside its matching app |
| Watch face (`.wfdl`, `.wfc`, or a face distributed as `.bin`) | **Watch face** |
| Prepared virtual NAND storage | **Advanced boot files → Virtual NAND**, only when the build's instructions require it |

1. Stop the running emulation.
2. Select **Custom firmware** under **Boot preset**.
3. Choose either the package or the raw application files. Clear selections from
   a previous experiment using the file input's remove control.
4. Keep bundled base files unless the build instructions explicitly require
   replacements. A normal custom-app preview does not require you to upload
   every file in **Advanced boot files**.
5. Start emulation. Check for the application's expected screen and inspect
   **Watch log** if it fails to start.

Use application resources from the same build when supplied. An application may
start but display missing or broken graphics if its resources do not match.
For Watch Pro 2, the **Bad Apple** preset provides a ready-made example without
building or downloading it yourself.

This workflow loads the selected application into virtual storage and boots it.
It does not test Bluetooth transfer or the update installer. Use
[desktop OTA testing](/emulator/ota-recovery/) for those stages.

## Installable apps from FMC

The [FMC app store](https://fmc.tools/apps) also distributes `.wp2app` packages.
These are different from a raw `app.bin` or an AOTA firmware update. They need
the matching patched Watch Pro 2 firmware and App Loader. Do not put them in
**Application image** or **Firmware package**.

The [CMF Watch SDK](https://github.com/fmctools/cmf-watch-sdk) describes the
loader installation and desktop emulator workflow. The
[community apps repository](https://github.com/fmctools/apps) contains app sources
and publishing instructions. This browser interface does not currently install
`.wp2app` packages. The SDK's documented target is Watch Pro 2 stock 1.0.0.73;
these packages do not establish Watch 3 Pro app compatibility.

## Return to stock

Save **Watch log** before discarding a failed experiment. **Hard reset to stock**
returns the virtual watch to the bundled starting state; it can discard virtual
settings and installed content. It does not restore a physical watch.

For a screenshot, use the camera control. **Include frame in screenshots** under
**Simulation → Display** controls whether the case appears in the image.
