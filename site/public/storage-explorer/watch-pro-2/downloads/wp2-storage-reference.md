# CMF Watch Pro 2 storage reference

Reference firmware: **1.0.0.73**. Analysis date: **21 November 2026**.

The watch has **128 MiB NAND main storage** and **4 MiB NOR**. NAND exposes 123 MiB of logical storage; the remaining 5 MiB is managed by its flash translation layer. This is a firmware and hardware reference, not a factory-state dump.

## Reading the structure

- Hierarchy is a capacity/file view, not a physical adjacency map.
- Only nodes with explicit range values have a documented contiguous byte range. Aggregate nodes may combine disjoint metadata or padding.
- NAND logical offsets cannot be interpreted as physical NAND offsets.
- Child sizes sum to the parent, but child ranges may use different address spaces.
- No stock free-space figure is established. FF bytes and partition headroom are not classified as usable filesystem space.
- Device-capture evidence is not a factory-state measurement.
- Package checksums establish consistency, not publisher cryptographic authenticity.

Offsets and sizes are integers in bytes. Address-space names are part of every range; offsets from different spaces must not be combined. `endByteExclusive` excludes the byte at that endpoint. A null range means no contiguous range is specified.

## Hierarchy

```text
Watch Pro 2 — 138,412,032 bytes
  NAND — 134,217,728 bytes
    Logical NAND — 128,974,848 bytes
      fw0_temp — 3,670,016 bytes
      sdfs_k — 1,048,576 bytes
        sdfs_k.bin — 524,096 bytes
          welcome.act — 3,200 bytes
          tst.bin — 4,196 bytes
          sdfs.txt — 10 bytes
          ring5.act — 1,162 bytes
          ring4.act — 3,520 bytes
          ring3.act — 5,694 bytes
          ring2.act — 5,164 bytes
          ring1.act — 15,556 bytes
          poweroff.act — 3,212 bytes
          logo.sty — 204 bytes
          logo.res — 15,124 bytes
          find.act — 6,532 bytes
          fcc.bin — 38,352 bytes
          di.act — 654 bytes
          alarm.act — 22,084 bytes
          aging.act — 7,470 bytes
          admusic.dsp — 390,756 bytes
          Image metadata and alignment — 1,206 bytes
        Outside supplied image — 524,480 bytes
      dstorage — 2,097,152 bytes
        Primary settings object — 32,768 bytes
        Secondary settings object — 24,576 bytes
        Additional persistent state — 8,192 bytes
        Heart-rate history — 32,768 bytes
        Blood-oxygen history — 16,384 bytes
        Step/activity history — 28,672 bytes
        Sleep history — 102,400 bytes
        Workout summaries — 61,440 bytes
        Workout heart-rate history — 442,368 bytes
        GPS track history — 659,456 bytes
        Stress history — 16,384 bytes
        Outside decoded history areas — 671,744 bytes
      font — 12,582,912 bytes
        fonts.bin — 9,513,344 bytes
          test.font — 72,022 bytes
          sans32.font — 5,320,508 bytes
          local280.wfc — 145,865 bytes
          local277.wfc — 3,021,359 bytes
          local276.wfc — 120,480 bytes
          local275.wfc — 213,607 bytes
          local274.wfc — 405,659 bytes
          local273.wfc — 72,022 bytes
          emoji28.font — 141,248 bytes
          Image metadata and alignment — 574 bytes
        Outside supplied image — 3,069,568 bytes
      res_a — 10,485,760 bytes
        res.bin — 10,137,792 bytes
          tiger.svg — 101,129 bytes
          num88e.font — 15,504 bytes
          num80m.font — 14,964 bytes
          num74m.font — 12,812 bytes
          num74b.font — 8,484 bytes
          num72el.font — 10,636 bytes
          num72e.font — 10,636 bytes
          num70m.font — 11,672 bytes
          num64el.font — 8,416 bytes
          num58m.font — 8,012 bytes
          num56el.font — 6,612 bytes
          num56e.font — 6,612 bytes
          num48m.font — 5,688 bytes
          num46m.font — 5,184 bytes
          num44m.font — 4,676 bytes
          num42m.font — 4,240 bytes
          num40m.font — 3,904 bytes
          num38m.font — 3,564 bytes
          num36r.font — 3,244 bytes
          num36m.font — 3,492 bytes
          num36l.font — 2,984 bytes
          num34m.font — 3,316 bytes
          num32m.font — 3,236 bytes
          num28m.font — 2,660 bytes
          num26m.font — 2,020 bytes
          num24r.font — 1,608 bytes
          num24m.font — 1,656 bytes
          num20m.font — 1,148 bytes
          num18m.font — 996 bytes
          nm48n.font — 7,792 bytes
          nm36n.font — 3,760 bytes
          nm120nb.font — 34,468 bytes
          nm104n.font — 34,340 bytes
          font48r.font — 18,056 bytes
          font48m.font — 44,392 bytes
          font44l.font — 23,020 bytes
          font40r.font — 13,844 bytes
          font38r.font — 34,444 bytes
          font38m.font — 13,232 bytes
          font36r.font — 43,256 bytes
          font36n.font — 13,284 bytes
          font36m.font — 262,424 bytes
          font36l.font — 13,352 bytes
          font34r.font — 140,992 bytes
          font34m.font — 11,596 bytes
          font32r.font — 307,672 bytes
          font32m.font — 519,912 bytes
          font32l.font — 9,640 bytes
          font30r.font — 9,492 bytes
          font28r.font — 57,320 bytes
          font28m.font — 242,116 bytes
          font26r.font — 9,280 bytes
          font24r.font — 18,148 bytes
          font24m.font — 175,552 bytes
          font24l.font — 30,192 bytes
          font20r.font — 9,976 bytes
          font18m.font — 31,036 bytes
          fnt56el.font — 20,352 bytes
          bt_watch.zht — 28,897 bytes
          bt_watch.zhc — 29,182 bytes
          bt_watch.th — 59,195 bytes
          bt_watch.sty — 197,368 bytes
          bt_watch.sk — 33,493 bytes
          bt_watch.ru — 48,089 bytes
          bt_watch.ro — 34,640 bytes
          bt_watch.res — 6,682,132 bytes
          bt_watch.pt — 33,795 bytes
          bt_watch.pl — 33,782 bytes
          bt_watch.ko — 33,310 bytes
          bt_watch.ja — 37,190 bytes
          bt_watch.it — 34,305 bytes
          bt_watch.in — 53,904 bytes
          bt_watch.id — 32,530 bytes
          bt_watch.he — 37,620 bytes
          bt_watch.fr — 35,474 bytes
          bt_watch.fil — 33,828 bytes
          bt_watch.es — 34,511 bytes
          bt_watch.eng — 30,834 bytes
          bt_watch.de — 34,392 bytes
          bt_watch.cz — 33,398 bytes
          bt_watch.bg — 46,729 bytes
          bt_watch.ar — 52,021 bytes
          Image metadata and alignment — 5,128 bytes
        Outside supplied image — 347,968 bytes
      res_b — 8,388,608 bytes
      res_e — 67,108,864 bytes
        res_e.bin — 58,777,088 bytes
          9.ajs — 4,795,064 bytes
          8.ajs — 1,886,654 bytes
          7.ajs — 1,893,750 bytes
          6.ajs — 3,190,239 bytes
          5.ajs — 2,795,159 bytes
          4.ajs — 2,816,699 bytes
          3.ajs — 2,636,212 bytes
          2.ajs — 2,031,214 bytes
          19.ajs — 2,964,415 bytes
          18.ajs — 4,105,949 bytes
          17.ajs — 3,988,068 bytes
          16.ajs — 6,075,165 bytes
          15.ajs — 3,466,369 bytes
          14.ajs — 3,305,983 bytes
          13.ajs — 2,974,369 bytes
          12.ajs — 3,180,079 bytes
          11.ajs — 1,841,390 bytes
          10.ajs — 2,814,323 bytes
          1.ajs — 2,014,913 bytes
          Image metadata and alignment — 1,074 bytes
        Outside supplied image — 8,331,776 bytes
      runtimel — 2,097,152 bytes
      udisk — 10,485,760 bytes
      Unpartitioned logical tail — 11,010,048 bytes
    NAND management — 5,242,880 bytes
  NOR — 4,194,304 bytes
    fw0_boot — 4,096 bytes
    fw0_para — 4,096 bytes
    fw1_boot — 4,096 bytes
    fw1_para — 4,096 bytes
    fw0_rec — 131,072 bytes
    fw0_sys — 3,452,928 bytes
      Stock app.bin — 2,465,920 bytes
        Firmware header — 512 bytes
        Application code and embedded data — 2,464,828 bytes
        Packaged image padding — 580 bytes
      Outside supplied application — 987,008 bytes
    reserved — 409,600 bytes
    fw0_sdfs — 65,536 bytes
      sdfs.bin — 24,512 bytes
        usrcfg.bin — 16 bytes
        sdfs.txt — 10 bytes
        extcfg.bin — 16 bytes
        defcfg.bin — 205 bytes
        cfg_mic.bin — 528 bytes
        bt_rf.bin — 2,896 bytes
        bt_pth.bin — 14,976 bytes
        bttbl.bin — 3,306 bytes
        alcfg.bin — 1,860 bytes
        Image metadata and alignment — 699 bytes
      Outside supplied image — 41,024 bytes
    nvram_fa — 4,096 bytes
    nvram_fa — 8,192 bytes
    nvram_us — 8,192 bytes
    logbuf — 16,384 bytes
    coredump — 81,920 bytes
```

## Region and file records

### Watch Pro 2

ID: `wp2-33607e1d955de933`. Size: **138,412,032 bytes**. Category: `data`.

Stock 1.0.0.73 package contents combined with independently verified chip geometry and partition reservations. Not a clean-device dump.

**Verification:** Stock reference + hardware evidence.

### Watch Pro 2 / NAND

ID: `wp2-4b571776136dc237`. Size: **134,217,728 bytes**. Category: `data`.

128 MiB main area, excluding spare/OOB cells.

**Verification:** Verified chip geometry.

### Watch Pro 2 / NAND / Logical NAND

ID: `wp2-dc50bb1d2928d697`. Size: **128,974,848 bytes**. Category: `data`.

Driver-exported address space.

**Verification:** Verified driver geometry.

### Watch Pro 2 / NAND / Logical NAND / fw0_temp

ID: `wp2-117aa3fc91a04765`. Size: **3,670,016 bytes**. Category: `metadata`.

Temporary staging area for OTA updates.

**Verification:** Role verified; factory contents unknown.

**Purpose:** OTA update staging.

**Range:** `nand-logical` / `[0x00000000, 0x00380000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. The staged region does not match the stock stored TEMP.bin or its decompressed inner package. A complete AOTA container could not be validated at the region start; historical staging state remains unclassified.

**Driver and format:** Temporary OTA staging role: stock OTA XML targets fw0_temp, storage ID 2.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k

ID: `wp2-87db1f46715d0ab0`. Size: **1,048,576 bytes**. Category: `resources`.

Stock package image contents shown within the verified partition reservation.

**Verification:** Stock image + verified boundary.

**Purpose:** System resources.

**Range:** `nand-logical` / `[0x00380000, 0x00480000)`.

**Source:** Verified device ACPT partition table + stock OTA package.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. Captured SDFS directory: 17 named entries; named-file checksums pass for the listed entries (none when the directory is empty). This observation alone does not validate the complete image or establish stock identity.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin

ID: `wp2-7b598a804b5385ce`. Size: **524,096 bytes**. Category: `resources`.

Exact decompressed stock SDFS image, with all named file checksums validated.

**Verification:** Verified in stock package.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / welcome.act

ID: `wp2-cc81e54930110391`. Size: **3,200 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00380240, 0x00380EC0)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / tst.bin

ID: `wp2-c16ff04d27ec38c4`. Size: **4,196 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00380EC0, 0x00381F24)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / sdfs.txt

ID: `wp2-49f198367eda669d`. Size: **10 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00381F40, 0x00381F4A)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / ring5.act

ID: `wp2-02db83fbd2334406`. Size: **1,162 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00381F80, 0x0038240A)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / ring4.act

ID: `wp2-919975bc2915359e`. Size: **3,520 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00382440, 0x00383200)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / ring3.act

ID: `wp2-87540f1ea2e31879`. Size: **5,694 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00383200, 0x0038483E)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / ring2.act

ID: `wp2-cb01cc92c5a462cf`. Size: **5,164 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00384840, 0x00385C6C)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / ring1.act

ID: `wp2-691094ccd9957fb9`. Size: **15,556 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00385C80, 0x00389944)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / poweroff.act

ID: `wp2-b938ac061fb3d943`. Size: **3,212 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00389980, 0x0038A60C)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / logo.sty

ID: `wp2-63acd73a2ac05ca7`. Size: **204 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0038A640, 0x0038A70C)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / logo.res

ID: `wp2-8109849dc270beb5`. Size: **15,124 bytes**. Category: `artwork`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0038A740, 0x0038E254)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / find.act

ID: `wp2-29cc6b6597057085`. Size: **6,532 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0038E280, 0x0038FC04)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / fcc.bin

ID: `wp2-a94b7c43de82a19b`. Size: **38,352 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0038FC40, 0x00399210)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / di.act

ID: `wp2-13710e7cab2fb2b0`. Size: **654 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00399240, 0x003994CE)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / alarm.act

ID: `wp2-1fc8ae80eebf0104`. Size: **22,084 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00399500, 0x0039EB44)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / aging.act

ID: `wp2-6d14c8c4664093aa`. Size: **7,470 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0039EB80, 0x003A08AE)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / admusic.dsp

ID: `wp2-b7b49ebfb6f20a83`. Size: **390,756 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x003A08C0, 0x003FFF24)`.

**Source:** sdfs_k.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / sdfs_k.bin / Image metadata and alignment

ID: `wp2-f87560376691e17d`. Size: **1,206 bytes**. Category: `metadata`.

Headers, directory records and alignment bytes inside the supplied image. Not usable filesystem space.

**Verification:** Verified in stock package.

### Watch Pro 2 / NAND / Logical NAND / sdfs_k / Outside supplied image

ID: `wp2-8fb7db5e6c89e75d`. Size: **524,480 bytes**. Category: `reserved`.

Remaining partition capacity beyond the supplied stock image. This interval is outside the image file inventory.

**Verification:** Capacity known; contents unverified.

**Range:** `nand-logical` / `[0x003FFF40, 0x00480000)`.

**Device capture:** The interval contains non-FF bytes; it cannot be called erased or free. The preceding stock image is byte-identical to the captured prefix.

**Verification limits:** Stock installed contents, byte ownership and subsequent use are undocumented.

### Watch Pro 2 / NAND / Logical NAND / dstorage

ID: `wp2-c036ad1d1312f39c`. Size: **2,097,152 bytes**. Category: `metadata`.

Persistent settings and sensor/activity history. Stock firmware defines eleven typed areas; the remaining interval is undocumented.

**Verification:** Stock history layout verified; field meanings partial.

**Purpose:** Settings and recorded history.

**Range:** `nand-logical` / `[0x00480000, 0x00680000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data.

**Driver and format:** All 11 history descriptors (396 table bytes) and their pointed-to object-size descriptors match exactly between stock 1.0.0.73 and the captured app. Typed offsets and reservations derive directly from stock code; field semantics are only partially decoded.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NAND / Logical NAND / dstorage / Primary settings object

ID: `wp2-44a47f63ae73c8c4`. Size: **32,768 bytes**. Category: `metadata`.

Stock descriptor type 0: 16,384-byte slots, 13,528-byte objects. Reservation is not a measure of populated records. Exact field semantics and factory contents remain incomplete.

**Verification:** Stock descriptor verified; fields partial.

**Range:** `nand-logical` / `[0x00480000, 0x00488000)`.

**Source:** Stock app table at CPU 0x101F2C78 + matching captured code.

### Watch Pro 2 / NAND / Logical NAND / dstorage / Secondary settings object

ID: `wp2-f2247996c4a9f578`. Size: **24,576 bytes**. Category: `metadata`.

Stock descriptor type 1: 12,288-byte slots, 4,856-byte objects. Reservation is not a measure of populated records. Exact field semantics and factory contents remain incomplete.

**Verification:** Stock descriptor verified; fields partial.

**Range:** `nand-logical` / `[0x00488000, 0x0048E000)`.

**Source:** Stock app table at CPU 0x101F2C78 + matching captured code.

### Watch Pro 2 / NAND / Logical NAND / dstorage / Additional persistent state

ID: `wp2-ecec806047709b06`. Size: **8,192 bytes**. Category: `metadata`.

Stock descriptor type 2: 4,096-byte slots, 2,544-byte objects. Reservation is not a measure of populated records. Exact field semantics and factory contents remain incomplete.

**Verification:** Stock descriptor verified; fields partial.

**Range:** `nand-logical` / `[0x0048E000, 0x00490000)`.

**Source:** Stock app table at CPU 0x101F2C78 + matching captured code.

### Watch Pro 2 / NAND / Logical NAND / dstorage / Heart-rate history

ID: `wp2-a4fcf22e327c413c`. Size: **32,768 bytes**. Category: `metadata`.

Stock descriptor type 3: 4,096-byte slots, 2,328-byte objects. Reservation is not a measure of populated records. Exact field semantics and factory contents remain incomplete.

**Verification:** Stock descriptor verified; fields partial.

**Range:** `nand-logical` / `[0x00490000, 0x00498000)`.

**Source:** Stock app table at CPU 0x101F2C78 + matching captured code.

### Watch Pro 2 / NAND / Logical NAND / dstorage / Blood-oxygen history

ID: `wp2-49148c79db0cc0f5`. Size: **16,384 bytes**. Category: `metadata`.

Stock descriptor type 4: 2,048-byte slots, 408-byte objects. Reservation is not a measure of populated records. Exact field semantics and factory contents remain incomplete.

**Verification:** Stock descriptor verified; fields partial.

**Range:** `nand-logical` / `[0x00498000, 0x0049C000)`.

**Source:** Stock app table at CPU 0x101F2C78 + matching captured code.

### Watch Pro 2 / NAND / Logical NAND / dstorage / Step/activity history

ID: `wp2-e730aa2bc51544b3`. Size: **28,672 bytes**. Category: `metadata`.

Stock descriptor type 5: 2,048-byte slots, 792-byte objects. Reservation is not a measure of populated records. Exact field semantics and factory contents remain incomplete.

**Verification:** Stock descriptor verified; fields partial.

**Range:** `nand-logical` / `[0x0049C000, 0x004A3000)`.

**Source:** Stock app table at CPU 0x101F2C78 + matching captured code.

### Watch Pro 2 / NAND / Logical NAND / dstorage / Sleep history

ID: `wp2-c07ab01b3b6a3ecb`. Size: **102,400 bytes**. Category: `metadata`.

Stock descriptor type 6: 2,048-byte slots, 848-byte objects. Reservation is not a measure of populated records. Exact field semantics and factory contents remain incomplete.

**Verification:** Stock descriptor verified; fields partial.

**Range:** `nand-logical` / `[0x004A3000, 0x004BC000)`.

**Source:** Stock app table at CPU 0x101F2C78 + matching captured code.

### Watch Pro 2 / NAND / Logical NAND / dstorage / Workout summaries

ID: `wp2-26a18d7129fd8fa2`. Size: **61,440 bytes**. Category: `metadata`.

Stock descriptor type 7: 4,096-byte slots, 184-byte objects. Reservation is not a measure of populated records. Exact field semantics and factory contents remain incomplete.

**Verification:** Stock descriptor verified; fields partial.

**Range:** `nand-logical` / `[0x004BC000, 0x004CB000)`.

**Source:** Stock app table at CPU 0x101F2C78 + matching captured code.

### Watch Pro 2 / NAND / Logical NAND / dstorage / Workout heart-rate history

ID: `wp2-3a7291ae71e243ba`. Size: **442,368 bytes**. Category: `metadata`.

Stock descriptor type 8: 2,048-byte slots, 2,024-byte objects. Reservation is not a measure of populated records. Exact field semantics and factory contents remain incomplete.

**Verification:** Stock descriptor verified; fields partial.

**Range:** `nand-logical` / `[0x004CB000, 0x00537000)`.

**Source:** Stock app table at CPU 0x101F2C78 + matching captured code.

### Watch Pro 2 / NAND / Logical NAND / dstorage / GPS track history

ID: `wp2-39bf35fe690ad706`. Size: **659,456 bytes**. Category: `metadata`.

Stock descriptor type 9: 2,048-byte slots, 2,024-byte objects. Reservation is not a measure of populated records. Exact field semantics and factory contents remain incomplete.

**Verification:** Stock descriptor verified; fields partial.

**Range:** `nand-logical` / `[0x00537000, 0x005D8000)`.

**Source:** Stock app table at CPU 0x101F2C78 + matching captured code.

### Watch Pro 2 / NAND / Logical NAND / dstorage / Stress history

ID: `wp2-b194cd25cfd917f8`. Size: **16,384 bytes**. Category: `metadata`.

Stock descriptor type 10: 2,048-byte slots, 408-byte objects. Reservation is not a measure of populated records. Exact field semantics and factory contents remain incomplete.

**Verification:** Stock descriptor verified; fields partial.

**Range:** `nand-logical` / `[0x005D8000, 0x005DC000)`.

**Source:** Stock app table at CPU 0x101F2C78 + matching captured code.

### Watch Pro 2 / NAND / Logical NAND / dstorage / Outside decoded history areas

ID: `wp2-e7d21616d6f20025`. Size: **671,744 bytes**. Category: `unknown`.

Not covered by the 11 verified type reservations. May be reserved or used by other storage logic; contents and ownership are not documented.

**Verification:** Purpose unresolved.

**Range:** `nand-logical` / `[0x005DC000, 0x00680000)`.

### Watch Pro 2 / NAND / Logical NAND / font

ID: `wp2-14c1d379c5ac65cc`. Size: **12,582,912 bytes**. Category: `resources`.

Stock package image contents shown within the verified partition reservation.

**Verification:** Stock image + verified boundary.

**Purpose:** Fonts and built-in watch faces.

**Range:** `nand-logical` / `[0x00680000, 0x01280000)`.

**Source:** Verified device ACPT partition table + stock OTA package.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. Captured SDFS directory: 9 named entries; named-file checksums pass for the listed entries (none when the directory is empty). This observation alone does not validate the complete image or establish stock identity.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NAND / Logical NAND / font / fonts.bin

ID: `wp2-0b27bc44bb059eea`. Size: **9,513,344 bytes**. Category: `resources`.

Exact decompressed stock SDFS image, with all named file checksums validated.

**Verification:** Verified in stock package.

### Watch Pro 2 / NAND / Logical NAND / font / fonts.bin / test.font

ID: `wp2-b4b0c914a8e66899`. Size: **72,022 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00680140, 0x00691A96)`.

**Source:** fonts.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / font / fonts.bin / sans32.font

ID: `wp2-a4484728e9d248ce`. Size: **5,320,508 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00691AC0, 0x00BA49FC)`.

**Source:** fonts.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / font / fonts.bin / local280.wfc

ID: `wp2-5377b08a902f9040`. Size: **145,865 bytes**. Category: `faces`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00BA4A00, 0x00BC83C9)`.

**Source:** fonts.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / font / fonts.bin / local277.wfc

ID: `wp2-f72239fad46e4ef0`. Size: **3,021,359 bytes**. Category: `faces`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00BC8400, 0x00EA9E2F)`.

**Source:** fonts.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / font / fonts.bin / local276.wfc

ID: `wp2-20149c702de9123d`. Size: **120,480 bytes**. Category: `faces`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00EA9E40, 0x00EC74E0)`.

**Source:** fonts.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / font / fonts.bin / local275.wfc

ID: `wp2-8d1a6da3b7f2bc85`. Size: **213,607 bytes**. Category: `faces`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00EC7500, 0x00EFB767)`.

**Source:** fonts.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / font / fonts.bin / local274.wfc

ID: `wp2-3f45e10305c91e10`. Size: **405,659 bytes**. Category: `faces`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00EFB780, 0x00F5E81B)`.

**Source:** fonts.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / font / fonts.bin / local273.wfc

ID: `wp2-bf8a9891895272dc`. Size: **72,022 bytes**. Category: `faces`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00F5E840, 0x00F70196)`.

**Source:** fonts.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / font / fonts.bin / emoji28.font

ID: `wp2-5e95c0b9b203c044`. Size: **141,248 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x00F701C0, 0x00F92980)`.

**Source:** fonts.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / font / fonts.bin / Image metadata and alignment

ID: `wp2-f279dbe877842793`. Size: **574 bytes**. Category: `metadata`.

Headers, directory records and alignment bytes inside the supplied image. Not usable filesystem space.

**Verification:** Verified in stock package.

### Watch Pro 2 / NAND / Logical NAND / font / Outside supplied image

ID: `wp2-af6d283cc98e03f4`. Size: **3,069,568 bytes**. Category: `reserved`.

Remaining partition capacity beyond the supplied stock image. This interval is outside the image file inventory.

**Verification:** Capacity known; contents unverified.

**Range:** `nand-logical` / `[0x00F92980, 0x01280000)`.

**Device capture:** The interval contains non-FF bytes; it cannot be called erased or free. The preceding stock image is byte-identical to the captured prefix.

**Verification limits:** Stock installed contents, byte ownership and subsequent use are undocumented.

### Watch Pro 2 / NAND / Logical NAND / res_a

ID: `wp2-00bc7f16ea91b7fb`. Size: **10,485,760 bytes**. Category: `resources`.

Stock package image contents shown within the verified partition reservation.

**Verification:** Stock image + verified boundary.

**Purpose:** UI resources.

**Range:** `nand-logical` / `[0x01280000, 0x01C80000)`.

**Source:** Verified device ACPT partition table + stock OTA package.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. Captured SDFS directory: 82 named entries; named-file checksums pass for the listed entries (none when the directory is empty). This observation alone does not validate the complete image or establish stock identity.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin

ID: `wp2-7618d2e9632fab87`. Size: **10,137,792 bytes**. Category: `resources`.

Exact decompressed stock SDFS image, with all named file checksums validated.

**Verification:** Verified in stock package.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / tiger.svg

ID: `wp2-e81cd0520189e20a`. Size: **101,129 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01280A80, 0x01299589)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num88e.font

ID: `wp2-ba0db9af7367d0bc`. Size: **15,504 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012995C0, 0x0129D250)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num80m.font

ID: `wp2-3d0676a4b928ce0f`. Size: **14,964 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0129D280, 0x012A0CF4)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num74m.font

ID: `wp2-37e12a7947056850`. Size: **12,812 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012A0D00, 0x012A3F0C)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num74b.font

ID: `wp2-239ad896c042942f`. Size: **8,484 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012A3F40, 0x012A6064)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num72el.font

ID: `wp2-cc23b66c620cd734`. Size: **10,636 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012A6080, 0x012A8A0C)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num72e.font

ID: `wp2-4cfc870861e0186c`. Size: **10,636 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012A8A40, 0x012AB3CC)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num70m.font

ID: `wp2-2533a9476788c2ab`. Size: **11,672 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012AB400, 0x012AE198)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num64el.font

ID: `wp2-424196e605b49e72`. Size: **8,416 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012AE1C0, 0x012B02A0)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num58m.font

ID: `wp2-d91ea980f4d13c01`. Size: **8,012 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012B02C0, 0x012B220C)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num56el.font

ID: `wp2-3adec7f4922c1655`. Size: **6,612 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012B2240, 0x012B3C14)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num56e.font

ID: `wp2-1db8bccfadb7c4ac`. Size: **6,612 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012B3C40, 0x012B5614)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num48m.font

ID: `wp2-f66d0a998c159012`. Size: **5,688 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012B5640, 0x012B6C78)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num46m.font

ID: `wp2-1a0e92d5966a2602`. Size: **5,184 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012B6C80, 0x012B80C0)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num44m.font

ID: `wp2-cedcc37ce7e444b2`. Size: **4,676 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012B80C0, 0x012B9304)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num42m.font

ID: `wp2-876bfd5b5f373d61`. Size: **4,240 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012B9340, 0x012BA3D0)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num40m.font

ID: `wp2-8b54b6d914eef106`. Size: **3,904 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012BA400, 0x012BB340)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num38m.font

ID: `wp2-d382176c4d16ef31`. Size: **3,564 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012BB340, 0x012BC12C)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num36r.font

ID: `wp2-ae7692eaf8be9503`. Size: **3,244 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012BC140, 0x012BCDEC)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num36m.font

ID: `wp2-c814d9b9714af7e8`. Size: **3,492 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012BCE00, 0x012BDBA4)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num36l.font

ID: `wp2-28f00f340c1fe25a`. Size: **2,984 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012BDBC0, 0x012BE768)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num34m.font

ID: `wp2-059cb70c031dab96`. Size: **3,316 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012BE780, 0x012BF474)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num32m.font

ID: `wp2-dd698e50875fcaf3`. Size: **3,236 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012BF480, 0x012C0124)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num28m.font

ID: `wp2-eb0e989644e7edbf`. Size: **2,660 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012C0140, 0x012C0BA4)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num26m.font

ID: `wp2-71053ec2869d4b22`. Size: **2,020 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012C0BC0, 0x012C13A4)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num24r.font

ID: `wp2-6c09955befefb2a6`. Size: **1,608 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012C13C0, 0x012C1A08)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num24m.font

ID: `wp2-18fbdc9b3a5cf6b6`. Size: **1,656 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012C1A40, 0x012C20B8)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num20m.font

ID: `wp2-0a2603dc9b3492ff`. Size: **1,148 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012C20C0, 0x012C253C)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / num18m.font

ID: `wp2-d00ec119b2df5798`. Size: **996 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012C2540, 0x012C2924)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / nm48n.font

ID: `wp2-7d08fa5ad5616c91`. Size: **7,792 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012C2940, 0x012C47B0)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / nm36n.font

ID: `wp2-fb10464b20d6b772`. Size: **3,760 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012C47C0, 0x012C5670)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / nm120nb.font

ID: `wp2-98fee1564aeb1b86`. Size: **34,468 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012C5680, 0x012CDD24)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / nm104n.font

ID: `wp2-4230b79ce822ad0c`. Size: **34,340 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012CDD40, 0x012D6364)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font48r.font

ID: `wp2-40e78e39381e5e71`. Size: **18,056 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012D6380, 0x012DAA08)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font48m.font

ID: `wp2-4fb24b8a8316b36f`. Size: **44,392 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012DAA40, 0x012E57A8)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font44l.font

ID: `wp2-af4f9987407600d7`. Size: **23,020 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012E57C0, 0x012EB1AC)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font40r.font

ID: `wp2-a207958c7969db8e`. Size: **13,844 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012EB1C0, 0x012EE7D4)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font38r.font

ID: `wp2-fe65c9d6735e1082`. Size: **34,444 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012EE800, 0x012F6E8C)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font38m.font

ID: `wp2-c01d1b6f2ec39061`. Size: **13,232 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012F6EC0, 0x012FA270)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font36r.font

ID: `wp2-f03eaab8ad6261e9`. Size: **43,256 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x012FA280, 0x01304B78)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font36n.font

ID: `wp2-0762f805ac63e521`. Size: **13,284 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01304B80, 0x01307F64)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font36m.font

ID: `wp2-28dd8614231dd819`. Size: **262,424 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01307F80, 0x01348098)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font36l.font

ID: `wp2-43ff227a4fbc50be`. Size: **13,352 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x013480C0, 0x0134B4E8)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font34r.font

ID: `wp2-759d9552abf9654f`. Size: **140,992 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0134B500, 0x0136DBC0)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font34m.font

ID: `wp2-fc35dfdcc593b685`. Size: **11,596 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0136DBC0, 0x0137090C)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font32r.font

ID: `wp2-cc521a26c4a5dc5b`. Size: **307,672 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01370940, 0x013BBB18)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font32m.font

ID: `wp2-4b5835af502dbaf1`. Size: **519,912 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x013BBB40, 0x0143AA28)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font32l.font

ID: `wp2-54ef90e8c49df8f7`. Size: **9,640 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0143AA40, 0x0143CFE8)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font30r.font

ID: `wp2-5d7fb00c212611b0`. Size: **9,492 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0143D000, 0x0143F514)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font28r.font

ID: `wp2-a6e7d1d04cb74998`. Size: **57,320 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0143F540, 0x0144D528)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font28m.font

ID: `wp2-9baf107f7247bd25`. Size: **242,116 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0144D540, 0x01488704)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font26r.font

ID: `wp2-95d58fe527b960b1`. Size: **9,280 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01488740, 0x0148AB80)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font24r.font

ID: `wp2-ad960b64dacfaff9`. Size: **18,148 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0148AB80, 0x0148F264)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font24m.font

ID: `wp2-8740f8cfefbbc9fd`. Size: **175,552 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0148F280, 0x014BA040)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font24l.font

ID: `wp2-ac81cde338d8acd4`. Size: **30,192 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x014BA040, 0x014C1630)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font20r.font

ID: `wp2-dec7412c2b9a333a`. Size: **9,976 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x014C1640, 0x014C3D38)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / font18m.font

ID: `wp2-8d5d3dc129627ea2`. Size: **31,036 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x014C3D40, 0x014CB67C)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / fnt56el.font

ID: `wp2-182212d459ba5bd1`. Size: **20,352 bytes**. Category: `fonts`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x014CB680, 0x014D0600)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.zht

ID: `wp2-17eda667e3073530`. Size: **28,897 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x014D0600, 0x014D76E1)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.zhc

ID: `wp2-cf679b30ade0812d`. Size: **29,182 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x014D7700, 0x014DE8FE)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.th

ID: `wp2-9163eae7cede626e`. Size: **59,195 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x014DE900, 0x014ED03B)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.sty

ID: `wp2-0e8358bf00ec049b`. Size: **197,368 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x014ED040, 0x0151D338)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.sk

ID: `wp2-ac5d55b6de485bcb`. Size: **33,493 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x0151D340, 0x01525615)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.ru

ID: `wp2-e42ee09cd1b17651`. Size: **48,089 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01525640, 0x01531219)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.ro

ID: `wp2-464171941cb18bb6`. Size: **34,640 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01531240, 0x01539990)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.res

ID: `wp2-0928389e7846d86f`. Size: **6,682,132 bytes**. Category: `artwork`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x015399C0, 0x01B98FD4)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.pt

ID: `wp2-34006bd5bbc8aa8c`. Size: **33,795 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01B99000, 0x01BA1403)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.pl

ID: `wp2-79948c6c97472439`. Size: **33,782 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01BA1440, 0x01BA9836)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.ko

ID: `wp2-d324bd4495e7f3e4`. Size: **33,310 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01BA9840, 0x01BB1A5E)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.ja

ID: `wp2-a5cd2e46d43f8527`. Size: **37,190 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01BB1A80, 0x01BBABC6)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.it

ID: `wp2-8836b0ad4f3e7c79`. Size: **34,305 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01BBAC00, 0x01BC3201)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.in

ID: `wp2-00b6548b38df2b41`. Size: **53,904 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01BC3240, 0x01BD04D0)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.id

ID: `wp2-2d11d8e0b7f5c965`. Size: **32,530 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01BD0500, 0x01BD8412)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.he

ID: `wp2-d6624e1376274419`. Size: **37,620 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01BD8440, 0x01BE1734)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.fr

ID: `wp2-65dfcc574707105f`. Size: **35,474 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01BE1740, 0x01BEA1D2)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.fil

ID: `wp2-84aae9f8953d9189`. Size: **33,828 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01BEA200, 0x01BF2624)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.es

ID: `wp2-5a09d183149e9dab`. Size: **34,511 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01BF2640, 0x01BFAD0F)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.eng

ID: `wp2-857afa6a260140a1`. Size: **30,834 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01BFAD40, 0x01C025B2)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.de

ID: `wp2-72c4452f7d85cb36`. Size: **34,392 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01C025C0, 0x01C0AC18)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.cz

ID: `wp2-d5fd1db0d13df54f`. Size: **33,398 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01C0AC40, 0x01C12EB6)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.bg

ID: `wp2-02034cc1e02171a3`. Size: **46,729 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01C12EC0, 0x01C1E549)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / bt_watch.ar

ID: `wp2-301da254c97e2d54`. Size: **52,021 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x01C1E580, 0x01C2B0B5)`.

**Source:** res.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_a / res.bin / Image metadata and alignment

ID: `wp2-956e8b966eeed418`. Size: **5,128 bytes**. Category: `metadata`.

Headers, directory records and alignment bytes inside the supplied image. Not usable filesystem space.

**Verification:** Verified in stock package.

### Watch Pro 2 / NAND / Logical NAND / res_a / Outside supplied image

ID: `wp2-e554a2d1ee18044d`. Size: **347,968 bytes**. Category: `reserved`.

Remaining partition capacity beyond the supplied stock image. This interval is outside the image file inventory.

**Verification:** Capacity known; contents unverified.

**Range:** `nand-logical` / `[0x01C2B0C0, 0x01C80000)`.

**Device capture:** The interval contains non-FF bytes; it cannot be called erased or free. The captured image differs from stock, so the stock boundary is not evidence of the captured image end.

**Verification limits:** Stock installed contents, byte ownership and subsequent use are undocumented.

### Watch Pro 2 / NAND / Logical NAND / res_b

ID: `wp2-e729e7799acc8748`. Size: **8,388,608 bytes**. Category: `resources`.

Resource partition without an image in this stock OTA. The device capture contains an empty SDFS directory.

**Verification:** Captured SDFS has zero directory entries; body checksum fails.

**Purpose:** Resource partition.

**Range:** `nand-logical` / `[0x01C80000, 0x02480000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. Captured SDFS directory: 0 named entries; named-file checksums pass for the listed entries (none when the directory is empty). This observation alone does not validate the complete image or establish stock identity.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Empty SDFS directory does not mean the reservation is blank. Its previously audited body-checksum mismatch remains unresolved. Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NAND / Logical NAND / res_e

ID: `wp2-027d690ae1b16151`. Size: **67,108,864 bytes**. Category: `resources`.

Stock package image contents shown within the verified partition reservation.

**Verification:** Stock image + verified boundary.

**Purpose:** Watch-face resources.

**Range:** `nand-logical` / `[0x02480000, 0x06480000)`.

**Source:** Verified device ACPT partition table + stock OTA package.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. Captured SDFS directory: 19 named entries; named-file checksums pass for the listed entries (none when the directory is empty). This observation alone does not validate the complete image or establish stock identity.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin

ID: `wp2-ce667df17823618d`. Size: **58,777,088 bytes**. Category: `resources`.

Exact decompressed stock SDFS image, with all named file checksums validated.

**Verification:** Verified in stock package.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 9.ajs

ID: `wp2-f127c8e0c28db8df`. Size: **4,795,064 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x02480280, 0x02912D38)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 8.ajs

ID: `wp2-792a6ba0a089e3c5`. Size: **1,886,654 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x02912D40, 0x02ADF6FE)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 7.ajs

ID: `wp2-46ab700db57e40c3`. Size: **1,893,750 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x02ADF700, 0x02CADC76)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 6.ajs

ID: `wp2-4fbee5e523d7edb4`. Size: **3,190,239 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x02CADC80, 0x02FB8A5F)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 5.ajs

ID: `wp2-a0f4b3a8c35e4a89`. Size: **2,795,159 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x02FB8A80, 0x03263117)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 4.ajs

ID: `wp2-34b395d326ba8b19`. Size: **2,816,699 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x03263140, 0x03512BFB)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 3.ajs

ID: `wp2-bd3bb15e2ae0292a`. Size: **2,636,212 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x03512C00, 0x037965B4)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 2.ajs

ID: `wp2-e02e689d1eba489a`. Size: **2,031,214 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x037965C0, 0x0398642E)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 19.ajs

ID: `wp2-389d29a9de32a026`. Size: **2,964,415 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x03986440, 0x03C59FFF)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 18.ajs

ID: `wp2-bd35d6749c3cefe4`. Size: **4,105,949 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x03C5A000, 0x040446DD)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 17.ajs

ID: `wp2-94fe168084544312`. Size: **3,988,068 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x04044700, 0x04412164)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 16.ajs

ID: `wp2-76b36f0f9ef3e9a8`. Size: **6,075,165 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x04412180, 0x049DD49D)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 15.ajs

ID: `wp2-9c589fcefe514d6b`. Size: **3,466,369 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x049DD4C0, 0x04D2B941)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 14.ajs

ID: `wp2-13e11eb39ee2b089`. Size: **3,305,983 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x04D2B980, 0x05052B7F)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 13.ajs

ID: `wp2-8b7215928de55def`. Size: **2,974,369 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x05052B80, 0x05328E21)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 12.ajs

ID: `wp2-6a13701efdd91bb8`. Size: **3,180,079 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x05328E40, 0x0563146F)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 11.ajs

ID: `wp2-29cafc0bb007c6bf`. Size: **1,841,390 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x05631480, 0x057F2D6E)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 10.ajs

ID: `wp2-7007ad50bb721b57`. Size: **2,814,323 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x057F2D80, 0x05AA1EF3)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / 1.ajs

ID: `wp2-e42deb4146e4498b`. Size: **2,014,913 bytes**. Category: `animations`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nand-logical` / `[0x05AA1F00, 0x05C8DDC1)`.

**Source:** res_e.bin / SDFS directory + file checksum.

### Watch Pro 2 / NAND / Logical NAND / res_e / res_e.bin / Image metadata and alignment

ID: `wp2-1bfa1cb609906fcc`. Size: **1,074 bytes**. Category: `metadata`.

Headers, directory records and alignment bytes inside the supplied image. Not usable filesystem space.

**Verification:** Verified in stock package.

### Watch Pro 2 / NAND / Logical NAND / res_e / Outside supplied image

ID: `wp2-8aa1f4541a581cd0`. Size: **8,331,776 bytes**. Category: `reserved`.

Remaining partition capacity beyond the supplied stock image. This interval is outside the image file inventory.

**Verification:** Capacity known; contents unverified.

**Range:** `nand-logical` / `[0x05C8DE00, 0x06480000)`.

**Device capture:** Entire interval was FF. The captured image differs from stock, so the stock boundary is not evidence of the captured image end.

**Verification limits:** Stock installed contents, byte ownership and subsequent use are undocumented.

### Watch Pro 2 / NAND / Logical NAND / runtimel

ID: `wp2-90796311bda0a528`. Size: **2,097,152 bytes**. Category: `metadata`.

Persistent runtime diagnostics. This is separate from the flash translation layer’s internal update-log blocks.

**Verification:** Role verified; factory contents unknown.

**Purpose:** Runtime diagnostic logs.

**Range:** `nand-logical` / `[0x06480000, 0x06680000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data.

**Driver and format:** Runtime diagnostic log role: ACPT file ID 0xFA matches the SDK runtime-log identifier.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NAND / Logical NAND / udisk

ID: `wp2-abc06531e4aba7eb`. Size: **10,485,760 bytes**. Category: `filesystem`.

Writable file storage used for custom apps and other files. The partition reserves 10 MiB; the captured FAT16 format provides 10,426,368 bytes of file-data capacity. Clean-stock free space has not been measured. Installed apps and their usage are excluded from this reference.

**Verification:** Writable filesystem verified; captured FAT16 format verified; clean-stock free space not measured.

**Purpose:** Writable file storage (FAT16 observed).

**Range:** `nand-logical` / `[0x06680000, 0x07080000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. Observed FAT16 format: 512-byte sectors, 1024-byte clusters, two identical FAT copies. 59,392 bytes of format overhead leave 10,426,368 bytes of file-data capacity. These describe the captured format, not verified factory formatting or available space.

**Driver and format:** ACPT file ID 40 matches PARTITION_FILE_ID_UDISK in the Actions SDK partition header. Filesystem geometry comes from the captured boot sector and allocation-table equality; installed files and their free-space counts are excluded.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NAND / Logical NAND / Unpartitioned logical tail

ID: `wp2-73b9c33487635b90`. Size: **11,010,048 bytes**. Category: `reserved`.

Logical NAND interval not assigned by the partition table. The stock OTA does not specify its contents or subsequent ownership.

**Verification:** Boundary verified; stock contents unknown.

**Purpose:** Outside the partition table; reuse unverified.

**Range:** `nand-logical` / `[0x07080000, 0x07B00000)`.

**Device capture:** All 11,010,048 bytes are FF; a prior independent full-tail read agreed.

**Verification limits:** Factory state, future OTA ownership, successful writes and subsequent use remain undocumented.

### Watch Pro 2 / NAND / NAND management

ID: `wp2-e887a498bda7086c`. Size: **5,242,880 bytes**. Category: `metadata`.

Capacity managed internally by the flash translation layer: mapping tables, update-log blocks and the block allocation pool.

**Verification:** Capacity and roles verified; stock allocation unknown.

**Purpose:** Flash translation and block management.

**Source:** Chip geometry + driver trace + live metadata; no physical content dump.

**Driver and format:** 1024 physical blocks minus 984 logical blocks = 40 blocks (5 MiB). Physical-page reader and mapping/log/pool handling were traced.

**Device capture:** Two live RAM metadata captures accounted for 8 update-log blocks, 31 allocation-pool blocks and 1 zone-table block. Two physical blocks exchanged roles; these counts are observations, not a factory baseline.

**Verification limits:** Raw physical contents, full OOB, per-block health and factory role assignments remain unverified. Pool membership does not imply erased pages.

### Watch Pro 2 / NOR

ID: `wp2-611fc901bc5cef0a`. Size: **4,194,304 bytes**. Category: `firmware`.

Separate 4 MiB NOR chip. Unknown regions remain explicit.

**Verification:** Verified chip geometry.

### Watch Pro 2 / NOR / fw0_boot

ID: `wp2-9ecce20ce0512ac0`. Size: **4,096 bytes**. Category: `firmware`.

Primary bootloader reservation.

**Verification:** Captured image validated; stock identity unknown.

**Purpose:** Primary bootloader.

**Range:** `nor-physical` / `[0x00000000, 0x00001000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. Captured firmware image: 3,816 bytes (56-byte header and 3,760-byte payload); both ACTH checksums pass. Stock identity is not established for this captured image.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / fw0_para

ID: `wp2-ea7f315d3d25a094`. Size: **4,096 bytes**. Category: `metadata`.

Active partition table: chip selection, offsets, sizes and firmware file identifiers.

**Verification:** Captured ACPT verified; factory state unknown.

**Purpose:** Active partition table.

**Range:** `nor-physical` / `[0x00001000, 0x00002000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. The 744-byte active ACPT table passes CRC32 and exactly matches all 22 recorded partition boundaries.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / fw1_boot

ID: `wp2-0fb4dfbdca648409`. Size: **4,096 bytes**. Category: `firmware`.

Secondary bootloader reservation.

**Verification:** Boundary verified; contents unknown.

**Purpose:** Secondary bootloader reservation.

**Range:** `nor-physical` / `[0x00002000, 0x00003000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** Entire reservation was FF in the device capture. This does not prove a factory default or ownership of the interval.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / fw1_para

ID: `wp2-443ec66476b56f18`. Size: **4,096 bytes**. Category: `metadata`.

Secondary partition-table reservation.

**Verification:** Boundary verified; contents unknown.

**Purpose:** Secondary partition-table reservation.

**Range:** `nor-physical` / `[0x00003000, 0x00004000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** Entire reservation was FF in the device capture. This does not prove a factory default or ownership of the interval.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / fw0_rec

ID: `wp2-4ab422e3fded8650`. Size: **131,072 bytes**. Category: `firmware`.

Recovery firmware reservation.

**Verification:** Captured image validated; stock identity unknown.

**Purpose:** Recovery firmware.

**Range:** `nor-physical` / `[0x00004000, 0x00024000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. Captured firmware image: 95,844 bytes (512-byte header and 95,332-byte payload); both ACTH checksums pass. Stock identity is not established for this captured image.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / fw0_sys

ID: `wp2-87c929087a1e21df`. Size: **3,452,928 bytes**. Category: `firmware`.

Main application firmware. The image breakdown uses stock firmware 1.0.0.73.

**Verification:** Stock image + verified boundary.

**Purpose:** Main application firmware.

**Range:** `nor-physical` / `[0x00024000, 0x0036F000)`.

**Source:** Verified device ACPT partition table + stock OTA package.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. Captured firmware image: 2,482,320 bytes (512-byte header and 2,481,808-byte payload); both ACTH checksums pass. Stock identity is not established for this captured image.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / fw0_sys / Stock app.bin

ID: `wp2-d62ca194acc1e3f2`. Size: **2,465,920 bytes**. Category: `firmware`.

Unmodified application from the nested stock OTA.

**Verification:** Verified in stock package.

### Watch Pro 2 / NOR / fw0_sys / Stock app.bin / Firmware header

ID: `wp2-1499f17c5528bf5c`. Size: **512 bytes**. Category: `metadata`.

Stock ACTH header checksum passes.

**Verification:** Verified in stock package.

### Watch Pro 2 / NOR / fw0_sys / Stock app.bin / Application code and embedded data

ID: `wp2-6ecaf3bab163cbcd`. Size: **2,464,828 bytes**. Category: `firmware`.

Stock application payload checksum passes. Internal code and data are not fully classified here.

**Verification:** Verified in stock package.

### Watch Pro 2 / NOR / fw0_sys / Stock app.bin / Packaged image padding

ID: `wp2-4487337495c36726`. Size: **580 bytes**. Category: `metadata`.

Bytes included in stock app.bin beyond its declared ACTH payload.

**Verification:** Verified in stock package.

### Watch Pro 2 / NOR / fw0_sys / Outside supplied application

ID: `wp2-732f6d1d66e70e15`. Size: **987,008 bytes**. Category: `reserved`.

Remaining partition capacity beyond the supplied stock image. This interval is outside the image file inventory.

**Verification:** Capacity known; contents unverified.

**Range:** `nor-physical` / `[0x0027E080, 0x0036F000)`.

**Device capture:** The interval contains non-FF bytes; it cannot be called erased or free. The captured image differs from stock, so the stock boundary is not evidence of the captured image end.

**Verification limits:** Stock installed contents, byte ownership and subsequent use are undocumented.

### Watch Pro 2 / NOR / reserved

ID: `wp2-bbba900808e996f6`. Size: **409,600 bytes**. Category: `reserved`.

Reserved NOR interval between the application and resource partitions. No payload is documented.

**Verification:** Boundary verified; contents unknown.

**Purpose:** Reserved NOR interval.

**Range:** `nor-physical` / `[0x0036F000, 0x003D3000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** Entire reservation was FF in the device capture. This does not prove a factory default or ownership of the interval.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / fw0_sdfs

ID: `wp2-1441f2f04a053bc0`. Size: **65,536 bytes**. Category: `resources`.

Stock package image contents shown within the verified partition reservation.

**Verification:** Stock image + verified boundary.

**Purpose:** Firmware resources.

**Range:** `nor-physical` / `[0x003D3000, 0x003E3000)`.

**Source:** Verified device ACPT partition table + stock OTA package.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. Captured SDFS directory: 9 named entries; named-file checksums pass for the listed entries (none when the directory is empty). This observation alone does not validate the complete image or establish stock identity.

**Driver and format:** No additional driver binding documented.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / fw0_sdfs / sdfs.bin

ID: `wp2-4e1ec6db853ad035`. Size: **24,512 bytes**. Category: `resources`.

Exact decompressed stock SDFS image, with all named file checksums validated.

**Verification:** Verified in stock package.

### Watch Pro 2 / NOR / fw0_sdfs / sdfs.bin / usrcfg.bin

ID: `wp2-3ce84ed483702486`. Size: **16 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nor-physical` / `[0x003D3140, 0x003D3150)`.

**Source:** sdfs.bin / SDFS directory + file checksum.

### Watch Pro 2 / NOR / fw0_sdfs / sdfs.bin / sdfs.txt

ID: `wp2-c78bf18c018e7e3e`. Size: **10 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nor-physical` / `[0x003D3180, 0x003D318A)`.

**Source:** sdfs.bin / SDFS directory + file checksum.

### Watch Pro 2 / NOR / fw0_sdfs / sdfs.bin / extcfg.bin

ID: `wp2-a04893d7fb9d8f94`. Size: **16 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nor-physical` / `[0x003D31C0, 0x003D31D0)`.

**Source:** sdfs.bin / SDFS directory + file checksum.

### Watch Pro 2 / NOR / fw0_sdfs / sdfs.bin / defcfg.bin

ID: `wp2-394c5900662564ba`. Size: **205 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nor-physical` / `[0x003D3200, 0x003D32CD)`.

**Source:** sdfs.bin / SDFS directory + file checksum.

### Watch Pro 2 / NOR / fw0_sdfs / sdfs.bin / cfg_mic.bin

ID: `wp2-540f315e2367706d`. Size: **528 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nor-physical` / `[0x003D3300, 0x003D3510)`.

**Source:** sdfs.bin / SDFS directory + file checksum.

### Watch Pro 2 / NOR / fw0_sdfs / sdfs.bin / bt_rf.bin

ID: `wp2-62729da24d5b829b`. Size: **2,896 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nor-physical` / `[0x003D3540, 0x003D4090)`.

**Source:** sdfs.bin / SDFS directory + file checksum.

### Watch Pro 2 / NOR / fw0_sdfs / sdfs.bin / bt_pth.bin

ID: `wp2-853a86fc2d2483f1`. Size: **14,976 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nor-physical` / `[0x003D40C0, 0x003D7B40)`.

**Source:** sdfs.bin / SDFS directory + file checksum.

### Watch Pro 2 / NOR / fw0_sdfs / sdfs.bin / bttbl.bin

ID: `wp2-86e993b2bb5ad42c`. Size: **3,306 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nor-physical` / `[0x003D7B40, 0x003D882A)`.

**Source:** sdfs.bin / SDFS directory + file checksum.

### Watch Pro 2 / NOR / fw0_sdfs / sdfs.bin / alcfg.bin

ID: `wp2-0af9267b400135ac`. Size: **1,860 bytes**. Category: `resources`.

File included in stock firmware 1.0.0.73.

**Verification:** Verified in stock package.

**Range:** `nor-physical` / `[0x003D8840, 0x003D8F84)`.

**Source:** sdfs.bin / SDFS directory + file checksum.

### Watch Pro 2 / NOR / fw0_sdfs / sdfs.bin / Image metadata and alignment

ID: `wp2-8ae711b18f5818d4`. Size: **699 bytes**. Category: `metadata`.

Headers, directory records and alignment bytes inside the supplied image. Not usable filesystem space.

**Verification:** Verified in stock package.

### Watch Pro 2 / NOR / fw0_sdfs / Outside supplied image

ID: `wp2-bc722c4229f73835`. Size: **41,024 bytes**. Category: `reserved`.

Remaining partition capacity beyond the supplied stock image. This interval is outside the image file inventory.

**Verification:** Capacity known; contents unverified.

**Range:** `nor-physical` / `[0x003D8FC0, 0x003E3000)`.

**Device capture:** Entire interval was FF. The preceding stock image is byte-identical to the captured prefix.

**Verification limits:** Stock installed contents, byte ownership and subsequent use are undocumented.

### Watch Pro 2 / NOR / nvram_fa

ID: `wp2-9e4a3cecb16e0681`. Size: **4,096 bytes**. Category: `metadata`.

Factory configuration property store.

**Verification:** Role verified; factory contents unknown.

**Purpose:** Factory configuration.

**Range:** `nor-physical` / `[0x003E3000, 0x003E4000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. 1 CRC-valid segment headers and 11 CRC-valid item records. Property names and values are excluded.

**Driver and format:** NVRAM factory role: ACPT file ID 6 matches the SDK partition constant and nvram_config_init lookup.

**Verification limits:** Current-versus-obsolete record ownership and every property field are not fully classified; recorded bytes are not a factory usage figure. Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / nvram_fa

ID: `wp2-80a0cafae68bb999`. Size: **8,192 bytes**. Category: `metadata`.

Writable factory configuration property store.

**Verification:** Role verified; factory contents unknown.

**Purpose:** Writable factory configuration.

**Range:** `nor-physical` / `[0x003E4000, 0x003E6000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. 1 CRC-valid segment headers and 17 CRC-valid item records. Property names and values are excluded.

**Driver and format:** Writable factory NVRAM role: ACPT file ID 7 matches the SDK constant and nvram_config_init lookup.

**Verification limits:** Current-versus-obsolete record ownership and every property field are not fully classified; recorded bytes are not a factory usage figure. Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / nvram_us

ID: `wp2-edef055c1c47f290`. Size: **8,192 bytes**. Category: `metadata`.

User configuration property store.

**Verification:** Role verified; factory contents unknown.

**Purpose:** User configuration.

**Range:** `nor-physical` / `[0x003E6000, 0x003E8000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. 2 CRC-valid segment headers and 120 CRC-valid item records. Property names and values are excluded.

**Driver and format:** User NVRAM role: ACPT file ID 8 matches the SDK constant and nvram_config_init lookup.

**Verification limits:** Current-versus-obsolete record ownership and every property field are not fully classified; recorded bytes are not a factory usage figure. Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / logbuf

ID: `wp2-e218a88d2586662d`. Size: **16,384 bytes**. Category: `metadata`.

Diagnostic log storage used by the Actions logging backend.

**Verification:** Role verified; factory contents unknown.

**Purpose:** Diagnostic log buffer.

**Range:** `nor-physical` / `[0x003E8000, 0x003EC000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data.

**Driver and format:** Diagnostic log role: ACPT file ID 0xFB matches the SDK identifier and act_log flash-buffer lookup.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

### Watch Pro 2 / NOR / coredump

ID: `wp2-1e1ed3db5530f4c1`. Size: **81,920 bytes**. Category: `metadata`.

Crash diagnostics, including processor state and selected memory blocks.

**Verification:** Role verified; factory contents unknown.

**Purpose:** Crash diagnostics.

**Range:** `nor-physical` / `[0x003EC000, 0x00400000)`.

**Source:** Verified device ACPT partition table / stock contents not supplied.

**Device capture:** The captured reservation contains non-FF bytes. Non-FF byte counts are not a measure of active data. Checksum-valid 19,934-byte crash payload, parsed to its exact end: 1 architecture block and 3 memory blocks. Registers and RAM contents are excluded.

**Driver and format:** Crash storage role: ACPT file ID 0xFD matches the SDK coredump backend lookup.

**Verification limits:** Factory contents and subsequent use are not documented by this device observation.

## Reuse and tooling

The JSON companion uses format `fmc-storage-reference`, schema version `1.0.0`, stable node IDs and parent/child links. A JSON Schema companion describes its fields. IDs are deterministic from hierarchy paths and explicit offsets; a renamed or relocated record receives a new ID.

The offline HTML viewer opens directly in a browser and performs no network or device requests. It includes the Lilex font under the SIL Open Font License 1.1; the license is embedded in the HTML. No firmware images, raw dumps, installed applications, personal configuration values, GPS coordinates or raw log/crash contents are included.

Sources: stock JX402_V1.0.0.73.bin, checksum-verified saved NAND/NOR captures, the Actions SDK and recorded firmware-driver analysis. Capture observations span a running system and are not an atomic snapshot.

Stock package SHA-256: `30903fc8ce6db4f8860bb554366635db3d2bcbb2d43827b3b50fbbac22b59353`.
