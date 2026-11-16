---
title: CMF Watch 3 Pro
description: Firmware identity, supported workflows and research for the CMF Watch 3 Pro.
---

| Field | Reference build |
|---|---|
| Product | CMF Watch 3 Pro |
| Board in the update package | `jx402_08` |
| Stock firmware | `1.0.1.77` |
| Emulator profile | `wp3-stock` |

## Work with this model

| Task | Start here |
|---|---|
| Try stock firmware in a browser | [Open Watch 3 Pro](/emulator/watch-pro-3/) |
| Test a build or a watch face | [Emulator inputs and file types](/emulator/) |
| Prepare and run desktop QEMU | [First boot](/emulator/first-boot/#watch-3-pro-storage) |
| Inspect the stock update | [Firmware format](/devices/cmf-watch-pro-3/formats/) and the [reference image](/dumps/#jx402_w3pro_v10177bin-stock-firmware) |
| Add a device model or parser | [Device documentation and contribution map](/about/roadmap/) |

## Documentation map

- [Support and verification](/devices/cmf-watch-pro-3/status/) separates offline, desktop, browser and physical results.
- [Firmware format](/devices/cmf-watch-pro-3/formats/) describes the update container and application layout.
- [Watch faces](/devices/cmf-watch-pro-3/watch-faces/) covers textures and custom previews.
- [Hardware and emulation](/devices/cmf-watch-pro-3/hardware/) describes the modeled device interfaces.
- [Testing stock firmware](/devices/cmf-watch-pro-3/testing/) provides input, sensor and passcode checks.
- [Virtual OTA](/emulator/ota-recovery/#watch-3-pro-update-coverage) describes the verified update stages and remaining recovery limits.

## Verification scope

The browser starts with local setup complete. This does not establish Nothing X
account pairing. Physical OTA and bootloader recovery remain unverified.
