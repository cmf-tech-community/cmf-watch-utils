import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lockBootControls} from '../web/boot-controls.mjs';

test('boot lock restores editable controls and preserves unsupported controls', () => {
  const controls = [{disabled: false}, {disabled: true}, {disabled: false}];
  const attributes = new Map();
  const root = {
    querySelectorAll: () => controls,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
  };
  const unlock = lockBootControls(root);
  assert.deepEqual(controls.map(control => control.disabled), [true, true, true]);
  assert.equal(attributes.get('aria-busy'), 'true');
  unlock();
  assert.deepEqual(controls.map(control => control.disabled), [false, true, false]);
  assert.equal(attributes.has('aria-busy'), false);
});
