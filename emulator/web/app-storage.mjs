const view = bytes => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function validateAppPackage(bytes, kind = 0) {
  if (bytes.length < 64) throw Error('App package is truncated.');
  const data = view(bytes);
  const size = data.getUint32(36, true);
  const entry = data.getUint32(40, true);
  const relocations = data.getUint32(44, true);
  if (new TextDecoder().decode(bytes.subarray(0, 4)) !== 'WP2A' ||
      data.getUint16(4, true) !== 1 || bytes[6] !== kind || bytes[7] > 3 ||
      !size || size > (kind ? 65536 : 131072) || entry >= size ||
      bytes.length !== 64 + size + relocations * 4 || bytes.subarray(56, 64).some(Boolean) ||
      crc32(bytes.subarray(0, 52)) !== data.getUint32(52, true) ||
      crc32(bytes.subarray(64)) !== data.getUint32(48, true)) throw Error('Invalid or incompatible app package.');
  let previous = -1;
  for (let index = 0; index < relocations; index++) {
    const offset = data.getUint32(64 + size + index * 4, true);
    if (offset <= previous || offset + 4 > size) throw Error('Invalid app relocation table.');
    previous = offset;
  }
  return bytes;
}

export function appVolumeMapping(nand) {
  if (nand.length !== 2112 * 65536) throw Error('Expected a prepared virtual NAND image.');
  const data = view(nand);
  const blocks = new Map();
  for (let offset = 0; offset < nand.length; offset += 2112 * 64) {
    const tag = offset + 2048;
    const marker = data.getUint32(tag, true);
    const logical = data.getUint16(tag + 6, true);
    if (![0xff00ffff, 0xff01ffff].includes(marker) || data.getUint16(tag + 4, true) || logical < 820 || logical >= 900) continue;
    if (blocks.has(logical)) throw Error('Ambiguous app-storage NAND mapping.');
    blocks.set(logical, offset);
  }
  const pages = [];
  for (let logical = 820; logical < 900; logical++) {
    if (!blocks.has(logical)) throw Error('This stock fixture needs app-storage preparation.');
    for (let page = 0; page < 64; page++) {
      const offset = blocks.get(logical) + page * 2112;
      if (page && (![0x5500ffff, 0x5501ffff].includes(data.getUint32(offset + 2048, true)) ||
          data.getUint16(offset + 2052, true) !== page || data.getUint16(offset + 2054, true) !== logical)) {
        throw Error('Unsupported app-storage page mapping.');
      }
      pages.push(offset);
    }
  }
  return pages;
}

export function installAppFiles(nand, packages, model) {
  if (model !== 'wp2') throw Error('Installable app storage is not verified for this model.');
  const pages = appVolumeMapping(nand);
  const volume = new Uint8Array(pages.length * 2048);
  pages.forEach((offset, index) => volume.set(nand.subarray(offset, offset + 2048), index * 2048));
  const populated = populateAppVolume(volume, packages);
  pages.forEach((offset, index) => nand.set(populated.subarray(index * 2048, (index + 1) * 2048), offset));
}

export function populateAppVolume(input, packages) {
  const bytes = input.slice();
  const data = view(bytes);
  if (bytes.length < 512 || data.getUint16(510, true) !== 0xaa55) throw Error('Invalid FAT volume.');
  const sector = data.getUint16(11, true);
  const clusterSectors = bytes[13];
  const reserved = data.getUint16(14, true);
  const fats = bytes[16];
  const rootEntries = data.getUint16(17, true);
  const total = data.getUint16(19, true) || data.getUint32(32, true);
  const fatSectors = data.getUint16(22, true);
  if (sector !== 512 || !clusterSectors || (clusterSectors & (clusterSectors - 1)) ||
      !reserved || !fats || fats > 2 || !rootEntries || !fatSectors || total * sector !== bytes.length) {
    throw Error('Unsupported FAT geometry.');
  }
  const rootStart = (reserved + fats * fatSectors) * sector;
  const firstData = rootStart + Math.ceil(rootEntries * 32 / sector) * sector;
  const clusterSize = clusterSectors * sector;
  const clusters = Math.floor((bytes.length - firstData) / clusterSize);
  if (clusters < 4085 || clusters >= 65525 || (clusters + 2) * 2 > fatSectors * sector) {
    throw Error('Expected a FAT16 volume.');
  }
  const fatStart = reserved * sector;
  const fat = index => data.getUint16(fatStart + index * 2, true);
  const setFat = (index, value) => {
    for (let copy = 0; copy < fats; copy++) data.setUint16(fatStart + copy * fatSectors * sector + index * 2, value, true);
  };
  const clusterOffset = index => firstData + (index - 2) * clusterSize;
  const allocate = size => {
    const needed = Math.max(1, Math.ceil(size / clusterSize));
    const chain = [];
    for (let i = 2; i < clusters + 2 && chain.length < needed; i++) if (!fat(i)) chain.push(i);
    if (chain.length !== needed) throw Error('Not enough free app storage.');
    chain.forEach((item, index) => {
      setFat(item, chain[index + 1] ?? 0xffff);
      bytes.fill(0, clusterOffset(item), clusterOffset(item) + clusterSize);
    });
    return chain;
  };
  const entry = (offset, name, attributes, cluster, size) => {
    bytes.fill(0, offset, offset + 32);
    bytes.set(new TextEncoder().encode(name), offset);
    bytes[offset + 11] = attributes;
    data.setUint16(offset + 26, cluster, true);
    data.setUint32(offset + 28, size, true);
  };
  let rootSlot;
  for (let i = 0; i < rootEntries; i++) {
    const offset = rootStart + i * 32;
    if (new TextDecoder().decode(bytes.subarray(offset, offset + 11)) === 'WP2APPS    ') {
      throw Error('App storage already exists; start from a clean stock fixture.');
    }
    if (rootSlot === undefined && [0, 0xe5].includes(bytes[offset])) rootSlot = offset;
  }
  if (rootSlot === undefined) throw Error('The root directory is full.');
  if (!packages.length || packages.length > 9) throw Error('Expected a loader and at most eight apps.');
  const names = new Set();
  for (const {name, bytes: payload} of packages) {
    if (!/^[L0-7]\.pkg$/.test(name) || names.has(name) || !payload.length) throw Error('Invalid app storage file.');
    names.add(name);
  }
  const directory = allocate(clusterSize)[0];
  entry(rootSlot, 'WP2APPS    ', 0x10, directory, 0);
  const directoryOffset = clusterOffset(directory);
  entry(directoryOffset, '.          ', 0x10, directory, 0);
  entry(directoryOffset + 32, '..         ', 0x10, 0, 0);
  packages.forEach(({name, bytes: payload}, index) => {
    const chain = allocate(payload.length);
    chain.forEach((cluster, part) => bytes.set(payload.subarray(part * clusterSize, (part + 1) * clusterSize), clusterOffset(cluster)));
    entry(directoryOffset + (index + 2) * 32, name[0] + '       PKG', 0x20, chain[0], payload.length);
  });
  return bytes;
}
