import assert from 'node:assert/strict';
import {test} from 'node:test';
import {gzipSync} from 'node:zlib';
import {fetchFixture} from '../web/fixtures.mjs';

test('reads a compressed fixture into its exact destination size', async () => {
  const source = Buffer.from('virtual flash fixture');
  const url = `data:application/octet-stream;base64,${gzipSync(source).toString('base64')}`;
  const options = {name: 'nand.bin', size: source.length, gzip: true};
  assert.deepEqual(await fetchFixture(url, options), new Uint8Array(source));
  for (const size of [source.length - 1, source.length + 1]) {
    await assert.rejects(fetchFixture(url, {...options, size}), /Invalid size for nand\.bin/);
  }
});

test('stops a fixture request that never receives a response', async context => {
  context.mock.method(globalThis, 'fetch', (_, {signal}) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), {once: true});
  }));
  await assert.rejects(fetchFixture('unused', {name: 'nand.bin', idleMs: 5}), /Loading nand\.bin stalled/);
});
