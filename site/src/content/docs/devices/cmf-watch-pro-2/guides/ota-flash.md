---
title: Flash an AOTA image
description: Prepare, transfer and check a Watch Pro 2 firmware update with the stock BLE client.
---

This guide uses the stock Watch Pro 2 Bluetooth update service, tested with
board JX402 and reference firmware 1.0.0.73. Read the
[flashing risks](/devices/cmf-watch-pro-2/limitations/) first. For custom firmware
exposing the Actions service, use [Actions SDK OTA](/tooling/actions-ota/).
For testing without a watch, use [virtual OTA](/emulator/ota-recovery/).

<span id="0-rollback-preparation"></span>
<span id="1-charging-and-disconnection"></span>

## Prepare the files and connection

Complete [workspace setup](/getting-started/setup/) and run commands from the
repository root. Keep an untouched, matching stock image on your computer.
In these examples, `firmware/custom.bin` is the package you intend to install;
replace that path with your file. Check it before connecting:

```text
uv run fwkit verify firmware/custom.bin
```

This checks package integrity, not hardware compatibility. Start with a charged
watch and stable power. Keep the computer awake and close to the watch. Turn off
phone Bluetooth and close other watch clients to prevent competing connections.

<span id="2-pairing-state"></span>

## Pair and check the watch

For your first connection, follow [pairing setup](/tooling/ble-tools/#pair-a-watch-pro-2).

```text
uv run python tools/cmf_watch.py pair
uv run python tools/cmf_watch.py info
```

Pairing exchanges credentials and saves them locally. If the watch was reset,
the old credentials may no longer work. Check that `info` reports the expected
watch before starting the update.

<span id="3-live-negotiation-to-a040"></span>
<span id="4-full-transfer"></span>

## Transfer the update

This command sends firmware to the physical watch:

```text
uv run python tools/ota_client.py --image firmware/custom.bin -v
```

Leave the connection and power undisturbed until the watch finishes installing
and restarts. The watch requests the parts it needs; requests can jump between
file offsets. The client's reported percentage is bytes served relative to the
whole file and may finish below 100%.

The client handles the final acknowledgement automatically. For protocol work,
see [the stock OTA sequence](/devices/cmf-watch-pro-2/protocol/ota/).
`--dry-run` and `--stop-after-a040` are diagnostic negotiation options: both
connect and send commands to the watch, although neither sends firmware bytes.
They are not offline file checks.

<span id="5-verification"></span>
<span id="interpreting-the-summary"></span>

## Check the result

After the watch restarts, check its About screen and the feature you changed.
Reconnect and run `info` if the installed firmware still provides the stock
service. A custom app may expose a different service, so its own instructions
must explain subsequent updates.

A completed transfer alone does not establish that the new app boots. Keep the
log together with the exact firmware file used. If the watch returns to pairing,
loses its display or cannot reconnect, follow [Troubleshooting](/getting-started/troubleshooting/).

<span id="rollback"></span>
<span id="failure-modes"></span>

## Restoring stock

Identify the firmware currently running on the watch before choosing the updater:

- If it still exposes the stock CMF service, follow this guide using the
  [Watch Pro 2 stock package](/dumps/#jx402_v10073bin-stock-factory-firmware)
  instead of your custom package. Repeat the file check, pairing, transfer and
  post-restart checks.
- If it runs a custom app with Actions OTA, follow that app's restoration
  instructions and the [Actions client reference](/tooling/actions-ota/).
  Do not assume a full stock package is accepted by an app-only updater.
- If it exposes neither service, these Bluetooth clients cannot restore it.
  See [failed-update troubleshooting](/getting-started/troubleshooting/#an-update-stopped-or-reported-failure).

A raw `app.bin` is not a complete stock update package. For a downloaded custom
app, use the author's model-specific packaging and installation instructions;
renaming it does not turn it into an AOTA package. It can instead be tried
through the emulator's [raw application input](/emulator/browser-guide/#load-custom-firmware).


If a compatible update service remains available, use its update procedure with
a known-good stock package for the same model. The older reconstructed 1.0.0.57
image in the data archive is not a verified hardware downgrade procedure.
If the watch no longer exposes an update service, this client cannot establish
a recovery connection. See [recovery limits](/devices/cmf-watch-pro-2/internals/recovery/).
