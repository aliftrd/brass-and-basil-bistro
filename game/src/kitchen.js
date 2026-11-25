// Kitchen station definitions, placement, interaction routing, and appliance updates.
import { CHEF_CONFIG, FIELD } from './config.js';
import {
  INGREDIENTS,
  PREP_BURNT,
  PREP_CHOPPED,
  PREP_COOKED,
  PREP_RAW,
  advanceDishAssembly,
  createIngredientItem,
  isPlateReadyToServe,
} from './recipes.js';

export const STATION_CRATE = 'crate';
export const STATION_CHOP = 'chop';
export const STATION_SKILLET = 'skillet';
export const STATION_OVEN = 'oven';
export const STATION_COUNTER = 'counter';
export const STATION_ASSEMBLY = 'assembly';
export const STATION_SERVE = 'serve';
export const STATION_TRASH = 'trash';

function makeStation(id, type, x, y, w, h, label, extra = {}) {
  return {
    id,
    type,
    x,
    y,
    w,
    h,
    label,
    item: null,
    progress: 0,
    burnProgress: 0,
    activeCook: false,
    chopAnim: 0,
    highlight: 0,
    standX: extra.standX ?? x + w / 2,
    standY: extra.standY ?? y + h / 2,
    ingredientId: extra.ingredientId ?? null,
    slotTag: extra.slotTag ?? '',
  };
}

export function createKitchenStations() {
  return [
    // Left Pantry Counter (walk from right edge x = 214)
    makeStation('crate-ribeye', STATION_CRATE, 14, 136, 172, 98, 'Ribeye', { ingredientId: 'ribeye', standX: 214, standY: 185 }),
    makeStation('crate-salmon', STATION_CRATE, 14, 244, 172, 98, 'Salmon', { ingredientId: 'salmon', standX: 214, standY: 293 }),
    makeStation('crate-tomato', STATION_CRATE, 14, 352, 172, 98, 'Tomato', { ingredientId: 'tomato', standX: 214, standY: 401 }),
    makeStation('crate-truffle', STATION_CRATE, 14, 460, 172, 98, 'Truffle', { ingredientId: 'truffle', standX: 214, standY: 509 }),
    makeStation('crate-noodles', STATION_CRATE, 14, 568, 172, 98, 'Noodles', { ingredientId: 'noodles', standX: 214, standY: 617 }),

    // Bottom Ingredient Counter (walk from top edge y = 566)
    makeStation('crate-dough', STATION_CRATE, 218, 596, 132, 100, 'Dough', { ingredientId: 'dough', standX: 284, standY: 566 }),
    makeStation('crate-potato', STATION_CRATE, 360, 596, 132, 100, 'Potato', { ingredientId: 'potato', standX: 426, standY: 566 }),
    makeStation('crate-basil', STATION_CRATE, 502, 596, 132, 100, 'Basil', { ingredientId: 'basil', standX: 568, standY: 566 }),
    makeStation('crate-lemon', STATION_CRATE, 644, 596, 132, 100, 'Lemon', { ingredientId: 'lemon', standX: 710, standY: 566 }),
    makeStation('crate-egg', STATION_CRATE, 786, 596, 132, 100, 'Egg', { ingredientId: 'egg', standX: 852, standY: 566 }),

    // Top Prep & Cooking Line (walk from bottom edge y = 274)
    makeStation('chop-1', STATION_CHOP, 242, 136, 140, 108, 'CHOP BOARD A', { standX: 312, standY: 274 }),
    makeStation('chop-2', STATION_CHOP, 392, 136, 140, 108, 'CHOP BOARD B', { standX: 462, standY: 274 }),
    makeStation('skillet-1', STATION_SKILLET, 556, 136, 108, 108, 'SKILLET 1', { standX: 610, standY: 274 }),
    makeStation('skillet-2', STATION_SKILLET, 674, 136, 108, 108, 'SKILLET 2', { standX: 728, standY: 274 }),
    makeStation('oven-1', STATION_OVEN, 792, 136, 116, 108, 'STONE OVEN', { standX: 850, standY: 274 }),

    // Center Island: Prep Holding Counters & Dish Mid-Assembly Mat
    makeStation('prep-slot-1', STATION_COUNTER, 242, 348, 126, 136, 'PREP COUNTER', { standX: 305, standY: 318, slotTag: 'COUNTER' }),
    makeStation('assembly-1', STATION_ASSEMBLY, 380, 344, 388, 144, 'DISH MID-ASSEMBLY', { standX: 574, standY: 316 }),
    makeStation('prep-slot-2', STATION_COUNTER, 780, 348, 128, 136, 'GARNISH TRAY', { standX: 844, standY: 318, slotTag: 'COUNTER' }),

    // Right Service Pass & Compost (walk from left edge x = 936)
    makeStation('serve-1', STATION_SERVE, 964, 136, 302, 180, 'SERVICE PASS A', { standX: 936, standY: 226 }),
    makeStation('serve-2', STATION_SERVE, 964, 328, 302, 172, 'SERVICE PASS B', { standX: 936, standY: 414 }),
    makeStation('trash', STATION_TRASH, 964, 514, 302, 182, 'COMPOST BIN', { standX: 936, standY: 605 }),
  ];
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function distanceToStationRect(x, y, station) {
  const nearestX = Math.max(station.x, Math.min(x, station.x + station.w));
  const nearestY = Math.max(station.y, Math.min(y, station.y + station.h));
  return Math.hypot(x - nearestX, y - nearestY);
}

export function findStationAtPoint(x, y, stations) {
  for (const station of stations) {
    if (pointInRect(x, y, station)) return station;
  }
  return null;
}

export function findNearestInteractiveStation(chef, stations) {
  let best = null;
  let bestDist = CHEF_CONFIG.interactRange;
  for (const station of stations) {
    const dist = distanceToStationRect(chef.x, chef.y, station);
    if (dist < bestDist) {
      bestDist = dist;
      best = station;
    }
  }
  return best;
}

export function resolveChefCollisions(chef, stations) {
  const r = CHEF_CONFIG.radius;
  chef.x = Math.max(196 + r, Math.min(954 - r, chef.x));
  chef.y = Math.max(FIELD.headerHeight + r + 4, Math.min(586 - r, chef.y));

  for (const s of stations) {
    if (s.type === STATION_CRATE || s.type === STATION_SERVE || s.type === STATION_TRASH) continue;
    // Top line & Center Island solid collision
    const pad = 2;
    const left = s.x - pad;
    const right = s.x + s.w + pad;
    const top = s.y - pad;
    const bottom = s.y + s.h + pad;
    const nearestX = Math.max(left, Math.min(chef.x, right));
    const nearestY = Math.max(top, Math.min(chef.y, bottom));
    const dx = chef.x - nearestX;
    const dy = chef.y - nearestY;
    const distSq = dx * dx + dy * dy;
    if (distSq < r * r) {
      const dist = Math.sqrt(distSq);
      if (dist > 0.0001) {
        const push = r - dist;
        chef.x += (dx / dist) * push;
        chef.y += (dy / dist) * push;
      } else {
        chef.y = bottom + r;
      }
    }
  }
}

export function stepKitchenAppliances(stations, dt, callbacks = {}) {
  for (const s of stations) {
    if (s.highlight > 0) s.highlight = Math.max(0, s.highlight - dt * 3);
    if (s.chopAnim > 0) s.chopAnim = Math.max(0, s.chopAnim - dt * 5);

    if ((s.type === STATION_SKILLET || s.type === STATION_OVEN) && s.item && s.item.kind === 'ingredient') {
      const def = INGREDIENTS[s.item.ingredientId];
      if (!def || !def.needsCook) continue;
      if (s.item.state === PREP_RAW && !def.needsChop) {
        // Items like noodles and egg cook directly from raw
      } else if (s.item.state === PREP_RAW && def.needsChop) {
        continue;
      }

      if (s.item.state !== PREP_COOKED && s.item.state !== PREP_BURNT) {
        s.activeCook = true;
        const speedMult = s.type === STATION_OVEN && def.needsCook === 'oven' ? 1.15 : 1.0;
        s.progress += (dt * speedMult) / def.cookTime;
        if (s.progress >= 1) {
          s.progress = 1;
          s.item.state = PREP_COOKED;
          s.burnProgress = 0;
          if (callbacks.onCookDone) callbacks.onCookDone(s);
        }
      } else if (s.item.state === PREP_COOKED) {
        s.activeCook = true;
        s.burnProgress += dt / (def.burnTime || 8);
        if (s.burnProgress >= 1) {
          s.burnProgress = 1;
          s.item.state = PREP_BURNT;
          if (callbacks.onBurn) callbacks.onBurn(s);
        }
      }
    } else {
      s.activeCook = false;
    }
  }
}

export function performChopAction(station, dt, onChopDone) {
  if (!station || station.type !== STATION_CHOP || !station.item) return false;
  if (station.item.kind !== 'ingredient' || station.item.state !== PREP_RAW) return false;
  const def = INGREDIENTS[station.item.ingredientId];
  if (!def || !def.needsChop) return false;

  station.chopAnim = 1;
  station.progress += (dt * CHEF_CONFIG.chopSpeed) / def.chopTime;
  if (station.progress >= 1) {
    station.progress = 1;
    station.item.state = PREP_CHOPPED;
    if (onChopDone) onChopDone(station);
  }
  return true;
}

export function transferItemBetweenChefAndStation(chef, station, worldState, callbacks = {}) {
  const held = chef.heldItem;

  // 1. Crate: pick up fresh raw ingredient if hands empty
  if (station.type === STATION_CRATE) {
    if (!held) {
      chef.heldItem = createIngredientItem(station.ingredientId, PREP_RAW);
      station.highlight = 1;
      callbacks.onPickup?.(station);
      return { ok: true, message: `Picked up ${INGREDIENTS[station.ingredientId].label}.` };
    }
    return { ok: false, message: 'Hands full! Place or assemble what you hold first.' };
  }

  // 2. Trash / Compost: discard held item
  if (station.type === STATION_TRASH) {
    if (held) {
      chef.heldItem = null;
      station.highlight = 1;
      callbacks.onTrash?.(station);
      return { ok: true, message: 'Composted item.' };
    }
    return { ok: false, message: 'Nothing in hand to compost.' };
  }

  // 3. Chopping Board
  if (station.type === STATION_CHOP) {
    if (!station.item && held && held.kind === 'ingredient' && held.state === PREP_RAW) {
      const def = INGREDIENTS[held.ingredientId];
      if (!def.needsChop) {
        return { ok: false, message: `${def.label} goes straight to the Skillet!` };
      }
      station.item = held;
      station.progress = 0;
      chef.heldItem = null;
      station.highlight = 1;
      callbacks.onPlace?.(station);
      return { ok: true, message: `Placed ${def.label} on chopping board. Press F or Space to chop!` };
    }
    if (station.item && station.item.kind === 'ingredient' && station.item.state === PREP_RAW) {
      // Pressing Space/Interact on an unchopped item on the board also chops a chunk!
      station.chopAnim = 1;
      const def = INGREDIENTS[station.item.ingredientId];
      station.progress += 0.36;
      callbacks.onChop?.(station);
      if (station.progress >= 1) {
        station.progress = 1;
        station.item.state = PREP_CHOPPED;
        callbacks.onCookDone?.(station);
        return { ok: true, message: `Finished prepping ${def.label}!` };
      }
      return { ok: true, message: `Chopping ${def.label}...` };
    }
    if (station.item && !held) {
      chef.heldItem = station.item;
      station.item = null;
      station.progress = 0;
      station.highlight = 1;
      callbacks.onPickup?.(station);
      return { ok: true, message: `Picked up ${INGREDIENTS[chef.heldItem.ingredientId].label}.` };
    }
    return { ok: false, message: 'Chopping board busy.' };
  }

  // 4. Skillet or Stone Oven
  if (station.type === STATION_SKILLET || station.type === STATION_OVEN) {
    if (!station.item && held && held.kind === 'ingredient') {
      const def = INGREDIENTS[held.ingredientId];
      if (!def.needsCook) {
        return { ok: false, message: `${def.label} does not need cooking!` };
      }
      if (def.needsChop && held.state === PREP_RAW) {
        return { ok: false, message: `Chop ${def.label} on a Chopping Board first!` };
      }
      if (held.state === PREP_COOKED || held.state === PREP_BURNT) {
        return { ok: false, message: `${def.label} is already cooked.` };
      }
      station.item = held;
      station.progress = 0;
      station.burnProgress = 0;
      chef.heldItem = null;
      station.highlight = 1;
      callbacks.onPlace?.(station);
      return { ok: true, message: `Cooking ${def.label} on ${station.label}.` };
    }
    if (station.item && !held) {
      chef.heldItem = station.item;
      station.item = null;
      station.progress = 0;
      station.burnProgress = 0;
      station.highlight = 1;
      callbacks.onPickup?.(station);
      return { ok: true, message: `Took ${INGREDIENTS[chef.heldItem.ingredientId].label} off heat.` };
    }
    return { ok: false, message: `${station.label} already occupied.` };
  }

  // 5. Prep Counter Slot
  if (station.type === STATION_COUNTER) {
    if (!station.item && held) {
      station.item = held;
      chef.heldItem = null;
      station.highlight = 1;
      callbacks.onPlace?.(station);
      return { ok: true, message: 'Placed item on prep counter.' };
    }
    if (station.item && !held) {
      chef.heldItem = station.item;
      station.item = null;
      station.highlight = 1;
      callbacks.onPickup?.(station);
      return { ok: true, message: 'Picked up item from prep counter.' };
    }
    return { ok: false, message: 'Swap items on an open space.' };
  }

  // 6. Dish Mid-Assembly Station
  if (station.type === STATION_ASSEMBLY) {
    if (held && held.kind === 'ingredient') {
      const result = advanceDishAssembly(station.item, held, worldState.orders);
      if (!result.ok) {
        callbacks.onError?.(result.reason);
        return { ok: false, message: result.reason };
      }
      chef.heldItem = null;
      station.highlight = 1;
      if (result.completedPlate) {
        station.item = null;
        chef.heldItem = result.completedPlate;
        callbacks.onPlateComplete?.(station, result.completedPlate);
      } else {
        station.item = result.assembly;
        callbacks.onAssemble?.(station);
      }
      return { ok: true, message: result.reason };
    }
    if (!held && station.item && station.item.kind === 'plate') {
      chef.heldItem = station.item;
      station.item = null;
      callbacks.onPickup?.(station);
      return { ok: true, message: 'Picked up finished plate! Deliver to Service Pass.' };
    }
    return { ok: false, message: 'Bring prepped or cooked ingredients here to assemble.' };
  }

  // 7. Service Pass
  if (station.type === STATION_SERVE) {
    if (held && held.kind === 'plate') {
      const matchingOrder = isPlateReadyToServe(held, worldState.orders);
      if (matchingOrder) {
        chef.heldItem = null;
        station.item = held;
        station.highlight = 1;
        callbacks.onServeOrder?.(station, matchingOrder, held);
        return { ok: true, message: `Served Order #${matchingOrder.id}!` };
      }
      // Put down on service pass waiting slot if empty
      if (!station.item) {
        station.item = held;
        chef.heldItem = null;
        station.highlight = 1;
        callbacks.onPlace?.(station);
        return { ok: true, message: 'Plate resting at Service Pass.' };
      }
      callbacks.onError?.('No matching active ticket for this plate!');
      return { ok: false, message: 'No matching active ticket for this plate!' };
    }
    if (!held && station.item && station.item.kind === 'plate') {
      const matchingOrder = isPlateReadyToServe(station.item, worldState.orders);
      if (matchingOrder) {
        const servedPlate = station.item;
        station.item = null;
        station.highlight = 1;
        callbacks.onServeOrder?.(station, matchingOrder, servedPlate);
        return { ok: true, message: `Served Order #${matchingOrder.id}!` };
      }
      chef.heldItem = station.item;
      station.item = null;
      callbacks.onPickup?.(station);
      return { ok: true, message: 'Picked up plate from Service Pass.' };
    }
    return { ok: false, message: 'Bring a completed plate here to serve!' };
  }

  return { ok: false, message: '' };
}
