---
title: Setup
description: Install the workspace, verify the command line, and choose your next step.
---

## 1. Install the workspace

Install Git and [uv](https://docs.astral.sh/uv/getting-started/installation/). The
workspace uses Python 3.12 or later. `uv` can fetch a compatible Python when one
is missing. Open a terminal in the directory where you want the checkout.

On Arch Linux, install the workspace tools with
`sudo pacman -Syu --needed git git-lfs uv`, then use the Linux commands below.
The emulator's additional libraries are listed under
[Arch Linux installation](/emulator/installation/#arch-linux).

**Windows PowerShell**

```powershell
$env:GIT_LFS_SKIP_SMUDGE = '1'
git clone https://github.com/cmf-tech-community/cmf-watch-utils.git
Remove-Item Env:GIT_LFS_SKIP_SMUDGE
cd cmf-watch-utils
uv sync --locked
```

**Linux or macOS**

```bash
GIT_LFS_SKIP_SMUDGE=1 git clone https://github.com/cmf-tech-community/cmf-watch-utils.git
cd cmf-watch-utils
uv sync --locked
```

These commands skip large firmware downloads. From the checkout, verify the tools:

```text
uv run fwkit --help
uv run cmf-watch-utils emu profiles
```

You should see the firmware toolkit help and `wp2-stock`, `wp2-onboarding` and `wp3-stock`. Keep
running the following commands from the repository root unless a step says otherwise.

The checkout also includes `scripts/install.ps1` and `scripts/install.sh`. Run them
with `-Target .` or `.` respectively to install the current checkout. Use
`-Firmware` or `--firmware` only when you also want the reference image.

## 2. Get the reference firmware if your task needs it

For container inspection or creating emulator fixtures, install Git LFS and fetch
the exact reference image:

```text
git lfs install --local
git lfs pull --include=dumps/binaries/firmware/JX402_V1.0.0.73.bin --exclude=""
uv run fwkit info dumps/binaries/firmware/JX402_V1.0.0.73.bin
```

This fetches the Watch Pro 2 reference image. Fetch the [Watch 3 Pro image](/dumps/#jx402_w3pro_v10177bin-stock-firmware) as well for Watch 3 Pro fixture preparation. If `fwkit` sees a tiny text file instead, Git still has
the LFS pointer. See [Dumps & data](/dumps/) for the direct download and checksum.
Use a separate copy for edits.

## 3. Choose a task

- **Inspect firmware** with the [quick start](/getting-started/quickstart/) and [fwkit reference](/tooling/fwkit/).
- **Boot firmware without a watch** with the [emulator installation](/emulator/installation/). Use the browser for a stock boot with no local setup, or install desktop QEMU when you need local fixtures.
- **Talk to your watch** with the [BLE tools](/tooling/ble-tools/). Start with `scan`. Pairing and OTA negotiation are live operations.
- **Check an Actions OTA package** offline with the [Actions OTA guide](/tooling/actions-ota/).
- **Build the docs** from `site/` with Node.js 22.22 or later and pnpm 12. Run `pnpm install --frozen-lockfile` and `pnpm build`. Use `pnpm dev` to preview.
