---
title: Watch emulator
description: What the QEMU preview supports and where to start.
---

The emulator runs stock CMF Watch Pro 2 and Watch 3 Pro firmware on your
computer. Both profiles support custom application boots. Desktop virtual OTA
has model-specific test coverage described in [OTA and recovery](/emulator/ota-recovery/).

## Browser preview

For step-by-step instructions, start with [Use the browser emulator](/emulator/browser-guide/).

Open either model in a recent desktop version of Chrome or Edge. Stock firmware
starts automatically. Select the model name above the virtual watch to switch.

- [Watch Pro 2](/emulator/watch-pro-2/) supports stock firmware, custom builds, the Bad Apple preset, and the FMC watch-face catalog.
- [Watch 3 Pro](/emulator/watch-pro-3/) opens the stock watch face on firmware `1.0.1.77`, with the charger disconnected and the display kept awake. Use **Watch color** to switch cases or **Custom firmware** to load an AOTA with application and SDFS images or raw Watch 3 Pro files. Desktop QEMU can boot to first-time setup for QR testing. End-to-end Nothing X pairing remains unverified on Watch 3 Pro.

### Display, audio and inputs
The first boot downloads the virtual storage and can take a moment. **Watch log**
shows the guest's progress. **Motor log** shows when the virtual watch vibrates,
including its duty cycle and frequency. On browsers that support vibration,
**Watch vibration** replays the pulse timing on your phone after you interact
with the page. Your phone controls the strength and feel of each pulse.
Use the touchscreen and crown, change brightness,
or simulate battery, motion, GPS and optical sensor readings.
Stock starts at the highest manual brightness in the watch's own settings.
The browser brightness slider adjusts the rendered display separately.
The virtual speaker is on by default. If your browser blocks autoplay, tap or
click the emulator to start audio. Use **Watch sound** under **Simulation →
Display** to mute it. If the virtual watch runs slowly, audio stretches to
keep pace while preserving pitch.
The stock preview plays the built-in ACT sounds through the virtual speaker.
You can preview a ringtone by changing the volume in the watch’s **Sounds**
settings. Bluetooth call audio requires additional DSP support.
**Battery level** sets the reported percentage in stock firmware. With a
custom app, the slider changes the simulated battery voltage and the app
decides how to report it.

### Watch faces and custom firmware

Choose **Display test** from **Boot preset** to run a bundled custom firmware.
Press the crown to change the pattern’s color. **Hard reset to stock** discards
the running session and boots stock again. Under **Custom firmware**, **Advanced
boot files** lets you supply a different virtual NAND image or override the
prepared base files.
Use the camera button to save the circular display as a transparent PNG.
Turn on **Include frame in screenshots** under **Display** to include the case.

Open **FMC watch faces** to browse the [FMC](https://fmc.tools) catalog for the selected model. Search by
title or creator and sort by newest, most downloaded, or most flashed. Choose a
face, then select **Apply watch face** to install it at boot. Applying restarts
a running watch. To use a local face file, stop the watch, select the file
under **Watch face**, and start it again. To try your own build, select **Custom
firmware**, then select an AOTA for the active model
under **Firmware package**, or select the application and companion SDFS
separately under **Raw application files**.

On Watch Pro 2, select **Bad Apple** from **Boot preset** to run the bundled demo.
For an example of a custom Zephyr application, see the
[Bad Apple source](https://github.com/fmctools/firmware-wp2-badapple) and
[case study](/devices/cmf-watch-pro-2/guides/bad-apple/).
For Bluetooth OTA and recovery tests, use desktop QEMU.

On phones and devices that report limited memory, the browser limits display
updates to about 30 fps to reduce work. The watch firmware still runs in software,
so boot times and animation speed depend on the host device.
The bundled Bad Apple preset uses a clock setting tuned for playback. Use a
custom firmware boot or desktop QEMU for tests that depend on guest timing.

### Watch 3 Pro passcodes and optical measurements

In **Simulation → Optical sensors**, enable **Feed raw optical samples** and
**Watch is worn**. Open **Heart rate** or **Blood oxygen** in the virtual watch
to measure the synthetic signal with the stock app. **Simulate readings**
supplies values directly for UI tests.

For a passcode test, open **Settings → Passcode** on the virtual watch and
set a numeric or gesture passcode. With **Off-wrist detection** enabled,
return to the face with **Watch is worn** on, then switch it off to lock.
Enter the test passcode to unlock. Both flows are verified on the hosted
preview. Use a disposable test code. Retention across a browser reload is unverified.

### Base firmware files

The browser includes the stock files needed to boot. Use **Advanced boot
files** when your test needs a different starting image. The emulator uses
its bundled version for each file you leave out.

| File | What it does |
|---|---|
| `app.bin` | Stock application used when booting stock. A custom app is selected through the main firmware inputs. |
| `nor.bin` | The small flash image containing boot parameters and application partitions. Custom app and resource files are placed in this image. |
| `nand-defaults.bin` | The larger flash image containing resources and settings. **Virtual NAND** supplies a replacement for this file. |
| `compat.bin` | The emulator's compatibility ROM, which provides the services the watch app expects at boot. |
| `nand-id.bin` | The chip identification table used by the NAND driver. |
| `wfc-index.txt` | Texture information used to render stock watch faces. |
| `stock-audio.bin` | Prepared stock ringtone, alarm and prompt samples for the virtual speaker. |

## Desktop emulator

| Page | What you will do |
|---|---|
| [Installation](/emulator/installation/) | Install the command line tools, download the QEMU and ROM archives, and check the host libraries. |
| [First boot](/emulator/first-boot/) | Create the virtual storage from the reference firmware, boot stock, and open the watch window. |
| [OTA and recovery](/emulator/ota-recovery/) | Transfer an update over simulated Bluetooth and check the installed app after reboot. |

Run `uv run cmf-watch-utils emu faces --search "LCD" --sort downloads` to
browse FMC from the desktop CLI. Copy the face's `id` and add
`--fmc-face ID` to your stock `emu run` command. For a file on your computer,
use `--watch-face FILE`. These replace Activity Mood on Watch Pro 2 or Duskscape on Watch 3 Pro. For Watch 3 Pro, pass `--profile wp3-stock` to both `emu faces` and `emu run`.

## Profiles

| Profile | Where the watch starts |
|---|---|
| `wp2-stock` | Stock firmware `1.0.0.73`, after language selection. Start here. |
| `wp2-onboarding` | The same firmware, at first-time setup. |
| `wp3-stock` | Watch 3 Pro stock `1.0.1.77`. Native fixtures can boot to first-time setup. |

Use the Watch Pro 2 profiles only for board JX402. They share the same
virtual hardware and use different starting storage.

## Scope

The preview has booted stock, Bad Apple, and Tilt Mouse on Windows. Watch Pro 2 virtual recovery can restore a broken app in QEMU. Real-watch bootloader
behavior, electrical faults, and recovery after power loss remain outside
that test. See [Recovery & boot modes](/devices/cmf-watch-pro-2/internals/recovery/).
