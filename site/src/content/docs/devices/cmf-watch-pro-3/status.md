---
title: Watch 3 Pro support and verification
description: Results for stock firmware 1.0.1.77, separated by offline, desktop, browser and physical testing.
---

These results apply to stock firmware **1.0.1.77**, board **jx402_08**.
Desktop results below used Windows. A passing emulator test establishes
behavior with simulated hardware, not physical device compatibility.

## Firmware and display

| Area | Verified result | Limit |
|---|---|---|
| Package tools | Reference AOTA and seven SDFS archives rebuilt byte-for-byte. | Changes need their own checks; parser success does not prove boot. |
| Stock boot | Desktop and browser reach the launcher and accept touch and crown input. | The emulator supplies a compatibility ROM and prepared storage. |
| Browser storage | The hosted emulator completed an automatic save, restored it after closing and reopening the tab, and reached the stock UI. | Retention of specific passcodes and optical history was not part of this test. |
| Stock faces | All seven normal stock faces and picker transitions were checked in Windows QEMU and the browser. | Always-on variants and every animation state were not covered. |
| Custom app | Browser application and package imports booted test images; desktop booted an installed graphics test app. | Use an image built for the selected model. |
| Passcodes | Browser tests covered numeric and gesture setup, off-wrist locking, rejected wrong entries and successful unlock. | Browser reload retention remains unverified. |

## Sensors, sound and factory tests

| Area | Recorded result | Limit |
|---|---|---|
| Touch | Desktop drawing and touch-grid tests responded to simulated input. | Does not establish physical touch-controller timing. |
| Crown | Desktop factory encoder test accepted presses and both rotation directions. | Full matched desktop/browser factory coverage is incomplete. |
| Motion | Desktop level, tilt and gyro tests responded to supplied values. | No physical calibration or sensor-noise validation. |
| Light | Desktop stock test displayed supplied lux and recorded a pass. | Shared controls alone do not establish identical browser results. |
| GPS | Desktop stock factory screen updated between simulated coordinate pairs. | No satellite acquisition or radio test. |
| Optical | Stock calculated heart rate and blood oxygen from raw synthetic samples and displayed history on desktop and browser. | Retention of optical history across a browser reload remains unverified. |
| Speaker and microphone | Desktop speaker/aging tests captured non-silent output; Windows microphone capture supplied PCM to the guest. | No completed four-hour aging run or complete browser microphone parity. |
| Motor | Desktop stock motor tests produced logged on/off transitions. | Browser vibration strength depends on the host device. |

The factory screens include operator-selected PASS buttons. A manually selected
PASS is not an independent hardware measurement. Full, partial and finished-unit
sequences, manufacturing radio modes and extended aging still need complete runs.

## Updates and recovery

A small app-and-resources package completed stock virtual Bluetooth transfer,
validation and reboot. The host installed the captured payload into virtual flash,
and the resulting app rendered. See [OTA coverage](/emulator/ota-recovery/#watch-3-pro-update-coverage)
for the distinction between guest validation and the host installer.

Full stock resource updates, interrupted-update recovery and automatic payload
extraction from arbitrary Watch 3 Pro NAND snapshots remain unverified.
Physical OTA, physical bootloader recovery and end-to-end Nothing X pairing
are not established by these tests. Local setup that opens the watch face is
not account pairing.
