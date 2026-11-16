---
title: Quick start
description: Start the browser emulator, inspect firmware offline, or find a physical Watch Pro 2 over Bluetooth.
---

Choose [Watch Pro 2](/emulator/watch-pro-2/) or [Watch 3 Pro](/emulator/watch-pro-3/)
to try stock firmware in the browser. The offline and BLE examples below use
the Python workspace on your computer.

## Inspect an image offline

Complete [Setup](/getting-started/setup/) and fetch the stock image first.

```text
uv run fwkit info dumps/binaries/firmware/JX402_V1.0.0.73.bin
uv run fwkit verify dumps/binaries/firmware/JX402_V1.0.0.73.bin
```

The inner contents of the image are unpacked for exploration:

```bash
uv run fwkit unpack dumps/binaries/firmware/JX402_V1.0.0.73.bin work/aota
```

## Find a physical Watch Pro 2

Start with a scan. The last two commands expect a watch the tool can already authenticate. Follow [BLE tools](/tooling/ble-tools/) for pairing and connection requirements.

```bash
uv run python tools/cmf_watch.py scan
uv run python tools/cmf_watch.py info
uv run python tools/cmf_watch.py ota-state --duration 5
```

## Watch faces

This uses the Watch Pro 2 sample. Supply a 270 × 270 replacement `icon.png` before running `wf-set-res`.

```bash
uv run fwkit wf-info dumps/samples/watchfaces/wf1.bin --tree
uv run fwkit wf-res  dumps/samples/watchfaces/wf1.bin
uv run fwkit wf-unpack dumps/samples/watchfaces/wf1.bin work/wf1
uv run fwkit wf-set-res dumps/samples/watchfaces/wf1.bin 0 icon.png -o work/wf1_new.bin
uv run python tools/cmf_watch.py wf-flash --file work/wf1_new.bin --dry-run
```

The watch-face dry run prints the upload plan. Try the face in the [browser emulator](/emulator/watch-pro-2/) or follow [Dial editing](/devices/cmf-watch-pro-2/guides/dial-editing/) for a physical upload.

## Emulator and OTA checks

```bash
uv run cmf-watch-utils emu profiles
uv run cmf-watch-utils emu preflight --image local/update.bin
uv run cmf-watch-utils ota actions --image local/actions-update.bin
```

These are offline commands. Continue with the [emulator overview](/emulator/)
for a virtual boot or OTA transfer. Before any physical OTA, review the
[stock flash guide](/devices/cmf-watch-pro-2/guides/ota-flash/) or
[Actions OTA reference](/tooling/actions-ota/) for the service your firmware exposes.
On the stock client, `--stop-after-a040` connects, authenticates and sends live OTA
commands before stopping at the acknowledgement.
