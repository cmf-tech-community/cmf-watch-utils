import {test} from 'node:test';
import assert from 'node:assert/strict';
import {downloadFile} from '../web/download.mjs';
import {cachedFetch} from '../web/persistence.mjs';

test('active downloads may exceed the idle deadline in total duration', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response(new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 5; i++) {
        controller.enqueue(new Uint8Array([i]));
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      controller.close();
    },
  })));
  const messages = [];
  const blob = await downloadFile('https://example.test/file', {name: 'firmware', idleMs: 70, progress: text => messages.push(text)});
  assert.equal(blob.size, 5);
  assert.ok(messages.length >= 5);
});

test('stalled download rejects with the affected file name', async t => {
  t.mock.method(globalThis, 'fetch', async (_url, {signal}) => new Response(new ReadableStream({
    start(controller) {
      signal.addEventListener('abort', () => controller.error(signal.reason), {once: true});
    },
  })));
  await assert.rejects(downloadFile('https://example.test/file', {name: 'firmware', idleMs: 20}), /Downloading firmware stalled/);
});

test('download cancellation also interrupts an IndexedDB open that never settles', async t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB');
  Object.defineProperty(globalThis, 'indexedDB', {configurable: true, value: {open: () => ({})}});
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'indexedDB', previous);
    else delete globalThis.indexedDB;
  });
  const controller = new AbortController();
  const pending = cachedFetch('https://example.test/file', {signal: controller.signal}, 'file-v1');
  controller.abort(Error('Download cancelled'));
  await assert.rejects(pending, /Download cancelled/);
});
