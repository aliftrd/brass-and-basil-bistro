// Keyboard and pointer input handler supporting WASD/Arrows, hotkeys, and click-to-route.
import { FIELD } from './config.js';

export const ACTION_INTERACT = 1;
export const ACTION_CHOP = 2;
export const ACTION_CONFIRM = 4;
export const ACTION_PAUSE = 8;
export const ACTION_MUTE = 16;

const UP_KEYS = new Set(['ArrowUp', 'KeyW']);
const DOWN_KEYS = new Set(['ArrowDown', 'KeyS']);
const LEFT_KEYS = new Set(['ArrowLeft', 'KeyA']);
const RIGHT_KEYS = new Set(['ArrowRight', 'KeyD']);
const INTERACT_KEYS = new Set(['Space', 'KeyE']);
const CHOP_KEYS = new Set(['KeyF', 'KeyC']);
const CONFIRM_KEYS = new Set(['Space', 'Enter']);
const PAUSE_KEYS = new Set(['KeyP', 'Escape']);
const MUTE_KEYS = new Set(['KeyM']);

export function createKitchenInput(canvas) {
  let up = false;
  let down = false;
  let left = false;
  let right = false;
  let chopHeld = false;
  let actions = 0;
  let pointerClick = null;
  let pointerPos = { x: -100, y: -100 };

  function toFieldCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height) || 1;
    const offsetX = (rect.width - FIELD.width * scale) / 2;
    const offsetY = (rect.height - FIELD.height * scale) / 2;
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (UP_KEYS.has(event.code)) up = true;
    else if (DOWN_KEYS.has(event.code)) down = true;
    else if (LEFT_KEYS.has(event.code)) left = true;
    else if (RIGHT_KEYS.has(event.code)) right = true;
    else if (CHOP_KEYS.has(event.code)) {
      chopHeld = true;
      if (!event.repeat) actions |= ACTION_CHOP;
    } else if (INTERACT_KEYS.has(event.code)) {
      if (!event.repeat) actions |= ACTION_INTERACT | ACTION_CONFIRM;
    } else if (CONFIRM_KEYS.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE_KEYS.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (MUTE_KEYS.has(event.code)) {
      if (!event.repeat) actions |= ACTION_MUTE;
    } else {
      return;
    }
    event.preventDefault();
  });

  window.addEventListener('keyup', (event) => {
    if (UP_KEYS.has(event.code)) up = false;
    else if (DOWN_KEYS.has(event.code)) down = false;
    else if (LEFT_KEYS.has(event.code)) left = false;
    else if (RIGHT_KEYS.has(event.code)) right = false;
    else if (CHOP_KEYS.has(event.code)) chopHeld = false;
  });

  window.addEventListener('blur', () => {
    up = false;
    down = false;
    left = false;
    right = false;
    chopHeld = false;
  });

  canvas.addEventListener('pointermove', (event) => {
    pointerPos = toFieldCoords(event.clientX, event.clientY);
  });

  canvas.addEventListener('pointerdown', (event) => {
    const pos = toFieldCoords(event.clientX, event.clientY);
    pointerPos = pos;
    pointerClick = pos;
    actions |= ACTION_CONFIRM;
  });

  return {
    movementVector() {
      const dx = (right ? 1 : 0) - (left ? 1 : 0);
      const dy = (down ? 1 : 0) - (up ? 1 : 0);
      if (dx === 0 && dy === 0) return { dx: 0, dy: 0 };
      const len = Math.hypot(dx, dy);
      return { dx: dx / len, dy: dy / len };
    },
    isChoppingHeld() {
      return chopHeld;
    },
    pointerPosition() {
      return pointerPos;
    },
    takePointerClick() {
      const click = pointerClick;
      pointerClick = null;
      return click;
    },
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
