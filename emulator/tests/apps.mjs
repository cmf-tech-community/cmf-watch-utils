import {test} from 'node:test';
import assert from 'node:assert/strict';
import {populateAppVolume} from '../web/app-storage.mjs';
import {parsePreload, resolvePreload} from '../web/preload.mjs';

function volume() {
  const bytes = new Uint8Array(10 * 1024 * 1024);
  const view = new DataView(bytes.buffer);
  view.setUint16(11, 512, true);
  bytes[13] = 4;
  view.setUint16(14, 1, true);
  bytes[16] = 1;
  view.setUint16(17, 512, true);
  view.setUint16(19, 20480, true);
  view.setUint16(22, 479, true);
  view.setUint16(510, 0xaa55, true);
  view.setUint32(512, 0xfffffff8, true);
  return bytes;
}

test('app files survive FAT chain traversal and input is unchanged', () => {
  const input = volume();
  const payload = Uint8Array.from({length: 7213}, (_, i) => i % 251);
  const output = populateAppVolume(input, [{name: 'L.pkg', bytes: payload}]);
  const view = new DataView(output.buffer);
  const root = 480 * 512;
  const clusterOffset = cluster => 512 * 512 + (cluster - 2) * 2048;
  const directory = clusterOffset(view.getUint16(root + 26, true));
  let cluster = view.getUint16(directory + 64 + 26, true);
  const recovered = [];
  while (cluster < 0xfff8) {
    recovered.push(...output.subarray(clusterOffset(cluster), clusterOffset(cluster) + 2048));
    cluster = view.getUint16(512 + cluster * 2, true);
  }
  assert.deepEqual(Uint8Array.from(recovered.slice(0, payload.length)), payload);
  assert.deepEqual(input, volume());
  assert.throws(() => populateAppVolume(output, [{name: '0.pkg', bytes: payload}]), /already exists/);
});

test('preload URLs reject ambiguous firmware and deduplicate app IDs', () => {
  assert.throws(() => parsePreload('?firmware=kqbnulphohzw2wb&firmware=kqbnulphohzw2wb'), /only one/);
  assert.throws(() => parsePreload('?app=../file'), /Invalid/);
  assert.deepEqual(parsePreload('?app=pyccglfsfijw463&app=pyccglfsfijw463').apps, ['pyccglfsfijw463']);
});

test('unsupported model app preload fails before downloading', async () => {
  await assert.rejects(resolvePreload({apps: ['pyccglfsfijw463']}, 'wp3', () => {
    throw Error('Unexpected network call');
  }), /No verified/);
});
