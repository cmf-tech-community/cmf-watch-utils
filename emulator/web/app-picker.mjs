import {fetchFixture} from './fixtures.mjs';
import {resolvePreload, catalogDownloadRevision} from './preload.mjs';
import {installAppFiles, validateAppPackage} from './app-storage.mjs';
import {downloadFile} from './download.mjs';

export function setupAppPicker(model, changed = () => {}, report = () => {}) {
  const get = id => document.getElementById(id);
  const section = get('apps-profile');
  const preset = get('boot-preset');
  const input = get('apps-files');
  const list = get('apps-selection');
  const files = [];
  const ids = new WeakMap();
  const roles = ['firmware', 'loader'];
  const localFile = role => get(`apps-${role}-file`).files[0];
  let dependencies;
  let pending;
  const catalog = new Map();
  for (const role of roles) {
    const picker = get(`apps-${role}-file`);
    picker.closest('[data-apps-override]').hidden = model !== 'wp2';
    picker.addEventListener('change', renderSources);
  }
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
  async function download(record, collection, progress = report) {
    return downloadFile(`https://fmc.tools/api/${collection}/${record.id}/download`, {
      name: record.name, revision: catalogDownloadRevision(record), progress,
    });
  }
  async function setPlan(plan) {
    section.hidden = false;
    report('Resolving selected FMC firmware, loader and apps…');
    dependencies = await resolvePreload(plan, model);
    preset.value = 'apps';
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
  async function prepare(validateFirmware, progress = () => {}, hosted = true) {
    if (model !== 'wp2') throw Error('No compatible Apps firmware is available for this watch.');
    const localLoader = localFile('loader');
    const localFirmware = localFile('firmware');
    if (pending && (!localFirmware || !localLoader)) await pending;
    if (!localLoader && !dependencies?.loader) throw Error('Select a local App Loader or retry loading the catalog.');
    if (!localFirmware && !dependencies?.firmware) throw Error('Select local patched firmware or retry loading the catalog.');
    const packages = [];
    const loader = localLoader || await download(dependencies.loader, 'firmwares', progress);
    progress('Checking App Loader and app packages…');
    packages.push({name: 'L.pkg', bytes: validateAppPackage(new Uint8Array(await loader.arrayBuffer()), 1)});
    for (const [slot, file] of files.entries()) {
      packages.push({name: `${slot}.pkg`, bytes: validateAppPackage(new Uint8Array(await file.arrayBuffer()))});
    }
    const firmware = localFirmware || await download(dependencies.firmware, 'firmwares', progress);
    if (firmware.size > 64 * 1024 ** 2) throw Error('Firmware packages must be 64 MiB or smaller.');
    progress('Checking and unpacking selected firmware…');
    const parsed = await validateFirmware(await firmware.arrayBuffer());
    if (!parsed) throw Error('Select patched firmware for the Apps preset.');
    progress('Downloading virtual app storage…');
    const nand = await fetchFixture(new URL(hosted ? './fixtures/nand-defaults.bin.gz' : './fixtures/nand-defaults.bin', import.meta.url), {
      name: 'virtual app storage', size: 2112 * 65536, gzip: hosted,
    });
    progress('Installing App Loader and selected apps into virtual storage…');
    installAppFiles(nand, packages, model);
    report(`${files.length} ${files.length === 1 ? 'app' : 'apps'} installed into virtual storage.`);
    return {app: parsed.app, sdfs: new Blob([parsed.sdfs]), nand: new Blob([nand])};
  }
  function renderSources() {
    for (const role of roles) {
      const record = dependencies?.[role];
      get(`apps-${role}-selection`).value = localFile(role) ? 'Local file' :
        record ? `${record.name} · ${record.version}` : 'Catalog selection unavailable';
    }
  }
  function render() {
    renderSources();
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
    if (dependencies) { render(); await loadCatalog(); return; }
    if (pending) return;
    report('Loading compatible firmware and loader…');
    pending = resolvePreload({apps: [], loader: 'bfe60t13x4bgbgc'}, model);
    try {
      dependencies = await pending;
      report('Firmware and loader selected automatically. App Loader has eight app slots.');
      render();
      await loadCatalog();
    } catch (error) {
      report(error.message, true);
    } finally { pending = undefined; }
  }
  preset.addEventListener('change', update);
  function snapshot() {
    return {dependencies, files: files.map(file => ({file, id: ids.get(file)}))};
  }
  function restore(saved) {
    dependencies = saved.dependencies;
    files.splice(0, files.length);
    for (const entry of saved.files) {
      files.push(entry.file);
      if (entry.id) ids.set(entry.file, entry.id);
    }
    render();
  }
  return {update, prepare, setPlan, snapshot, restore, hasLocalFiles: () => roles.some(localFile) || files.some(file => !ids.has(file)), files: () => [...files], dependencies: () => dependencies};
}
