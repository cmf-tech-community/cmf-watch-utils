import {cachedFetch} from './persistence.mjs';

export async function downloadFile(url, {name, revision = '', progress = () => {}, idleMs = 45000} = {}) {
  const controller = new AbortController();
  let timer, reader, received = 0, streamed = 0;
  const advance = bytes => {
    received = Math.max(received, bytes);
    clearTimeout(timer);
    timer = setTimeout(() => controller.abort(Error(`Downloading ${name} stalled. Check your connection and retry.`)), idleMs);
    progress(`Loading ${name}…${received ? ` ${(received / 1048576).toFixed(1)} MB` : ''}`);
  };
  try {
    advance(0);
    const response = await cachedFetch(url, {signal: controller.signal}, revision, advance);
    controller.signal.throwIfAborted();
    if (!response.ok || !response.body) throw Error(`Could not download ${name} (${response.status}).`);
    reader = response.body.getReader();
    const chunks = [];
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      chunks.push(value);
      streamed += value.length;
      advance(streamed);
    }
    return new Blob(chunks);
  } catch (error) {
    throw controller.signal.aborted ? controller.signal.reason : error;
  } finally {
    clearTimeout(timer);
    reader?.releaseLock();
  }
}
