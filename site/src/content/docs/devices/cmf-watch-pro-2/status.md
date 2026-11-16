---
title: Watch Pro 2 support and verification
description: What has been verified on Watch Pro 2 hardware, in the emulator, and with offline tools.
---

The reference device is Watch Pro 2 board `JX402` with stock firmware
`1.0.0.73`. Physical Bluetooth tests used Windows. Offline format checks and
virtual tests have their own scope.

<span id="status-summary"></span>
<span id="firmware-and-container-work"></span>
<span id="watch-faces-and-ui"></span>
<span id="animations-and-the-bad-apple-proof-of-concept"></span>
<span id="ble-and-ota"></span>

| Workflow | Verified result |
|---|---|
| Bluetooth pairing and device queries | The stock watch paired, established an authenticated session, and answered version, battery and motion queries. [BLE tools](/tooling/ble-tools/) |
| Watch-face upload | A rebuilt face rendered on a physical watch. Deleting an installed face and uploading its replacement freed and reused the slot. [Watch-face editing and upload](/devices/cmf-watch-pro-2/guides/dial-editing/) |
| Firmware and resource tools | The reference AOTA image rebuilt byte-for-byte. SDFS, RES, STY, WFDL and AJS tools were checked on the documented stock formats. A modified warm-up animation also played on hardware. [Firmware toolkit](/tooling/fwkit/) · [Animation case study](/devices/cmf-watch-pro-2/guides/bad-apple/) |
| Stock firmware update | A physical watch accepted a modified AOTA package, restarted and booted the updated resources. [Firmware flashing guide](/devices/cmf-watch-pro-2/guides/ota-flash/) |
| Emulator boot | Stock and custom firmware draw on the virtual display. All six stock faces rendered in Windows QEMU and the browser. Bad Apple rendered in both, and Tilt Mouse booted on Windows. [Emulator](/emulator/) |
| Virtual stock OTA | The guest accepted an update and restarted. The host read the staged package from virtual NAND, installed it with modeled recovery and booted the resulting app. [Virtual OTA and recovery](/emulator/ota-recovery/) |
| Actions SDK OTA | Transfer and guest-reported validation passed in QEMU. Physical transfer with the published Actions client remains unverified. [Actions SDK OTA](/tooling/actions-ota/) |
| Recovery | The QEMU model restored a broken virtual app and booted stock. The equivalent physical boot path remains unverified. [Recovery & boot modes](/devices/cmf-watch-pro-2/internals/recovery/) |

<span id="what-the-toolkit-is-not"></span>

Read [Firmware flashing risks and limitations](/devices/cmf-watch-pro-2/limitations/)
before installing firmware on a physical watch. Watch 3 Pro results are
documented in its [device profile](/devices/cmf-watch-pro-3/).
