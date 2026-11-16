---
title: Firmware analysis with Ghidra
description: Import a reference application, run analysis scripts and record reproducible findings.
---

This workflow applies to the reference applications for Watch Pro 2 1.0.0.73
and Watch 3 Pro 1.0.1.77. Install Ghidra and its required JDK, then extract
`app.bin` from the matching update using [fwkit](/tooling/fwkit/). Run commands
from the repository root. Ghidra is not needed to run the emulator.

## Import

`app.bin` is a raw Thumb-2 image mapped at **`0x10000000`**. The import uses the
`ARM:LE:32:Cortex` processor with an image base of `0x10000000`. The ACTH header starts at file
offset 0, so file offset `X` maps to address `0x10000000 + X`.

## Bundled scripts

`tooling/ghidra_scripts/` contains helpers for repeatable exports:

| Script | Purpose |
|---|---|
| `DumpApp.java` | Summary, entry points and header fields |
| `CountFns.java` | Function count and address ranges |
| `FuncAt.java` / `ListFnsInRange.java` | Function boundaries |
| `Decompile.java` / `DecompileAt.java` / `DecompRange.java` | Export decompilation |
| `Callers.java` / `CallersOf.java` / `RefsTo.java` / `Xrefs.java` | Call and data xrefs |
| `FindImm.java` / `FindOps.java` / `SearchDecomp.java` | Immediate/opcode/text search |
| `FindStrings.java` / `FindStrXrefs.java` | String tables and references |
| `FindOta.java` / `OtaFns.java` / `OtaGraph.java` / `OtaHandlers.java` / `OtaReq.java` | OTA state-machine mapping |
| `NameMap.java` / `ExportAnnotated.java` | Export names and annotated listings |

## Headless example

These examples use Bash line continuation. In PowerShell, place each command
on one line and invoke `analyzeHeadless.bat` from Ghidra’s `support` directory.
Supply an extracted `app.bin` from the reference firmware.

```bash
analyzeHeadless analysis-projects wp2 \
  -import app.bin \
  -processor ARM:LE:32:Cortex \
  -loader BinaryLoader \
  -loader-baseAddr 0x10000000 \
  -scriptPath tooling/ghidra_scripts \
  -postScript DumpApp.java \
  -analysisTimeoutPerFile 900
```

Create the `analysis-projects` directory before import. The project name `wp2`
is arbitrary; use a separate project for each firmware build. This second
example decompiles a function in Watch Pro 2 1.0.0.73:

```bash
analyzeHeadless analysis-projects wp2 -process app.bin -noanalysis \
  -scriptPath tooling/ghidra_scripts \
  -postScript DecompileAt.java 0x101F4D70
```

Exact argument order depends on the script; the Java file header lists its parameters.

## Conventions

- Addresses in this documentation are virtual addresses (`0x10...`), not file offsets.
- In Watch Pro 2 1.0.0.73, `0x101F4D70` is the BLE/AT group dispatcher; `0x10054CF4` is `system_app_launch`.
- Watch 3 Pro application fields and reset vector are in its [firmware reference](/devices/cmf-watch-pro-3/formats/#application-image).
- The Watch Pro 2 ACTH fields are referenced in [app.bin internals](/devices/cmf-watch-pro-2/internals/appbin/).
- Decompiler output is a hypothesis, confirmed by a live reply or a byte-level round-trip.

## Reproducibility

Ghidra versions differ in analysis quality, so the version, the script arguments and the
SHA-256 of `app.bin` accompany a published finding. The firmware and the Ghidra project are
kept outside source changes. Published reference binaries are listed separately
in the [data index](/dumps/).
