// Game entry point: initializes audio, input, world, renderer, and 60 Hz fixed-timestep loop.
import {
  BEST_SCORE_KEY,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  STEP,
} from './config.js';
import { createSeededRandom } from './random.js';
import { createKitchenAudio } from './audio.js';
import {
  ACTION_CHOP,
  ACTION_CONFIRM,
  ACTION_INTERACT,
  ACTION_MUTE,
  ACTION_PAUSE,
  createKitchenInput,
} from './input.js';
import { EVENT_EXPIRED, EVENT_SERVED, EVENT_SHIFT_OVER, createCookingWorld } from './world.js';
import { createKitchenRenderer } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const audio = createKitchenAudio();
const world = createCookingWorld(createSeededRandom(seed), audio);
const renderer = createKitchenRenderer(canvas);

function readBestScore() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_SCORE_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(value) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(value));
  } catch {
    // Storage disabled in private contexts.
  }
}

function runShotMode(name) {
  const scene = stageShot(name, world);
  let frames = 0;
  function paintFrame() {
    renderer.draw(world.state, scene.screen, scene.best);
    frames += 1;
    if (frames < 2) {
      requestAnimationFrame(paintFrame);
    } else {
      window.__shotReady = true;
    }
  }
  requestAnimationFrame(paintFrame);
}

function runInteractiveGame() {
  const input = createKitchenInput(canvas);
  let screen = SCREEN_TITLE;
  let bestScore = readBestScore();
  let accumulator = 0;
  let lastTime = performance.now();

  function announce(msg) {
    statusEl.textContent = msg;
  }

  function startShift() {
    audio.unlock();
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Kitchen open! Prep, cook, assemble, and serve orders.');
  }

  function finishShift() {
    screen = SCREEN_OVER;
    if (world.state.score > bestScore) {
      bestScore = world.state.score;
      saveBestScore(bestScore);
    }
    announce(`Shift complete. Revenue $${world.state.score}. Best $${bestScore}.`);
  }

  function processActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Audio muted.' : 'Audio enabled.');
    }
    if ((actions & ACTION_CONFIRM) && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) {
      input.takePointerClick();
      startShift();
      return { interact: false, chopTap: false };
    }
    if ((actions & ACTION_PAUSE) && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
      return { interact: false, chopTap: false };
    }
    if ((actions & (ACTION_PAUSE | ACTION_CONFIRM)) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Resumed.');
      return { interact: false, chopTap: false };
    }
    return {
      interact: Boolean(actions & ACTION_INTERACT),
      chopTap: Boolean(actions & ACTION_CHOP),
    };
  }

  function tick(actions) {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, { move: { dx: 0, dy: 0 }, chopHeld: false }, true);
      return;
    }
    const events = world.step(STEP, {
      move: input.movementVector(),
      interact: actions.interact,
      chopHeld: input.isChoppingHeld() || actions.chopTap,
      pointerClick: input.takePointerClick(),
      pointerPos: input.pointerPosition(),
    }, false);
    actions.interact = false;
    actions.chopTap = false;

    if (events & EVENT_SHIFT_OVER) {
      finishShift();
    } else if (events & EVENT_SERVED) {
      announce(`Served! Revenue $${world.state.score}.`);
    } else if (events & EVENT_EXPIRED) {
      announce('An order timed out.');
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - lastTime) / 1000, MAX_FRAME);
    lastTime = now;
    const actions = processActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        tick(actions);
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, bestScore);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Brass and Basil: Bistro Rush. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shotName) runShotMode(shotName);
else runInteractiveGame();
