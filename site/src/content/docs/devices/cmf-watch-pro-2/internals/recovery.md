---
title: Recovery & boot modes
description: What is known about recovery, safe mode, OTA flags and the limits of unbricking.
---

## Physical recovery

There is **no confirmed, button-only recovery path** for every failure mode on this watch.
The app contains safe-mode and launch/retry logic, and OTA flags persist across reboots, but no
unit has been deliberately bricked to prove a universal recovery sequence.

An Actions OTA loading screen confirms the app exposed that update service in
the tested state. It does not establish where boot-time recovery runs or whether
the service survives a broken app.

## What QEMU recovery verifies

Virtual tests cover stock OTA validation, reset and host-modeled installation,
and stock restoration when the modeled crown and charger inputs are present.
The [emulator recovery reference](/emulator/ota-recovery/) records the exact
stages and command requirements.

The guest starts through a compatibility ROM. The real bootloader and recovery
partitions were not read back or executed. These tests cannot establish physical
recovery when the application, bootloader, storage or power path is damaged.

## Evidence in the firmware

The app references:

- `system_app_launch` at `0x10054CF4`
- safe mode at `0x10054C94`
- launch init at `0x10054DBC`
- checks for `/NAND:C/A/B/E/K` and `_res_file_check`
- persistent OTA flags `OTA_UPG_FLAG` (`0x10058508`) and `OTA_UPG_TYPE` (`0x100585BC`)

This suggests a software retry/safe-mode path if an update fails validation. It does not prove
that a corrupt bootloader or an interrupted NAND write can be recovered without hardware.

## Factory test menu

The watch has a hidden factory/test menu. Entering its shutdown/reset option cleared app data
and pairing state on the tested unit. That is why a stale authkey can produce `A052` but no
`A040`; re-pairing restores the OTA path.

Factory-menu reset options can erase local settings and pairing state.

## UART / physical debug

The app contains a UART shell (`nand logic read/write`, `devboot`, `reboot`, `cpuload`) on
`UART_0`. Reaching it requires physical access to the debug pads and a USB-UART adapter. Physical access and recovery through this shell have not been verified.
Its presence in the firmware is not proof that it can recover a damaged watch.

## Practical precautions

Use the [flashing guide](/devices/cmf-watch-pro-2/guides/ota-flash/) for
preparation and the [troubleshooting guide](/getting-started/troubleshooting/)
for failed updates. Keep a known-good image, verify the candidate and establish
that the app responds before retrying. A saved image alone does not provide a
working recovery transport.

## Bootloop warning

If the stock app never starts, its BLE update service may be unavailable. The virtual crown and charger test does not verify a physical recovery procedure.
