# Watch Pro 2 emulator builds

These preview archives contain the ATS3089C QEMU machine or its
host-independent compatibility ROM, virtual NAND provisioner and staged OTA reader. Stock firmware,
resources, virtual flash images, and the Android lab stay outside the archives.
The checkout's firmware tools and local fixtures are still needed to run
firmware tests. These builds do not establish hardware fidelity.

Use the [Emulator CLI guide](https://cmf.arnv.dev/emulator/) for setup, profile
selection and test commands. From the repository root, `uv sync --locked` and
`uv run cmf-watch-utils emu profiles` lists the available profiles. Running
the emulator also requires a matching compatibility ROM and prepared local virtual
NOR, raw NAND and NAND ID files. Generate them with `emu prepare-fixtures` using
the exact stock package, pinned NAND ID and Arm-capable GDB. The interactive viewer uses Tcl/Tk `wish`, while
loopback OTA uses an isolated H4 controller. The recovery supervisor models
installation and rescue. It does not run the physical bootloader.

Stock 1.0.0.73 uses an audio DSP for its built-in sounds. The emulator plays
their decoded samples through the virtual DAC when the guest submits the
matching ACT stream. The hosted browser build prepares those samples
automatically. For a local desktop or browser setup, place `stock-audio.bin`
alongside the other fixtures:

```bash
uv run --locked --with unicorn==2.1.4 python emulator/prepare-stock-audio.py \
  --stock /path/to/JX402_V1.0.0.73.bin \
  --decoder /path/to/CMF-Ringtone-Tool/act_emu \
  --output /path/to/fixtures/stock-audio.bin
```

The generator uses [CMF Ringtone Tool](https://github.com/tirodz/CMF-Ringtone-Tool/tree/6e867e18f7984df694a2a0e75a08c78c5c06603c/act_emu)
and validates the resulting samples. Fixture preparation needs the decoder and
Unicorn. Playback uses the virtual DAC alone. Bluetooth call audio and arbitrary
DSP programs are outside this model.

Build from the repository root with Python 3.12 or later.

```text
python emulator/build.py --component qemu --audio pa
python emulator/build.py --component qemu --audio dsound
python emulator/build.py --component qemu --audio coreaudio
python emulator/build.py --component rom
```

The commands use the native compiler and Ninja for the host. Use UCRT64 on
Windows. Install GLib, Pixman, libfdt, pkg-config and development files for the
selected audio backend. The ROM build uses Arm GNU GCC, binutils, and newlib.
The binary archives use the host's system libraries. On Windows, run with the
MSYS2 UCRT64 runtime packages on PATH.

The builder verifies the pinned QEMU source archive and downloads the required
source files from a pinned Actions SDK commit. Use `--qemu-archive` and
`--sdk-root` for local source inputs. `--work-dir`, `--output-dir`, `--jobs`,
`--arm-prefix` and repeatable `--configure-arg=...` are configurable. Select a
fresh work directory when changing QEMU configure flags. The default audio
configuration supports headless testing. Use `--wfc-dir` for an optional local
stock texture index. The published preview omits this index, so some stock
watch faces may render differently.

GitHub Actions builds Linux x64, Windows x64, macOS ARM64, and one shared ROM
and NAND-reader bundle. Each native build must execute a small synthetic ARM
program through the watch machine's NOR handoff. The program needs no stock
files. A manual run uploads artifacts for inspection. Pushing an `emulator-v*`
tag publishes a prerelease with checksums and corresponding source archives
after all build jobs pass.

## Arch Linux

For prebuilt archives, follow the [Arch runtime setup](https://cmf.arnv.dev/emulator/installation/#arch-linux).
To compile QEMU locally, install the native build tools and libraries:

```bash
sudo pacman -Syu --needed base-devel python ninja pkgconf glib2 pixman dtc libpulse
uv run --locked python emulator/build.py --component qemu --audio pa
```

To also build the shared ROM and NAND tools:

```bash
sudo pacman -S --needed arm-none-eabi-gcc arm-none-eabi-binutils arm-none-eabi-newlib
uv run --locked python emulator/build.py --component rom
```

Run these commands from the repository root after `uv sync --locked`.
Archives are written to `emulator/dist/`. Each QEMU build includes the synthetic
boot check. Arch-specific firmware boot and viewer behavior have not been verified;
the Linux release runner uses Ubuntu 22.04.

## Watch 3 Pro desktop preview

The experimental `wp3-stock` profile boots stock Watch 3 Pro `1.0.1.77` in the shared native QEMU runtime. It uses a synthetic flash layout and the compatibility ROM. Prepare it with `emu prepare-fixtures --profile wp3-stock --stock <watch-3-pro-package> --provisioning-stock <watch-pro-2-1.0.0.73-package>` and the usual QEMU, Arm GDB, NAND ID and provisioner options. The Watch Pro 2 package supplies the virtual NAND writer. Run the resulting fixtures with `emu run --profile wp3-stock`. The stock guest starts on virtual charger power during first boot. Disconnect it through Advanced after initialization to use the watch screen.

The [Watch 3 Pro browser preview](https://cmf.arnv.dev/emulator/watch-pro-3/) boots stock firmware. Watch 3 Pro pairing, recovery, and full factory suite coverage are still in development.

The optional `stock-audio.bin` sound bank works with both models’ verified stock builds. Place the bank in the model’s fixture directory. The Watch 3 Pro aging test produced a non-silent WAV capture and accepted live microphone input with `--host-mic --audio dsound` on Windows. The Advanced panel can set GPS, ambient light, acceleration, gyroscope readings, and simulated values for the stock heart rate and blood oxygen screens.

Use `emu faces --profile wp3-stock` to list published Watch 3 Pro faces from FMC. Start a stock run with `--fmc-face <id>` or `--watch-face <file>` to replace Duskscape in that session’s virtual NAND.
