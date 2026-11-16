---
title: Hardware and emulation
description: Watch 3 Pro stock device interfaces, optical sampling and verification boundaries.
---

The stock application boots on this project's ATS3089C QEMU model. Desktop and browser builds share the machine implementation. The model supplies a compatibility ROM and a synthetic virtual flash map. Treat the interfaces below as evidence from stock 1.0.1.77 running against that model.

| Area | Evidence and implementation |
|---|---|
| Boot and flash | Stock looks for an ACPT table at `0x11800000` and checks the CRC over the first 740 bytes of the 744-byte table. The native provisioner stages the WP3 resources using a WP2 stock NAND writer. This describes the virtual map. |
| Display and input | Stock initializes the ICNA3312 display and CST820 touch path. QEMU models touch, crown press and both rotation directions. The graphics path combines stock JPEG, GPU and display-engine operations. |
| Motion | The guest uses the LSM6DSO and STK8321 paths. The virtual controls supply acceleration and angular velocity. |
| Light and position | Stock queries the ambient light driver and the SYN477xx GNSS path. The GNSS model serves the stock SPI2 startup exchange and synthetic NMEA fixes. The stock factory GPS screen displayed changes to the simulated coordinates. |
| Haptics and audio | The model exposes the firmware's vibration timing and plays prepared stock sound samples. Browser vibration follows host support. Desktop microphone input can be passed to the guest where the host backend supports it. |

## GH3220 optical sensor

The driver uses I²C address `0x14`. The bank selector and two register address bytes are distinct. The initial identity check reads `0xaa55` from register `0x0036` in bank 1. The trim handshake writes `0x0020`, then `0x0030` to `0x0700`, and polls bit 0 of `0x0718`.

| Interface | Stock behaviour |
|---|---|
| GPIO 22 and status `0x0508` | Wear on and off use status bits `0x0400` and `0x0800`. The guest acknowledges status by writing set bits back. |
| FIFO count `0x050a`, burst selector `0xaaaa` | The count is in 32-bit words. Each big-endian word carries a five-bit channel tag in bits 31–27 and a 24-bit ADC sample in bits 23–0. |
| Channel selection | `0x0108` selects active slots. Slot configuration at `0x010a + slot × 0x1c` selects the phases included in a frame. |

In raw-sample mode the emulator feeds a synthetic waveform into the FIFO and the firmware calculates both measurements. Stock showed both readings in browser and desktop histories. On desktop, stock reloaded the timestamped records from the same virtual NAND after a stock flush and a QEMU reset. Browser page-reload retention was not established.

## Test scope

Desktop factory checks exercised both crown directions, ambient light, motion, GNSS and selected display screens. These results cover individual tests and controls. The browser passcode test covered numeric and gesture setup, simulated off-wrist locking, wrong-entry rejection and a successful unlock. The low-level emulation does not reproduce physical sensor quality, battery and radio behaviour, or bootloader recovery. Partial factory screens and individual peripherals are useful regression checks. Completing a factory-menu interaction in QEMU does not establish a factory test result for physical hardware.
