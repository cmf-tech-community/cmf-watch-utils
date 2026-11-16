---
title: Bad Apple on Watch Pro 2
description: The source-built Zephyr app and the earlier stock warm-up animation experiment.
---

## Source-built firmware

The [Bad Apple project](https://github.com/fmctools/firmware-wp2-badapple)
builds a Zephyr application with its own media assets. This is the version
available as the **Bad Apple** boot preset in the
[Watch Pro 2 browser emulator](/emulator/watch-pro-2/). It plays video and
audio and uses the watch's touch and crown controls. The project repository
contains the source, build instructions and a downloadable firmware package.

<span id="why-9ajs"></span>
<span id="build-outline"></span>
<span id="flash-result"></span>

## Stock warm-up animation experiment

An earlier test replaced a sport warm-up animation inside stock firmware.
It verified that the stock application could play a rebuilt
[AJS animation](/devices/cmf-watch-pro-2/formats/ajs/) after a Bluetooth
firmware update. AJS stores JPEG frames and their playback rate. The watch
selects a file from its sport table and uses a separate timer for the
warm-up screen.

The test used `9.ajs`, the file assigned to sport type 22 with an
eight-second warm-up timer. A short, silent clip encoded at 240×240 and
25 fps fit that screen. Its frame bytes matched after extraction and rebuild,
and playback was verified on the physical watch.

<span id="capacity-ceiling"></span>

The edit replaced one file in `res_e.bin`, the fixed-size resource
partition that holds the stock warm-up animations. Because the stock
partition is almost full, a replacement must fit in the space reclaimed
by the removed file and the small amount of unused space. See the
[SDFS capacity reference](/devices/cmf-watch-pro-2/formats/sdfs/#capacity)
for the partition size and [AJS animations](/devices/cmf-watch-pro-2/formats/ajs/#tools)
for commands to inspect or rebuild an animation.

<span id="legal-note"></span>

The [data index](/dumps/) identifies the archived stock-resource image.
Read the [flashing limitations](/devices/cmf-watch-pro-2/limitations/)
before using a firmware image on hardware.
