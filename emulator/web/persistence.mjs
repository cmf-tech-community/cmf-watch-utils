const databaseName = 'cmf-emulator-v1';
const preferenceKey = 'cmf-emulator-preferences-v1';
let database;
let cacheEpoch = 0;

export function preferences() {
  try {
    const value = JSON.parse(localStorage.getItem(preferenceKey));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

export function setPreference(name, value) {
  const values = preferences();
  values[name] = value;
  localStorage.setItem(preferenceKey, JSON.stringify(values));
}

async function openDatabase() {
  if (!database) database = new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      for (const name of ['downloads', 'watches']) request.result.createObjectStore(name);
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => { db.close(); database = undefined; };
      resolve(db);
    };
    request.onerror = () => { database = undefined; reject(request.error); };
    request.onblocked = () => { database = undefined; reject(Error('Close other emulator tabs and retry storage access.')); };
  });
  return database;
}

async function store(name, mode, operation) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(name, mode);
    const request = operation(transaction.objectStore(name));
    transaction.oncomplete = () => resolve(request?.result);
    transaction.onabort = () => reject(transaction.error || Error('Browser storage transaction failed.'));
    transaction.onerror = () => {};
  });
}

export async function clearDownloads() {
  cacheEpoch++;
  await store('downloads', 'readwrite', s => s.clear());
}

export async function discardDownload(url) {
  const key = new URL(url, globalThis.location?.href).href + '|';
  await store('downloads', 'readwrite', s => s.delete(IDBKeyRange.bound(key, key + '\uffff')));
}

export async function cachedFetch(url, options = {}, revision = '', progress = () => {}) {
  if (preferences().cache === false || !globalThis.indexedDB) return fetch(url, options);
  const address = new URL(url, globalThis.location?.href).href;
  const key = `${address}|${revision}`;
  const epoch = cacheEpoch;
  try {
    const entry = await store('downloads', 'readonly', s => s.get(key));
    if (entry && (revision || Date.now() - entry.saved < 3600000)) {
      options.signal?.throwIfAborted();
      return new Response(entry.blob, {headers: entry.headers});
    }
  } catch (error) { if (options.signal?.aborted) throw error; }
  const response = await fetch(url, options);
  if (!response.ok || response.type === 'opaque') return response;
  const chunks = [];
  const reader = response.body.getReader();
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      progress();
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const blob = new Blob(chunks, {type: response.headers.get('content-type') || ''});
  options.signal?.throwIfAborted();
  if (epoch === cacheEpoch && preferences().cache !== false && blob.size <= 160 * 1024 * 1024) {
    try {
      await store('downloads', 'readwrite', s => {
        let size = blob.size;
        const entries = [];
        const cursor = s.openCursor();
        cursor.onsuccess = () => {
          const current = cursor.result;
          if (current) {
            if (current.key !== key) { size += current.value.blob.size; entries.push([current.key, current.value.saved, current.value.blob.size]); }
            current.continue();
          } else {
            entries.sort((a, b) => a[1] - b[1]);
            while ((size > 256 * 1024 * 1024 || entries.length >= 128) && entries.length) {
              const [old, , bytes] = entries.shift(); s.delete(old); size -= bytes;
            }
            s.put({blob, saved: Date.now(), headers: [...response.headers]}, key);
          }
        };
      });
    } catch {
      globalThis.dispatchEvent?.(new Event('emulator-cache-unavailable'));
    }
  }
  return new Response(blob, {status: response.status, headers: response.headers});
}

export async function storageKey(model, files) {
  const hashes = [];
  for (const [name, bytes] of files) {
    if (!['nor.bin', 'nand-defaults.bin', 'app.bin', 'wfc-index.txt'].includes(name)) continue;
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    hashes.push(name + ':' + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join(''));
  }
  return `${model}:${hashes.sort().join('|')}`;
}

export async function loadWatch(key) {
  const saved = await store('watches', 'readonly', s => s.get(key));
  if (!saved) return null;
  const decode = async blob => new Uint8Array(await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  const nor = await decode(saved.nor), nand = await decode(saved.nand);
  if (nor.length !== 0x400000 || nand.length !== 2112 * 65536) throw Error('Saved watch storage has an invalid size. Clear saved watch storage to start again.');
  return {nor, nand, saved: saved.saved};
}

export async function saveWatch(key, nor, nand, expected = 0) {
  const previous = await store('watches', 'readonly', s => s.get(key));
  if ((previous?.saved || 0) !== expected) throw Error('Saved storage changed in another session. Reload to restore it before saving.');
  const fingerprint = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  const hashes = [await fingerprint(nor), await fingerprint(nand)];
  if (previous?.hashes?.every((hash, i) => hash === hashes[i]) && previous.hashes.length === 2) {
    const current = await store('watches', 'readonly', s => s.get(key));
    if (current?.saved !== expected) throw Error('Saved storage changed in another session. Reload to restore it before saving.');
    return current.saved;
  }
  const encode = bytes => new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).blob();
  const entry = {nor: await encode(nor), nand: await encode(nand), saved: Date.now(), hashes};
  let conflict = false;
  await store('watches', 'readwrite', s => {
    const request = s.get(key);
    request.onsuccess = () => {
      if ((request.result?.saved || 0) !== expected) { conflict = true; s.transaction.abort(); return; }
      s.put(entry, key);
    };
  }).catch(error => {
    if (conflict) throw Error('Saved storage changed in another session. Reload to restore it before saving.');
    throw error;
  });
  return entry.saved;
}

export async function clearWatches(model) {
  await store('watches', 'readwrite', s => s.delete(IDBKeyRange.bound(`${model}:`, `${model}:\uffff`)));
}

export async function clearWatch(key) {
  await store('watches', 'readwrite', s => s.delete(key));
}

export function restoreSettings(model, root) {
  if (preferences().remember === false) return;
  const saved = preferences()[model] || {};
  for (const [id, value] of Object.entries(saved)) {
    const element = root.querySelector(`#${CSS.escape(id)}`);
    if (!element || element.type === 'file') continue;
    if (element.type === 'checkbox') element.checked = value === true;
    else if (typeof value === 'string') {
      if (element.tagName === 'SELECT' && ![...element.options].some(option => option.value === value)) continue;
      const previous = element.value;
      element.value = value;
      if (!element.checkValidity()) element.value = previous;
    }
  }
}

export function saveSettings(model, root) {
  if (preferences().remember === false) return;
  const values = {};
  for (const el of root.querySelectorAll('input[id],select[id]')) {
    if (el.type === 'file' || el.closest('#storage-controls') || !el.checkValidity()) continue;
    values[el.id] = el.type === 'checkbox' ? el.checked : el.value;
  }
  setPreference(model, values);
}
