---
title: Hardware notes
description: SoC, RAM, flash, display, UART shell, factory mode and recovery notes.
---

Findings for `JX402_V1.0.0.73` (CMF Watch Pro 2).  Addresses are for the
0.73 `app.bin` (`0x10000000` base).

## 1. SoC / memory

| item | finding | confidence |
|---|---|---|
| SoC | Actions ATS3089C, Zephyr RTOS, Thumb-2 | high |
| core | Cortex-M class; exact core and clock not extracted | medium |
| SRAM | `0x2FF00000..0x30000000` (~1 MB); reset SP `0x2FFB6740` | high |
| PSRAM | window at `0x38000000`; refs up to `0x38FFF10A` (~16 MB address space), globals use low offsets | medium |
| flash | Examined unit: FORESEE F35SQA001G NAND, 128 MiB main array; GD25LF32E NOR, 4 MiB | high |
| storage | Writable FAT at `/NAND:`; resource SDFS at `/NAND:A`, `/NAND:C`, `/NAND:E` and `/NAND:K` | high |

The app image is `0x25A080` (2,465,920 B).  RAM globals at `0x3800_xxxx`
and `0x3830_xxxx` are **not** in `app.bin`; the image is XIP/loaded at
`0x10000000`.

NAND exposes 123 MiB of logical storage; 5 MiB supports flash management.
Only the 10 MiB `udisk` reservation is the writable file-storage volume in
the verified layout. See [Storage](/devices/cmf-watch-pro-2/internals/storage/)
for partition ranges, formatted capacity and evidence limits, or open
[Storage Explorer](/storage-explorer/watch-pro-2/) to inspect the hierarchy.

## 2. Display / graphics

| item | finding |
|---|---|
| panel | 466×466 display used by the stock UI; controller details require model-specific evidence |
| refresh | Host rendering speed does not establish the physical panel refresh rate |
| UI toolkit | LVGL 8.x (`lvgl/src/extra`, `lv_api_map.h`) |
| 2D GPU | VeriSilicon **VGLite** |
| media | hardware JPEG decoder (Allwinner `ezJPEG`-style) |
| other | display engine (DE), GPU clock control |

The UI is a compiled LVGL app; `.sty` only supplies scene geometry, text
indices, picture indices and colours.

## 3. App model

- Monolithic C/Zephyr `app.bin`; no dynamic loader, no Lua/JS/ELF/plugin
  engine in the image.
- Apps are **views** in a registry of 24-byte entries starting near file
  offset `0x4b8`:
  `[name_ptr, 0, create_fn, 0, id_word, 0x01d201d2]`.
  `id_word` low 16 bits is the view id (`0x4e` about, `0x87` factory).
- Stock firmware has no community app loader. Patched firmware and the
  [community app SDK](https://github.com/fmctools/cmf-watch-sdk) add a separate
  package-loading path. Its file-storage and RAM limits are distinct from
  the stock view registry.
- Zephyr shell is present over `UART_0`: `devmem`, `kheap`, `dumpbuf`,
  `nand logic read/write`, `reboot`, `cpuload`.  Physical UART pads are
  required; physical UART access has not been established by this project.

## 4. Hidden factory mode

Trigger: **Settings -> About -> five rapid taps on the version row**.
`FUN_100bf9bc` increments a counter when `FUN_101cb8a2(...) < 0x14d`
(333 ms); after the fifth tap (`counter > 4`) it calls
`FUN_101898bc(0x87, 0)`.

Menu (`factory_test_view`, id `0x87`):

- system comprehensive / semi-finished / finished-product tests
- LCD, drawline, touch, sensor level/tilt, light-leak 1/2
- BIO, charge/NTC, battery voltage, MIC, key encoder, motor, speaker
- light perception, GPS test
- DUT test, AP mode, test record, device QR code
- shipping mode, clear-user-data-and-power-off, exit factory mode

Labels are inline UTF-8 in `app.bin` around `0x21a9fb..0x21ad97`; they are
not in `bt_watch.<lang>`.  Menu builder `FUN_10094a48`, click handler
`FUN_10094800`, key handler `FUN_1009408c`.

There are **no Wi-Fi/lwIP/TCP strings** in the app, so factory "AP mode"
is not a Wi-Fi access point; it is likely a BLE/RF or PCBA test path.
Shipping mode and clear-data can wipe settings; both are destructive and
are only invoked deliberately.

## 5. JPEG animation playback

`.ajs` files are `/NAND:E/N.ajs`, 240x240 JPEG frames.  The prelude byte
at `+0x07` is the frame rate (0 => 25).  `simple_video_9` creates
`lv_timer_2(cb, 1000/fps, ...)`, so shipped files play at 25 fps.  All 19
are sport warm-up animations driven by the `0x101ED708` table; they are
not menu entries (see the [animation mapping](/devices/cmf-watch-pro-2/formats/watchface/#5-ajs-animation-files-nande)).

The stock animation image is densely packed, but its file length is smaller
than the physical partition reservation. Extra reserved capacity is not
verified as safely reusable. See [SDFS capacity](/devices/cmf-watch-pro-2/formats/sdfs/)
and the [AJS format](/devices/cmf-watch-pro-2/formats/ajs/) for editing constraints.
A replacement warm-up animation has played on hardware; that experiment is
separate from the source-built [Bad Apple firmware](/devices/cmf-watch-pro-2/guides/bad-apple/).
