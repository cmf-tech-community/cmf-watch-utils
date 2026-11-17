import {cachedFetch, preferences, saveBootDraft, takeBootDraft} from './persistence.mjs';
import {lockBootControls, captureBootFiles, restoreBootFiles} from './boot-controls.mjs';
import {setupStorage, restoreSettings} from './storage-controls.mjs';
import {downloadCatalogFace, setupFaceCatalog} from './catalog.mjs';
import {fetchFixture} from './fixtures.mjs';
import {installWatchFace} from './face.mjs';
import {speakerSlice} from './speaker.mjs';
import {setupAppPicker} from './app-picker.mjs';
import {parsePreload, catalogRecord, catalogDownloadRevision} from './preload.mjs';
import {downloadFile} from './download.mjs';

const $ = (id) => document.getElementById(id);
const panel = $('panel');
const context = panel.getContext('2d', {alpha:false});
const pixels = context.createImageData(466,466);
const hosted = document.body.hasAttribute('data-hosted');
const bundledStock = document.body.hasAttribute('data-stock-ready');
const watch3 = document.body.dataset.model === 'wp3';
const faceModel = watch3 ? 'wp3' : 'wp2';
restoreSettings(faceModel, document.querySelector('.advanced'));
const modelSlug = watch3 ? 'watch-pro-3' : 'watch-pro-2';
const modelToggle = $('model-toggle');
if (modelToggle) {
  const list = $('model-list');
  function showModels(open) {
    list.hidden = !open;
    modelToggle.setAttribute('aria-expanded', String(open));
  }
  modelToggle.addEventListener('click', () => showModels(list.hidden));
  const picker = modelToggle.closest('.model-picker');
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !list.hidden) {
      showModels(false);
      modelToggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!picker.contains(event.target)) showModels(false);
  });
}
const stockFiles = $('stock-files');
const frameFile = $('frame-file');
const frameOverrides = new Map();
const bootPreset = $('boot-preset');
function updateLink(values) {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries(values)) {
    url.searchParams.delete(key);
    for (const item of Array.isArray(value) ? value : value ? [value] : []) url.searchParams.append(key, item);
  }
  history.replaceState(null, '', url);
}
const appPicker = setupAppPicker(faceModel, updateLink, (text, error = false) => status(text, error, 'notice'));
$('share-session').onclick = async () => {
  const url = new URL(location.href);
  for (const key of ['idle', 'debug', 'isolation-reload']) url.searchParams.delete(key);
  $('share-url').value = url.href;
  const local = appPicker.hasLocalFiles() || [...document.querySelectorAll('input[type=file]')].some(input => input.id !== 'apps-files' && input.files.length && !(input.id === 'firmware-file' && url.searchParams.has('firmware')));
  try {
    await navigator.clipboard.writeText(url.href);
    $('share-status').textContent = local ? 'Link copied. Local uploads are not included.' : 'Link copied.';
  } catch {
    $('share-url').hidden = false;
    $('share-url').focus();
    $('share-url').select();
    $('share-status').textContent = 'Copy this link manually. Local uploads are not included.';
  }
};
async function selectCatalogFirmware(record) {
  status(`Downloading ${record.name} · ${record.version}…`, false, 'loading');
  const blob = await downloadFile(`https://fmc.tools/api/firmwares/${record.id}/download`, {
    name: record.name, revision: catalogDownloadRevision(record), progress: text => status(text, false, 'loading'),
  });
  const selection = new DataTransfer();
  selection.items.add(new File([blob], `${record.name}-${record.version}.bin`));
  $('firmware-file').files = selection.files;
  $('firmware-file').dispatchEvent(new Event('change'));
  bootPreset.value = 'custom';
  bootPreset.dispatchEvent(new Event('change'));
  status(`Selected ${record.name} · ${record.version}.`, false, 'notice');
  const select = $('fmc-firmware-selection');
  if (![...select.options].some(option => option.value === record.id)) select.add(new Option(`${record.name} · ${record.version}`, record.id));
  select.value = record.id;
  updateLink({firmware: record.id, loader: null, app: null, preset: null});
}
const firmwareRecords = new Map();
$('fmc-firmware-catalog').addEventListener('toggle', async () => {
  if (!$('fmc-firmware-catalog').open || firmwareRecords.size) return;
  try {
    const query = new URLSearchParams({filter: `published=true && device="${watch3 ? 'watch_3_pro' : 'watch_pro_2'}" && kind!="loader"`, perPage: '100', sort: '-updated'});
    for (let page = 1; ; page++) {
      query.set('page', page);
      const response = await fetch(`https://fmc.tools/api/collections/firmwares/records?${query}`, {signal: AbortSignal.timeout(15000)});
      if (!response.ok) throw Error('Could not load the FMC firmware catalog.');
      const data = await response.json();
      for (const record of data.items) {
        firmwareRecords.set(record.id, record);
        if (![...$('fmc-firmware-selection').options].some(option => option.value === record.id)) $('fmc-firmware-selection').add(new Option(`${record.name} · ${record.version}`, record.id));
      }
      if (page >= data.totalPages) break;
    }
  } catch (error) { status(error.message, true); }
});
$('fmc-firmware-use').onclick = async () => {
  const record = firmwareRecords.get($('fmc-firmware-selection').value);
  if (!record) return;
  try {
    await selectCatalogFirmware(record);
    if (bootInProgress) await restartSelection();
  } catch (error) { status(error.message, true); }
};
const builtInPresets = new Map();
if (document.body.hasAttribute('data-demo-ready')) {
  builtInPresets.set('display-demo', 'display-demo.bin');
  bootPreset.querySelector('[value="display-demo"]').hidden = false;
}
if (document.body.hasAttribute('data-bad-apple-ready')) {
  builtInPresets.set('bad-apple', 'bad-apple-app.bin');
}
const needsBaseFiles = hosted && !bundledStock;
let bootInProgress = false;
let bootBusy = false;
const bootDraftKey = `${faceModel}-boot-draft`;
let stockPowerReady = false;
let bootedCatalogFace;
let nextFace;
const nextFaceKey = `${faceModel}-next-face`;
if (crossOriginIsolated) {
  try {
    nextFace = JSON.parse(sessionStorage.getItem(nextFaceKey));
    sessionStorage.removeItem(nextFaceKey);
  } catch {}
}
const faceCatalog = setupFaceCatalog($('face-catalog'), nextFace, face => {
  updateLink({watchface: face?.id});
  if (bootInProgress) {
    if (bootPreset.value === 'apps') {
      restartSelection();
      return;
    }
    if (needsBaseFiles) {
      restartSelection();
      return;
    }
    restartFor('stock', face);
    return;
  }
  const faceFile = $('face-file');
  if (face && faceFile.files.length) {
    faceFile.value = '';
    faceFile.dispatchEvent(new Event('change'));
  }
  $('start').click();
}, faceModel, face => updateLink({watchface: face?.id}));
const requiredFixtures = ['nor.bin', 'nand-defaults.bin', 'nand-id.bin', 'compat.bin', 'app.bin'];
let runtime, timer, pointer=null, crownDown=false, frames=0, lastFrame=null;
let lastFrameFile;
const economyDisplay = matchMedia('(pointer: coarse)').matches || navigator.deviceMemory <= 4;
let nextFrame = 0;
let speaker, speakerOutput, audioCursor, audioEpoch, audioTime = 0;
let audioFile, audioData, audioChanged = 0;
let lastAudioPacket;
let customApp = false;
let runtimeLog='', halted=false, nextLog=0;
const storage = setupStorage(faceModel, {getRuntime: () => runtime, input, report: (text, error) => status(text, error, 'notice'), isStopped: () => halted || !frames || (!customApp && !stockPowerReady)});
for (const link of document.querySelectorAll('#model-list a')) link.addEventListener('click', async event => {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  try { await storage.checkpoint(); location.assign(link.href); }
  catch (error) { status(error.message, true); }
});
const debug=new URLSearchParams(location.search).has('debug');
const encoder = new TextEncoder();
const fatalGuestOutput = /ZEPHYR FATAL ERROR|\bHARD FAULT\b|Kernel panic|Lockup: can't escalate/i;
function status(text,error=false,state) {
  const message = $('status');
  message.textContent = text;
  message.toggleAttribute('data-error', error);
  $('notification').hidden = !error && state !== 'loading' && state !== 'timeout' && state !== 'notice';
  $('recover').hidden = !error && state !== 'timeout';
}
function guestStopped(message) {
  if (halted) return;
  halted = true;
  stopVibration();
  if (speakerOutput) speakerOutput.gain.value = 0;
  status(message, true);
  for (const button of document.querySelectorAll('#crown, #up, #down')) {
    button.disabled = true;
  }
}

async function restartFor(preset, face) {
  try { await storage.checkpoint(); } catch (error) { status(error.message, true); return; }
  const url = new URL(location.href);
  for (const key of ['firmware', 'loader', 'app', 'watchface', 'idle']) url.searchParams.delete(key);
  sessionStorage.removeItem(nextFaceKey);
  if (face) {
    try {
      sessionStorage.setItem(nextFaceKey, JSON.stringify(face));
    } catch {
      $('image-error').textContent = 'Stop the emulator and choose the face again.';
      return;
    }
  }
  url.searchParams.set('preset', preset);
  if (face?.id) url.searchParams.set('watchface', face.id);
  if (preset !== 'stock' && !builtInPresets.has(preset)) url.searchParams.set('idle', '1');
  location.replace(url.href);
}

async function restartSelection() {
  if (bootBusy) return;
  bootBusy = true;
  const unlock = lockBootControls($('boot-images'));
  try {
    await storage.checkpoint();
    const token = crypto.randomUUID();
    const value = {
      preset: bootPreset.value,
      files: captureBootFiles($('boot-images')),
      apps: bootPreset.value === 'apps' ? appPicker.snapshot() : undefined,
      face: faceCatalog.selected(),
      firmware: {value: $('fmc-firmware-selection').value,
        label: $('fmc-firmware-selection').selectedOptions[0]?.textContent},
    };
    await saveBootDraft(faceModel, token, value);
    sessionStorage.setItem(bootDraftKey, token);
    status('Restarting with the selected files…', false, 'loading');
    location.reload();
  } catch (error) {
    status(`Could not apply the selection: ${error.message}`, true);
    bootBusy = false;
    unlock();
  }
}

async function bootStock() {
  try { await storage.reset(); } catch (error) { status(error.message, true); return; }
  restartFor('stock');
}

$('recover').onclick = bootStock;
$('hard-reset').onclick = bootStock;

function log(text) {
  runtimeLog=(runtimeLog+'\n'+text).slice(-8000);
  $('log').textContent=runtimeLog;
  if (!halted && fatalGuestOutput.test(text)) {
    guestStopped('Guest firmware crashed. Save the watch log or boot stock.');
  } else if (!halted && /stopped on unimplemented|^Aborted\(|Invalid WFC|Cannot read WFC/.test(text)) {
    guestStopped('Emulator stopped. See the watch log.');
  }
}
function input(line) {
  if (!runtime||halted) return;
  const bytes=encoder.encode(line+'\n');
  const stream=runtime.FS.open('/watch/input.txt','a');
  try {runtime.FS.write(stream,bytes,0,bytes.length);} finally {runtime.FS.close(stream);}
}
function crown(down) {
  if(crownDown===down)return;
  crownDown=down; input(`c ${down?1:0}`);
}
function point(event) {
  const rect=panel.getBoundingClientRect();
  let x=(event.clientX-rect.left)*466/rect.width,y=(event.clientY-rect.top)*466/rect.height;
  const dx=x-233,dy=y-233,r=Math.hypot(dx,dy);
  if(r>232){x=233+dx*232/r;y=233+dy*232/r;}
  return [Math.round(x),Math.round(y)];
}
function release() {
  if(pointer){input(`t 0 ${pointer.x} ${pointer.y}`);pointer=null;}
  crown(false);
}
panel.addEventListener('pointerdown',event=>{
  panel.classList.add('pointer-focus');
  if(!runtime||pointer)return;
  const [x,y]=point(event);pointer={id:event.pointerId,x,y};
  panel.setPointerCapture(event.pointerId);panel.focus({preventScroll:true});input(`t 1 ${x} ${y}`);
});
for(const name of ['blur','keydown']) panel.addEventListener(name,()=>panel.classList.remove('pointer-focus'));
panel.addEventListener('pointermove',event=>{
  if(!pointer||pointer.id!==event.pointerId)return;
  const [x,y]=point(event);
  if(x!==pointer.x||y!==pointer.y){Object.assign(pointer,{x,y});input(`t 1 ${x} ${y}`);}
});
for(const name of ['pointerup','pointercancel','lostpointercapture']) panel.addEventListener(name,release);
$('crown').addEventListener('pointerdown',event=>{event.preventDefault();$('crown').setPointerCapture(event.pointerId);crown(true);});
for(const name of ['pointerup','pointercancel','lostpointercapture']) $('crown').addEventListener(name,()=>crown(false));
$('crown').addEventListener('click', event => {
  if (event.detail !== 0) return;
  crown(true);
  crown(false);
});
const rotateCrown = steps => input(`r ${Math.max(-320, Math.min(320, steps * 40))}`);
$('up').onclick=()=>rotateCrown(-2);$('down').onclick=()=>rotateCrown(2);
panel.addEventListener('wheel',event=>{if(runtime&&event.deltaY){event.preventDefault();rotateCrown(event.deltaY>0?2:-2);}},{passive:false});
window.addEventListener('keydown',event=>{
  if(!runtime||halted||event.ctrlKey||event.altKey||event.metaKey||!['Space','ArrowUp','ArrowDown'].includes(event.code))return;
  if(event.target.closest('button,input,select,summary,a'))return;
  event.preventDefault();
  if(event.code==='Space')crown(true);
  else rotateCrown(event.code==='ArrowUp'?-2:2);
});
window.addEventListener('keyup',event=>{if(event.code==='Space' && crownDown){event.preventDefault();crown(false);}});
window.addEventListener('blur',release);
document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
function renderFrame() {
  try {
    const {ino, mtime} = runtime.FS.stat('/watch/frame.ppm');
    const version = `${ino}:${mtime.getTime()}`;
    if (version === lastFrameFile) return;
    const data=runtime.FS.readFile('/watch/frame.ppm');
    const header='P6\n466 466\n255\n';
    if(data.length!==header.length+466*466*3)return;
    for(let i=0;i<header.length;i++)if(data[i]!==header.charCodeAt(i))throw Error('Unexpected panel format');
    lastFrameFile = version;
    const words = new Uint32Array(data.buffer, data.byteOffset, data.length >>> 2);
    if (lastFrame && words.every((word,i)=>word===lastFrame.words[i]) &&
        data.subarray(words.byteLength).every((byte,i)=>byte===lastFrame.tail[i])) return;
    lastFrame = {words, tail: data.subarray(words.byteLength)};
    for(let i=0,j=header.length;i<pixels.data.length;i+=4,j+=3){
      pixels.data[i]=data[j];pixels.data[i+1]=data[j+1];pixels.data[i+2]=data[j+2];pixels.data[i+3]=255;
    }
    context.putImageData(pixels,0,0);frames++;
    if(frames===1 && !halted) {
      if (customApp) storage.ready();
      faceCatalog.markApplied(bootedCatalogFace);
      status('Firmware is rendering locally.',false,'running');
    }
    $('offline').hidden=true;
    $('capture').disabled = false;
  } catch(error) {
    if (error.name !== 'ErrnoError') {
      log(error.message);
      guestStopped('The browser could not read the emulated display.');
      cancelAnimationFrame(timer);
    }
  }
}
const sound = $('watch-sound');

function prepareSpeaker() {
  if (!sound.checked || halted) return;
  try {
    if (!speaker) {
      speaker = new AudioContext({latencyHint:'interactive'});
      speakerOutput = speaker.createGain();
      speakerOutput.connect(speaker.destination);
    }
    speakerOutput.gain.value = 1;
  } catch {
    sound.checked = false;
  }
}
function unlockSpeaker() {
  prepareSpeaker();
  if (sound.checked && !halted && speaker?.state === 'suspended') speaker.resume().catch(() => {});
}
sound.onchange = () => {

  if (sound.checked) {
    unlockSpeaker();
  } else if (speakerOutput) {
    speakerOutput.gain.value = 0;
  }
};
window.addEventListener('pointerup', unlockSpeaker, {capture: true, passive: true});
window.addEventListener('keydown', unlockSpeaker, {capture: true, passive: true});
prepareSpeaker();
function renderAudio() {
  if (!runtime || halted || speaker?.state !== 'running') return;
  try {
    const path = '/watch/speaker.pcm';
    const {ino, mtime} = runtime.FS.stat(path);
    const version = `${ino}:${mtime.getTime()}`;
    if (version !== audioFile) {
      audioData = runtime.FS.readFile(path);
      audioFile = version;
      audioChanged = performance.now();
    }
    const data = audioData;
    if (data.length < 12 || data.length % 2) return;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const rate = view.getUint32(0, true);
    const end = view.getUint32(4, true);
    const epoch = view.getUint32(8, true);
    const first = end - (data.length - 12) / 2;
    const now = speaker.currentTime;
    const delay = economyDisplay ? .25 : .12;
    if (!rate || first < 0) return;
    if (epoch !== audioEpoch) {
      if (lastAudioPacket && audioCursor < lastAudioPacket.end) {
        const tail = lastAudioPacket;
        const start = Math.max(audioCursor, tail.first);
        audioTime = scheduleAudio(tail, start, tail.end - start, Math.max(audioTime, now + .025));
      }
      audioEpoch = epoch;
      audioCursor = undefined;
    }
    if (end <= first) return;
    lastAudioPacket = {view, rate, first, end};
    const stockSound = !customApp && rate === 16000;
    const slice = speakerSlice({first, end, cursor: audioCursor, rate, now,
      scheduledUntil: audioTime, delay: stockSound ? .72 : delay,
      flush: performance.now() - audioChanged >= (stockSound ? 750 : 140)});
    if (!slice) return;
    const {start, length, when} = slice;
    audioTime = scheduleAudio(lastAudioPacket, start, length, when);
    audioCursor = start + length;
  } catch (error) {
    if (error.name !== 'ErrnoError') {
      sound.checked = false;
      speakerOutput.gain.value = 0;
    }
  }
}

function scheduleAudio({view, rate, first}, start, length, when) {
  const buffer = speaker.createBuffer(1, length, rate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    channel[i] = view.getInt16(12 + (start - first + i) * 2, true) / 32768;
  }
  const source = speaker.createBufferSource();
  source.buffer = buffer;
  source.connect(speakerOutput);
  source.start(when);
  return when + length / rate;
}
setInterval(renderAudio, 20);
function readLog(path,limit,start) {
  const length=runtime.FS.stat(path).size;
  const offset = start ?? Math.max(0,length-limit);
  const stream=runtime.FS.open(path,'r');
  try {
    const bytes=new Uint8Array(Math.min(length-offset,limit));
    const count = runtime.FS.read(stream,bytes,0,bytes.length,offset);
    return new TextDecoder().decode(bytes.subarray(0,count));
  } finally {runtime.FS.close(stream);}
}
const motorPath = '/watch/motor.log';
const vibration = $('watch-vibration');
const canVibrate = typeof navigator.vibrate === 'function';
$('vibration-control').hidden = !canVibrate;
let motorOffset = 0, motorRemainder = '', nextMotorPoll = 0;
const motorPatternGapMs = 100, maxVibrationMs = 10000;
const motorPulses = [];
let motorStart, vibratingUntil = 0, skipMotorPlayback = false;
let lastMotorEnd;

function stopVibration() {
  if (vibratingUntil > performance.now()) navigator.vibrate(0);
  motorPulses.length = 0;
  motorStart = undefined;
  lastMotorEnd = undefined;
  vibratingUntil = 0;
}

vibration.addEventListener('change', () => {
  if (!vibration.checked) stopVibration();
  else skipMotorPlayback = true;
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopVibration();
  else skipMotorPlayback = true;
});
window.addEventListener('pagehide', stopVibration);

function playMotor(now) {
  const first = motorPulses[0];
  if (!first) return;
  const gapFromLast = lastMotorEnd === undefined ? 0 : Math.max(0, first.start - lastMotorEnd);
  const earliest = vibratingUntil + gapFromLast;
  if (now < earliest) return;
  motorPulses.shift();
  const pattern = [Math.min(first.end - first.start, maxVibrationMs)];
  let end = first.end;
  while (pattern.length < 9 && motorPulses.length) {
    const next = motorPulses[0];
    const gap = next.start - end;
    if (gap < 0 || gap > motorPatternGapMs) break;
    motorPulses.shift();
    if (gap === 0) {
      pattern[pattern.length - 1] = Math.min(pattern.at(-1) + next.end - next.start, maxVibrationMs);
    } else {
      pattern.push(gap, Math.min(next.end - next.start, maxVibrationMs));
    }
    end = next.end;
  }
  navigator.vibrate(pattern);
  vibratingUntil = now + pattern.reduce((total, duration) => total + duration, 0);
  lastMotorEnd = end;
}

function pollMotor(now) {
  if (halted || now < nextMotorPoll) return;
  nextMotorPoll = now + 25;
  try {
    const size = runtime.FS.stat(motorPath).size;
    if (size < motorOffset) {
      stopVibration();
      motorOffset = 0;
      motorRemainder = '';
    }
    if (size !== motorOffset) {
      const start = Math.max(motorOffset, size - 4096);
      if (start > motorOffset) stopVibration();
      const chunk = readLog(motorPath, 4096, start);
      const lines = (start > motorOffset ? chunk.slice(chunk.indexOf('\n') + 1) : motorRemainder + chunk).split('\n');
      motorOffset = start + chunk.length;
      motorRemainder = lines.pop();
      const events = lines.map(line => /^(\d+) (\d+) (\d+)\s*$/.exec(line)?.slice(1).map(Number)).filter(Boolean);
      if (events.length) {
        const [, duty, hz] = events.at(-1);
        $('motor-status').textContent = !duty ? 'Off' : hz ? `${duty / 10}% · ${hz} Hz` : 'On';
        const log = $('motor-log');
        log.textContent = 'Virtual ms | Duty ‰ | Hz\n' + readLog(motorPath, 8192).trimEnd();
        if (canVibrate && vibration.checked && !skipMotorPlayback && !document.hidden && navigator.userActivation?.hasBeenActive !== false) {
          for (const [ms, level] of events) {
            if (level) {
              motorStart ??= ms;
            } else if (motorStart !== undefined) {
              if (ms > motorStart) motorPulses.push({start: motorStart, end: ms});
              motorStart = undefined;
            }
          }
        }
      }
    } else if (!size) {
      $('motor-status').textContent = 'Off';
    }
  } catch {}
  skipMotorPlayback = false;
  if (canVibrate && vibration.checked && !document.hidden) playMotor(now);
}
function render() {
  timer = requestAnimationFrame(render);
  const now = performance.now();
  pollMotor(now);
  if (now >= nextFrame) {
    nextFrame = now + (economyDisplay ? 30 : 0);
    renderFrame();
  }
  if(now<nextLog)return;
  nextLog=now+500;
  try {
    const uart=readLog('/watch/uart.log',32000).split('\n').filter(line=>!line.includes('#CD:')).join('\n');
    if (!stockPowerReady && (watch3 ? /view 16 painted/ : /view \d+ painted/).test(uart)) {
      stockPowerReady = true;
      storage.ready();
      sendPower();
    }
    let diagnostic='';
    if(debug)try{diagnostic=readLog('/watch/qemu.log',12000);}catch{}
    const logPanel = $('log');
    const output = runtimeLog + '\n' + diagnostic + '\n' + uart;
    if (logPanel.textContent !== output) {
      const follow = logPanel.scrollHeight - logPanel.scrollTop - logPanel.clientHeight <= 4;
      logPanel.textContent = output;
      if (follow) logPanel.scrollTop = logPanel.scrollHeight;
    }
    if (!halted && fatalGuestOutput.test(uart)) {
      guestStopped('Guest firmware crashed. Save the watch log or boot stock.');
    }
  } catch {}
}
const frameColor = $('frame-color');
const frameCase = $('case');
let frameUrl;
let frameImage;
function loadFrame() {
  const color = frameColor.value;
  frameCase.dataset.color = color;
  if (frameUrl) URL.revokeObjectURL(frameUrl);
  frameImage = undefined;
  const file = frameOverrides.get(color);
  const label = frameFile.parentElement.querySelector('.file-name');
  label.textContent = file?.name || 'Select file';
  label.title = file?.name || '';
  frameFile.closest('.file-row').querySelector('.clear-file').hidden = !file;
  frameUrl = file ? URL.createObjectURL(file) : undefined;
  if (hosted && !bundledStock && !frameUrl) {
    delete frameCase.dataset.frame;
    return;
  }
  const source = frameUrl;
  const image = new Image();
  image.onload = () => {
    if (frameColor.value !== color || frameUrl !== source) return;
    frameImage = image;
    frameCase.dataset.frame = color;
    frameCase.style.setProperty('--frame-image', `url("${image.src}")`);
  };
  image.onerror = () => {
    if (frameColor.value === color && frameUrl === source) delete frameCase.dataset.frame;
  };
  const format = frameColor.selectedOptions[0].dataset.format || 'png';
  image.src = source || new URL(`./frames/${color}.${format}`, import.meta.url).href;
}
frameColor.addEventListener('change', () => {
  frameFile.value = '';
  loadFrame();
});
function updateBootOptions() {
  const preset = bootPreset.value;
  const stock = preset === 'stock';
  const uploads = preset === 'custom' || (preset === 'bad-apple' && !builtInPresets.has(preset));
  $('firmware-package').hidden = !uploads;
  $('raw-applications').hidden = !uploads;
  $('advanced-boot-files').hidden = !uploads && !needsBaseFiles;
  $('face-catalog').hidden = !stock && preset !== 'apps';
  $('watch-face-upload').hidden = !stock;
  $('display-demo-guide').hidden = preset !== 'display-demo';
  $('bad-apple-guide').hidden = preset !== 'bad-apple' || !uploads;
}
{
  $('advanced-boot-files').open = needsBaseFiles;
  $('hosted-frames').hidden = false;
  $('boot-presets').hidden = false;
  if (watch3) {
    $('gyro-controls').hidden = false;
    $('firmware-label').textContent = 'Firmware 1.0.1.77';
  }
  if (needsBaseFiles) $('stock-file-hint').firstElementChild.textContent =
    'Select app.bin, compat.bin, nor.bin, nand-defaults.bin and nand-id.bin. The texture index is optional.';
  if (hosted) document.querySelector('.wordmark').href = '../';
  bootPreset.onchange = () => {
    if (bootPreset.value !== 'apps') updateLink({preset: bootPreset.value, firmware: null, loader: null, app: null});
    updateBootOptions();
    $('image-error').textContent = '';
    if (bootInProgress) status('Selection changed. Choose Apply and restart to use it.', false, 'notice');
  };
  loadFrame();
}
$('show-frame').onchange=event=>$('case').classList.toggle('frameless',!event.target.checked);
const device = document.querySelector('.device-card');
function updateFullscreen() {
  const expanded = document.fullscreenElement === device || device.classList.contains('expanded');
  const label = expanded ? 'Exit fullscreen' : 'Expand watch view';
  $('fullscreen').setAttribute('aria-label', label);
  $('fullscreen').title = label;
}

$('fullscreen').onclick = async () => {
  if (device.classList.contains('expanded')) {
    device.classList.remove('expanded');
  } else if (document.fullscreenElement === device) {
    await document.exitFullscreen();
  } else {
    try {
      await device.requestFullscreen();
    } catch {
      device.classList.add('expanded');
    }
  }
  updateFullscreen();
};
document.addEventListener('fullscreenchange', updateFullscreen);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && device.classList.contains('expanded')) {
    device.classList.remove('expanded');
    updateFullscreen();
  }
});
function exportLog(motorOnly) {
  const read = path => {
    try {
      return runtime?.FS.readFile(path, {encoding: 'utf8'}) || '';
    } catch {
      return '';
    }
  };
  const motor = read(motorPath);
  const motorLog = motor && `Motor log (virtual ms, duty per mille, Hz)\n${motor}`;
  if (motorOnly) return motorLog || $('motor-log').textContent;
  return [runtimeLog, debug ? read('/watch/qemu.log') : '', read('/watch/uart.log'), motorLog]
    .filter(Boolean).join('\n') || $('log').textContent;
}

for (const [copyId, saveId, kind] of [
  ['copy-log', 'save-log', 'browser'],
  ['copy-motor-log', 'save-motor-log', 'motor'],
]) {
  const copy = $(copyId);
  const feedback = copy.parentElement.querySelector('.log-feedback');
  let feedbackTimer;
  copy.onclick = async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(exportLog(kind === 'motor'));
      copied = true;
    } catch {}
    clearTimeout(feedbackTimer);
    copy.textContent = copied ? 'Copied' : 'Copy failed';
    feedback.textContent = copied ? 'Log copied to the clipboard.' : 'Could not copy the log.';
    feedbackTimer = setTimeout(() => {
      copy.textContent = 'Copy log';
      feedback.textContent = '';
    }, 1800);
  };
  $(saveId).onclick = () => {
    const contents = exportLog(kind === 'motor');
    const url = URL.createObjectURL(new Blob([contents], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `wp${watch3 ? 3 : 2}-${kind}.log`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}
const roller = document.querySelector('.knurls');
let rollY;
roller.addEventListener('pointerdown', event => {
  if (!runtime || halted) return;
  rollY = event.clientY;
  roller.setPointerCapture(event.pointerId);
});
roller.addEventListener('pointermove', event => {
  if (rollY === undefined || !roller.hasPointerCapture(event.pointerId)) return;
  const steps = Math.trunc((event.clientY - rollY) / 12);
  if (!steps) return;
  rotateCrown(steps);
  rollY += steps * 12;
});
roller.addEventListener('lostpointercapture', () => { rollY = undefined; });
roller.addEventListener('wheel', event => {
  if (!runtime || !event.deltaY) return;
  event.preventDefault();
  rotateCrown(event.deltaY > 0 ? 2 : -2);
}, { passive: false });
for (const picker of document.querySelectorAll('.file-row .file-control input')) {
  const label = picker.parentElement.querySelector('.file-name');
  const clear = picker.closest('.file-row').querySelector('.clear-file');
  picker.addEventListener('change', () => {
    if (picker.id === 'firmware-file') updateLink({firmware: null});
    if (picker.id === 'face-file') updateLink({watchface: null});
    const file = picker.files[0];
    if (picker === frameFile) {
      if (file) frameOverrides.set(frameColor.value, file);
      else frameOverrides.delete(frameColor.value);
      loadFrame();
      return;
    }
    const names = [...picker.files].map(item => item.name);
    label.textContent = names.length > 1 ? `${names.length} files selected` :
      names[0] || label.dataset.empty || (picker.multiple ? 'Select files' : 'Select file');
    label.title = names.join(', ');
    clear.hidden = !file;
    $('image-error').textContent = '';
  });
  clear.onclick = () => {
    if (picker.disabled) return;
    picker.value = '';
    picker.dispatchEvent(new Event('change'));
    picker.focus();
  };
}

let powerChanged = preferences().remember !== false && Boolean(preferences()[faceModel]);
let powerTimer;
function sendPower() {
  if (!customApp && !stockPowerReady) return;
  const percent = Number($('battery').value);
  const voltage = percent <= 69
    ? 3300 + 700 * percent / 69
    : 4000 + 350 * (percent - 69) / 31;
  const charger = Number($('charger').checked);
  input(customApp ? `p ${Math.round(voltage)} ${charger}` : `p 4000 ${charger} ${percent}`);
}
function updateBattery() {
  const percent = syncSliderFill($('battery'));
  $('battery-level').value = percent;
  $('battery').setAttribute('aria-valuetext', $('battery-level').value);
}
$('battery').oninput = () => {
  powerChanged = true;
  updateBattery();
  if (!powerTimer) {
    powerTimer = setTimeout(() => {
      powerTimer = undefined;
      sendPower();
    }, 50);
  }
};
$('charger').onchange = () => {
  powerChanged = true;
  sendPower();
};
updateBattery();

function syncSliderFill(slider) {
  const min = Number(slider.min);
  const percent = (slider.valueAsNumber - min) * 100 / (Number(slider.max) - min) + '%';
  slider.style.setProperty('--level', percent);
  return percent;
}

function updateBrightness() {
  const brightness = $('brightness');
  $('brightness-level').value = syncSliderFill(brightness);
  input(`b ${brightness.value}`);
}
$('brightness').oninput = updateBrightness;
updateBrightness();

const rawOptical = $('raw-optical');
const opticalWorn = $('optical-worn');
$('raw-optical-controls').hidden = !watch3;

function sendHealth() {
  const raw = watch3 && rawOptical.checked;
  opticalWorn.disabled = customApp || !raw;
  for (const id of ['health-enabled', 'heart-rate', 'blood-oxygen']) {
    $(id).disabled = customApp || raw;
  }
  if (customApp) return;
  if (watch3) input(`o ${raw ? (opticalWorn.checked ? 2 : 1) : 0}`);
  if (raw) return;
  if (!$('health-enabled').checked) {
    input('h 0 72 98');
    return;
  }
  const rate = $('heart-rate');
  const oxygen = $('blood-oxygen');
  if (rate.validity.valid && oxygen.validity.valid) {
    input(`h 1 ${rate.value} ${oxygen.value}`);
  }
}

function sendGps() {
  if (!$('gps-enabled').checked) {
    input('g 0 0 0');
    return;
  }
  const latitude = $('gps-lat');
  const longitude = $('gps-lon');
  if (latitude.validity.valid && longitude.validity.valid) {
    input(`g 1 ${Math.round(latitude.value * 1e6)} ${Math.round(longitude.value * 1e6)}`);
  }
}

for (const id of ['raw-optical', 'optical-worn', 'health-enabled', 'heart-rate', 'blood-oxygen']) {
  $(id).onchange = sendHealth;
}
for (const id of ['gps-enabled', 'gps-lat', 'gps-lon']) $(id).onchange = sendGps;

const ambientLight = $('ambient-lux');
const ambientLightSlider = $('ambient-lux-slider');
if (watch3) ambientLight.max = ambientLightSlider.max = '19267';

function updateAmbientLight() {
  ambientLight.value = ambientLightSlider.value;
  ambientLightSlider.setAttribute('aria-valuetext', `${ambientLightSlider.value} lux`);
  syncSliderFill(ambientLightSlider);
  if (!customApp) input(`l ${ambientLightSlider.value}`);
}

ambientLightSlider.addEventListener('input', updateAmbientLight);
ambientLight.addEventListener('change', () => {
  if (!ambientLight.reportValidity()) return;
  ambientLightSlider.value = ambientLight.valueAsNumber;
  updateAmbientLight();
});
updateAmbientLight();

function buildCylinder(element, radius, depth, facets, ridged) {
  const width = 2 * radius * Math.tan(Math.PI / facets) + 0.35;
  for (let index = 0; index < facets; index++) {
    const side = document.createElement('div');
    const angle = index * 360 / facets;
    const light = 17 + 21 * Math.max(0, Math.cos((angle - 325) * Math.PI / 180))
      + (ridged && index % 2 === 0 ? 11 : 0);
    side.className = 'cylinder-side';
    side.style.width = `${width}px`;
    side.style.height = `${depth}px`;
    side.style.background = `linear-gradient(hsl(0 0% ${light + 9}%), hsl(0 0% ${light}%) 25% 75%, hsl(0 0% ${light - 5}%))`;
    side.style.transform = `translate(-50%, -50%) rotateZ(${angle}deg) translateY(-${radius}px) rotateX(90deg)`;
    element.append(side);
  }
}

buildCylinder($('orientation-model'), 27, 9, 36, false);
buildCylinder(document.querySelector('.crown-cylinder'), 4, 6, 20, true);

const orientationPad = $('orientation-pad');
let pitch = 0;
let roll = 0;
let gravity = [0, 0, 1000];
let drag;
let motionTimer;

const axes = [...$('orientation-axes').querySelectorAll('input')];
const gyroAxes = [...$('gyro-controls').querySelectorAll('input[type=number]')];
const gyroFollow = $('gyro-follow');
let gyroStopTimer;
let gyroLastTime;
function stopModelGyroscope() {
  clearTimeout(gyroStopTimer);
  gyroLastTime = undefined;
  if (!watch3 || !gyroFollow.checked) return;
  for (const axis of gyroAxes) axis.value = 0;
  sendGyroscope();
}
function followModelGyroscope(nextPitch, nextRoll) {
  if (!watch3 || !gyroFollow.checked) return;
  const now = performance.now();
  const seconds = Math.max(0.016, (now - (gyroLastTime ?? now - 50)) / 1000);
  const radians = pitch * Math.PI / 180;
  const delta = (next, previous) => ((next - previous + 180) % 360 + 360) % 360 - 180;
  const pitchRate = delta(nextPitch, pitch) / seconds;
  const rollRate = delta(nextRoll, roll) / seconds;
  const rates = [pitchRate, rollRate * Math.cos(radians), -rollRate * Math.sin(radians)];
  gyroAxes.forEach((axis, i) => { axis.value = Math.round(Math.max(-2000, Math.min(2000, rates[i]))); });
  gyroLastTime = now;
  sendGyroscope();
  clearTimeout(gyroStopTimer);
  gyroStopTimer = setTimeout(stopModelGyroscope, 120);
}
gyroFollow.onchange = () => {
  clearTimeout(gyroStopTimer);
  gyroLastTime = undefined;
  for (const axis of gyroAxes) axis.readOnly = gyroFollow.checked;
  if (gyroFollow.checked) stopModelGyroscope();
};
gyroFollow.onchange();

function sendGyroscope() {
  if (!watch3 || gyroAxes.some(axis => !axis.validity.valid)) return;
  input(`w ${gyroAxes.map(axis => axis.valueAsNumber * 1000).join(' ')}`);
}

for (const axis of gyroAxes) axis.addEventListener('change', sendGyroscope);

function showOrientation() {
  $('orientation-model').style.transform = `rotateY(${roll}deg) rotateX(${pitch}deg)`;
  $('orientation-reading').textContent = `X ${gravity[0]} · Y ${gravity[1]} · Z ${gravity[2]} mg`;
  if (!motionTimer) {
    motionTimer = setTimeout(() => {
      motionTimer = undefined;
      input(`a ${gravity.join(' ')}`);
    }, 50);
  }
}

function setOrientation(nextPitch, nextRoll, moving = false) {
  if (moving) followModelGyroscope(nextPitch, nextRoll);
  pitch = nextPitch % 360;
  roll = nextRoll % 360;
  const x = pitch * Math.PI / 180;
  const y = roll * Math.PI / 180;
  gravity = [-Math.sin(y), Math.cos(y) * Math.sin(x), Math.cos(y) * Math.cos(x)]
    .map(value => Math.round(value * 1000) || 0);
  axes.forEach((axis, index) => { axis.value = gravity[index]; });
  showOrientation();
}

$('orientation-reading').onclick = () => {
  const editor = $('orientation-axes');
  editor.hidden = !editor.hidden;
  $('orientation-reading').setAttribute('aria-expanded', String(!editor.hidden));
  if (!editor.hidden) axes[0].focus();
};

for (const axis of axes) {
  axis.addEventListener('input', () => {
    if (axes.some(field => !field.value || !field.validity.valid)) return;
    gravity = axes.map(field => Number(field.value));
    const [x, y, z] = gravity;
    const magnitude = Math.hypot(x, y, z);
    if (magnitude) {
      roll = Math.asin(-x / magnitude) * 180 / Math.PI;
      pitch = Math.atan2(y, z) * 180 / Math.PI;
    }
    showOrientation();
  });
  axis.addEventListener('blur', () => {
    if (!axis.value || !axis.validity.valid) axis.value = gravity[axes.indexOf(axis)];
  });
}

axes[0].dispatchEvent(new Event('input'));

orientationPad.addEventListener('pointerdown', event => {
  if (event.button !== 0 || drag) return;
  orientationPad.focus();
  orientationPad.setPointerCapture(event.pointerId);
  drag = {id: event.pointerId, x: event.clientX, y: event.clientY, pitch, roll};
});
orientationPad.addEventListener('pointermove', event => {
  if (drag?.id !== event.pointerId) return;
  setOrientation(drag.pitch - (event.clientY - drag.y) * 2,
    drag.roll + (event.clientX - drag.x) * 2, true);
});
orientationPad.addEventListener('lostpointercapture', () => { drag = undefined; stopModelGyroscope(); });
orientationPad.addEventListener('keydown', event => {
  switch (event.key) {
    case 'ArrowUp': setOrientation(pitch + 5, roll, true); break;
    case 'ArrowDown': setOrientation(pitch - 5, roll, true); break;
    case 'ArrowLeft': setOrientation(pitch, roll - 5, true); break;
    case 'ArrowRight': setOrientation(pitch, roll + 5, true); break;
    case 'Home': setOrientation(0, 0); break;
    default: return;
  }
  event.preventDefault();
  event.stopPropagation();
});
$('reset-orientation').onclick = () => { stopModelGyroscope(); setOrientation(0, 0); };
$('reset-simulation').onclick = () => {
  $('brightness').value = 100;
  updateBrightness();
  $('battery').value = 69;
  $('charger').checked = false;
  $('health-enabled').checked = false;
  rawOptical.checked = opticalWorn.checked = false;
  $('heart-rate').value = 72;
  $('blood-oxygen').value = 98;
  $('gps-enabled').checked = false;
  $('gps-lat').value = $('gps-lon').value = 0;
  ambientLightSlider.value = 0;
  sendHealth();
  sendGps();
  updateAmbientLight();
  powerChanged = true;
  updateBattery();
  sendPower();
  setOrientation(0, 0);
  for (const axis of gyroAxes) axis.value = 0;
  sendGyroscope();
};

$('capture').onclick = () => {
  if (!frames) return;
  const includeFrame = $('capture-frame').checked;
  const snapshot = document.createElement('canvas');
  const artwork = includeFrame && frameImage;
  const size = includeFrame ? 1024 : panel.width;
  snapshot.width = snapshot.height = size;
  const draw = snapshot.getContext('2d');
  const style = getComputedStyle(frameCase);
  const centerY = artwork ? size * parseFloat(style.getPropertyValue('--bezel-center')) / 100 : size / 2;
  let diameter = size;
  if (artwork) {
    const scale = size / Math.max(artwork.naturalWidth, artwork.naturalHeight);
    const width = artwork.naturalWidth * scale, height = artwork.naturalHeight * scale;
    draw.drawImage(artwork, (size - width) / 2, (size - height) / 2, width, height);
    diameter = size * parseFloat(style.getPropertyValue('--bezel-width')) / 100;
  } else if (includeFrame) {
    const metal = draw.createLinearGradient(0, 0, size, size);
    metal.addColorStop(0, '#666');
    metal.addColorStop(.55, '#232323');
    metal.addColorStop(1, '#555');
    draw.fillStyle = metal;
    draw.beginPath();
    draw.arc(size / 2, centerY, size / 2, 0, 2 * Math.PI);
    draw.fill();
    diameter *= .96;
  }
  if (includeFrame) {
    draw.fillStyle = '#000';
    draw.beginPath();
    draw.arc(size / 2, centerY, diameter / 2, 0, 2 * Math.PI);
    draw.fill();
    diameter *= parseFloat(style.getPropertyValue('--screen-width')) / 100;
  }
  draw.beginPath();
  draw.arc(size / 2, centerY, diameter / 2, 0, 2 * Math.PI);
  draw.clip();
  draw.imageSmoothingEnabled = false;
  draw.drawImage(panel, (size - diameter) / 2, centerY - diameter / 2, diameter, diameter);
  snapshot.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${modelSlug}${includeFrame ? '-framed' : ''}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
};

function validateHostedFirmware(bytes) {
  const worker = new Worker(new URL('./firmware-worker.js', import.meta.url));
  let timeout;
  return new Promise((resolve, reject) => {
    timeout = setTimeout(() => reject(Error('The firmware validator timed out.')), 60000);
    worker.onmessage = ({data}) => data.error ? reject(Error(data.error)) : resolve(data);
    worker.onerror = () => reject(Error('The browser firmware validator could not start.'));
    worker.postMessage({firmware: bytes, model: watch3 ? 'wp3' : 'wp2'}, [bytes]);
  }).finally(() => {
    clearTimeout(timeout);
    worker.terminate();
  });
}

async function validateLocalFirmware(bytes) {
  let response;
  try {
    response = await fetch(watch3 ? './firmware/wp3' : './firmware', {
      method: 'POST',
      headers: {'Content-Type': 'application/octet-stream'},
      body: bytes,
    });
  } catch {
    throw Error('The local firmware importer did not respond. Check that the emulator server is running and retry.');
  }
  if ([404, 405, 501].includes(response.status)) {
    throw Error('This server has no firmware importer. Open the emulator served by the current serve.py.');
  }
  if (response.status === 204) return null;
  if (!response.ok) throw Error(`Firmware package rejected: ${response.statusText}`);
  const payload = await response.arrayBuffer();
  const length = payload.byteLength >= 4 ? new DataView(payload).getUint32(0, true) : 0;
  if (length < 0x208 || length > 0x34b000 || payload.byteLength - 4 - length <= 0 ||
      payload.byteLength - 4 - length > 0x10000) {
    throw Error('Invalid application or resources returned by the firmware importer.');
  }
  return {app: new Uint8Array(payload, 4, length), sdfs: new Uint8Array(payload, 4 + length)};
}

async function readBootOverrides() {
  const preset = bootPreset.value;
  if (preset === 'apps') {
    return {...await appPicker.prepare(hosted ? validateHostedFirmware : validateLocalFirmware,
      text => status(text, false, 'loading'), hosted), catalogFace: faceCatalog.selected()};
  }
  const stock = preset === 'stock';
  const builtIn = builtInPresets.get(preset);
  const uploads = !stock && !builtIn;
  const firmware = uploads ? $('firmware-file').files[0] : undefined;
  const app = uploads ? $('app-file').files[0] : undefined;
  const nand = uploads || needsBaseFiles ? $('nand-file').files[0] : undefined;
  const face = stock ? $('face-file').files[0] : undefined;
  const sdfs = uploads ? $('sdfs-file').files[0] : undefined;
  const catalogFace = stock ? faceCatalog.selected() : undefined;
  if (builtIn && !firmware && !app && !sdfs) {
    const load = async name => {
      const response = await cachedFetch(new URL(`./presets/${name}`, import.meta.url), {}, 'bundle');
      if (!response.ok) throw Error('The selected firmware preset could not be loaded.');
      return response.blob();
    };
    const appImage = await load(builtIn);
    return {
      app: new Uint8Array(await appImage.arrayBuffer()),
      sdfs: bootPreset.value === 'bad-apple' ? await load('bad-apple-sdfs.bin') : undefined,
      nand,
    };
  }
  if (bootPreset.value !== 'stock' && !firmware && (!app || (bootPreset.value === 'bad-apple' && !sdfs))) {
    throw Error(bootPreset.value === 'bad-apple'
      ? 'Choose the Bad Apple application and its companion SDFS file.'
      : 'Choose a custom application image.');
  }
  if (face && catalogFace) throw Error('Clear the imported watch face or select “Use stock face” in the FMC picker.');
  if (firmware && (app || sdfs)) {
    throw Error('Choose a firmware package or raw application files.');
  }
  if ((face || catalogFace) && (app || nand)) {
    throw Error('Use the watch-face picker with the stock application and default NAND.');
  }
  if (sdfs && (!app || sdfs.size < 32 || sdfs.size > 0x10000 ||
      await sdfs.slice(0, 8).text() !== 'sdfs.bin')) {
    throw Error('Choose a companion SDFS image up to 64 KiB with a custom application.');
  }
  if (nand && nand.size !== 2112 * 65536) {
    throw Error('Virtual NAND must be a 138,412,032-byte prepared raw image.');
  }
  if (firmware) {
    if (firmware.size > 64 * 1024 ** 2) throw Error('Firmware packages must be 64 MiB or smaller.');
    let packageBytes;
    try {
      packageBytes = await firmware.arrayBuffer();
    } catch {
      throw Error('The selected firmware file could not be read. Select a local copy and retry.');
    }
    if (packageBytes.byteLength === (watch3 ? 45069312 : 56903752)) {
      const hash = await crypto.subtle.digest('SHA-256', packageBytes);
      const digest = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
      const stockHash = watch3 ? 'cf381188eb5fe26a14047a03697e68b58785bdcd01c4baf8703d4624650c6352'
        : '30903fc8ce6db4f8860bb554366635db3d2bcbb2d43827b3b50fbbac22b59353';
      if (digest === stockHash) return { nand };
    }
    const parsed = await (hosted ? validateHostedFirmware : validateLocalFirmware)(packageBytes);
    return parsed ? {app: parsed.app, sdfs: new Blob([parsed.sdfs]), nand} : {nand};
  }
  if (!app) return { nand, face, catalogFace };
  if (app.size < 0x208 || app.size > 0x34b000) {
    throw Error('Application does not fit the selected watch’s partition.');
  }
  const bytes = new Uint8Array(await app.arrayBuffer());
  const vectors = new DataView(bytes.buffer);
  const sp = vectors.getUint32(0x200, true);
  const reset = vectors.getUint32(0x204, true);
  if (new TextDecoder().decode(bytes.subarray(0, 8)) !== 'ACTHHTCA' ||
      sp < 0x2ff00000 || sp >= 0x30000000 || !(reset & 1) ||
      reset < 0x10000200 || reset >= 0x10000000 + bytes.length) {
    throw Error('Expected an ACTH application with valid boot vectors.');
  }
  return { app: bytes, nand, sdfs };
}

async function installFace(face, files) {
  const nand = files.find(([name]) => name === 'nand-defaults.bin')[1];
  const index = await installWatchFace(nand, new Uint8Array(await face.arrayBuffer()), faceModel);
  if (!index) return;
  const existing = files.find(([name]) => name === 'wfc-index.txt');
  if (existing) {
    existing[1] = encoder.encode(new TextDecoder().decode(existing[1]) + '\n' + index);
  } else {
    files.push(['wfc-index.txt', encoder.encode(index)]);
  }
}

async function loadFixtures(nandOverride, useStockAudio) {
  const textureIndex = 'wfc-index.txt';
  const stockAudio = 'stock-audio.bin';
  const nandName = 'nand-defaults.bin';
  const selected = new Map();
  for (const file of $('advanced-boot-files').hidden ? [] : stockFiles.files) {
    if (![...requiredFixtures, textureIndex].includes(file.name) || selected.has(file.name)) {
      throw Error(`Unexpected or duplicate stock file: ${file.name}.`);
    }
    selected.set(file.name, file);
  }
  if (nandOverride) selected.set(nandName, nandOverride);

  let available = bundledStock ? [...requiredFixtures, textureIndex] : [];
  if (document.body.hasAttribute('data-stock-audio')) available.push(stockAudio);
  if (!hosted) {
    const response = await fetch('./fixtures/manifest.json');
    if (!response.ok) throw Error('Prepare the local fixture manifest first.');
    available = (await response.json()).files;
  }
  const missing = requiredFixtures.filter(name => !available.includes(name) && !selected.has(name));
  if (missing.length) throw Error(`Select the missing stock files: ${missing.join(', ')}.`);

  const names = [...requiredFixtures];
  if (available.includes(textureIndex) || selected.has(textureIndex)) names.push(textureIndex);
  if (useStockAudio && available.includes(stockAudio)) names.push(stockAudio);
  const sizes = { [nandName]: 2112 * 65536, 'nor.bin': 0x400000, 'nand-id.bin': 790, 'compat.bin': 65536 };
  const download = new AbortController();
  try {
    return await Promise.all(names.map(async name => {
      const override = selected.get(name);
      if (override) {
        if (name in sizes && override.size !== sizes[name]) throw Error(`Invalid size for ${name}.`);
        return [name, new Uint8Array(await override.arrayBuffer())];
      }
      const gzip = bundledStock && name === nandName;
      const url = new URL(`./fixtures/${name}${gzip ? '.gz' : ''}`, import.meta.url);
      return [name, await fetchFixture(url, {name, size: sizes[name], gzip, signal: download.signal})];
    }));
  } catch (error) {
    download.abort(error);
    throw error;
  }
}

$('stop').onclick=async()=>{
  try { await storage.checkpoint(); } catch (error) { status(error.message, true); return; }
  const url = new URL(location.href);
  url.searchParams.set('idle', '1');
  location.replace(url);
};
$('start').onclick=async()=>{
  if (!crossOriginIsolated) {
    status(hosted
      ? 'Browser isolation is not ready. Reload this page and allow its service worker before booting.'
      : 'Cross-origin isolation is required. Start the supplied local server.', true);
    return;
  }
  if (bootBusy) return;
  if (bootInProgress) return restartSelection();
  bootBusy = true;
  bootInProgress = true;
  $('start').disabled=true;
  const unlock = lockBootControls($('boot-images'));
  try {
    if(!crossOriginIsolated)throw Error('Cross-origin isolation is required. Start the supplied local server.');
    $('image-error').textContent = '';
    if ($('firmware-file').files.length) status('Checking firmware package...', false, 'loading');
    let overrides, files;
    try {
      overrides = await readBootOverrides();
      status(bundledStock && !stockFiles.files.length && !overrides.app
        ? 'Loading stock firmware and virtual storage…'
        : 'Loading the runtime and virtual storage…', false, 'loading');
      files = await loadFixtures(overrides.nand, !overrides.app);
      if (overrides.face || overrides.catalogFace) {
        status(overrides.catalogFace ? `Installing ${overrides.catalogFace.name}…` : 'Installing watch face…', false, 'loading');
        const face = overrides.face || await downloadCatalogFace(overrides.catalogFace);
        await installFace(face, files);
      }
    } catch (error) {
      $('image-error').textContent = error.message;
      bootInProgress = false;
      status(error.message, true);
      $('start').disabled = false;
      return;
    }
    bootedCatalogFace = overrides.catalogFace;
    customApp = Boolean(overrides.app);
    rawOptical.disabled = customApp;
    sendHealth();
    ambientLight.disabled = ambientLightSlider.disabled = customApp;
    $('firmware-label').textContent = customApp
      ? ({'bad-apple': 'BAD APPLE', 'display-demo': 'DISPLAY TEST'}[bootPreset.value] || 'CUSTOM APPLICATION')
      : `FIRMWARE ${watch3 ? '1.0.1.77' : '1.0.0.73'}`;
    $('stop').disabled=false;
    if (customApp) {
      const nor = files.find(([name]) => name === 'nor.bin')[1];
      nor.fill(0xff, 0x24000, 0x36f000);
      nor.set(overrides.app, 0x24000);
      if (overrides.sdfs) {
        nor.fill(0xff, 0x3d3000, 0x3e3000);
        nor.set(new Uint8Array(await overrides.sdfs.arrayBuffer()), 0x3d3000);
      }
    }
    await storage.restore(files);
    const runtimeURL = new URL('./runtime/', import.meta.url);
    const scriptURL = new URL('qemu-system-arm.js', runtimeURL).href;
    status('Starting the emulator runtime…', false, 'loading');
    const {default:createQemu} = await import(scriptURL);
    const mediaClock = builtInPresets.has('bad-apple') && bootPreset.value === 'bad-apple';
    const clock = mediaClock ? 'shift=6,align=on' : 'shift=3,align=off';
    const wasm = await cachedFetch(new URL('qemu-system-arm.wasm', runtimeURL), {}, runtimeURL.pathname.includes('/assets/') ? 'bundle' : '');
    if (!wasm.ok) throw Error('Could not load the emulator runtime.');
    runtime=await createQemu({
      wasmBinary: new Uint8Array(await wasm.arrayBuffer()),
      mainScriptUrlOrBlob:scriptURL,
      locateFile:name=>new URL(name, runtimeURL).href,
      print:log,printErr:log,onAbort:reason=>guestStopped(reason ? `Runtime aborted: ${reason}` : 'Runtime aborted. See the watch log.'),
      onExit:code=>guestStopped(`Emulator exited (${code}). See the watch log.`),
      arguments:['-M','ats3089c-wp2','-bios','/watch/compat.bin',
        ...(!customApp && !watch3 ? ['-kernel', '/watch/app.bin'] : []),
        ...(debug?['-d','unimp','-D','/watch/qemu.log']:[]),
        '-display','none','-monitor','none','-serial','file:/watch/uart.log','-serial','null','-serial','null',
        '-icount',clock,...(watch3 ? [] : ['-no-reboot'])],
      preRun:[module=>{
        module.FS.mkdir('/watch');
        for(const [name,data]of files)module.FS.writeFile(`/watch/${name}`,data,{canOwn:true});
        files = null;
        module.FS.writeFile('/watch/input.txt','');
        Object.assign(module.ENV,{QEMU_WP2_NOR:'/watch/nor.bin',QEMU_WP2_NAND:'/watch/nand-defaults.bin',
          QEMU_WP2_FRAME:'/watch/frame.ppm',QEMU_WP2_INPUT:'/watch/input.txt',QEMU_WP2_LIVE_FRAME:'1',
          QEMU_WP2_PCM_STREAM:'/watch/speaker.pcm',
          QEMU_WP2_MOTOR:motorPath,QEMU_WP2_STORAGE_SNAPSHOT:'/watch/storage',
          QEMU_WP2_LIVE_SENSORS:'1',QEMU_WP2_HOST_RTC:'1',QEMU_WP2_UNPLUGGED:$('charger').checked?'0':'1'});
        if (watch3) module.ENV.QEMU_WP2_MODEL = 'wp3';
        if (mediaClock) module.ENV.QEMU_WP2_MEDIA_CLOCK = '1';
        if (!customApp && !watch3) {
          module.ENV.QEMU_WP2_LIVE_HEALTH = '1';
          module.ENV.QEMU_WP2_STOCK_AWAKE = '1';
        }
        if(economyDisplay)module.ENV.QEMU_WP2_ECONOMY_DISPLAY='1';
        if(module.FS.analyzePath('/watch/wfc-index.txt').exists&&!new URLSearchParams(location.search).has('no-textures'))module.ENV.QEMU_WP2_WFC_INDEX='/watch/wfc-index.txt';
        if (!customApp && module.FS.analyzePath('/watch/stock-audio.bin').exists) {
          module.ENV.QEMU_WP2_STOCK_AUDIO = '/watch/stock-audio.bin';
        }
      }]
    });
    if (!halted) {
      for (const id of ['crown','up','down']) $(id).disabled = false;
      if (powerChanged) sendPower();
      updateBrightness();
      sendHealth();
      if ($('gps-enabled').checked) sendGps();
      updateAmbientLight();
      input(`a ${gravity.join(' ')}`);
      sendGyroscope();
      status('Waiting for the guest display...', false, 'loading');
      setTimeout(() => {
        if (!halted && !frames) status('No display frame after 90 seconds. Check the watch log.', false, 'timeout');
      }, 90000);
    }
    timer = requestAnimationFrame(render);
  }catch(error){log(error.stack);guestStopped(error.message);}
  finally {
    bootBusy = false;
    unlock();
    $('apply-boot').textContent = bootInProgress ? 'Apply and restart' : 'Boot selection';
  }
};
$('apply-boot').onclick = () => $('start').click();


const bootUrl = new URL(location.href);
if (hosted && !crossOriginIsolated) {
  $('start').disabled = true;
  $('apply-boot').disabled = true;
  if (!navigator.serviceWorker || bootUrl.searchParams.has('isolation-reload')) {
    status('This browser could not start the emulator workers. Try a recent desktop version of Chrome or Edge.', true);
  } else {
    status('Preparing browser emulation...', false, 'loading');
    const reloadIsolated = () => {
      bootUrl.searchParams.set('isolation-reload', '1');
      location.replace(bootUrl);
    };
    navigator.serviceWorker.addEventListener('controllerchange', reloadIsolated, {once: true});
    navigator.serviceWorker.register('./isolation-worker.js').then(() => {
      if (navigator.serviceWorker.controller) reloadIsolated();
    }).catch(() => {
      status('The browser blocked the emulator worker. Check that service workers are allowed for this site.', true);
    });
  }
} else if (bootUrl.searchParams.has('isolation-reload')) {
  bootUrl.searchParams.delete('isolation-reload');
  history.replaceState(null, '', bootUrl);
}

const idle = bootUrl.searchParams.has('idle');
const requestedPreset = bootUrl.searchParams.get('preset');
if (crossOriginIsolated && (idle || requestedPreset)) {
  bootUrl.searchParams.delete('idle');
  bootUrl.searchParams.delete('preset');
  history.replaceState(null, '', bootUrl);
}
if (builtInPresets.has(requestedPreset)) {
  bootPreset.value = requestedPreset;
} else if (requestedPreset === 'custom' || requestedPreset === 'apps' || (!watch3 && requestedPreset === 'bad-apple')) {
  bootPreset.value = requestedPreset;
}
updateBootOptions();
if (crossOriginIsolated || !hosted) {
$('start').disabled = true;
const unlockSelection = lockBootControls($('boot-images'));
let preloadFailed = false;
let draft;
try {
  const draftToken = sessionStorage.getItem(bootDraftKey);
  if (draftToken && crossOriginIsolated) {
    draft = await takeBootDraft(faceModel, draftToken);
    sessionStorage.removeItem(bootDraftKey);
    if (!draft) throw Error('The selected files could not be restored. Select them again before booting.');
  }
  if (draft) {
    const selectedUrl = location.href;
    bootPreset.value = draft.preset;
    restoreBootFiles(draft.files, $);
    if (draft.apps) appPicker.restore(draft.apps);
    if (draft.face) faceCatalog.select(draft.face);
    if (draft.firmware.value) {
      $('fmc-firmware-selection').add(new Option(draft.firmware.label, draft.firmware.value));
      $('fmc-firmware-selection').value = draft.firmware.value;
    }
    history.replaceState(null, '', selectedUrl);
    updateBootOptions();
    await appPicker.update();
  } else {
    const plan = parsePreload(bootUrl.search);
    if (plan.apps.length || plan.loader) {
      await appPicker.setPlan(plan);
      if (plan.watchface) {
        faceCatalog.select(appPicker.dependencies().watchface);
        $('face-catalog').open = true;
      }
      updateBootOptions();
    } else if (plan.firmware) {
      const record = await catalogRecord(plan.firmware, faceModel, 'firmware');
      await selectCatalogFirmware(record);
      if (plan.watchface) throw Error('Load the selected firmware first, then choose a watch face.');
    } else if (plan.watchface) {
      const face = await catalogRecord(plan.watchface, faceModel, 'watchface');
      faceCatalog.select(face);
      $('face-catalog').open = true;
    } else {
      await appPicker.update();
    }
  }
} catch (error) {
  $('image-error').textContent = error.message;
  status(error.message, true);
  preloadFailed = true;
} finally {
  unlockSelection();
  $('start').disabled = false;
}
const chooseAppsFirst = !draft && bootPreset.value === 'apps' && !appPicker.files().length;
if (!preloadFailed && crossOriginIsolated && chooseAppsFirst) {
  status('Firmware and App Loader selected. Add apps, then choose Boot selection.', false, 'notice');
}
if (!preloadFailed && crossOriginIsolated && !idle && !chooseAppsFirst && (bundledStock || !hosted)) $('start').click();
}
