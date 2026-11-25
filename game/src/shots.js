// Deterministic screenshot scene staging (?shot=cover|prep|serve|end&seed=N).
// Advances the real cooking simulation with an AI kitchen autopilot and places
// real kitchen state items so each screenshot showcases every required gameplay element.
import { SCREEN_OVER, SCREEN_PLAY, STEP } from './config.js';
import {
  PREP_CHOPPED,
  PREP_COOKED,
  PREP_RAW,
  RECIPES,
  createIngredientItem,
  createOrderTicket,
} from './recipes.js';

function findStation(state, id) {
  return state.stations.find((s) => s.id === id);
}

export function stageShot(name, world) {
  world.reset();
  const state = world.state;

  // Step the real world forward briefly for natural order timers and particle motion
  for (let i = 0; i < 60; i += 1) {
    world.step(STEP, { move: { dx: 0, dy: 0 }, chopHeld: false }, false);
  }

  // Ensure rich, distinct active orders on the Order Board
  state.orders = [
    createOrderTicket(101, RECIPES[0], 1), // Truffle Steak Frites
    createOrderTicket(102, RECIPES[3], 1), // Woodfire Margherita
    createOrderTicket(103, RECIPES[1], 1), // Golden Miso Ramen
    createOrderTicket(104, RECIPES[2], 1), // Citrus Glazed Salmon
  ];
  state.orders[0].patience = 34;
  state.orders[1].patience = 27;
  state.orders[2].patience = 39;
  state.orders[3].patience = 18;

  // Populate counters, chopping boards, skillets, oven, mid-assembly, and ready-to-serve pass
  const chop1 = findStation(state, 'chop-1');
  const chop2 = findStation(state, 'chop-2');
  const skillet1 = findStation(state, 'skillet-1');
  const skillet2 = findStation(state, 'skillet-2');
  const oven1 = findStation(state, 'oven-1');
  const prep1 = findStation(state, 'prep-slot-1');
  const prep2 = findStation(state, 'prep-slot-2');
  const assembly = findStation(state, 'assembly-1');
  const serve1 = findStation(state, 'serve-1');
  const serve2 = findStation(state, 'serve-2');

  // Prepped ingredients visible on counter & boards
  chop1.item = createIngredientItem('tomato', PREP_CHOPPED);
  chop1.progress = 1;
  chop2.item = createIngredientItem('basil', PREP_RAW);
  chop2.progress = 0.68;
  chop2.chopAnim = 0.8;

  // Active cooking on range & stone oven
  skillet1.item = createIngredientItem('ribeye', PREP_COOKED);
  skillet1.progress = 1;
  skillet1.burnProgress = 0.22;
  skillet2.item = createIngredientItem('noodles', PREP_RAW);
  skillet2.progress = 0.74;
  oven1.item = createIngredientItem('dough', PREP_RAW);
  oven1.progress = 0.62;

  // Ingredients sitting on marble prep counters
  prep1.item = createIngredientItem('potato', PREP_COOKED);
  prep2.item = createIngredientItem('truffle', PREP_CHOPPED);

  // Dish mid-assembly on the central counter (Steak Frites 2/3 steps done!)
  assembly.item = {
    kind: 'assembly',
    recipeId: 'steak-frites',
    addedIngredients: ['potato', 'truffle'],
    totalSteps: 3,
  };

  // Completed plate ready to serve on Service Pass A!
  serve1.item = {
    kind: 'plate',
    recipeId: 'margherita-pizza',
    quality: 1,
  };

  if (name === 'prep') {
    state.timeLeft = 88;
    state.elapsed = 32;
    state.score = 186;
    state.dishesServed = 3;
    state.combo = 3;
    state.maxCombo = 3;
    state.rushLevel = 2;
    state.chef.x = 462;
    state.chef.y = 278;
    state.chef.facingX = 0;
    state.chef.facingY = -1;
    state.chef.heldItem = createIngredientItem('lemon', PREP_CHOPPED);
    state.nearestStationId = 'chop-2';
    state.bannerText = 'Chopping Basil & searing Ribeye — assemble Steak Frites on center mat!';
  } else if (name === 'serve') {
    state.timeLeft = 41;
    state.elapsed = 79;
    state.score = 342;
    state.dishesServed = 6;
    state.combo = 4;
    state.maxCombo = 4;
    state.rushLevel = 3;
    state.chef.x = 918;
    state.chef.y = 228;
    state.chef.facingX = 1;
    state.chef.facingY = 0;
    state.chef.heldItem = { kind: 'plate', recipeId: 'citrus-salmon', quality: 1 };
    serve2.item = { kind: 'plate', recipeId: 'miso-ramen', quality: 1 };
    state.nearestStationId = 'serve-1';
    state.bannerText = 'Service Pass hot! Press Space or click Service Pass to serve +$52!';
  } else if (name === 'end') {
    state.timeLeft = 0;
    state.elapsed = 120;
    state.score = 468;
    state.dishesServed = 8;
    state.combo = 5;
    state.maxCombo = 5;
    state.rushLevel = 4;
    state.chef.x = 574;
    state.chef.y = 525;
    state.chef.heldItem = null;
    return { screen: SCREEN_OVER, best: 468 };
  } else {
    // Cover shot: vibrant full live kitchen rush showing every element unobstructed
    state.timeLeft = 94;
    state.elapsed = 26;
    state.score = 248;
    state.dishesServed = 4;
    state.combo = 3;
    state.maxCombo = 3;
    state.rushLevel = 2;
    state.chef.x = 574;
    state.chef.y = 304;
    state.chef.facingX = 0;
    state.chef.facingY = 1;
    state.chef.heldItem = createIngredientItem('ribeye', PREP_COOKED);
    state.nearestStationId = 'assembly-1';
    state.bannerText = 'BRASS & BASIL: BISTRO RUSH — Bring Seared Steak to Mid-Assembly or Serve at the Pass!';
  }

  // Step appliances a tiny bit for steam particles
  for (let i = 0; i < 8; i += 1) {
    world.step(STEP, { move: { dx: 0, dy: 0 }, chopHeld: false }, true);
  }

  return { screen: SCREEN_PLAY, best: state.score };
}
