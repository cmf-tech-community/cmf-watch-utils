import {cachedFetch} from './persistence.mjs';
import {resolvePreload} from './preload.mjs';
import {installAppFiles, validateAppPackage} from './app-storage.mjs';

export function setupAppPicker(model, changed = () => {}, report = () => {}) {
  const get = id => document.getElementById(id);
  const section = get('apps-profile');
  const preset = get('boot-preset');
  const input = get('apps-files');
  const list = get('apps-selection');
  const files = [];
  const ids = new WeakMap();
  let dependencies;
  let pending;
  const catalog = new Map();
  get('apps-catalog-add').onclick = async () => {
    const button = get('apps-catalog-add');
    const record = catalog.get(get('apps-catalog').value);
    if (!record) return;
    if (files.length >= 8) { report('Select at most eight apps.'); return; }
    try {
      button.disabled = true;
      report(`Downloading ${record.name}…`);
      const blob = await download(record, 'apps');
      validateAppPackage(new Uint8Array(await blob.arrayBuffer()));
      if (files.length >= 8) throw Error('Select at most eight apps.');
      const file = new File([blob], `${record.name} · ${record.version}.wp2app`);
      ids.set(file, record.id);
      files.push(file);
      render();
      report(`${record.name} added.`);
    } catch (error) { report(error.message, true); }
    finally { button.disabled = model !== 'wp2'; }
  };
  async function download(record, collection) {
    const response = await cachedFetch(`https://fmc.tools/api/${collection}/${record.id}/download`, {signal: AbortSignal.timeout(90000)}, record.updated || record.version || '');
    if (!response.ok) throw Error(`Could not download ${record.name}.`);
    return response.blob();
  }
  async function setPlan(plan) {
    section.hidden = false;
    report('Resolving selected FMC firmware, loader and apps…');
    dependencies = await resolvePreload(plan, model);
    preset.value = 'apps';
    preset.dispatchEvent(new Event('change'));
    for (const role of ['firmware', 'loader']) {
      const record = dependencies[role];
      get(`apps-${role}-selection`).value = `${record.name} · ${record.version}`;
    }
    for (const record of dependencies.apps) {
      const blob = await download(record, 'apps');
      const file = new File([blob], `${record.name} · ${record.version}.wp2app`);
      validateAppPackage(new Uint8Array(await file.arrayBuffer()));
      ids.set(file, record.id);
      files.push(file);
    }
    report('Selected firmware, loader and apps are ready to install.');
    render();
    await loadCatalog();
  }
  async function prepare(validateFirmware, progress = () => {}) {
    progress('Downloading App Loader and checking app packages…');
    if (model !== 'wp2') throw Error('No compatible Apps firmware is available for this watch.');
    if (pending) await pending;
    if (!dependencies) throw Error('Select compatible firmware and loader first.');
    const packages = [];
    const loader = await download(dependencies.loader, 'firmwares');
    packages.push({name: 'L.pkg', bytes: validateAppPackage(new Uint8Array(await loader.arrayBuffer()), 1)});
    for (const [slot, file] of files.entries()) {
      packages.push({name: `${slot}.pkg`, bytes: validateAppPackage(new Uint8Array(await file.arrayBuffer()))});
    }
    progress('Downloading firmware and preparing app storage…');
    const firmware = await download(dependencies.firmware, 'firmwares');
    const parsed = await validateFirmware(await firmware.arrayBuffer());
    const response = await cachedFetch(new URL('./fixtures/nand-defaults.bin.gz', import.meta.url), {}, 'bundle');
    if (!response.ok) throw Error('The emulator bundle is missing prepared app storage.');
    const nand = new Uint8Array(await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
    installAppFiles(nand, packages, model);
    report(`${files.length} ${files.length === 1 ? 'app' : 'apps'} installed into virtual storage.`);
    return {app: parsed.app, sdfs: new Blob([parsed.sdfs]), nand: new Blob([nand])};
  }
  function render() {
    if (dependencies) changed({preset: 'apps', firmware: dependencies.firmware.id, loader: dependencies.loader.id, app: files.map(file => ids.get(file)).filter(Boolean)});
    list.replaceChildren();
    for (const file of files) {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = file.name;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${file.name}`);
      remove.onclick = () => { files.splice(files.indexOf(file), 1); render(); };
      item.append(label, remove);
      list.append(item);
    }
  }
  input.onchange = () => {
    const next = [...input.files];
    input.value = '';
    if (files.length + next.length > 8) {
      report('Select at most eight apps.');
      return;
    }
    for (const file of next) {
      if (!files.some(existing => existing.name === file.name && existing.size === file.size)) files.push(file);
    }
    render();
  };
  async function loadCatalog() {
    if (catalog.size) return;
      const query = new URLSearchParams({filter: 'published=true && device="watch_pro_2"', perPage: '100', sort: 'name'});
      for (let page = 1; ; page++) {
        query.set('page', page);
        const response = await fetch(`https://fmc.tools/api/collections/apps/records?${query}`, {signal: AbortSignal.timeout(15000)});
        if (!response.ok) throw Error('The FMC app catalog could not be loaded.');
        const result = await response.json();
        for (const record of result.items) {
          catalog.set(record.id, record);
          const option = document.createElement('option');
          option.value = record.id;
          option.textContent = `${record.name} · ${record.version}`;
          get('apps-catalog').append(option);
        }
        if (page >= result.totalPages) break;
      }
  }
  async function update() {
    section.hidden = preset.value !== 'apps';
    if (section.hidden) return;
    input.disabled = model !== 'wp2';
    get('apps-catalog').disabled = model !== 'wp2';
    get('apps-catalog-add').disabled = model !== 'wp2';
    if (model !== 'wp2') {
      report('No compatible patched firmware or App Loader is available for this watch yet.');
      get('apps-firmware-selection').value = 'Unavailable';
      get('apps-loader-selection').value = 'Unavailable';
      return;
    }
    if (dependencies) { render(); return; }
    if (pending) return;
    report('Loading compatible firmware and loader…');
    pending = resolvePreload({apps: [], loader: 'bfe60t13x4bgbgc'}, model);
    try {
      dependencies = await pending;
      for (const role of ['firmware', 'loader']) {
        const record = dependencies[role];
        get(`apps-${role}-selection`).value = `${record.name} · ${record.version}`;
      }
      report('Firmware and loader selected automatically. App Loader has eight app slots.');
      render();
      await loadCatalog();
    } catch (error) {
      report(error.message, true);
    } finally { pending = undefined; }
  }
  preset.addEventListener('change', update);
  return {update, prepare, setPlan, hasLocalFiles: () => files.some(file => !ids.has(file)), files: () => [...files], dependencies: () => dependencies};
}
