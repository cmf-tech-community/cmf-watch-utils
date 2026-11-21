---
title: Firmware flashing risks and limitations
description: What to check before flashing a CMF Watch Pro 2, what can fail, and what recovery options are verified.
---

A failed firmware update can leave the **CMF Watch Pro 2** unable to start.
If the watch stops booting, its Bluetooth update service may become unavailable.
There is no verified physical recovery procedure that covers every failure.

<span id="flashing-risks"></span>
<span id="ethical-and-legal-limits"></span>

## Before flashing

- **Match the model and board.** These hardware results apply to Watch Pro 2
  board `JX402` (`jx402_01_3089c` in the update package), with stock firmware
  `1.0.0.73` as the reference. Use firmware explicitly built for your board.
  Watch 3 Pro uses a different package.
- **Check the image.** For a downloaded firmware file, compare its SHA-256 with
  the publisher's checksum when available. The `fwkit verify` command checks
  the internal checksums of an AOTA firmware package. Those checks establish
  file integrity. Compatibility and successful boot require separate testing.
- **Keep a matching stock image on your computer.** You can use it to restore
  stock if the watch still exposes a compatible Bluetooth update service.
  Keep a copy of the exact file you install so you can identify the build if
  something fails.
- **Keep power and Bluetooth stable.** Start with the watch charged and the host
  awake. If using FMC on your phone, disconnect any competing watch client.
  Leave the update client connected until the watch finishes installing and
  restarts. Transfer time depends on the package and Bluetooth connection.

See the [reference firmware downloads](/dumps/) and the
[desktop flashing guide](/devices/cmf-watch-pro-2/guides/ota-flash/).

## If the update fails

| What the watch does | What to check |
|---|---|
| Restarts into its usual interface | Check the firmware version and reconnect before retrying. If the watch was reset, pair it again because the previous Bluetooth credentials may be stale. |
| Shows an update or recovery screen | Check whether your updater can still connect. A visible progress bar alone only confirms the screen is active. Recovery depends on which update service is available in that state. |
| Stays black or repeatedly restarts | Stop repeated transfers. If the watch still connects, record its version and visible update services. If it remains unreachable, physical diagnosis or vendor service may be needed. |

An interruption can happen while the watch receives the package or while it
installs it. A failed transfer may leave the previous firmware working, but
the outcome depends on the point of failure. The Watch Pro 2 AOTA packages
documented here update the application and resources. They do not replace the
bootloader, which is the code that starts the watch before the app. A stock
package cannot repair an inaccessible or damaged bootloader through this path.
See [Recovery & boot modes](/devices/cmf-watch-pro-2/internals/recovery/).

<span id="emulator-limits"></span>
<span id="tested-scope"></span>

## What the emulator can verify

Use the [browser emulator](/emulator/watch-pro-2/) to check whether a supported
firmware package boots and draws a usable screen. Desktop QEMU can also test
Bluetooth transfer, guest validation, reboot and installation into virtual
storage. Its crown-and-charger test restores a broken virtual app using the
emulator's recovery model. Physical bootloader behaviour, recovery after
power loss, and recovery with a broken Bluetooth service still require
hardware evidence. [Virtual OTA and recovery](/emulator/ota-recovery/)

<span id="storage-ceiling"></span>
<span id="protocol-and-access-limitations"></span>
<span id="unresolved-formats-and-internals"></span>

## Watch faces and firmware resources

A watch-face upload is a separate operation from a firmware update. A malformed
or oversized face can still prevent the stock interface from loading. The stock
AOTA packages documented here leave the partition holding user-installed faces
outside the update, so reinstalling firmware may leave the offending face
in place. See [Watch-face editing and upload](/devices/cmf-watch-pro-2/guides/dial-editing/)
for validation and upload guidance.

Firmware resource partitions have fixed capacities. A replacement must fit the
partition after rebuilding, including alignment and padding. See the
[SDFS format and capacity reference](/devices/cmf-watch-pro-2/formats/sdfs/)
when building or changing a package.

The [storage reference](/devices/cmf-watch-pro-2/internals/storage/) distinguishes
physical capacity, partition reservations and writable file storage.
[Storage Explorer](/storage-explorer/watch-pro-2/) shows the verified layout.
Unpartitioned or erased-looking regions are not verified expansion space.

For help with connection failures, pairing screens and failed downloads, see
[Troubleshooting](/getting-started/troubleshooting/).
