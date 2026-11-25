// Core simulation state: chef movement, pointer routing, order board queue, particles, combo, and shift timer.
import { CHEF_CONFIG, SHIFT_DURATION } from './config.js';
import { pickWeightedItem } from './random.js';
import { RECIPES, createOrderTicket, isPlateReadyToServe } from './recipes.js';
import {
  STATION_CHOP,
  STATION_SERVE,
  createKitchenStations,
  findNearestInteractiveStation,
  findStationAtPoint,
  performChopAction,
  resolveChefCollisions,
  stepKitchenAppliances,
  transferItemBetweenChefAndStation,
} from './kitchen.js';

export const EVENT_SERVED = 1;
export const EVENT_EXPIRED = 2;
export const EVENT_SHIFT_OVER = 4;

export function createCookingWorld(random, audio = null) {
  const stations = createKitchenStations();

  const chef = {
    x: 574,
    y: 530,
    facingX: 0,
    facingY: -1,
    heldItem: null,
    navTarget: null,
    walkAnim: 0,
  };

  const state = {
    chef,
    stations,
    orders: [],
    nextOrderId: 101,
    score: 0,
    dishesServed: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: SHIFT_DURATION,
    elapsed: 0,
    rushLevel: 1,
    orderSpawnTimer: 0,
    hoveredStationId: null,
    nearestStationId: null,
    bannerText: 'Welcome Chef! Click any ingredient or use WASD + Space.',
    bannerTone: 'info',
    popups: [],
    particles: [],
  };

  let pendingEvents = 0;

  function addPopup(x, y, text, color = '#2ecc71') {
    state.popups.push({ x, y, text, color, life: 1.4, maxLife: 1.4 });
  }

  function addParticles(x, y, color, count = 6, vy = -45) {
    for (let i = 0; i < count; i += 1) {
      state.particles.push({
        x: x + (random() - 0.5) * 26,
        y: y + (random() - 0.5) * 16,
        vx: (random() - 0.5) * 40,
        vy: vy - random() * 35,
        radius: 3 + random() * 4,
        color,
        life: 0.7 + random() * 0.4,
        maxLife: 1.1,
      });
    }
  }

  function spawnOrder() {
    if (state.orders.length >= 4) return;
    const activeIds = new Set(state.orders.map((o) => o.recipeId));
    const pool = RECIPES.filter((r) => !activeIds.has(r.id));
    const recipe = pickWeightedItem(random, pool.length ? pool : RECIPES);
    const rushScale = 1 + (state.rushLevel - 1) * 0.1;
    state.orders.push(createOrderTicket(state.nextOrderId, recipe, rushScale));
    state.nextOrderId += 1;
  }

  function reset() {
    chef.x = 574;
    chef.y = 530;
    chef.facingX = 0;
    chef.facingY = -1;
    chef.heldItem = null;
    chef.navTarget = null;
    chef.walkAnim = 0;

    for (const s of stations) {
      s.item = null;
      s.progress = 0;
      s.burnProgress = 0;
      s.activeCook = false;
      s.chopAnim = 0;
      s.highlight = 0;
    }

    state.orders = [];
    state.nextOrderId = 101;
    state.score = 0;
    state.dishesServed = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.timeLeft = SHIFT_DURATION;
    state.elapsed = 0;
    state.rushLevel = 1;
    state.orderSpawnTimer = 2.0;
    state.hoveredStationId = null;
    state.nearestStationId = null;
    state.bannerText = 'Dinner Service Open! Prep ingredients, assemble mid-counter & serve at the pass.';
    state.bannerTone = 'info';
    state.popups = [];
    state.particles = [];

    spawnOrder();
    spawnOrder();
    spawnOrder();
  }

  function handleStationInteraction(station) {
    if (!station) return false;
    const res = transferItemBetweenChefAndStation(chef, station, state, {
      onPickup: () => audio?.playPickup(),
      onPlace: () => audio?.playPickup(),
      onChop: () => {
        audio?.playChop();
        addParticles(station.x + station.w / 2, station.y + 52, '#f4c763', 4, -30);
      },
      onCookDone: () => {
        audio?.playCookDone();
        addPopup(station.x + station.w / 2, station.y, 'READY!', '#f4c763');
      },
      onAssemble: () => {
        audio?.playAssemble();
        addParticles(station.x + station.w / 2, station.y + 60, '#2ecc71', 7, -50);
      },
      onPlateComplete: (_st, plate) => {
        audio?.playCookDone();
        addPopup(station.x + station.w / 2, station.y, 'PLATED!', '#2ecc71');
        addParticles(station.x + station.w / 2, station.y + 60, '#ffffff', 10, -55);
      },
      onServeOrder: (serveStation, order) => {
        audio?.playServe();
        const idx = state.orders.findIndex((o) => o.id === order.id);
        if (idx !== -1) state.orders.splice(idx, 1);
        state.combo += 1;
        state.maxCombo = Math.max(state.maxCombo, state.combo);
        state.dishesServed += 1;
        const speedBonus = Math.round((order.patience / order.maxPatience) * 18);
        const comboBonus = (state.combo - 1) * 10;
        const earned = order.reward + speedBonus + comboBonus;
        state.score += earned;
        pendingEvents |= EVENT_SERVED;
        addPopup(serveStation.x + 120, serveStation.y + 24, `+$${earned} SERVED!`, '#2ecc71');
        addParticles(serveStation.x + 140, serveStation.y + 70, '#f4c763', 14, -65);
        // Clear served dish after a brief moment in real gameplay, or keep empty for next plate
        serveStation.item = null;
        spawnOrder();
      },
      onTrash: () => audio?.playPickup(),
      onError: (msg) => {
        audio?.playError();
        addPopup(chef.x, chef.y - 32, 'CHECK STEP', '#e74c3c');
        state.bannerText = msg;
        state.bannerTone = 'warn';
      },
    });
    if (res.message && res.ok) {
      state.bannerText = res.message;
      state.bannerTone = 'ok';
    }
    return res.ok;
  }

  function step(dt, inputData, passiveMode = false) {
    let events = pendingEvents;
    pendingEvents = 0;

    if (!passiveMode) {
      state.elapsed += dt;
      state.timeLeft = Math.max(0, state.timeLeft - dt);
      state.rushLevel = 1 + Math.floor(state.elapsed / 35);
      if (state.timeLeft <= 0) {
        events |= EVENT_SHIFT_OVER;
      }

      // Check hover
      const pointer = inputData.pointerPos;
      const hovered = pointer ? findStationAtPoint(pointer.x, pointer.y, stations) : null;
      state.hoveredStationId = hovered ? hovered.id : null;

      // Click-to-route
      if (inputData.pointerClick) {
        const clicked = findStationAtPoint(inputData.pointerClick.x, inputData.pointerClick.y, stations);
        if (clicked) {
          chef.navTarget = { station: clicked };
        }
      }

      // Manual movement overrides pointer routing
      const move = inputData.move ?? { dx: 0, dy: 0 };
      if (Math.abs(move.dx) > 0.01 || Math.abs(move.dy) > 0.01) {
        chef.navTarget = null;
        chef.x += move.dx * CHEF_CONFIG.speed * dt;
        chef.y += move.dy * CHEF_CONFIG.speed * dt;
        chef.facingX = move.dx;
        chef.facingY = move.dy;
        chef.walkAnim += dt * 12;
      } else if (chef.navTarget) {
        const target = chef.navTarget.station;
        let goalX = target.standX;
        let goalY = target.standY;

        // Avoid getting stuck across the center island: route around top or bottom aisle if needed
        const islandTop = 340;
        const islandBottom = 492;
        const chefInCenterY = chef.y > islandTop && chef.y < islandBottom;
        const crossingIslandX =
          (chef.x < 380 && goalX > 760) ||
          (chef.x > 760 && goalX < 380) ||
          (chef.y < 330 && goalY > 500 && chef.x > 230 && chef.x < 920) ||
          (chef.y > 500 && goalY < 330 && chef.x > 230 && chef.x < 920);

        if (crossingIslandX && !chefInCenterY) {
          goalX = chef.x < 574 ? 214 : 936;
          goalY = chef.y < 416 ? 295 : 535;
        }

        const dx = goalX - chef.x;
        const dy = goalY - chef.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 14 && goalX === target.standX && goalY === target.standY) {
          chef.navTarget = null;
          handleStationInteraction(target);
        } else if (dist > 1) {
          const stepDist = Math.min(dist, CHEF_CONFIG.speed * dt);
          chef.x += (dx / dist) * stepDist;
          chef.y += (dy / dist) * stepDist;
          chef.facingX = dx / dist;
          chef.facingY = dy / dist;
          chef.walkAnim += dt * 12;
        }
      }

      resolveChefCollisions(chef, stations);
      const nearest = findNearestInteractiveStation(chef, stations);
      state.nearestStationId = nearest ? nearest.id : null;

      if (inputData.interact) {
        handleStationInteraction(nearest);
      }
      if (inputData.chopHeld && nearest && nearest.type === STATION_CHOP) {
        performChopAction(nearest, dt, () => {
          audio?.playCookDone();
          addPopup(nearest.x + nearest.w / 2, nearest.y, 'PREPPED!', '#f4c763');
        });
      }

      // Order spawning & patience countdown
      state.orderSpawnTimer -= dt;
      if (state.orderSpawnTimer <= 0) {
        spawnOrder();
        state.orderSpawnTimer = Math.max(5.5, 11 - state.rushLevel * 1.4);
      }

      for (let i = state.orders.length - 1; i >= 0; i -= 1) {
        const order = state.orders[i];
        order.patience -= dt;
        if (order.patience <= 0) {
          state.orders.splice(i, 1);
          state.combo = 0;
          state.score = Math.max(0, state.score - 15);
          events |= EVENT_EXPIRED;
          addPopup(120 + i * 210, 128, 'ORDER TIMED OUT -$15', '#e74c3c');
          spawnOrder();
        }
      }
    }

    // Appliances step in both active and passive preview modes
    stepKitchenAppliances(stations, dt, {
      onCookDone: (station) => {
        if (!passiveMode) audio?.playCookDone();
        addPopup(station.x + station.w / 2, station.y, 'COOKED!', '#f4c763');
      },
      onBurn: (station) => {
        if (!passiveMode) audio?.playError();
        addPopup(station.x + station.w / 2, station.y, 'OVERCOOKED!', '#e74c3c');
      },
    });

    // Subtle ambient steam from active cookware & ready plates
    for (const s of stations) {
      if ((s.activeCook || (s.type === STATION_SERVE && s.item)) && random() < dt * 3.5) {
        addParticles(s.x + s.w / 2, s.y + 42, 'rgba(255,248,235,0.48)', 1, -24);
      }
      // Auto-serve if a plate is sitting on pass matching an order? No — player explicitly serves!
    }

    // Update popups & particles
    for (let i = state.popups.length - 1; i >= 0; i -= 1) {
      const p = state.popups[i];
      p.y -= 26 * dt;
      p.life -= dt;
      if (p.life <= 0) state.popups.splice(i, 1);
    }
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const pt = state.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }

    return events;
  }

  reset();
  return { state, reset, step, handleStationInteraction };
}
