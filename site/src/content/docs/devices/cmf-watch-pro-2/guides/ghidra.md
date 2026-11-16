---
title: Watch Pro 2 analysis
description: Reference addresses and entry points for analysing the Watch Pro 2 application.
---

## Import

Use the shared [Ghidra workflow](/contributing/firmware-analysis/#import) to
import an extracted `app.bin`. Watch Pro 2 1.0.0.73 uses Thumb-2 code with an
image base of `0x10000000`. File offset X maps to `0x10000000 + X`.

## Bundled scripts

The [analysis script reference](/contributing/firmware-analysis/#bundled-scripts)
lists the helpers in `tooling/ghidra_scripts/` and their purposes.

## Headless example

The [headless commands](/contributing/firmware-analysis/#headless-example)
cover import and function export, including Windows command syntax.

## Conventions

For Watch Pro 2 1.0.0.73, `0x101F4D70` is the BLE/AT group dispatcher and
`0x10054CF4` is `system_app_launch`. These are virtual addresses, not file
offsets. See [app.bin internals](/devices/cmf-watch-pro-2/internals/appbin/)
for ACTH fields and [BLE protocol](/devices/cmf-watch-pro-2/protocol/ble/)
for dispatch and update functions. Do not reuse these addresses for another build.

## Reproducibility

Record the image hash, Ghidra version, script arguments and evidence supporting
each interpretation. The shared [reproducibility guidance](/contributing/firmware-analysis/#reproducibility)
describes what belongs with a finding.
