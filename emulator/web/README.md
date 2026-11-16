# Watch emulators in the browser

The [browser preview](https://cmf.arnv.dev/emulator/watch-pro-2/) runs stock 1.0.0.73 using
our existing ATS3089C model and compatibility ROM. The hosted preview downloads
stock storage generated from the published firmware and includes the four
Watch Pro 2 frame renders. Local builds can use their own prepared fixtures.

Stock boot, touchscreen taps and swipes, crown presses, and crown rotation have
been exercised in Chromium. This is a display-and-input preview, not a replacement
for hardware testing. The CPU uses QEMU's TCI interpreter because the upstream
Wasm JIT produced guest faults on this Cortex-M workload.

## Requirements

- A recent desktop browser with WebAssembly threads and SharedArrayBuffer support.
  Chromium is the tested browser; other browsers have not been verified.
- Enough memory for a 512 MiB Wasm heap, virtual flash and browser overhead.
  Allow at least 1.5 GiB free RAM for this prototype.
- This repository's Python environment: `uv sync`.
- Prepared stock fixtures and the matching 64 KiB compatibility ROM from the
  native emulator setup. A phone, Bluetooth adapter and real watch are unnecessary.
- The experimental browser build artifact. Native QEMU executables cannot be
  used as the browser runtime.

## Prepare a local session

From the repository root, stage your existing stock fixtures:

```text
uv run python emulator/web/stage.py --fixtures fixtures --rom runtime/compat.bin --output web-local
```

The output directory must be new. Staging validates the stock application and
copies the page and virtual storage. Current fixture preparation generates
`wfc-index.txt`; staging copies it automatically. Keep it with the matching
flash files so stock watch-face textures render correctly.

For older Watch Pro 2 fixtures, regenerate them or pass `--stock-image PATH`
with the reference 1.0.0.73 package to generate the index during staging.
`--wfc-dir PATH` accepts extracted `*_local*.wfc` files as an alternative.
Watch 3 Pro uses the index from its prepared fixtures.

Download `wp2-wasm-experimental` from the **Experimental browser emulator**
workflow. Copy `qemu-system-arm.wasm` and `qemu-system-arm.worker.js` into
`web-local/runtime/`. Copy `qemu-system-arm` into that directory and rename it
`qemu-system-arm.js`.

Start the local server:

```text
uv run python emulator/web/serve.py web-local
```

Open `http://127.0.0.1:8090/` to start stock automatically. The server binds to
loopback and sends the cross-origin isolation headers needed by Wasm workers.
Opening the HTML directly as a file will not work. A first boot can take tens
of seconds; the watch log shows guest progress.

To test a different base image, select **Custom firmware** and use
**Advanced boot files**. The bundled base files fill in any you leave out.
The hosted preview accepts local firmware packages,
application files and watch faces. Open **FMC watch faces** to browse community
faces by name or author and sort by newest, downloads, or flashes. Choose a
face and select **Apply watch face** to install it on the next boot. The same
picker is available when serving local stock files. On Watch Pro 2, select **Bad Apple** to run the bundled release. Use
**Custom firmware** for a build of your own. Under
**Display**, you can choose a built-in frame color or replace its artwork with
an image file.

To preview the same versioned web bundle that Pages publishes, run
`uv run python emulator/web/prepare-presets.py --output web-presets` with Arm
GNU tools on PATH, followed by
`uv run python emulator/web/publish.py --runtime WASM_BUILD --stock web-local --presets web-presets --output web-preview`
and serve `web-preview`. Open `http://127.0.0.1:8090/emulator/watch-pro-2/`.
For this layout, stage with `--stock-image` and `--frames-dir` to include the
stock texture index and frame renders.

The Display test preset is built from source for the virtual watch. A local
preview can also bundle a verified Bad Apple package with
`prepare-presets.py --output web-presets --bad-apple PATH`. Pages downloads
the pinned Bad Apple release, verifies its SHA-256 and bundles it when the
release is available. Rerun Pages after making the release available. To
select a different build, set both `WP2_BAD_APPLE_TAG` and
`WP2_BAD_APPLE_SHA256` to its tag and package hash.

## Controls

- Click or drag on the round display to tap or swipe.
- Press the round crown button, or focus the display and press Space.
- Use the crown arrows, the keyboard arrows, or scroll over the display to rotate.
- **Show frame** toggles the surrounding bezel. The expand button enlarges the
  device view. Neither changes the guest's 466 x 466 display resolution.
- The camera button saves the circular display as a transparent PNG. Turn on
  **Include frame in screenshots** to include the selected watch frame.
- The square stop control reloads into an idle session. **Hard reset to stock**
  returns to the bundled starting state. Unsaved guest storage changes are discarded.
- Open **Watch log** to inspect recent guest UART output or save the full captured UART log. Add `?debug` to the URL for
  verbose GPU/MMIO diagnostics; this increases logging and memory use.

## Watch 3 Pro browser preview

The [hosted preview](https://cmf.arnv.dev/emulator/watch-pro-3/) includes stock
`1.0.1.77`. Select the model name above the virtual watch to switch between
Watch Pro 2 and Watch 3 Pro.

Build the WebAssembly runtime from the current emulator sources and prepare desktop
`wp3-stock` fixtures first. Use `stage.py --profile wp3-stock` with those fixtures
and the matching ROM. Pass the native QEMU executable with `--qemu`, an Arm-capable
debugger with `--gdb`, and the native runtime's `provision-nand.bin` with
`--provisioner`. Staging carries over the model's stock texture index and lets
stock firmware write its initial settings to the browser's virtual NAND.

Run `publish.py --profile wp3-stock --model-selector` with the staged Watch 3 Pro
files in `--stock`. Publish the Watch Pro 2 files to the same `--output` directory
with `--profile wp2-stock --model-selector`. Serve that directory to open either
`/emulator/watch-pro-2/` or `/emulator/watch-pro-3/`. The heading lets you switch
between the two routes. Pass `--model-selector` when both pages are present.

Watch 3 Pro opens the stock watch face with the virtual charger disconnected.
The stock browser preview starts with local setup complete and stays awake while idle. The [emulator guide](https://cmf.arnv.dev/emulator/#watch-3-pro-passcodes-and-optical-measurements) covers stock passcodes and synthetic optical measurements.
For the first-time language and QR screens, run `wp3-stock` in desktop QEMU.
Choose **Custom firmware** to
boot a Watch 3 Pro AOTA with application and SDFS images, or supply its raw
ACTH application and optional SDFS and virtual NAND files. The **Display test**
preset runs the built-in graphics demo. **Watch color**
switches among the four bundled Watch 3 Pro front renders. Its stock
firmware starts at the highest manual brightness.
**Ambient light** sends lux to the virtual W1160 sensor over the same emulated
I²C path as the desktop toolkit.

## Current limits

The port reuses the native model, including its approximations and stock-specific
helpers. A successful browser boot does not verify the real boot ROM, physical
recovery, electrical behavior or freedom from crashes. TCI execution is slower
than native QEMU and does not reproduce device performance or power consumption.

Sound is enabled by default. If Chromium blocks autoplay, click or tap the
emulator. The browser plays samples from the emulated DAC at their declared
rate. The bundled Bad Apple preset uses an aligned QEMU clock to keep the DAC
supplied at real-time speed. Use desktop QEMU for virtual Bluetooth OTA
and recovery. Browser sessions use temporary storage. The Pages build generates
stock files for both watch models from the pinned firmware packages.

## Development checks

The runner builds the pinned QEMU-Wasm revision with the shared hardware model.
The vector renderer has a host-side regression check:

```text
cc -Wall -Wextra -Werror emulator/tests/vg_path.c -lm -o vg-path-test
./vg-path-test
node --check emulator/web/watch.js
node --test emulator/tests/speaker.mjs
```

For a browser regression check, boot stock, open the app list with the crown,
scroll it using both touch and crown rotation, and tap a stock app. Repeat after
reset. Keep the runtime revision, boot output and screenshots with the results.
A loading screen or a canvas with no guest output is not a successful boot.

Select a face file (`.wfdl`, `.wfc`, or `.bin`) for your watch under
**Boot images → Watch face**, then press Play. The importer replaces Activity
Mood on Watch Pro 2 or Duskscape on Watch 3 Pro for the session. The **FMC watch
faces** panel lists published faces for the selected model. Choose a face and
select **Apply watch face** to boot it. The browser edits its in-memory NAND.
Large faces may use a second stock slot for space. **Hard reset to stock**
restores all stock faces.


For a custom firmware session, open **Boot images** and select its Watch Pro 2 ACTH `app.bin` under
**Application image** and its matching `sdfs.bin`, if provided, under
**Application resources**. Start emulation to boot the staged virtual NOR.

Use **Firmware package** to boot a validated Watch Pro 2 AOTA package that
contains an application and companion resources. The verified stock 1.0.0.73
package uses the matching stock fixtures. Select the package and press Play. If a guest fault or runtime exit appears in the notification strip,
**Boot stock** starts a fresh session from the supplied stock fixtures.
**Battery target** maps percentage to an approximate voltage. The guest
firmware calculates its own displayed percentage.
Use **Simulation → Display → Brightness** to dim the virtual screen. At
100%, the screen uses the brightness set by the guest firmware. Desktop
QEMU offers the same slider under **Advanced**.

Drag the miniature watch to change orientation, or use the arrow keys for
smaller adjustments. Select its X/Y/Z readout to edit the three acceleration
values directly. **Reset simulation** restores the default sensor and power
settings. **Hard reset to stock** discards the running session and selected
files, then starts a fresh stock session.

Open **Optical sensors** to set the heart rate and blood oxygen shown by
the stock measurement apps. On Watch 3 Pro, **Simulate readings** supplies display values directly.
Enable **Feed raw optical samples** and **Watch is worn** to have stock calculate
measurements from a synthetic signal. Stock has displayed these results in its
history screens; persistence across browser reloads remains unverified. Open **Gyroscope** on Watch 3 Pro to enter X, Y and Z angular
velocity in degrees per second. Open **GPS** to send a stationary fix at a
latitude and longitude in decimal degrees. The guest must start its GPS
receiver, for example when starting an outdoor workout.

Use **Copy log** or **Save log** in either log header to export the full watch
log or just the motor events.

Pass `--frames-dir` to the staging script to include the four Nothing X
front renders. Select **Watch color** in the browser to switch frames while
the emulator runs.
