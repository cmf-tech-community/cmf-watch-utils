import {preferences, setPreference, clearDownloads, clearWatches, clearWatch, storageKey, loadWatch, saveWatch, restoreSettings, saveSettings} from './persistence.mjs';

export function setupStorage(model, {getRuntime, input, report, isStopped}) {
  const $ = id => document.getElementById(id);
  const root = document.querySelector('.advanced');
  let key, saved = 0, pending, generation = 0, requestId = 0, ready = false;
  let autoTimer, lastAttempt = 0;
  function scheduleSave(delay = 2500) {
    clearTimeout(autoTimer);
    if (!ready || !$('persist-watch').checked) return;
    autoTimer = setTimeout(() => checkpoint().catch(fail), Math.max(delay, 10000 - (Date.now() - lastAttempt)));
  }
  const message = text => { $('storage-status').textContent = text; };
  const fail = error => { message(`Storage was not saved: ${error.message}`); report(`Storage was not saved: ${error.message}`, true); };
  const bindings = [['cache-downloads', 'cache'], ['remember-settings', 'remember'], ['persist-watch', `${model}-storage`]];
  for (const [id, name] of bindings) {
    const el = $(id);
    el.checked = preferences()[name] ?? true;
    el.addEventListener('change', () => {
      try { setPreference(name, el.checked); } catch (error) { fail(error); }
      if (id === 'persist-watch') {
        message(el.checked ? 'Watch storage saves automatically and restores when reopened.' : 'Watch storage is session-only. Existing saves are kept.');
        scheduleSave(0);
      }
      $('save-watch-storage').disabled = !ready || !$('persist-watch').checked;
    });
  }
  if (!$('persist-watch').checked) message('Watch storage is session-only. Existing saves are kept.');
  root.addEventListener('change', () => { try { saveSettings(model, root); } catch (error) { fail(error); } });
  for (const event of ['pointerup', 'keyup']) root.addEventListener(event, e => {
    if (!e.target.closest('#orientation-pad')) return;
    try { saveSettings(model, root); } catch (error) { fail(error); }
  });
  $('reset-simulation').addEventListener('click', () => queueMicrotask(() => { try { saveSettings(model, root); } catch (error) { fail(error); } }));
  async function usage() {
    const estimate = await navigator.storage?.estimate?.();
    $('storage-usage').textContent = estimate ? `${Math.round(estimate.usage / 1048576)} MB used by this site. Downloads are capped at 256 MB. Browser clearing can remove saved data.` : 'Browser storage availability varies. Private browsing data is temporary.';
  }
  $('protect-storage').onclick = async () => {
    try {
      const granted = await navigator.storage?.persist?.();
      message(granted ? 'Browser storage is protected from automatic eviction. Clearing site data still removes it.' : 'The browser did not grant protected storage. Existing data remains available until cleared or evicted.');
      await usage();
    } catch (error) { fail(error); }
  };
  $('clear-downloads').onclick = async () => {
    try { await clearDownloads(); message('Downloaded files cleared. Watch storage is unchanged.'); await usage(); } catch (error) { fail(error); }
  };
  $('clear-settings').onclick = () => {
    try { setPreference(model, {}); setPreference('remember', false); $('remember-settings').checked = false; message('Remembered settings cleared. Current controls are unchanged; defaults return on reload.'); } catch (error) { fail(error); }
  };
  async function clear() {
    generation++;
    clearTimeout(autoTimer);
    $('persist-watch').checked = false;
    setPreference(`${model}-storage`, false);
    if (pending) await pending.catch(() => {});
    await clearWatches(model);
    saved = 0;
    message('Saved watch storage cleared. Restart to use fresh storage.');
    await usage();
  }
  $('clear-watch-storage').onclick = async () => {
    if (!confirm('Delete saved storage for this watch model, including its apps, settings and history?')) return;
    try { await clear(); } catch (error) { fail(error); }
  };
  async function checkpoint() {
    if (pending) return pending;
    if (!$('persist-watch').checked || !key || !getRuntime() || isStopped()) return;
    clearTimeout(autoTimer);
    lastAttempt = Date.now();
    const currentGeneration = generation;
    pending = (async () => {
      message('Saving watch storage…');
      const runtime = getRuntime(), token = ++requestId;
      input(`snapshot ${token}`);
      const deadline = Date.now() + 30000;
      while (true) {
        let ack = '';
        try { ack = runtime.FS.readFile('/watch/storage.ack', {encoding: 'utf8'}); } catch {}
        if (ack === `${token} error`) throw Error('The emulator could not export its flash.');
        if (ack === `${token} ok`) break;
        if (Date.now() > deadline) throw Error('The runtime did not respond. A runtime with storage snapshot support is required.');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      try {
        if (generation !== currentGeneration) return;
        saved = await saveWatch(key, runtime.FS.readFile('/watch/storage.nor'), runtime.FS.readFile('/watch/storage.nand'), saved);
        message(`Watch storage saved at ${new Date(saved).toLocaleTimeString()}.`);
        await usage();
      } finally {
        for (const suffix of ['nor', 'nand', 'ack']) try { runtime.FS.unlink(`/watch/storage.${suffix}`); } catch {}
      }
    })();
    try { await pending; } finally { pending = undefined; }
  }
  $('save-watch-storage').onclick = () => checkpoint().catch(fail);
  setInterval(() => { if (!document.hidden) scheduleSave(0); }, 15000);
  for (const type of ['pointerup', 'keyup', 'change']) {
    document.addEventListener(type, event => {
      if (event.target.closest('#storage-controls')) return;
      scheduleSave();
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) checkpoint().catch(fail);
    else scheduleSave(0);
  });
  window.addEventListener('pagehide', () => { checkpoint().catch(() => {}); });
  window.addEventListener('emulator-cache-unavailable', () => message('Download caching is unavailable or full. Downloads still work; watch saves are separate.'));
  usage().catch(() => {});
  return {
    clear, checkpoint,
    async reset() {
      generation++;
      clearTimeout(autoTimer);
      if (pending) await pending.catch(() => {});
      if (key) await clearWatch(key);
      key = undefined;
      ready = false;
      saved = 0;
      sessionStorage.setItem(`${model}-fresh-storage`, '1');
    },
    async restore(files) {
      key = await storageKey(model, files);
      saved = 0;
      if (sessionStorage.getItem(`${model}-fresh-storage`)) {
        await clearWatch(key);
        sessionStorage.removeItem(`${model}-fresh-storage`);
      }
      if (!$('persist-watch').checked) return;
      let entry;
      try { entry = await loadWatch(key); }
      catch (error) {
        $('persist-watch').checked = false;
        message(`Watch storage could not be restored: ${error.message} Running without saving; existing saves are unchanged.`);
        report('Browser storage is unavailable. This watch session will not be saved.', true);
        return;
      }
      if (!entry) { message('No save for this firmware and app selection. Starting with fresh storage.'); return; }
      for (const [name, bytes] of [['nor.bin', entry.nor], ['nand-defaults.bin', entry.nand]]) files.find(file => file[0] === name)[1] = bytes;
      saved = entry.saved;
      message(`Restored watch storage saved at ${new Date(saved).toLocaleString()}.`);
    },
    ready() {
      ready = true;
      $('save-watch-storage').disabled = !$('persist-watch').checked;
      scheduleSave(0);
    },
  };
}

export {restoreSettings};
