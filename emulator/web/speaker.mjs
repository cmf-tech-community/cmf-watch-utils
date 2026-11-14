export function speakerSlice({first, end, cursor, rate, now, scheduledUntil, delay, flush}) {
  const start = Math.max(first, cursor ?? first);
  const restarting = scheduledUntil <= now;
  if (restarting && !flush && end - start < Math.ceil(rate * delay)) return;

  const when = restarting ? now + .025 : scheduledUntil;
  const capacity = Math.floor((now + delay - when) * rate);
  const length = Math.min(end - start, capacity);
  if (length <= 0) return;
  return {start, length, when};
}
