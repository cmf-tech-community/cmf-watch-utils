---
title: Legal & attribution
description: Licensing, third-party notices and the terms for the published artifacts.
---

## License

This repository is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
See [`LICENSE`](https://github.com/cmf-tech-community/cmf-watch-utils/blob/main/LICENSE).

Rationale: the BLE/frame behaviour and watch-face upload flow were informed by, and in part
ported from, the AGPL-3.0 licensed [`cmf-tech-community/fmc`](https://github.com/cmf-tech-community/fmc)
project. Keeping the combined work under AGPL-3.0 is the simplest way to respect that license.

## Third-party attribution

- [`cmf-tech-community/fmc`](https://github.com/cmf-tech-community/fmc) — independent watch-face editor and
  protocol reference (AGPL-3.0). Used for cross-checking frame headers, AES/CRC rules, WFDL
  layout and the upload handshake.
- Nothing/CMF and the CMF Watch Pro 2 name are trademarks of their respective owners. This is
  an unofficial interoperability project and is not affiliated with or endorsed by Nothing.
- Bad Apple is a copyrighted work. The proof-of-concept firmware image published under
  `dumps/binaries/` contains frames from it, which places redistribution of that image under
  the rights holder's terms. The case study itself describes the process only.

## Published artifacts

The [data index](/dumps/) lists the artifacts available from this repository.

- Stock firmware packages and selected application extracts are tracked under `dumps/binaries/` using Git LFS.
- The rebuilt proof-of-concept image under `dumps/binaries/`, which contains third-party
  animation frames.
- Manifests with sizes and hashes, and redacted notes.

The following is intentionally excluded:

- Vendor resources, fonts, pictures, `.ajs` animations and watch-face packages outside the
  firmware images.
- Captured personal data: MAC addresses, serial numbers, pairing secrets, authkeys, session
  keys, GPS tracks and notification contents.

The repository license applies to the project code. Firmware and third-party media have their own terms.

Locally obtained images are placed under `firmware/`; that path is gitignored.

## Safety and acceptable use

These tools target research, interoperability, and hardware that is owned or authorised for
testing. Bypassing ownership/account protections, attacking hardware that is not owned, and
redistributing vendor firmware or copyrighted media fall outside the intended use. Firmware
modification can permanently damage a device. No warranty is provided; see the AGPL-3.0 for
the full disclaimer.
