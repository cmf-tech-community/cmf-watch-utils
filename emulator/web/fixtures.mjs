export async function fetchFixture(url, {name, size, gzip = false, signal, idleMs = 45000}) {
  const controller = new AbortController();
  const timeout = Error(`Loading ${name} stalled. Start the emulator to retry.`);
  let timer;
  let reader;
  const armTimeout = () => {
    clearTimeout(timer);
    timer = setTimeout(() => controller.abort(timeout), idleMs);
  };
  try {
    armTimeout();
    const response = await fetch(url, {
      signal: signal ? AbortSignal.any([signal, controller.signal]) : controller.signal,
    });
    if (!response.ok || !response.body) throw Error(`Could not load the stock file ${name}.`);
    if (size === undefined) return new Uint8Array(await response.arrayBuffer());
    const stream = gzip ? response.body.pipeThrough(new DecompressionStream('gzip')) : response.body;
    reader = stream.getReader();
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      armTimeout();
      if (value.length > size - offset) throw Error(`Invalid size for ${name}.`);
      bytes.set(value, offset);
      offset += value.length;
    }
    if (offset !== size) throw Error(`Invalid size for ${name}.`);
    return bytes;
  } catch (error) {
    controller.abort(error);
    if (reader) void reader.cancel().catch(() => {});
    throw error;
  } finally {
    clearTimeout(timer);
    if (reader) reader.releaseLock();
  }
}
