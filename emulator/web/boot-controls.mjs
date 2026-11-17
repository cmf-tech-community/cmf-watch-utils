export function lockBootControls(root) {
  const controls = [...root.querySelectorAll('input, select, button')];
  const previous = controls.map(control => control.disabled);
  for (const control of controls) control.disabled = true;
  root.setAttribute('aria-busy', 'true');
  return () => {
    controls.forEach((control, index) => { control.disabled = previous[index]; });
    root.removeAttribute('aria-busy');
  };
}

export function captureBootFiles(root) {
  return [...root.querySelectorAll('input[type=file]')]
    .filter(input => input.id !== 'apps-files')
    .map(input => [input.id, [...input.files]]);
}

export function restoreBootFiles(entries, get) {
  for (const [id, files] of entries) {
    const input = get(id);
    if (!input || input.type !== 'file') continue;
    const transfer = new DataTransfer();
    for (const file of files) transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change'));
  }
}
