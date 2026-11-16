---
title: Methodology
description: How the formats and protocol were recovered, and how to reproduce or extend the work.
---

## Approach

1. **Reversible experiments.** The same bytes are parsed and rebuilt before any change is made.
2. **Separate hypotheses from facts.** A decompiler comment is a hypothesis until a round-trip,
   a live reply, or a boot proves it.
3. **Application capture.** The official app is the reference client for frame layout,
   keys, retries and ordering.
4. **Rollback.** The image being replaced is saved, and the diff kept as small as possible.
5. **Personal data.** MAC addresses, serial numbers, pairing secrets and authkeys are stripped
   from this repository.

## Static analysis

The shared [firmware analysis guide](/contributing/firmware-analysis/) covers
Ghidra import, script exports and address conventions. Device references hold
build-specific addresses and structures. Cross-reference command constants,
strings and callers, then validate the interpretation against a byte-level
check or observed behavior. Decompilation alone does not prove a hardware path.

## Dynamic analysis

- BLE traffic was captured and replayed against the watch with a Python/Bleak client.
- Shell/AT commands were used for identity, battery and sensor checks.
- Watch Pro 2 stock OTA was verified in separate negotiation, transfer and post-reboot checks.
- A successful full flash was accepted only after the watch rebooted and the new animation
  played on the UI.

## Emulated hardware

Record the stock version, model, fixture and interaction. Compare the guest’s
visible behaviour with register, serial or storage evidence. A synthesized
sensor input can verify driver and app behaviour in QEMU. Report physical
measurements and validation separately.

## Format recovery

For each container:

1. The magic, header fields and table are located.
2. The smallest shipped object is decoded.
3. It is re-encoded and compared **byte-for-byte** with the original.
4. Only then is a field edited or a payload replaced.
5. The outer container CRC, entry CRCs and partition checksums are verified.

The regression suite (`tooling/tests/selftest.py`) encodes this discipline. It requires a
legitimate firmware image supplied locally.

## Cross-checking

The public [`fmctools/fmc`](https://github.com/fmctools/fmc) project (AGPL-3.0) was used
as an independent reference for the frame header, AES/CRC rules, `.wfdl` layout and the
watch-face upload handshake. Where older assumptions differed, live-verified FMC behaviour took
precedence. The watch-face uploader is a behavioural port, which is why this repository is
AGPL-3.0.

## Reproducing a result

- Offline: the selftest is run against a locally held firmware image, followed by
  `fwkit info/verify`.
- BLE read-only: `ota-state`, `info` or explicitly read-only shell queries.
- BLE OTA: check the package offline and exercise the protocol over loopback when possible. Retain the previous image.
- Firmware OTA: the [AOTA OTA flow](/devices/cmf-watch-pro-2/protocol/ota/) is followed exactly; INIT2
  is not reordered and the end acknowledgement is not skipped.
