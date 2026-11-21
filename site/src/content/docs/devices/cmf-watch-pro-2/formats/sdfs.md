---
title: SDFS filesystem
description: The simple named-file filesystem used inside res_e and other AOTA partitions.
---

SDFS is the filesystem used by the resource partitions. It is deliberately small: a header, a
fixed-size entry table, then aligned file bodies.

## Layout

```text
0x00  magic "sdfs.bin"
0x08  u32 zero
0x0C  u32 file count
0x10  u32 total image size
0x14  u32 zero
0x18  u32 checksum of the entry table
0x1C  u32 checksum of the body
0x20  entries, 32 bytes each:
        name[12] | u32 offset | u32 size | u32 0 | u32 0 | u32 sum32(data)
```

File offsets are absolute inside the image and aligned to `0x40`. The checksum is a 32-bit
word sum (`sum32`), not CRC32: the data is read as little-endian `u32` values, summed modulo
2^32; trailing bytes are ignored.

## Tools

```bash
uv run fwkit sdfs-list    work/res_e.bin
uv run fwkit sdfs-extract work/res_e.bin work/res_e
uv run fwkit sdfs-pack    work/res_e work/res_e_new.bin
```

The following example replaces `9.ajs`, the stock warm-up animation for sport
type 22, with a prepared animation at `work/9.ajs`. It writes a new firmware
package to `out/custom.bin`. Create the output directory first. This changes
the animation resource, not the app or its warm-up timer.

Replacing one file inside an AOTA partition without unpacking everything:

```bash
uv run fwkit edit-sdfs dumps/binaries/firmware/JX402_V1.0.0.73.bin res_e.bin 9.ajs work/9.ajs out/custom.bin
```

## Fixed partition length

The stock `res_e.bin` **image** is **58,777,088 bytes**. Its physical partition
reservation is **64 MiB (67,108,864 bytes)**. These are different limits.

Preserving the stock image length is the conservative repacking approach.
Replacing a file can change the natural SDFS size; `fwkit.sdfs.pad_to(img, size)`
pads to the requested length and refreshes the size and body checksum.
Packer and SDK inspection do not establish a universal fixed-length rejection
rule at the stock image size. Larger images have not been verified across the
shipped updater, resource readers and recovery path. Do not change partition
boundaries on the assumption that image padding is a partition table.

## Capacity

The 19 stock animation payloads total **58,776,014 bytes**. The **1,074-byte**
difference from the image length includes headers, directory entries and
alignment; it is not freely allocatable payload. The **8,331,776 bytes** beyond
the stock image remain inside the resource reservation and are unvalidated
for reuse. Neither quantity enlarges the writable FAT filesystem.

For partition ranges, stock image inventory and writable-storage measurements,
see [Storage](/devices/cmf-watch-pro-2/internals/storage/). The interactive
[Storage Explorer](/storage-explorer/watch-pro-2/) also provides per-file sizes,
checksums and downloadable references.
