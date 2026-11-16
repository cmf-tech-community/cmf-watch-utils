---
title: Contributing
description: Set up a first contribution, choose the relevant checks, and prepare a pull request.
---

You can work on the tools and documentation without owning a watch. Start with
the type of change you want to make; firmware downloads and an emulator build
are needed only for tests that use them.

## Choose your starting point

| Change | Files | First check |
|---|---|---|
| Documentation | `site/src/content/docs/` | Preview the changed page locally. |
| Firmware parsing or editing | `tooling/src/fwkit/` | Run command help, then test with the relevant input file. |
| Command line or Bluetooth tools | `src/cmf_watch_utils/` | Run the Python tests without connecting a watch. |
| Emulated hardware | `emulator/` | Build the native runtime and run its generated test program. |
| Browser emulator controls | `emulator/web/` | Follow the browser development instructions in that directory's README. |

The [repository contribution guide](https://github.com/fmctools/cmf-watch-utils/blob/main/CONTRIBUTING.md)
contains build and test commands for emulator changes. The device pages hold
model-specific formats and research; [methodology](/about/methodology/) explains
how to distinguish an observation from an unverified hypothesis.

## Prepare a working copy

Follow [Setup](/getting-started/setup/) to clone the repository. A checkout is
that local copy; its root is the `cmf-watch-utils` directory containing
`pyproject.toml` and `README.md`.

If you do not have write access to the repository, create a fork on GitHub and
use your fork's clone URL in the setup commands. A fork gives you a repository
where you can push your branch. Create a branch before editing:

```text
git switch -c docs/clarify-setup
```

Choose a name describing your change. Documentation-only work needs Git,
Node.js and pnpm; you can skip `uv sync` and firmware downloads in Setup.

## Preview documentation

Install Node.js 22.22 or later and pnpm 12. From the repository root:

```text
cd site
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed in the terminal, normally `http://localhost:4321/`.
Keep that terminal running while you edit. Changes to Markdown reload in the
browser. To stop the server, press Ctrl+C in its terminal.

The docs server serves the documentation. The separate WebAssembly emulator
bundle is prepared by the emulator build workflow; starting Astro alone does
not build the interactive watch pages. For a local watch session, follow
[the browser build README](https://github.com/fmctools/cmf-watch-utils/blob/main/emulator/web/README.md).

Before submitting a docs change, stop the preview and run this from `site/`:

```text
pnpm build
```

A successful build checks that pages compile. Also follow the links and read
the instructions in order; a build cannot tell whether a step makes sense to
a new reader.

## Check a Python change

From the repository root, after `uv sync --locked`:

```text
uv run --locked python -m unittest discover -s tests -v
```

These tests use generated data and do not need a watch or stock firmware.
For a format change, also run the relevant reference-image checks described
in the [fwkit reference](/tooling/fwkit/). Download firmware only when needed.

## Submit the change

Review `git diff` before committing. Exclude generated storage, pairing data,
logs containing personal information and unrelated files. Push your branch to
your fork or authorized repository, then open a pull request targeting `main`.
Describe the behavior changed and the checks you actually ran. State any test
that still needs a device or another operating system.

For a reported problem, include its model, firmware and steps to reproduce it.
[Troubleshooting](/getting-started/troubleshooting/) lists the information that
helps distinguish setup problems from firmware or emulator failures.

## Firmware research

[Memory layout and analysis](/contributing/firmware-analysis/) covers Ghidra
imports and repeatable exports. [Research methodology](/about/methodology/)
explains the evidence needed for format, protocol and emulator claims. Put
build-specific findings in the corresponding device reference.

For project discussion and community questions, see [Community](/about/community/).
