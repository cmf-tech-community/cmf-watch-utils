---
title: Quick start
description: Start the browser emulator, inspect firmware offline, or find a physical Watch Pro 2 over Bluetooth.
---

Choose the task you want to complete. Browser tasks need no watch, phone,
account or command-line installation. Computer commands on this page require
[Setup](/getting-started/setup/) first.

| I want to… | Start here | What I need |
|---|---|---|
| Try a virtual watch | [Browser walkthrough](/emulator/browser-guide/#start-a-watch) | A browser; stock files are included |
| Try an FMC or downloaded watch face | [Load a watch face](/emulator/browser-guide/#try-a-watch-face) | Choose a catalog face or a file for the selected model |
| Run downloaded custom firmware | [Load firmware](/emulator/browser-guide/#load-custom-firmware) | A package, or an app and its matching resources |
| Run the emulator on my computer | [Desktop installation](/emulator/installation/) → [First boot](/emulator/first-boot/) | Workspace, project QEMU runtime and virtual storage |
| Connect my physical Watch Pro 2 | [Pairing](/tooling/ble-tools/#pair-a-watch-pro-2) | Workspace and computer Bluetooth |
| Install firmware or return to stock | [Physical firmware update](/devices/cmf-watch-pro-2/guides/ota-flash/) | A compatible package and a working update service |
| Test the update process without a watch | [Virtual OTA](/emulator/ota-recovery/) | Desktop emulator; loading a file in the browser is a different test |

The examples below are for inspecting and editing files. They are not required
to use the browser emulator.

## Inspect an image offline

Complete [Setup](/getting-started/setup/) and fetch the stock image first.
Run these commands from the repository root:

```text
uv run fwkit info dumps/binaries/firmware/JX402_V1.0.0.73.bin
uv run fwkit verify dumps/binaries/firmware/JX402_V1.0.0.73.bin
uv run fwkit unpack dumps/binaries/firmware/JX402_V1.0.0.73.bin work/aota
```

The first command lists the package contents. The second checks its integrity.
The last writes extracted files to `work/aota` for inspection without changing
the original package.

## Find a physical Watch Pro 2

Follow [pairing setup](/tooling/ble-tools/#pair-a-watch-pro-2) before authenticated
queries. Start with a scan, then check the paired device:

```text
uv run python tools/cmf_watch.py scan
uv run python tools/cmf_watch.py info
uv run python tools/cmf_watch.py ota-state --duration 5
```

## Watch faces

To try an existing face, use the [browser walkthrough](/emulator/browser-guide/#try-a-watch-face).
For editing, follow [Dial editing](/devices/cmf-watch-pro-2/guides/dial-editing/),
which explains the sample file, replacement images and physical upload steps.
A watch-face upload is separate from a firmware update.

## Emulator and OTA checks

After setup, list the available emulator profiles:

```text
uv run cmf-watch-utils emu profiles
```

For a firmware package you already have, replace `local/update.bin` with its path:

```text
uv run cmf-watch-utils emu preflight --image local/update.bin
```

This checks the package offline. For Watch 3 Pro, add `--profile wp3-stock`.
Continue with [First boot](/emulator/first-boot/) to run it on desktop, or
[OTA and recovery](/emulator/ota-recovery/) to test a virtual update.
Physical flashing uses a separate [guide](/devices/cmf-watch-pro-2/guides/ota-flash/).
