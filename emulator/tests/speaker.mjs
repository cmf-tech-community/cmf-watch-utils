import assert from 'node:assert/strict';
import {test} from 'node:test';
import {speakerSlice} from '../web/speaker.mjs';

const defaults = {first: 0, end: 7000, rate: 16000, now: 1,
  scheduledUntil: 0, delay: .3, flush: false};

test('preserves the first available sample and schedules consecutive slices', () => {
  const first = speakerSlice(defaults);
  assert.equal(first.start, 0);
  assert.ok(first.length > 0);
  const endTime = first.when + first.length / defaults.rate;
  const next = speakerSlice({...defaults, now: 1.1, cursor: first.length, scheduledUntil: endTime});
  assert.equal(next.start, first.length);
  assert.equal(next.when, endTime);
});

test('waits for refill after a stall and resumes at the same sample', () => {
  assert.equal(speakerSlice({...defaults, cursor: 5000}), undefined);
  const resumed = speakerSlice({...defaults, cursor: 5000, end: 12000});
  assert.equal(resumed.start, 5000);
  assert.ok(resumed.when > defaults.now);
});

test('flushes short clips without padding and skips only overwritten samples', () => {
  assert.equal(speakerSlice({...defaults, end: 70}), undefined);
  assert.equal(speakerSlice({...defaults, end: 70, flush: true}).length, 70);
  assert.equal(speakerSlice({...defaults, first: 400, cursor: 30}).start, 400);
});
