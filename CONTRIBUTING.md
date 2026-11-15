# Contributing to CMF Watch Utils

Start with the [setup guide](https://cmf.arnv.dev/getting-started/setup/) to clone the repository and install Git, Python and `uv`. The tools-only setup skips firmware downloads. From the repository root, check the installation and run the tests.

```sh
uv sync --locked
uv run --locked cmf-watch-utils emu profiles
uv run --locked python -m unittest discover -s tests -v
```

The [repository map](README.md#layout) shows where the CLI, firmware parsers, emulator, and documentation live. Open a GitHub issue for a bug or a feature that needs discussion. Include your OS, affected watch profile or firmware version, and the steps to reproduce the behavior when they apply.

## Emulator changes

Use the [native build guide](emulator/README.md) to install the compiler and system libraries for your host. The following command builds QEMU and runs a small generated ARM program to verify that the virtual CPU starts and executes guest code.

```sh
uv run --locked python emulator/build.py --component qemu
```

For the browser, download the `wp2-wasm-experimental` artifact from the [WASM workflow](https://github.com/cmf-tech-community/cmf-watch-utils/actions/workflows/emulator-wasm.yml) for the revision you want to test. Unpack it to `wasm-output` and run the same smoke test as CI with Chrome installed. Use `--channel msedge` for Microsoft Edge.

```sh
uv run --locked --with playwright==1.55.0 python emulator/smoke_browser.py wasm-output
```

Both smoke tests generate their own boot images. They need no stock firmware, phone, Bluetooth adapter, or physical watch. For changes to a stock screen, sensor, or watch face, follow [First boot](https://cmf.arnv.dev/emulator/first-boot/) and repeat the interaction with the affected stock profile. For an OTA change, use [virtual OTA and recovery](https://cmf.arnv.dev/emulator/ota-recovery/) and record which stage you verified.

## Documentation changes

Install Node.js 22 and pnpm 12. From `site/`, run `pnpm install --frozen-lockfile` and `pnpm dev` to preview changes. Run `pnpm build` before opening a PR.

## Opening a pull request

Open a PR against `main` from a branch or a fork. Explain what changed and how you tested it. If your change affects the emulator, include the watch profile and runtime. A screenshot or short UART excerpt helps for behavior that a reviewer needs to reproduce. Remove real device identifiers, pairing data, and personal data from attachments. Follow the repository's [working rules](AGENTS.md#working-rules-for-changes) for device testing and commits.

Every PR gets an **Emulator smoke** check. It runs the applicable native and browser jobs when their files change and records a pass for unrelated changes. The desktop release workflow runs the full Windows, Linux, and macOS builds separately.
