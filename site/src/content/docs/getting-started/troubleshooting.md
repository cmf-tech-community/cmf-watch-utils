---
title: Troubleshooting
description: Help with pairing screens, failed updates, black displays, downloads and emulator setup.
---

Start with the section that matches what you see. Before trying another update,
keep the firmware file and save the updater's log if it offers that option.
Record the watch model and what happened just before the problem.

## The watch shows a pairing code after an update

A pairing screen means the watch has reached its setup screen. It does not, by
itself, mean the firmware is broken or that the update succeeded. An update or
reset may have cleared the watch's connection to its companion app.

1. Let any update progress finish before changing connections.
2. Open Nothing X on your phone and use its add-device flow to set up the watch.
   Follow the prompts on the phone and watch.
3. If the app still lists the old connection but cannot reconnect, remove that
   saved device from the app and try adding it again. Removing a device or
   resetting it may discard settings; read the confirmation before proceeding.
4. After setup, open the watch's About screen and check its firmware version.
   Also check the feature you intended to install.

If Nothing X rejects the code or setup returns to the pairing screen, save the
exact error message. Check that the firmware was built for your watch model.
Repeatedly flashing the same file is not a confirmed fix for a pairing failure.

For **Watch Pro 2 desktop tools**, a reset can also invalidate the saved pairing
credentials. Once the watch has finished restarting, disconnect phone clients
and follow [pairing setup](/tooling/ble-tools/) before retrying a connection.
This is separate from pairing in Nothing X. Physical Watch 3 Pro recovery has
not been verified by this project.

## The updater cannot find or connect to the watch

1. Wake the watch and keep it close to the device running the updater.
2. Close other watch apps. When updating from a computer, turn phone Bluetooth
   off so the phone does not reconnect during the update.
3. Check that Bluetooth is enabled on the updating device. On a phone, grant
   the Bluetooth or nearby-device permissions requested by the app.
4. Try connecting again. If the watch was reset, repeat pairing using the
   instructions for your updater.

A failure before firmware data is sent does not establish that the installed
firmware changed. If the watch is still usable, check its version before deciding
whether another update is needed.

## An update stopped or reported failure

Keep the watch on stable power. Do not interrupt an installation that is still
progressing on the watch. A transfer failure and an installation failure are
different: one happens while sending the file, the other while applying it.

If the watch returns to its normal screen, check the version and reconnect.
Before retrying, confirm that the file matches your model and that its download
is complete. Use the same updater's instructions rather than switching protocols
based only on the appearance of a progress bar.

If it stays on an update screen, repeatedly restarts or becomes unreachable,
see [Watch Pro 2 flashing risks](/devices/cmf-watch-pro-2/limitations/) and
[recovery limits](/devices/cmf-watch-pro-2/internals/recovery/). There is no verified
button sequence that recovers every failed physical watch. The emulator's
recovery controls are not instructions for recovering hardware.

## The screen went black after installing a watch face

First check whether the watch is asleep: wake it using its normal controls.
If it still connects to its companion app, try selecting a built-in watch face
through the app, if that option is available. This is a diagnostic step, not a
guaranteed recovery method.

If the display remains black or the watch repeatedly restarts, stop uploading
faces and record which file caused the problem. Oversized or malformed resources
can prevent the interface from loading. On Watch Pro 2, a firmware update does
not necessarily remove installed watch faces, so reinstalling stock firmware
may leave the same problem in place.

Do not use an unknown factory-menu option as a recovery shortcut. Some options
erase data or shut down the watch. If no usable connection remains, vendor
support or physical diagnosis may be needed.

## A downloaded firmware file cannot be opened

A file downloaded with Git may be a small text pointer instead of the actual
firmware. Follow [reference firmware setup](/getting-started/setup/#2-get-the-reference-firmware-if-your-task-needs-it)
to download the binary through Git LFS. Compare the download's checksum with the
[data index](/dumps/) before using it.

A checksum is a value calculated from a file. A match confirms that your copy
matches the published file; it does not establish compatibility with your watch.

## The desktop emulator does not start

Use the project's QEMU release for your operating system. A general QEMU package
does not include this watch model. Follow [installation](/emulator/installation/),
then [first boot](/emulator/first-boot/) with the firmware and storage files for
the selected model.

Run commands from the repository folder after completing [setup](/getting-started/setup/).
If a command reports a missing file, check its path and whether the file was
actually downloaded. Save the error text before changing any files.

## The browser emulator freezes, goes black or has broken audio

Close unused emulator tabs first; each running watch consumes memory and CPU.
If the page still responds, save the Watch log before restarting. Test the stock
preset to distinguish a problem with a custom image from one affecting the stock
firmware too. Restarting or resetting the virtual watch can discard unsaved state.

Audio may require clicking or tapping the page before the browser permits playback.
Check **Watch sound** under **Simulation → Config** and whether the tab is muted. Slow emulation can
also interrupt audio; a successful browser boot does not guarantee real-time
playback on every device.

## The browser emulator opens without my saved watch state

Open **Simulation → Config** and check **Automatically save watch storage**.
Reopen the same model with the same firmware and app selection. Select any
local uploads again. The status under the switch shows whether a save was
restored or whether browser storage was unavailable.

If the tab closed before the last checkpoint finished, the emulator restores
the previous completed save. Clearing saved watch storage or resetting to
stock can remove the checkpoint. See [Save data in the browser](/emulator/browser-guide/#save-data-in-the-browser).

## Reporting a problem

Include the watch model, firmware version, updater or emulator version, operating
system, and the steps that caused the problem. For browser issues, include the
browser name and version. Describe what you expected and what appeared instead.

Attach the relevant log after removing Bluetooth addresses, serial numbers,
pairing keys, notifications and other personal information. State whether the
problem occurred on a real watch, desktop QEMU or the browser emulator.
