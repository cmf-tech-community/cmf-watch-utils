---
title: AJS animations
description: The JPEG-frame animation format used for sport warm-ups, including frame records, tile tables and stock player behavior.
---

`.ajs` files live in `/NAND:E` inside `res_e.bin` and are played by the sport warm-up view. They
are not menu entries or watch faces.

## Layout

A `.ajs` is **not** a plain concatenation of JPEGs: each frame is preceded
by a tile descriptor and the chain is driven by a length field, not marker
scanning.  There are 8 prelude bytes, then repeated records:

```
0x00  u32 0
0x04  bytes 00 00 00 <fps>    (0.73 files: 0x19 = 25 fps; 0 => 25)
0x07  u8   fps               <-- not a version field

record at p (first record p = 0x08):
p+0x00  u16  size            bytes after this field
p+0x02  "JPEG"               Allwinner tile descriptor magic
p+0x06  u16  width           (240)
p+0x08  u16  height          (240)
p+0x0A  u16  tile_width      (240)
p+0x0C  u16  tile_height     (240)
p+0x0E  u16  tile_count N    (1 in every shipped file)
p+0x10  N * (u16 offset, u16 length)   offsets from the "JPEG" magic
p+...   tile JPEG streams    (each FF D8 … FF D9)
next record p' = p + 2 + size
```

For one tile the table is `(18, jpeg_len)`, the JPEG starts at
`p+0x14` (file `0x1C` for the first frame), and
`size = 14 + 4*N + sum(tile lengths)` (= `18 + jpeg_len` for `N=1`).
File `+0x1A` is the first tile's JPEG length.  There is no trailing record:
the last frame ends at EOF.

Tile offsets are relative to the descriptor magic, so a multi-tile frame is
a normal table; the player computes `cols = ceil(width/tile_width)`,
`rows = ceil(height/tile_height)` and blits every tile at
`(col*tile_width, row*tile_height)`, clipped to the canvas.

## Tools

First extract `res_e.bin` from the reference firmware and unpack its
[SDFS filesystem](/devices/cmf-watch-pro-2/formats/sdfs/). In the example below,
`work/res_e/9.ajs` is the stock warm-up animation for sport type 22.
The output directories hold extracted frames and your rebuilt animation.

```bash
uv run fwkit ajs-info    work/res_e/9.ajs --frames
uv run fwkit ajs-extract work/res_e/9.ajs work/ajs9
uv run fwkit ajs-repack  work/ajs9 -o work/custom.ajs --fps 25
uv run fwkit ajs-set-frame work/custom.ajs 0 new_frame.jpg -o work/custom2.ajs
```

`ajs-extract` writes `NNNN.jpg` (or `NNNN_TT.jpg` for multi-tile frames). A matching repack is
byte-identical for the shipped files.

## Warm-up mapping

All 19 files are **sport warm-up animations**, not menu entries.  The
app table at `0x101ED708` (file `0x1ED708`) has 19 16-byte records:
`[sport_type, seconds, category, ajs_index]`.

| `.ajs` | sport type | seconds | category |
|---|---|---|---|
| 1 | 14 | 20 | 9 |
| 2 | 15 | 20 | 9 |
| 3 | 16 | 30 | 9 |
| 4 | 17 | 30 | 9 |
| 5 | 18 | 30 | 9 |
| 6 | 19 | 30 | 9 |
| 7 | 20 | 20 | 9 |
| 8 | 21 | 20 | 9 |
| 9 | 22 | 8 | 11 |
| 10 | 23 | 30 | 9 |
| 11 | 24 | 20 | 9 |
| 12 | 25 | 30 | 9 |
| 13 | 26 | 8 | 11 |
| 14 | 27 | 8 | 11 |
| 15 | 28 | 6 | 11 |
| 16 | 29 | 6 | 11 |
| 17 | 30 | 6 | 11 |
| 18 | 31 | 20 | 11 |
| 19 | 32 | 20 | 9 |

Replacing `N.ajs` only changes the warm-up preview/animation for that
sport; it does not add a dial or menu item. The warm-up timer in the table
and the duration encoded in the animation are independent.

## Stock player

Player (`simple_video_8` = open/parse, `simple_video_7` = timer tick,
`simple_video_6` = rewind):

1. 0x16 bytes are read from offset 0, `"JPEG"` is required at `+0x0A`,
   width/height are parsed, and the fps byte is taken from prelude `+0x07`;
2. the seek goes to `0x0A` (descriptor start) and `size + 2` bytes are read;
3. every tile is decoded at `buffer + offset` with `length` bytes via the
   Allwinner JPEG decoder (`FUN_100ffcc4` → `FUN_100ffa70`);
4. the next `size` comes from the two bytes at `buffer[size]`.  At EOF the
   short read yields 0, and `simple_video_6` seeks back to `0x08` to loop.

`simple_video_9` creates `lv_timer_2(cb, 1000 / fps, ...)`; fps 0 is
coerced to 25.  Observed frame counts: 1.ajs = 500, 8.ajs = 500,
9.ajs = 1124, 16.ajs = 1397.  Frames are ~1.5–4.9 KB each; all 19 shipped
files use 240×240 with a single 240×240 tile, and they fill `res_e.bin`
(58,776,014 of 58,777,088 bytes; only 1,074 bytes free).

Unlike `bt_watch.res` pictures, which have a 22-byte
header with `"JPEG"` at `+0x04` and the same 14-byte tile descriptor after
it, `.ajs` stores the descriptor after a 2-byte `size` field.


## Capacity

The stock animation partition is almost full. A replacement must fit the space
released by the original file, including the rebuilt filesystem table and alignment.
Measure the encoded replacement and verify the rebuilt package; a clip's duration
alone does not determine its size. The [SDFS reference](/devices/cmf-watch-pro-2/formats/sdfs/)
documents the reference partition capacity.

Replacing an animation changes an existing sport warm-up. Its display duration
is controlled separately by the stock app's warm-up table. For a standalone
video player, see the [source-built Bad Apple firmware](/devices/cmf-watch-pro-2/guides/bad-apple/).

## Pitfalls

- Keep the 240×240 frame size. The player reads the frame rate from `+0x07` (0 means 25).
- Trailing bytes are not added after the last record; the last frame ends at EOF.
- Repacking goes through the toolkit rather than concatenating JPEGs; the record prelude and
  tile table must match what the player expects.
- See [Legal and attribution](/about/legal/) before redistributing a modified image.
