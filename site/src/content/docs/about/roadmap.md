---
title: Device support and contributions
description: Where to document a device and how to establish the scope of support.
---

## Device coverage

| Model | Documented scope |
|---|---|
| [Watch Pro 2](/devices/cmf-watch-pro-2/) | Firmware and formats, stock BLE and OTA, desktop and browser emulation |
| [Watch 3 Pro](/devices/cmf-watch-pro-3/) | Firmware and formats, desktop and browser emulation |
| Other models | No device profile or verified workflow |

## Documentation structure

| Area | Content |
|---|---|
| [Getting started](/getting-started/quickstart/) | First tasks and required tools |
| [Tooling](/tooling/fwkit/) | Shared command line tools and file inputs |
| [Emulator](/emulator/) | Browser and desktop workflows, virtual controls, and recovery limits |
| Device pages | Per-build identifiers, formats, protocol details and results |
| [Dumps](/dumps/) | Reference packages, checksums and supporting data |
| [Methodology](/about/methodology/) | How to verify and document findings |

## Add or extend a device

Identify the model, board and firmware version first. A device can have an
offline format or emulator profile before it has a verified BLE route. State
which part of a workflow was exercised and label the evidence as offline,
emulated or physical. See the [contribution guide](https://github.com/fmctools/cmf-watch-utils/blob/main/CONTRIBUTING.md)
for repository tests and how to submit changes.

For watch-face work, record the model, package type, codec and the view used
for verification. An import, a render and a physical upload are separate
checks. Use the [Watch Pro 2 WFDL reference](/devices/cmf-watch-pro-2/formats/watchface/)
or the [Watch 3 Pro face notes](/devices/cmf-watch-pro-3/formats/#watch-face-resources)
for the relevant format.
