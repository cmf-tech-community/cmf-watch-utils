---
title: Storage
description: Verified NAND and NOR capacities, partitions, writable storage, firmware resources and remaining unknowns for Watch Pro 2.
---

The examined Watch Pro 2 has **128 MiB of NAND main storage and a separate
4 MiB NOR chip**. Only part of that capacity is a writable filesystem for files.
The rest holds firmware, resources, recorded history, diagnostics and flash
management data.

[Open Storage Explorer](/storage-explorer/watch-pro-2/) to browse the complete
hierarchy, inspect addresses and evidence, or download the reference as HTML,
JSON, Markdown, SVG or PNG. The explorer runs without connecting to a watch.

This reference covers board **JX402**, stock firmware **1.0.0.73**, verified chip
geometry and saved device captures. The captured watch used patched firmware;
its installed apps and personal data are excluded. Capture observations do not
establish a factory-reset storage state. These numbers have not been verified
for Watch 3 Pro or every Watch Pro 2 hardware revision.

## Capacity at a glance

A MiB is 1,048,576 bytes. Partition capacity, image-file size, formatted file-data
capacity and free space describe different things.

| Layer | Capacity | Meaning |
| --- | ---: | --- |
| NAND main array | 128 MiB | Physical main storage on the NAND chip |
| Logical NAND | 123 MiB | Address space exposed by the NAND driver |
| NAND management difference | 5 MiB | Block mapping, update logs and allocation pool; not normal file storage |
| NAND partition reservations | 112.5 MiB | Regions assigned by the active partition table |
| Unpartitioned logical tail | 10.5 MiB | Within logical NAND, after the last partition |
| NOR | 4 MiB | Separate chip containing boot code, application and configuration |

The combined main capacity is **132 MiB**. The 123 MiB logical view is part of
the 128 MiB NAND, not extra capacity. The chip also has **4 MiB of spare/OOB
cells**, separate from its main array. OOB means out-of-band storage used for
NAND metadata and error correction; it is excluded from all file budgets here.

The older **116.5 MiB** figure adds NAND and NOR partition reservations. It is
not the physical capacity and does not describe available space for apps.

## Explore the layout

Storage Explorer has three linked views: the hierarchy in Explorer, a size-based
map or list in the centre, and the selected region's details. Selecting a region
in the map also reveals it in the hierarchy. Search finds partitions and stock
resource files. **Files** detail exposes the resource inventory; **List** makes
small entries easier to select.

Areas follow byte sizes. Their placement is a visual arrangement, not a map of
physical adjacency. Explicit ranges distinguish logical NAND offsets from
physical NOR offsets. Endpoints in the structured download are exclusive:
`[startByte, endByteExclusive)`.

The downloads contain the same reviewed reference. HTML works offline, JSON
includes stable IDs and parent/child links, and Markdown includes descriptions
and evidence. The JSON Schema describes the structured format. SVG and PNG
posters can show the current region or whole device. They contain no firmware
images, raw dumps, installed-app files or personal configuration values.

## NAND partitions

All starts below are offsets in **logical NAND**, not physical chip addresses.
The active ACPT partition table passes CRC32 and contains nine NAND entries.
ACPT is the Actions partition table that records each region's chip, file
identifier, start and reserved size.

| Partition | Start | Reservation | Purpose |
| --- | --- | ---: | --- |
| `fw0_temp` | `0x00000000` | 3.5 MiB | Temporary OTA update staging |
| `sdfs_k` | `0x00380000` | 1 MiB | System resources, including boot and sound assets |
| `dstorage` | `0x00480000` | 2 MiB | Settings and recorded sensor/activity history |
| `font` | `0x00680000` | 12 MiB | Fonts, emoji and built-in watch-face resources |
| `res_a` | `0x01280000` | 10 MiB | UI resources, styles and strings |
| `res_b` | `0x01C80000` | 8 MiB | Resource partition not supplied by this stock update |
| `res_e` | `0x02480000` | 64 MiB | Exercise animation resources |
| `runtimel` | `0x06480000` | 2 MiB | Runtime diagnostics |
| `udisk` | `0x06680000` | 10 MiB | Writable file storage |

The partitions end at `0x07080000`. Logical NAND ends at `0x07B00000`.
The intervening 10.5 MiB has no entry in the captured partition table.

`res_b` has a known resource role. Its captured SDFS directory has zero entries,
but its body checksum fails and the region is not entirely erased. It must not
be described as a verified empty filesystem or available file space. Likewise,
unmounted settings and log partitions can contain active data.

### Writable file storage

`udisk` is the writable file-storage partition. Its ACPT file ID **40** matches
the Actions SDK's `PARTITION_FILE_ID_UDISK`. The captured volume uses FAT16, a
filesystem that tracks allocated space in clusters.

| Captured format property | Value |
| --- | ---: |
| Partition capacity | 10,485,760 bytes / 10 MiB |
| Sector size | 512 bytes |
| Cluster size | 1,024 bytes |
| FAT copies | 2, identical in the checked capture |
| Format metadata | 59,392 bytes |
| File-data capacity | 10,426,368 bytes / about 9.943 MiB |

These are verified format properties, **not clean-stock free space**. Installed
files, directories, allocation rounding and interrupted transfers all affect
the free count. No factory-reset free-space measurement is established.

The first runtime free-count cache held `0xFFFFFFFF`, meaning that the count
was not yet known. The final format and allocation checks instead read the
boot sector and both complete FATs. An unknown cached counter must not be
interpreted as a capacity or free-space measurement.

Allocation is rounded to clusters. A nonempty 64-byte file needs at least one
1,024-byte cluster on this volume; directories and temporary install files also
consume space. App executable size, package size and RAM requirements are
separate limits. Loader slot counts and package limits belong to the
[community app SDK](https://github.com/fmctools/cmf-watch-sdk), not to the flash
hardware, and can change between loader versions.

The full FAT reconciliation accounted for all non-free clusters as reachable
files/directories or an explicitly identified unreferenced chain. A partial
package remained allocated without a live directory entry, consistent with an
interrupted transfer. The capture did not establish which operation caused it.
An allocated orphan chain is not free space; no repair was performed.

Repeated observations also showed that assisted-GPS file growth can change
free space independently of app installation. Subtracting app file sizes from
a modified watch therefore does not produce a measured stock baseline.

The emulator's generated FAT geometry differs from this captured physical
volume. Emulator free-space numbers must not be used as the hardware's budget.

### Filesystem paths

The captured mount list distinguishes writable file storage from resource
containers. The stock path resolver chooses the longest matching prefix.

| Mount | Backing region | Access through the mounted filesystem |
| --- | --- | --- |
| `/NAND:` | `udisk` | Writable FAT files |
| `/NAND:A` | `res_a` | Resource SDFS |
| `/NAND:B` | `res_b` | Resource SDFS |
| `/NAND:C` | `font` | Fonts and built-in watch-face SDFS |
| `/NAND:E` | `res_e` | Exercise animation SDFS |
| `/NAND:K` | `sdfs_k` | System resource SDFS |

Resource letters map to partition file IDs: A=10, B=11, C=12, E=14 and K=20.
`/NAND:C` does not fall through to writable `/NAND:`. The inspected SDFS
operations table lacks generic write, truncate, unlink, rename and directory
creation operations. Separate upload, updater or raw-storage code can still
modify resources; read-only mounted access is not a hardware write prohibition.

`dstorage` and `runtimel` are accessed by partition-backed services, without
ordinary filesystem mounts in the checked state. Mount listings alone cannot
establish their usage or contents.

### Recorded history

Stock code defines eleven typed reservations inside `dstorage`. The 396-byte
descriptor table at CPU address `0x101F2C78` and its pointed object-size records
match the captured application code.

| Type | Purpose | Logical NAND start | Reserved bytes |
| --- | --- | --- | ---: |
| 0 | Primary settings object | `0x00480000` | 32,768 |
| 1 | Secondary settings object | `0x00488000` | 24,576 |
| 2 | Additional persistent state | `0x0048E000` | 8,192 |
| 3 | Heart-rate history | `0x00490000` | 32,768 |
| 4 | Blood-oxygen history | `0x00498000` | 16,384 |
| 5 | Step/activity history | `0x0049C000` | 28,672 |
| 6 | Sleep history | `0x004A3000` | 102,400 |
| 7 | Workout summaries | `0x004BC000` | 61,440 |
| 8 | Workout heart-rate history | `0x004CB000` | 442,368 |
| 9 | GPS track history | `0x00537000` | 659,456 |
| 10 | Stress history | `0x005D8000` | 16,384 |

Together these cover **1,425,408 bytes**. The remaining **671,744 bytes (656 KiB)**
are outside the decoded descriptors. Their purpose is unresolved. Reserved
bytes are not populated-record counts, and individual record fields are not
fully decoded. No personal readings or locations are included in the reference.

## NOR partitions

NOR is a separate **4 MiB GD25LF32E** chip on the examined unit. The NAND is
identified as **FORESEE F35SQA001G**. These identities come from active device
identification and geometry, not from the chips chosen by the emulator.

NOR offsets below are physical chip offsets. Its thirteen reservations are
contiguous and bounded by `0x00400000`.

| Partition | Start | Reserved bytes | Purpose |
| --- | --- | ---: | --- |
| `fw0_boot` | `0x00000000` | 4,096 | Primary bootloader |
| `fw0_para` | `0x00001000` | 4,096 | Active partition table |
| `fw1_boot` | `0x00002000` | 4,096 | Secondary bootloader reservation |
| `fw1_para` | `0x00003000` | 4,096 | Secondary partition-table reservation |
| `fw0_rec` | `0x00004000` | 131,072 | Recovery firmware |
| `fw0_sys` | `0x00024000` | 3,452,928 | Main application firmware |
| `reserved` | `0x0036F000` | 409,600 | Reserved interval |
| `fw0_sdfs` | `0x003D3000` | 65,536 | Firmware resources |
| `nvram_fa` (file ID 6) | `0x003E3000` | 4,096 | Factory configuration |
| `nvram_fa` (file ID 7) | `0x003E4000` | 8,192 | Writable factory configuration |
| `nvram_us` | `0x003E6000` | 8,192 | User configuration |
| `logbuf` | `0x003E8000` | 16,384 | Diagnostic log buffer |
| `coredump` | `0x003EC000` | 81,920 | Crash diagnostics |

The captured primary bootloader and recovery images are **3,816** and **95,844**
bytes, respectively. Both pass ACTH header and payload checksums; this validates
their structure, not their identity as untouched stock images. The secondary
boot and parameter reservations read entirely as `FF`. They are reservations,
not verified working backup images.

Configuration-store roles agree with SDK file IDs and driver lookups. The
captured records pass their checked CRCs, but all property values are excluded.
Crash storage contains a checksum-valid container with architecture and memory
blocks; registers and memory contents are also excluded. Neither observation
is a factory usage figure.

The stock application file is **2,465,920 bytes**, leaving **987,008 bytes**
between its packaged length and its NOR reservation. This arithmetic is not
a verified append or patch budget: executable mappings, image checksums, RAM
sections and updater/recovery constraints still apply.

### NOR address mappings

On the examined device, CPU address `0x12000000` exposes a zero-offset NOR
mapping with automatic CRC handling disabled. Its application and partition
headers match the separately mapped live headers. Adding a physical NOR offset
to `0x14000000` is incorrect for this capture: that alias already exposes the
application mapping. No mapping registers were changed during verification.

These are firmware-specific CPU mappings, not portable addresses for other
boards. File offsets in the explorer are chip offsets, not CPU addresses.

## Stock resource images

The stock package supplies five SDFS images plus the application image, with
**136 named resource files** in total. Image lengths are not partition capacities.

| Image | Partition | Stock image bytes | Named files |
| --- | --- | ---: | ---: |
| `res.bin` | `res_a` | 10,137,792 | 82 |
| `fonts.bin` | `font` | 9,513,344 | 9 |
| `res_e.bin` | `res_e` | 58,777,088 | 19 |
| `sdfs_k.bin` | `sdfs_k` | 524,096 | 17 |
| Nested `sdfs.bin` | `fw0_sdfs` | 24,512 | 9 |

All named-file checksums in these stock images validate. `fonts.bin` contains
shipped fonts, emoji and six `local*.wfc` watch-face resources. The corresponding
resource area must not be described as wholly absent from firmware updates.

The 64 MiB `res_e` reservation contains the **58,777,088-byte** stock image.
Its 19 animation payloads total **58,776,014 bytes**. The **1,074-byte** difference
includes headers, directory entries and alignment; it is not free payload space.
The reservation extends **8,331,776 bytes** beyond the stock image. That capacity
is not part of FAT and is not verified as safe to reuse.

Preserving the stock image length remains the conservative repacking approach.
Packer and SDK inspection do not establish a universal rejection rule at that
exact length, but a larger resource image has not been verified across the
shipped updater, consumers and recovery path. See the
[SDFS format](/devices/cmf-watch-pro-2/formats/sdfs/) for encoding and tools.

## NAND block management and the unpartitioned tail

The NAND driver exposes **984 logical blocks** out of **1,024 physical blocks**,
each with 128 KiB of main data. The flash translation layer (FTL) maps logical
blocks to physical blocks and manages updates. Its 40-block difference is 5 MiB.

Two bounded runtime metadata captures accounted for those 40 blocks as:

| Observed role | Blocks | Main capacity |
| --- | ---: | ---: |
| Update-log blocks | 8 | 1 MiB |
| Allocation pool | 31 | 3.875 MiB |
| Active zone table | 1 | 128 KiB |

These counts describe the observed running state. Blocks can exchange roles;
pool membership does not mean their pages are erased. The 5 MiB is not one
contiguous logical tail. Raw physical contents, full OOB data and per-block
health were not captured. Identifying a physical reader did not establish a
safe invocation path over BLE.

Separately, the complete **10.5 MiB logical tail** at
`[0x07080000, 0x07B00000)` read as `FF` in both an independent tail scan and the
full logical dump. This establishes erased-looking contents at those times,
not ownership across versions or safe write/recovery behaviour.

Extending the final partition to that endpoint would give a theoretical
**20.5 MiB reservation before filesystem overhead**. This is an untested layout,
not supported expansion. Changing a partition does not enlarge its existing
FAT filesystem; migration, updater compatibility and interrupted-write recovery
would need separate implementation and tests.

## Implications for apps and music

Existing writable file storage is the established place for custom files. An
app package includes headers and relocations in addition to its executable
image. Persistent data, widgets, directories and temporary files add allocation
cost. Budget against the installed loader/SDK version and actual filesystem,
not total chip capacity.

Music-file capacity alone does not establish playback support. A local player
also needs file access, decoding, streaming buffers and a suitable lifecycle.
A phone media-control API does not by itself provide local audio-file playback.
Unused-looking resource, history or diagnostic reservations are not substitutes
for writable storage.

## Evidence and remaining limits

The reference was cross-checked on **21 November 2026** using active chip geometry,
the CRC-valid 744-byte ACPT table, the stock update, complete logical NAND/NOR
captures, filesystem allocation and driver/code analysis. The logical NAND dump
covers **128,974,848 bytes**; NOR covers **4,194,304 bytes**. Saved capture hashes
were rechecked before generating the explorer. Package and file checksums prove
consistency, not publisher cryptographic authenticity.

Captures span a running system and are not a simultaneous snapshot. Matching
FAT copies and validated structures provide regional consistency evidence.
The stock NAND read API can flush already-dirty runtime-log cache pages; this
method must not be described as guaranteed zero-write acquisition.

The reference does **not** establish clean-stock free space, destructive
full-capacity testing, NAND bad-block health, raw physical/OOB contents, every
configuration/history field, safe tail expansion or recovery after repartitioning.
No flash, reset, filesystem repair or expansion was used to establish these findings.

The [structured reference](/storage-explorer/watch-pro-2/downloads/wp2-storage-structure.v1.json)
records byte sizes, explicit ranges, source descriptions and verification limits.
Its [JSON Schema](/storage-explorer/watch-pro-2/downloads/wp2-storage-structure.schema.json)
defines the fields. The editable generator and reviewed metadata live in
`tools/storage_explorer/` in the repository; regenerating the viewer requires
neither a raw dump nor access to a watch.
