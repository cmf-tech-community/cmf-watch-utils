---
title: Documentation guidelines for agents
description: Structure, evidence, writing and verification rules for changes to project documentation.
---

These guidelines apply to the site, repository READMEs and help text in the
emulator. Read `AGENTS.md` and the relevant code before editing. Keep publication
separate from local review; a successful build is not approval to publish.

## Start with the reader's task

Identify what the reader wants to do, what they already have and what they
should see when finished. A first-time user may have only a browser or a
downloaded file; they may not know what a repository, package or image means.
Explain each term where it affects a choice.

Keep browser use independent of developer setup. Stock browser previews include
their starting files. Do not send users through cloning, firmware extraction or
a toolchain installation unless their chosen task needs it.

## Put each topic in one place

| Content | Location |
|---|---|
| Installation, first steps and common failures | Getting started |
| Browser use, desktop boot and virtual updates | Emulator |
| Model-specific guides, formats, hardware and verified results | The device section |
| Command and option details | Tool reference |
| Development setup and shared analysis methods | Contributing |
| Licenses, attribution and reference downloads | Project information |

A guide explains how to complete a task. A reference defines fields, commands
or interfaces. A status page states what was verified. Link between them instead
of copying their full contents. Shared workflows belong outside device sections;
model-specific differences remain explicit. Do not add empty pages merely to
make two model sections equally large.

Preserve existing URLs and linked heading IDs. When consolidating a section,
retain a useful entry point or anchor at the relevant replacement content.
Check links from the emulator and repository READMEs as well as the sidebar.

## Establish technical claims

Use current code, reproducible checks and recorded research. Record the model,
firmware version, host and test boundary where those affect the result. Resolve
contradictions against evidence before rewriting them as facts.

- Distinguish offline package validation, application boot, update transfer,
  installation and post-restart behavior.
- Distinguish desktop, browser and physical-watch results. Shared source alone
  does not establish identical behavior.
- Distinguish simulated readings from stock calculations using raw samples.
- Describe modeled recovery as modeled recovery. It cannot guarantee that a
  physical watch can be recovered or that firmware cannot brick it.
- Label unknowns precisely. Do not turn a hypothesis into a supported feature,
  or retain an old failure as a current limitation after it has been resolved.

Keep experimental sizes, transient errors and chronological milestones out of
task guides unless they explain a current constraint. Preserve useful historical
evidence in a clearly identified research or run record.

## Write complete procedures

A procedure states prerequisites, inputs, steps, expected results and what to
do if the result differs. Explain which folder to run commands from and which
paths are placeholders. Use paths relative to the checkout where possible;
quote paths containing spaces. Provide separate shell examples when syntax
actually differs across Windows, Linux and macOS.

Check option names, defaults and input formats against the CLI or UI. A `.bin`
extension alone does not identify a firmware package, raw application or face.
Explain the difference before asking the user to select a file. Identify
commands that contact or modify a physical device before the command block.
Never describe live OTA negotiation as an offline check.

For recovery instructions, identify the required working connection and updater.
Do not invent a button sequence, assume any custom firmware accepts stock
packages, or imply that reinstalling firmware erases a faulty watch face.

## Language and examples

Use descriptive headings such as “Load custom firmware” or “Pair a Watch Pro 2”.
Use short, direct sentences with enough detail to complete the task. Define
necessary technical terms rather than removing technical depth.

| Do | Do not |
|---|---|
| Explain what a file contains and which input accepts it | Tell readers to “provide the necessary artifacts” |
| State what passed and what remains untested | Claim “fully supported” from one successful boot |
| Link FMC to [fmc.tools](https://fmc.tools) when introducing the service | Replace a source-attribution link with a product homepage |
| Use `fmctools` for current GitHub repository links | Rely on the former organization redirect indefinitely |
| Keep known-good defaults and describe optional overrides | Make users reconstruct bundled files to try the preview |
| Describe current behavior and concrete outcomes | Narrate internal chats, abandoned plans or praise the workflow |

Use the exact UI label when naming a control. Avoid unexplained acronyms,
coaching language, promotional claims and vague phrases such as “just configure
it”. First-person project language is suitable for introductions, while technical
procedures should focus on the user's action and the system's response.

## Privacy and publication

Remove personal Bluetooth addresses, serial numbers, pairing keys, account data,
notification content, GPS tracks and local usernames from public examples and
logs. Use `AA:BB:CC:DD:EE:FF` when an address placeholder is needed. Follow
repository rules for firmware and third-party assets; do not broaden or narrow
those rules based on assumptions. Keep unresolved publication questions in the
review notes rather than scattering internal approval commentary through docs.

## Review and verify

1. Read the page as a newcomer arriving from a search result, without the
   surrounding conversation. Check whether its purpose and prerequisites stand alone.
2. Walk through browser-only use, downloaded files, first pairing, a failed
   update and returning to stock wherever relevant. Record any missing choice
   or unexplained result.
3. Check commands against current help and implementation. Do not run physical
   writes merely to validate documentation without the required authorization.
4. Build the site with `pnpm build` from `site/`. Check internal routes and
   fragments, old incoming links, sidebar placement and search visibility.
5. For emulator help changes, check both generated model pages. Preview with
   local documentation links so unpublished routes can be reviewed.
6. Report what was actually checked. Separate prose review, code inspection,
   command execution and device tests. Keep unverified results explicit.
