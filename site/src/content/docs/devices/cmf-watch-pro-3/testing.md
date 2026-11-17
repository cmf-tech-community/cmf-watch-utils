---
title: Testing stock firmware
description: Repeatable Watch 3 Pro checks for inputs, simulated sensors and passcodes.
---

Use stock 1.0.1.77 with profile `wp3-stock`. Start with the
[browser emulator](/emulator/watch-pro-3/) or prepare desktop storage using
[First boot](/emulator/first-boot/#watch-3-pro-storage). Keep each run's log and
selected input values. The [status page](/devices/cmf-watch-pro-3/status/)
distinguishes existing results from tests that still need coverage.

## Display and controls

Open the app list with a short crown press. Scroll in both directions using the
crown, then repeat using touch. Open an app and return to the face. Hold the
face to open its picker and check the selected face after leaving the picker.
For graphics changes, repeat with all seven stock faces.

## Simulated sensors

The browser groups inputs under **Simulation**. The desktop viewer uses
**Advanced**. Change one input at a time while the corresponding stock screen
is measuring; merely changing a host control does not prove that stock read it.

| Input | What to observe |
|---|---|
| Orientation and gyro | Level, tilt or angular values should follow the supplied motion. |
| Ambient light | The light test should respond to a changed lux value. Lux measures illumination. |
| GPS | Start a stock mode using the receiver, then compare the displayed fix with the supplied coordinates. |
| Battery and charger | Set **Battery level** in the browser and compare it with the stock percentage. Toggle the charger separately and check the charging indicator. |
| Optical samples | Enable raw samples and worn state, then start a stock measurement. |

For optical tests in the browser, enable **Simulate optical sensor signals** and
**Watch is worn** under **Optical sensors**. Open Heart rate or Blood oxygen
and allow stock to calculate a result. Check the history screen separately.
**Set measurement results** supplies values directly for display tests, which does
not test the raw-sample calculation. See [optical interfaces](/devices/cmf-watch-pro-3/hardware/#gh3220-optical-sensor)
for the driver-level behavior.

## Passcodes

In stock **Settings → Passcode**, create a disposable numeric code or gesture.
Enable off-wrist detection, return to the face with **Watch is worn** on, then
turn it off. Verify that stock locks, rejects an incorrect entry and accepts
the correct one. Repeat independently for the other passcode type.
Browser reload persistence is a separate test, not part of this unlock check.

## Record failures

Save the watch log before resetting. Include the exact interaction and whether
sound or controls still worked after the display failed. Keep desktop and browser
results separate. See [Troubleshooting](/getting-started/troubleshooting/) for
connection, file and startup problems. Tests here run in virtual storage and do
not require flashing a watch.
