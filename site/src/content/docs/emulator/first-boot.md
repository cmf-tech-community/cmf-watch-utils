---
title: First boot
description: Create the watch's virtual storage, boot stock firmware, and open the viewer.
---

Complete [Installation](/emulator/installation/) first. The commands
use paths relative to the checkout. On Windows, use `runtime/qemu-system-arm.exe` and add `--runtime-dir` with the path to your MSYS2 `ucrt64/bin` folder. On Ubuntu, use `--gdb gdb-multiarch`.

## Watch Pro 2 storage

QEMU needs files that stand in for the watch's storage. They contain the app,
its fonts and images, and the language setting. These prepared storage files
are called **fixtures** in the CLI. Creating them only writes files on your
computer; it does not connect to or modify a physical watch. The CLI uses the reference
firmware to create these files on your computer.

1. Download the pinned SDK [NAND ID file](https://raw.githubusercontent.com/lvgl/lv_port_actions_technology/26f51e584940d5b141cd1d09d2629d69b595f579/action_technology_sdk/zephyr/tools/prebuilt/leopard/common/bin/nand_id_all.bin)
   and save it as `runtime/nand_id_all.bin`. It tells the stock driver which
   kind of flash chip the emulator presents. You only need that one SDK file.
2. Install an Arm debugger. On Windows, use an Arm GNU Toolchain distribution
   containing `arm-none-eabi-gdb.exe`. Add its `bin` folder to PATH or pass
   the full path in quotes after `--gdb`. Run `arm-none-eabi-gdb --version` to
   check it. The debugger is used here to start the storage setup inside QEMU.
3. Leave at least 250 MiB free on the drive. Run this from the checkout:

```text
uv run cmf-watch-utils emu prepare-fixtures --fixtures fixtures --stock dumps/binaries/firmware/JX402_V1.0.0.73.bin --nand-id runtime/nand_id_all.bin --qemu runtime/qemu-system-arm --rom runtime/compat.bin --provisioner runtime --gdb arm-none-eabi-gdb
```

The command prints where it saved the storage files and logs. The
`fixtures` folder should contain `nor.bin`, `nand-id.bin` and
`nand-defaults.bin`, plus `wfc-index.txt` for stock texture decoding. Keep them
together for future runs. If older fixtures show corrupted watch-face graphics,
prepare a fresh directory with the current CLI to generate the texture index.

## Watch 3 Pro storage

Fetch both stock packages from the [data index](/dumps/). Watch 3 Pro supplies
the guest files. Watch Pro 2 supplies the virtual NAND writer. Use the same
ROM, NAND ID file and debugger as above.

```text
uv run cmf-watch-utils emu prepare-fixtures --profile wp3-stock --fixtures fixtures-wp3 --stock dumps/binaries/firmware/JX402_w3pro_V1.0.1.77.bin --provisioning-stock dumps/binaries/firmware/JX402_V1.0.0.73.bin --nand-id runtime/nand_id_all.bin --qemu runtime/qemu-system-arm --rom runtime/compat.bin --provisioner runtime --gdb arm-none-eabi-gdb
```

Add `--profile wp3-stock` and substitute `fixtures-wp3` for `fixtures` in
the commands below. Keep `wfc-index.txt` beside the flash files. Native
stock fixtures can show the language screen. The [browser preview](/emulator/watch-pro-3/)
starts at the face. With the current desktop CLI, add `--watch-face-preview`
to the Watch 3 Pro stock run for the same starting screen. This completes local
setup for testing; it does not perform Nothing X account pairing.

## Headless boot

First run without opening a window. This checks that the virtual watch starts
and draws something:

```text
uv run cmf-watch-utils emu run --fixtures fixtures --qemu runtime/qemu-system-arm --rom runtime/compat.bin --headless --output runs/first-boot
```

Look for `"panel_frame_captured": true` in the output. QEMU saves a screenshot
as `runs/first-boot/frame.ppm` and its result as `report.json`.

## Open the viewer

Run again with a new output folder:

```text
uv run cmf-watch-utils emu run --fixtures fixtures --qemu runtime/qemu-system-arm --rom runtime/compat.bin --output runs/first-window
```

The window title shows the selected model. For the first-run language
screen, repeat the storage preparation with `--profile wp2-onboarding`,
then add that flag to your boot command. Every boot command needs a new output
folder. Use a different name to keep older results.

Windowed runs select an available speaker backend automatically. Use
`--audio none` for a silent window. To record the speaker output to
`audio.wav` without opening a window, run with `--headless --wav`.

Add `--host-mic` to a windowed run to let guest microphone capture use your
computer's default audio input. Capture starts when the guest starts recording
and stops when it stops or restarts. The host audio backend and microphone
permissions determine whether input samples are available. The guest receives
silence when host capture is disabled or there are no samples ready.

Use `--allow-reboot` to follow the stock firmware through a restart. The
factory menu's DUT confirmation and Exit Factory actions both restart the watch.

In stock firmware, **Advanced → Ambient light (lux)** sets the simulated
ambient light (the range depends on the profile). In the browser, use **Simulation →
Ambient light**. The factory light test displays the simulated value after you
start the measurement.

The vibration motor is not felt, but its drive is logged. Each change is a line in
`motor.log` in the output folder: virtual milliseconds, duty in tenths of a percent and
PWM frequency in hertz, with `0 0` meaning off. The window shows the current state
next to the firmware version.

## Custom firmware

Use `--app local/app.bin` to start an app you built. Add `--sdfs local/sdfs.bin`
if it needs a matching resource archive. Use `--ota-image local/update.bin`
to extract the app and resources from a supported update and boot them directly.
That direct boot checks whether the app starts and renders. Use
[OTA and recovery](/emulator/ota-recovery/) to test transfer and installation.

```text
uv run cmf-watch-utils emu preflight --image local/update.bin
```

For Watch 3 Pro, add `--profile wp3-stock` to the preflight command too.

Preflight means checking a package without running it. The command checks the
target board, checksums, and whether the app and its resources fit. It only
needs the Python workspace and the update file. Some factory packages include
extra partitions. Use [fwkit](/tooling/fwkit/) to inspect those.

## Troubleshooting

| What you see | What to check |
|---|---|
| Firmware hash mismatch or a tiny firmware file | Repeat step 2 in [Setup](/getting-started/setup/) to download the full reference image. |
| `ats3089c-wp2` missing | Point `--qemu` at the executable from the preview archive. |
| QEMU exits before boot | Rerun `emu doctor`. On Windows, check that `--runtime-dir` points to MSYS2's UCRT64 `bin` folder. |
| Storage preparation fails | Check free space, the debugger path, and the numbered GDB, QEMU and UART logs in the reported folder. |
| Headless works but the window fails | Install Tcl/Tk and pass `--wish` with the path to its executable if it is outside PATH. |
