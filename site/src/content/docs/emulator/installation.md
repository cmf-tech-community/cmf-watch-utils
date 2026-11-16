---
title: Installation
description: Install the CMF Watch Utils CLI, the QEMU runtime, and the host libraries.
---

QEMU runs the watch on your computer. The compatibility ROM in the shared
archive starts the firmware. Both are required before you can create the
watch's storage or boot the emulator.

A **profile** selects the model and starting state. The **runtime** is the QEMU
program that runs it; **fixtures** are files representing the watch’s storage.
Installation prepares the tools, and the next page creates that storage.

## Workspace

Follow [Setup](/getting-started/setup/) through step 2. That installs the CLI
and puts the reference firmware at
`dumps/binaries/firmware/JX402_V1.0.0.73.bin`. Keep your terminal open in the
`cmf-watch-utils` folder. Run:

```text
uv run cmf-watch-utils emu profiles
```

Use `wp2-stock` for Watch Pro 2, `wp2-onboarding` for its setup screens, or `wp3-stock` for Watch 3 Pro. See [Watch 3 Pro storage](/emulator/first-boot/#watch-3-pro-storage) for the additional package.

## Runtime archives

Use a current checkout and matching runtime. The automatic stock texture index
and Watch 3 Pro preview controls described here require the preview 9 generation
or later. Older checkouts may lack these CLI options even with a newer QEMU binary.

Download **two** archives from the same [preview release](https://github.com/fmctools/cmf-watch-utils/releases):

- The archive named `cmf-emulator-windows-x64.tar.gz`, `cmf-emulator-linux-x64.tar.gz`,
  or `cmf-emulator-macos-arm64.tar.gz` for your computer. It contains the project's
  QEMU executable. Use a release that lists your model or build the current runtime from source.
- `cmf-emulator-wp2-rom.tar.gz`. It contains `compat.bin`, which starts the
  virtual watch, and the small programs used to prepare and read its storage.

On Windows, move the downloads into the checkout. Then run these commands in
PowerShell to put the contents of both archives in one folder:

```powershell
New-Item -ItemType Directory -Force runtime | Out-Null
tar -xf cmf-emulator-windows-x64.tar.gz -C runtime --strip-components 1
tar -xf cmf-emulator-wp2-rom.tar.gz -C runtime --strip-components 1
Get-ChildItem runtime
```

Check that you see `qemu-system-arm.exe`, `compat.bin` and `provision-nand.elf`.
On Linux or macOS, use `mkdir -p runtime` and substitute your host's archive in
the first `tar` command. The QEMU executable on those hosts has no `.exe` suffix.
If a release archive is unavailable, see the [source build instructions](https://github.com/fmctools/cmf-watch-utils/blob/main/emulator/README.md).

## Host dependencies

### Windows

Install MSYS2 and open its **UCRT64** terminal. Run this command there,
then switch back to PowerShell:

```bash
pacman -S --needed mingw-w64-ucrt-x86_64-glib2 mingw-w64-ucrt-x86_64-pixman mingw-w64-ucrt-x86_64-dtc mingw-w64-ucrt-x86_64-libwinpthread mingw-w64-ucrt-x86_64-zlib mingw-w64-ucrt-x86_64-tk
```

UCRT64 is the MSYS2 environment used by the Windows runtime. Its terminal
installs the libraries; the remaining examples run in PowerShell.

The last package provides `wish.exe`, which opens the watch window. For `--runtime-dir`, use the `ucrt64/bin` folder from your MSYS2 installation.

### Arch Linux

Install the runtime libraries, viewer and Arm debugger from the official repositories:

```bash
sudo pacman -Syu --needed git git-lfs uv glib2 pixman dtc libpulse tk arm-none-eabi-gdb
```

`uv` manages the Python workspace. GLib, Pixman and `dtc` provide QEMU's
native libraries; `libpulse` provides its audio client library. Tcl/Tk supplies
the `wish` viewer. [Arm GDB](https://archlinux.org/packages/extra/x86_64/arm-none-eabi-gdb/)
is used to prepare the virtual storage.

Use the Linux x64 archive and the shared ROM archive. From the checkout:

```bash
mkdir -p runtime
tar -xf cmf-emulator-linux-x64.tar.gz -C runtime --strip-components 1
tar -xf cmf-emulator-wp2-rom.tar.gz -C runtime --strip-components 1
uv sync --locked
uv run cmf-watch-utils emu doctor --qemu runtime/qemu-system-arm --rom runtime/compat.bin
arm-none-eabi-gdb --version
```

In [First boot](/emulator/first-boot/), use
`--qemu runtime/qemu-system-arm`, omit `--runtime-dir`,
and keep `--gdb arm-none-eabi-gdb`. The viewer needs a graphical desktop;
on Wayland, it also needs XWayland (`xorg-xwayland`). Audio playback needs a
running PulseAudio server or PipeWire's PulseAudio compatibility service.

The Linux archive is built and smoke-tested on Ubuntu 22.04. Arch has not
had an end-to-end firmware boot test. If a rolling library update prevents
the archive from loading, follow the [Arch source build instructions](https://github.com/fmctools/cmf-watch-utils/blob/main/emulator/README.md#arch-linux).
The distribution's standard QEMU package does not include this watch model.

### Ubuntu and macOS

| Host | Packages | Command differences |
|---|---|---|
| Ubuntu 22.04 x64 | Install `libglib2.0-0 libpixman-1-0 libfdt1 libpulse0 tk gdb-multiarch` with apt. | Remove `.exe` and `--runtime-dir`. Use `--gdb gdb-multiarch` when preparing storage. |
| macOS ARM64 | Install `glib pixman dtc` with Homebrew. Install Tcl/Tk for the viewer and an Arm-capable GDB to prepare storage. | Remove `.exe` and `--runtime-dir`. Put `wish` on PATH or pass its path with `--wish`. Pass the debugger path with `--gdb`. |

## Verify the installation

Run this check from the checkout. Apply the command differences above on Linux and macOS:

```text
uv run cmf-watch-utils emu doctor --qemu runtime/qemu-system-arm.exe --rom runtime/compat.bin --runtime-dir "PATH_TO_UCRT64_BIN"
```

Replace `PATH_TO_UCRT64_BIN` with your actual MSYS2 `ucrt64/bin` directory;
keep the quotation marks if the path contains spaces.

Look for `"machine": "ats3089c-wp2"` and `"viewer_available": true`. If only the
viewer is missing, you can still run the headless check in [First boot](/emulator/first-boot/).

Next, [prepare the watch's storage and boot stock firmware](/emulator/first-boot/).
