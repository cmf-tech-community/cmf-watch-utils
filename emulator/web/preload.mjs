const identifier = /^[a-z0-9]{15}$/;
const devices = {wp2: 'watch_pro_2', wp3: 'watch_3_pro'};
const origin = 'https://fmc.tools';
const appPresets = {
  wp2: {firmware: 'kqbnulphohzw2wb', loader: 'bfe60t13x4bgbgc'},
};

export function catalogDownloadRevision(record) {
  const file = record.image || record.package;
  return file ? `${record.collectionId || record.collectionName || ''}/${record.id}/${file}` : '';
}

export async function catalogRecord(id, model, role, request = fetch) {
  if (!identifier.test(id)) throw Error(`Invalid FMC ${role} ID.`);
  const collection = role === 'app' ? 'apps' : role === 'watchface' ? 'watchfaces' : 'firmwares';
  const response = await request(`${origin}/api/collections/${collection}/records/${id}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw Error(`FMC ${role} could not be loaded (${response.status}).`);
  return checkCompatibility(await response.json(), model, role);
}

export async function resolvePreload(plan, model, request = fetch) {
  plan = {...plan, apps: [...plan.apps]};
  const automatic = [];
  if (plan.loader || plan.apps.length) {
    const preset = appPresets[model];
    if (!preset) throw Error('No verified app firmware and loader preset is available for this watch.');
    for (const role of ['firmware', 'loader']) {
      if (!plan[role]) {
        plan[role] = preset[role];
        automatic.push(role);
      }
    }
  }
  const result = {apps: [], automatic};
  for (const role of ['firmware', 'loader', 'watchface']) {
    if (plan[role]) result[role] = await catalogRecord(plan[role], model, role, request);
  }
  for (const id of plan.apps) result.apps.push(await catalogRecord(id, model, 'app', request));
  if ((result.loader || result.apps.length) && result.firmware?.kind === 'stock') {
    throw Error('Installable apps require compatible patched firmware, not stock firmware.');
  }
  return result;
}

export function parsePreload(search) {
  const params = new URLSearchParams(search);
  const plan = {apps: []};
  for (const key of ['firmware', 'loader', 'watchface', 'app']) {
    const values = params.getAll(key);
    if (key !== 'app' && values.length > 1) throw Error(`Specify only one ${key}.`);
    if (values.some(value => !identifier.test(value))) throw Error(`Invalid FMC ${key} ID.`);
    if (key === 'app') plan.apps = [...new Set(values)];
    else if (values.length) plan[key] = values[0];
  }
  if (plan.apps.length > 8) throw Error('App Loader has eight app slots.');
  return plan;
}

export function checkCompatibility(record, model, role) {
  const device = devices[model];
  if (!device || !record.published ||
      (record.device !== device && !(model === 'wp2' && role === 'watchface' && !record.device))) {
    throw Error(`This FMC ${role} is not published for the selected watch.`);
  }
  if (role === 'loader' && record.kind !== 'loader') throw Error('Select an App Loader package.');
  if (role === 'firmware' && !['stock', 'patched'].includes(record.kind)) {
    throw Error('This item is a loader, not firmware. Select it as the loader.');
  }
  return record;
}
