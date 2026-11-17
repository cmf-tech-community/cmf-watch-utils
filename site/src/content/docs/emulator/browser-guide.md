---
title: Use the browser emulator
description: Start a virtual watch, save its storage, load watch faces, firmware or apps, and share a setup.
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

## Save data in the browser

**Simulation → Config** separates three kinds of local storage:

- **Cache downloads** keeps downloaded firmware, app packages, watch faces and emulator files for reuse. It is enabled by default. Clearing the download cache does not erase saved watch data. The cache is limited to 256 MB; older entries are removed as needed.
- **Remember settings** retains simulation controls, sound and appearance choices separately for each watch model. It is enabled by default. Uploaded files must be selected again.
- **Automatically save watch storage** preserves the virtual watch’s NOR and NAND flash, including settings, installed apps and history that its firmware has written. It is enabled by default and can be turned off. Saves are separated by model and the contents of the selected firmware, resources and apps; a different selection starts with its own storage.

With automatic saving enabled, the emulator saves once stock is ready, after interactions settle and every 15 seconds while visible. It also attempts a save when the page becomes hidden, and finishes a save before **Stop**, model changes and firmware switches. Reopening the same firmware restores its saved storage automatically. **Save now** is an optional shortcut.

The save status shows when the latest checkpoint finished. An abrupt tab closure, browser crash or power loss can interrupt a pending save; changes since the last completed checkpoint may be lost. This is a flash checkpoint, not a suspended CPU session: the watch boots again when reopened, and changes the firmware has not written to flash are not included.

Cached files avoid repeat downloads. They do not eliminate firmware boot time, decompression or emulator startup. Switching models does not copy one model’s saved storage to the other. A share link contains selections, not your saved watch data or local uploads.

**Protect saved data** asks your browser to keep this site's saves and downloads when disk space runs low. The browser may decline. Clearing site data still removes the files, even if the browser granted protection.

**Clear saved data** has separate controls for downloaded files, remembered controls and all saved watch storage for the current model. Clearing saved watch storage does not interrupt the running watch; restart it to use fresh storage. **Hard reset to stock** discards the current saved state and starts a fresh stock watch.

## Simulate hardware inputs

### Battery

The battery slider sets the percentage reported by supported stock firmware.
This is a testing override, not a battery-discharge model. Custom firmware uses
the simulated voltage and its own battery driver instead.

### Optical sensors

Under **Optical sensors**, **Set measurement results** supplies the chosen
heart-rate and blood-oxygen values directly. On Watch 3 Pro, turn on **Simulate
optical sensor signals** and **Watch is worn** to send a repeating test pulse to
the stock sensor driver. Open Heart rate or Blood oxygen on the watch and let
the firmware calculate the result. Turn off signal simulation to enter exact
values again.

### Orientation and rotation

Under **Simulation → Orientation**, drag the small watch model or focus it and
use the arrow keys. Its tilt sets the gravity readings supplied to the watch.

On Watch 3 Pro, **Follow model movement** also produces gyroscope readings while
the model rotates. These readings describe rotation speed in degrees per second,
not the angle of the watch. They return to zero when movement stops, even if the
watch remains tilted. Disable this option to enter constant X, Y and Z rotation
rates for a sensor test. The model gesture controls tilt; manual Z input also
allows tests of rotation around the face's perpendicular axis.

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

1. Stop emulation and select **Apps firmware** under **Boot preset**.
2. The compatible patched firmware and App Loader are selected automatically.
   Their names and versions appear above the app list.
3. Choose an app from **FMC apps** and click **Add selected app**, or select one
   or more local `.wp2app` files under **Add apps**. Up to eight apps fit in the
   loader's slots. Each selected file has a **Remove** control.
4. Start emulation. The browser downloads the firmware and loader, checks the
   packages, and installs them into virtual storage before booting.
5. Open **Apps** in the watch's menu and select an installed app.

The browser prepares the virtual storage automatically. With automatic saving
enabled, reopening the same firmware, loader and app selection restores the
last saved storage. Catalog apps can be reselected from the session URL.
Select local uploads again after reloading.

This profile currently supports Watch Pro 2. Watch 3 Pro shows an unavailable
message because no compatible patched firmware and loader are configured.
The [CMF Watch SDK](https://github.com/fmctools/cmf-watch-sdk) describes app
development. The [community apps repository](https://github.com/fmctools/apps)
contains sources and publishing instructions.

### Share a configured session

Catalog selections update the page URL. **Share session** copies a link to the
selected firmware, loader, apps and watch face. Local uploads cannot be included;
recipients must select those files themselves. The link recreates the boot
configuration, not the running watch's memory or saved settings.

The firmware catalog remains available while emulation runs. **Use selected
firmware** restarts the virtual watch when necessary to apply the selection.

Append FMC record IDs to the model page's URL:

| Parameter | Selection |
|---|---|
| `watchface=<id>` | A watch face for that model |
| `firmware=<id>` | One firmware catalog record |
| `loader=<id>` | One compatible App Loader record |
| `app=<id>` | An app; repeat this parameter for multiple apps |

For example, `/emulator/watch-pro-2/?app=pyccglfsfijw463` loads Orbit and selects
the compatible firmware and loader automatically. Add
`&app=m00yj6hopd9a0zs` to include Sky Hop. Selections appear in the corresponding
controls before startup. An explicit firmware or loader replaces that automatic
selection and must be compatible with the apps.

IDs refer to catalog records, not immutable releases: the files behind a record
can change when its author updates it. Invalid IDs, incompatible models and
unsupported combinations produce an error rather than silently booting stock.
Firmware packages with resources that differ from the bundled base require
matching virtual storage; selecting a catalog entry does not make every firmware
version compatible. **Hard reset to stock** clears URL selections as well.

## Return to stock

Save **Watch log** before discarding a failed experiment. **Hard reset to stock**
returns the virtual watch to the bundled starting state; it can discard virtual
settings and installed content. It does not restore a physical watch.

For a screenshot, use the camera control. **Include frame in screenshots** under
**Simulation → Display** controls whether the case appears in the image.
