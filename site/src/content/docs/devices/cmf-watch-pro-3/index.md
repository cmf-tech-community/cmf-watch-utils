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
| Inspect the stock update | [Firmware and watch faces](/devices/cmf-watch-pro-3/formats/) and the [reference image](/dumps/#jx402_w3pro_v10177bin-stock-firmware) |
| Add a device model or parser | [Device documentation and contribution map](/about/roadmap/) |

## Verification scope

The browser and desktop emulator run the stock application and render its launcher, touch and crown interactions, and stock watch-face picker. Browser tests covered stock numeric and gesture passcodes, off-wrist locking and unlocking. The stock measurement apps computed heart rate and blood oxygen from synthetic optical samples. See [hardware and emulation](/devices/cmf-watch-pro-3/hardware/) for the observed driver behaviour and limits.

The browser starts with local setup complete. Desktop fixtures can start at the language and QR screens. Reaching a screen in QEMU establishes what the guest application can do with virtual devices. End-to-end Nothing X pairing on Watch 3 Pro, physical OTA and the physical bootloader and recovery paths remain unverified in this project. Use the [Watch Pro 2 device pages](/devices/cmf-watch-pro-2/) for that model’s separate hardware and protocol results.
