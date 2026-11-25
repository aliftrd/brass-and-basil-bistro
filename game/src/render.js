// Canvas renderer for Brass & Basil: Bistro Rush — draws the bistro kitchen, order board,
// ingredients on counters, dish mid-assembly, shift timer, ready-to-serve plates, and chef.
import { FIELD, FONT_STACK, MONO_FONT, PALETTE, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './config.js';
import { INGREDIENTS, PREP_BURNT, PREP_CHOPPED, PREP_COOKED, getRecipeById } from './recipes.js';
import {
  STATION_ASSEMBLY,
  STATION_CHOP,
  STATION_COUNTER,
  STATION_CRATE,
  STATION_OVEN,
  STATION_SERVE,
  STATION_SKILLET,
  STATION_TRASH,
} from './kitchen.js';

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function drawFoodGraphic(ctx, item, cx, cy, scale = 1) {
  if (!item) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  if (item.kind === 'plate') {
    const recipe = getRecipeById(item.recipeId);
    // Porcelain dinner plate with brass rim detail
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(2, 4, 30, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbf8f2';
    ctx.beginPath();
    ctx.ellipse(0, 0, 29, 21, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4c8b4';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = PALETTE.brass;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 23, 16, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Dish-specific appetizing art
    if (recipe.id === 'steak-frites') {
      // Golden fries pile
      ctx.fillStyle = '#f2c94c';
      for (let i = -3; i <= 2; i += 1) {
        ctx.fillRect(4 + i * 3, -9 + (i % 2) * 2, 3, 13);
      }
      // Seared ribeye with char grill marks
      ctx.fillStyle = '#7c2f24';
      ctx.beginPath();
      ctx.ellipse(-7, 2, 13, 9, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b150e';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-14, -1);
      ctx.lineTo(-2, 6);
      ctx.moveTo(-10, -4);
      ctx.lineTo(2, 3);
      ctx.stroke();
      // Herb butter + truffle dot
      ctx.fillStyle = '#52b765';
      ctx.beginPath();
      ctx.arc(-6, 1, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (recipe.id === 'miso-ramen' || recipe.id === 'truffle-noodles') {
      // Broth & noodles
      ctx.fillStyle = recipe.id === 'miso-ramen' ? '#d98a2b' : '#b89448';
      ctx.beginPath();
      ctx.ellipse(0, 0, 19, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f7df8d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-2, 1, 10, 0.2, Math.PI * 1.4);
      ctx.stroke();
      // Soft egg half
      ctx.fillStyle = '#fff9ee';
      ctx.beginPath();
      ctx.ellipse(8, -3, 6, 4.5, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59f1f';
      ctx.beginPath();
      ctx.arc(8, -3, 2.8, 0, Math.PI * 2);
      ctx.fill();
      // Scallion/truffle garnish
      ctx.fillStyle = recipe.id === 'miso-ramen' ? '#40b55c' : '#3a2b24';
      ctx.beginPath();
      ctx.arc(-7, -4, 3, 0, Math.PI * 2);
      ctx.arc(-3, 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (recipe.id === 'citrus-salmon') {
      // Glazed salmon fillet
      ctx.fillStyle = '#e56f4d';
      ctx.beginPath();
      ctx.roundRect(-16, -7, 26, 14, 5);
      ctx.fill();
      ctx.strokeStyle = '#ffd5c2';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(-7, 5);
      ctx.moveTo(-2, -5);
      ctx.lineTo(1, 5);
      ctx.stroke();
      // Meyer lemon wheel
      ctx.fillStyle = '#f7d646';
      ctx.beginPath();
      ctx.arc(10, 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#40b55c';
      ctx.beginPath();
      ctx.arc(-12, 6, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Woodfire Margherita
      ctx.fillStyle = '#e5b869';
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cf3827';
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff9ee';
      ctx.beginPath();
      ctx.arc(-6, -3, 3.5, 0, Math.PI * 2);
      ctx.arc(6, 3, 3.5, 0, Math.PI * 2);
      ctx.arc(5, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#36a852';
      ctx.beginPath();
      ctx.ellipse(0, 1, 5, 2.5, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (item.kind === 'assembly') {
    const recipe = getRecipeById(item.recipeId);
    // Wooden/ceramic assembly board with partially built dish
    ctx.fillStyle = '#f7f2e8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.amber;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    item.addedIngredients.forEach((ingId, idx) => {
      const def = INGREDIENTS[ingId];
      const angle = idx * 2.1 - 0.6;
      const px = Math.cos(angle) * 9;
      const py = Math.sin(angle) * 6;
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.ellipse(px, py, 9, 6, angle * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = def.accent;
      ctx.beginPath();
      ctx.arc(px + 2, py - 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Small step badge
    ctx.fillStyle = PALETTE.ink;
    roundRectPath(ctx, -18, 12, 36, 14, 5);
    ctx.fill();
    ctx.fillStyle = PALETTE.brassBright;
    ctx.font = `700 10px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${item.addedIngredients.length}/${recipe.steps.length}`, 0, 19);
    ctx.restore();
    return;
  }

  // Single ingredient (raw, chopped, cooked, burnt)
  const def = INGREDIENTS[item.ingredientId];
  if (!def) {
    ctx.restore();
    return;
  }

  const isBurnt = item.state === PREP_BURNT;
  const isCooked = item.state === PREP_COOKED;
  const isChopped = item.state === PREP_CHOPPED;
  const baseColor = isBurnt ? '#261e1b' : isCooked ? '#9e4728' : def.color;

  if (isChopped) {
    // Neat diced pieces
    for (let i = 0; i < 4; i += 1) {
      const ox = (i % 2 === 0 ? -7 : 6) + (i > 1 ? 1 : -1);
      const oy = i < 2 ? -5 : 5;
      ctx.fillStyle = baseColor;
      roundRectPath(ctx, ox - 5, oy - 4, 10, 8, 2);
      ctx.fill();
      ctx.fillStyle = def.accent;
      ctx.fillRect(ox - 2, oy - 2, 3, 2);
    }
  } else if (def.id === 'ribeye' || def.id === 'salmon') {
    ctx.fillStyle = baseColor;
    roundRectPath(ctx, -14, -9, 28, 18, 6);
    ctx.fill();
    ctx.strokeStyle = isBurnt ? '#111' : def.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -5);
    ctx.lineTo(-4, 5);
    ctx.moveTo(2, -5);
    ctx.lineTo(6, 5);
    ctx.stroke();
  } else if (def.id === 'tomato' || def.id === 'lemon' || def.id === 'truffle') {
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(0, 1, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.accent;
    ctx.beginPath();
    ctx.ellipse(-2, -6, 5, 2.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (def.id === 'noodles' || def.id === 'dough') {
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isBurnt ? '#111' : def.accent;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0.3, Math.PI * 1.6);
    ctx.stroke();
  } else if (def.id === 'egg') {
    ctx.fillStyle = isCooked ? '#fff9ee' : baseColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 13, 0.2, 0, Math.PI * 2);
    ctx.fill();
    if (isCooked) {
      ctx.fillStyle = '#f5a623';
      ctx.beginPath();
      ctx.arc(0, 1, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Potato or Basil
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.ellipse(-4, 0, 9, 6, -0.3, 0, Math.PI * 2);
    ctx.ellipse(5, 2, 8, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Prep state badge
  if (isCooked || isChopped || isBurnt) {
    ctx.fillStyle = isBurnt ? '#c0392b' : isCooked ? '#e67e22' : '#27ae60';
    ctx.beginPath();
    ctx.arc(13, -11, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `700 8px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isBurnt ? '!' : isCooked ? '★' : '✓', 13, -10.5);
  }

  ctx.restore();
}

export function createKitchenRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  function drawKitchenFloorAndCounters(state) {
    // Wall & bistro checkerboard floor
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);

    const tileSize = 48;
    for (let y = FIELD.headerHeight; y < FIELD.height; y += tileSize) {
      for (let x = 0; x < FIELD.width; x += tileSize) {
        const even = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        ctx.fillStyle = even ? PALETTE.tileA : PALETTE.tileB;
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.strokeStyle = PALETTE.tileGrout;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Pantry counter wood backing (left and bottom)
    ctx.fillStyle = PALETTE.woodDark;
    roundRectPath(ctx, 8, 128, 184, 578, 10);
    ctx.fill();
    roundRectPath(ctx, 206, 588, 722, 118, 10);
    ctx.fill();

    // Top prep/range counter island backing
    ctx.fillStyle = '#3d2c24';
    roundRectPath(ctx, 232, 128, 686, 124, 12);
    ctx.fill();
    ctx.strokeStyle = PALETTE.brass;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center island marble + walnut surround
    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    roundRectPath(ctx, 236, 344, 686, 154, 14);
    ctx.fill();
    ctx.fillStyle = PALETTE.woodMid;
    roundRectPath(ctx, 232, 336, 686, 156, 14);
    ctx.fill();
    ctx.strokeStyle = PALETTE.brass;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Right Service Pass stainless counter
    ctx.fillStyle = '#363d45';
    roundRectPath(ctx, 954, 128, 318, 578, 12);
    ctx.fill();
    ctx.strokeStyle = PALETTE.brass;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Section titles on counters
    ctx.fillStyle = PALETTE.brassBright;
    ctx.font = `700 11px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('PANTRY COUNTERS', 16, 704);
    ctx.fillText('PREP & COOK LINE', 244, 254);
  }

  function drawOrderTicketBoard(state) {
    // Top Header Rail
    ctx.fillStyle = PALETTE.headerBg;
    ctx.fillRect(0, 0, FIELD.width, FIELD.headerHeight);
    ctx.fillStyle = PALETTE.headerBorder;
    ctx.fillRect(0, FIELD.headerHeight - 3, FIELD.width, 3);

    // Order board title tag
    ctx.fillStyle = '#2d211b';
    roundRectPath(ctx, 10, 8, 930, 106, 10);
    ctx.fill();
    ctx.strokeStyle = '#5a4335';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw up to 4 order tickets
    const maxVisible = 4;
    for (let i = 0; i < maxVisible; i += 1) {
      const tx = 18 + i * 228;
      const ty = 14;
      const tw = 218;
      const th = 94;

      const order = state.orders[i];
      if (!order) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        roundRectPath(ctx, tx, ty, tw, th, 8);
        ctx.fill();
        ctx.fillStyle = '#6f5b4e';
        ctx.font = `600 12px ${FONT_STACK}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('NEXT ORDER INCOMING', tx + tw / 2, ty + th / 2);
        continue;
      }

      const ratio = Math.max(0, Math.min(1, order.patience / order.maxPatience));
      const urgent = ratio < 0.3;

      // Ticket card shadow & paper
      ctx.fillStyle = PALETTE.ticketPaper;
      roundRectPath(ctx, tx, ty, tw, th, 8);
      ctx.fill();
      ctx.strokeStyle = urgent ? PALETTE.crimson : order.recipe.accent;
      ctx.lineWidth = urgent ? 3 : 2;
      ctx.stroke();

      // Ticket top strip
      ctx.fillStyle = urgent ? '#fde2df' : PALETTE.ticketHeader;
      roundRectPath(ctx, tx + 2, ty + 2, tw - 4, 24, 6);
      ctx.fill();

      ctx.fillStyle = PALETTE.ink;
      ctx.font = `800 12px ${FONT_STACK}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${order.id} ${order.recipe.shortName}`, tx + 8, ty + 14);

      ctx.fillStyle = PALETTE.emeraldDark;
      ctx.font = `800 12px ${MONO_FONT}`;
      ctx.textAlign = 'right';
      ctx.fillText(`+$${order.reward}`, tx + tw - 8, ty + 14);

      // Step ingredients inside ticket
      const assemblyStation = state.stations.find((s) => s.type === STATION_ASSEMBLY);
      const currentAssembly = assemblyStation?.item;
      const isMatchingAssembly = currentAssembly && currentAssembly.recipeId === order.recipeId;

      order.recipe.steps.forEach((step, sIdx) => {
        const sx = tx + 8 + sIdx * 68;
        const sy = ty + 32;
        const done = isMatchingAssembly && currentAssembly.addedIngredients.includes(step.ingredient);

        ctx.fillStyle = done ? '#dff5e7' : '#f0e6d2';
        roundRectPath(ctx, sx, sy, 64, 42, 6);
        ctx.fill();
        if (done) {
          ctx.strokeStyle = PALETTE.emerald;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }

        drawFoodGraphic(
          ctx,
          { kind: 'ingredient', ingredientId: step.ingredient, state: step.targetState },
          sx + 32,
          sy + 16,
          0.62
        );
        ctx.fillStyle = PALETTE.ink;
        ctx.font = `700 9.5px ${FONT_STACK}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(INGREDIENTS[step.ingredient].short, sx + 32, sy + 40);
      });

      // Patience bar at bottom of ticket
      ctx.fillStyle = '#ddd1bc';
      roundRectPath(ctx, tx + 8, ty + 80, tw - 16, 8, 4);
      ctx.fill();
      ctx.fillStyle = ratio > 0.5 ? PALETTE.emerald : ratio > 0.28 ? PALETTE.amber : PALETTE.crimson;
      roundRectPath(ctx, tx + 8, ty + 80, Math.max(6, (tw - 16) * ratio), 8, 4);
      ctx.fill();
    }
  }

  function drawShiftTimerAndScoreHud(state) {
    const hx = 950;
    const hy = 8;
    const hw = 320;
    const hh = 106;

    ctx.fillStyle = '#251b16';
    roundRectPath(ctx, hx, hy, hw, hh, 10);
    ctx.fill();
    ctx.strokeStyle = PALETTE.brass;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Title & Rush level
    ctx.fillStyle = PALETTE.brassBright;
    ctx.font = `800 13px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('BRASS & BASIL', hx + 12, hy + 10);

    ctx.fillStyle = '#3b2b22';
    roundRectPath(ctx, hx + 12, hy + 30, 128, 22, 6);
    ctx.fill();
    ctx.fillStyle = PALETTE.cream;
    ctx.font = `700 11px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`RUSH WAVE ${state.rushLevel}`, hx + 76, hy + 41);

    // Score & Combo
    ctx.fillStyle = PALETTE.emerald;
    ctx.font = `800 28px ${MONO_FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`$${state.score}`, hx + 12, hy + 56);

    // Target & Combo pill
    ctx.fillStyle = state.combo > 1 ? PALETTE.brassBright : PALETTE.muted;
    ctx.font = `800 13px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${state.dishesServed} SERVED · COMBO x${Math.max(1, state.combo)}`, hx + 12, hy + 88);

    // Prominent Shift Timer
    const timeUrgent = state.timeLeft <= 20;
    ctx.fillStyle = timeUrgent ? '#4b1c19' : '#18120f';
    roundRectPath(ctx, hx + 178, hy + 12, 130, 82, 10);
    ctx.fill();
    ctx.strokeStyle = timeUrgent ? PALETTE.crimson : PALETTE.brassBright;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = timeUrgent ? '#ff9b92' : PALETTE.muted;
    ctx.font = `700 11px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('SHIFT TIMER', hx + 243, hy + 20);

    ctx.fillStyle = timeUrgent ? '#ff5f52' : PALETTE.cream;
    ctx.font = `800 32px ${MONO_FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(formatClock(state.timeLeft), hx + 243, hy + 56);

    // Timer progress bar
    const tRatio = Math.max(0, Math.min(1, state.timeLeft / 120));
    ctx.fillStyle = '#33251f';
    roundRectPath(ctx, hx + 190, hy + 80, 106, 6, 3);
    ctx.fill();
    ctx.fillStyle = timeUrgent ? PALETTE.crimson : PALETTE.brassBright;
    roundRectPath(ctx, hx + 190, hy + 80, Math.max(4, 106 * tRatio), 6, 3);
    ctx.fill();
  }

  function drawCounterIngredients(state) {
    for (const s of state.stations) {
      if (s.type !== STATION_CRATE && s.type !== STATION_COUNTER) continue;
      const isActive = state.nearestStationId === s.id || state.hoveredStationId === s.id;

      if (s.type === STATION_CRATE) {
        const def = INGREDIENTS[s.ingredientId];
        ctx.fillStyle = '#5a3a26';
        roundRectPath(ctx, s.x, s.y, s.w, s.h, 8);
        ctx.fill();
        ctx.strokeStyle = isActive ? PALETTE.brassBright : '#80563c';
        ctx.lineWidth = isActive ? 3 : 1.5;
        ctx.stroke();

        // Inner ingredient crate tray
        ctx.fillStyle = '#3b2416';
        roundRectPath(ctx, s.x + 10, s.y + 8, s.w - 20, s.h - 32, 6);
        ctx.fill();

        // Multiple visual ingredient items inside crate
        drawFoodGraphic(ctx, { kind: 'ingredient', ingredientId: s.ingredientId, state: 'raw' }, s.x + s.w / 2 - 14, s.y + s.h / 2 - 8, 0.85);
        drawFoodGraphic(ctx, { kind: 'ingredient', ingredientId: s.ingredientId, state: 'raw' }, s.x + s.w / 2 + 14, s.y + s.h / 2 - 6, 0.85);

        // Label bar
        const darkTextNeeded = s.ingredientId === 'dough' || s.ingredientId === 'egg' || s.ingredientId === 'noodles' || s.ingredientId === 'lemon';
        ctx.fillStyle = def.color;
        roundRectPath(ctx, s.x + 8, s.y + s.h - 24, s.w - 16, 18, 4);
        ctx.fill();
        ctx.fillStyle = darkTextNeeded ? PALETTE.ink : '#ffffff';
        ctx.font = `800 12px ${FONT_STACK}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(def.label.toUpperCase(), s.x + s.w / 2, s.y + s.h - 15);
      } else {
        // Prep counter marble top
        ctx.fillStyle = PALETTE.marble;
        roundRectPath(ctx, s.x, s.y, s.w, s.h, 10);
        ctx.fill();
        ctx.strokeStyle = isActive ? PALETTE.brassBright : PALETTE.marbleEdge;
        ctx.lineWidth = isActive ? 3.5 : 2;
        ctx.stroke();

        ctx.fillStyle = '#5d5246';
        ctx.font = `800 10.5px ${FONT_STACK}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(s.label, s.x + s.w / 2, s.y + 8);

        if (s.item) {
          drawFoodGraphic(ctx, s.item, s.x + s.w / 2, s.y + s.h / 2 + 6, 1.35);
          if (s.item.kind === 'ingredient') {
            ctx.fillStyle = PALETTE.ink;
            ctx.font = `700 11px ${FONT_STACK}`;
            ctx.textBaseline = 'bottom';
            ctx.fillText(`${INGREDIENTS[s.item.ingredientId].short} (${s.item.state})`, s.x + s.w / 2, s.y + s.h - 8);
          }
        } else {
          ctx.fillStyle = '#a19586';
          ctx.font = `600 11px ${FONT_STACK}`;
          ctx.textBaseline = 'middle';
          ctx.fillText('Counter Slot', s.x + s.w / 2, s.y + s.h / 2 + 8);
        }
      }
    }
  }

  function drawChoppingAndCookingStations(state) {
    for (const s of state.stations) {
      const isActive = state.nearestStationId === s.id || state.hoveredStationId === s.id;

      if (s.type === STATION_CHOP) {
        ctx.fillStyle = PALETTE.woodLight;
        roundRectPath(ctx, s.x, s.y, s.w, s.h, 10);
        ctx.fill();
        ctx.strokeStyle = isActive ? PALETTE.brassBright : '#5e3d28';
        ctx.lineWidth = isActive ? 3.5 : 2;
        ctx.stroke();

        // Cutting board inset with subtle wood grain lines
        ctx.fillStyle = '#c49363';
        roundRectPath(ctx, s.x + 12, s.y + 22, s.w - 24, s.h - 44, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(92, 54, 24, 0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x + 18, s.y + 38);
        ctx.lineTo(s.x + s.w - 22, s.y + 38);
        ctx.moveTo(s.x + 18, s.y + 56);
        ctx.lineTo(s.x + s.w - 22, s.y + 56);
        ctx.stroke();

        // Chef knife silhouette
        ctx.save();
        ctx.translate(s.x + s.w - 26, s.y + 42 - s.chopAnim * 7);
        ctx.rotate(-0.35 + s.chopAnim * 0.45);
        ctx.fillStyle = '#d5dde5';
        ctx.fillRect(-14, -3, 20, 6);
        ctx.fillStyle = '#2c221e';
        ctx.fillRect(6, -2, 10, 4);
        ctx.restore();

        ctx.fillStyle = PALETTE.cream;
        ctx.font = `800 10.5px ${FONT_STACK}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(s.label, s.x + s.w / 2, s.y + 6);

        if (s.item) {
          drawFoodGraphic(ctx, s.item, s.x + s.w / 2 - 4, s.y + s.h / 2 + 2, 1.25);
          if (s.item.state === 'raw') {
            ctx.fillStyle = '#2d1e17';
            roundRectPath(ctx, s.x + 16, s.y + s.h - 17, s.w - 32, 9, 4);
            ctx.fill();
            ctx.fillStyle = PALETTE.emerald;
            roundRectPath(ctx, s.x + 16, s.y + s.h - 17, Math.max(6, (s.w - 32) * Math.min(1, s.progress)), 9, 4);
            ctx.fill();
          } else {
            ctx.fillStyle = PALETTE.emeraldDark;
            roundRectPath(ctx, s.x + 20, s.y + s.h - 20, s.w - 40, 14, 5);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = `800 9.5px ${FONT_STACK}`;
            ctx.textBaseline = 'middle';
            ctx.fillText('CHOPPED ✓', s.x + s.w / 2, s.y + s.h - 13);
          }
        }
      } else if (s.type === STATION_SKILLET || s.type === STATION_OVEN) {
        const isOven = s.type === STATION_OVEN;
        ctx.fillStyle = isOven ? '#5c463c' : '#2d3238';
        roundRectPath(ctx, s.x, s.y, s.w, s.h, 10);
        ctx.fill();
        ctx.strokeStyle = isActive ? PALETTE.brassBright : '#4d555e';
        ctx.lineWidth = isActive ? 3.5 : 2;
        ctx.stroke();

        ctx.fillStyle = PALETTE.brassBright;
        ctx.font = `800 10px ${FONT_STACK}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(s.label, s.x + s.w / 2, s.y + 6);

        if (isOven) {
          // Stone oven arch & ember glow
          ctx.fillStyle = s.activeCook ? '#e67e22' : '#733822';
          ctx.beginPath();
          ctx.arc(s.x + s.w / 2, s.y + 62, 28, Math.PI, 0);
          ctx.lineTo(s.x + s.w / 2 + 28, s.y + 82);
          ctx.lineTo(s.x + s.w / 2 - 28, s.y + 82);
          ctx.closePath();
          ctx.fill();
        } else {
          // Copper skillet & burner flame
          if (s.activeCook) {
            ctx.strokeStyle = '#ff8c2b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(s.x + s.w / 2, s.y + 56, 30, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = PALETTE.copperDark;
          ctx.beginPath();
          ctx.arc(s.x + s.w / 2, s.y + 56, 26, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = PALETTE.copper;
          ctx.beginPath();
          ctx.arc(s.x + s.w / 2, s.y + 56, 22, 0, Math.PI * 2);
          ctx.fill();
          // Handle
          ctx.fillStyle = PALETTE.brass;
          ctx.fillRect(s.x + s.w / 2 + 20, s.y + 52, 16, 7);
        }

        if (s.item) {
          drawFoodGraphic(ctx, s.item, s.x + s.w / 2, s.y + 56, 1.15);
          const isCooked = s.item.state === PREP_COOKED;
          const isBurnt = s.item.state === PREP_BURNT;
          ctx.fillStyle = '#18120f';
          roundRectPath(ctx, s.x + 12, s.y + s.h - 17, s.w - 24, 10, 4);
          ctx.fill();

          if (isBurnt) {
            ctx.fillStyle = PALETTE.crimson;
            roundRectPath(ctx, s.x + 12, s.y + s.h - 17, s.w - 24, 10, 4);
            ctx.fill();
          } else if (isCooked) {
            ctx.fillStyle = s.burnProgress > 0.55 ? PALETTE.crimson : PALETTE.emerald;
            roundRectPath(ctx, s.x + 12, s.y + s.h - 17, s.w - 24, 10, 4);
            ctx.fill();
          } else {
            ctx.fillStyle = PALETTE.amber;
            roundRectPath(ctx, s.x + 12, s.y + s.h - 17, Math.max(6, (s.w - 24) * Math.min(1, s.progress)), 10, 4);
            ctx.fill();
          }
        }
      }
    }
  }

  function drawMidAssemblyStation(state) {
    const s = state.stations.find((st) => st.type === STATION_ASSEMBLY);
    if (!s) return;
    const isActive = state.nearestStationId === s.id || state.hoveredStationId === s.id;

    // Marble plating deck
    ctx.fillStyle = '#f3ede2';
    roundRectPath(ctx, s.x, s.y, s.w, s.h, 12);
    ctx.fill();
    ctx.strokeStyle = isActive ? PALETTE.brassBright : PALETTE.brass;
    ctx.lineWidth = isActive ? 4 : 2.5;
    ctx.stroke();

    // Header pill
    ctx.fillStyle = '#2d211b';
    roundRectPath(ctx, s.x + 10, s.y + 8, s.w - 20, 24, 6);
    ctx.fill();
    ctx.fillStyle = PALETTE.brassBright;
    ctx.font = `800 12px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (s.item && s.item.kind === 'assembly') {
      const recipe = getRecipeById(s.item.recipeId);
      ctx.fillText(`DISH MID-ASSEMBLY · ${recipe.shortName.toUpperCase()} (${s.item.addedIngredients.length}/${recipe.steps.length})`, s.x + s.w / 2, s.y + 20);

      // Draw large dish mid-assembly graphic on left side of mat
      drawFoodGraphic(ctx, s.item, s.x + 86, s.y + 84, 1.85);

      // Draw step checklist on right side of mat
      recipe.steps.forEach((step, idx) => {
        const rx = s.x + 160;
        const ry = s.y + 42 + idx * 30;
        const done = s.item.addedIngredients.includes(step.ingredient);

        ctx.fillStyle = done ? '#d9f5e3' : '#fff4d9';
        roundRectPath(ctx, rx, ry, s.w - 174, 24, 6);
        ctx.fill();
        ctx.strokeStyle = done ? PALETTE.emerald : PALETTE.amber;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = done ? PALETTE.emeraldDark : '#8a5200';
        ctx.font = `800 11.5px ${FONT_STACK}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(done ? `✓ ${step.label}` : `→ ADD ${step.label.toUpperCase()}`, rx + 10, ry + 12);
      });
    } else if (s.item && s.item.kind === 'plate') {
      ctx.fillText('PLATED! TAKE TO SERVICE PASS', s.x + s.w / 2, s.y + 20);
      drawFoodGraphic(ctx, s.item, s.x + s.w / 2, s.y + 86, 1.8);
    } else {
      ctx.fillText('DISH MID-ASSEMBLY COUNTER', s.x + s.w / 2, s.y + 20);
      ctx.fillStyle = '#7e7060';
      ctx.font = `700 13px ${FONT_STACK}`;
      ctx.fillText('Bring prepped & cooked ingredients here to build an order', s.x + s.w / 2, s.y + 84);
    }
  }

  function drawReadyToServePass(state) {
    for (const s of state.stations) {
      const isActive = state.nearestStationId === s.id || state.hoveredStationId === s.id;
      if (s.type === STATION_SERVE) {
        const hasPlate = s.item && s.item.kind === 'plate';
        ctx.fillStyle = hasPlate ? '#263a30' : '#4a525b';
        roundRectPath(ctx, s.x, s.y, s.w, s.h, 10);
        ctx.fill();
        ctx.strokeStyle = hasPlate ? PALETTE.emerald : isActive ? PALETTE.brassBright : PALETTE.stainlessLight;
        ctx.lineWidth = hasPlate ? 3.5 : isActive ? 3 : 2;
        ctx.stroke();

        // Warm brass heat lamp glow
        const grad = ctx.createRadialGradient(s.x + s.w / 2, s.y + s.h / 2, 10, s.x + s.w / 2, s.y + s.h / 2, 110);
        grad.addColorStop(0, hasPlate ? 'rgba(46, 204, 113, 0.28)' : 'rgba(244, 199, 99, 0.14)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        roundRectPath(ctx, s.x, s.y, s.w, s.h, 10);
        ctx.fill();

        // Header badge
        ctx.fillStyle = hasPlate ? PALETTE.emeraldDark : '#2d333a';
        roundRectPath(ctx, s.x + 10, s.y + 10, s.w - 20, 26, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 12.5px ${FONT_STACK}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hasPlate ? '★ PLATE READY TO SERVE! ★' : s.label, s.x + s.w / 2, s.y + 23);

        // Service bell icon on top right
        ctx.fillStyle = PALETTE.brassBright;
        ctx.beginPath();
        ctx.arc(s.x + s.w - 28, s.y + 56, 11, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(s.x + s.w - 41, s.y + 56, 26, 4);

        if (hasPlate) {
          const recipe = getRecipeById(s.item.recipeId);
          drawFoodGraphic(ctx, s.item, s.x + s.w / 2 - 14, s.y + 92, 1.85);

          ctx.fillStyle = PALETTE.emerald;
          roundRectPath(ctx, s.x + 18, s.y + s.h - 36, s.w - 36, 26, 6);
          ctx.fill();
          ctx.fillStyle = PALETTE.ink;
          ctx.font = `800 12px ${FONT_STACK}`;
          ctx.fillText(`SERVE ${recipe.shortName.toUpperCase()} [SPACE / CLICK]`, s.x + s.w / 2, s.y + s.h - 23);
        } else {
          // Empty warm serving mat
          ctx.strokeStyle = 'rgba(255,255,255,0.22)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.ellipse(s.x + s.w / 2, s.y + 100, 42, 30, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#cfd7df';
          ctx.font = `700 11.5px ${FONT_STACK}`;
          ctx.fillText('Bring completed plate here to serve', s.x + s.w / 2, s.y + 100);
        }
      } else if (s.type === STATION_TRASH) {
        ctx.fillStyle = '#332824';
        roundRectPath(ctx, s.x, s.y, s.w, s.h, 10);
        ctx.fill();
        ctx.strokeStyle = isActive ? PALETTE.brassBright : '#5a463d';
        ctx.lineWidth = isActive ? 3 : 1.5;
        ctx.stroke();

        // Compost bin icon at top
        ctx.fillStyle = '#251d1a';
        roundRectPath(ctx, s.x + 14, s.y + 12, s.w - 28, 42, 8);
        ctx.fill();
        ctx.fillStyle = '#d3b8a6';
        ctx.font = `800 12px ${FONT_STACK}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('COMPOST BIN (DISCARD HELD ITEM)', s.x + s.w / 2, s.y + 33);

        // Clean Controls Legend inside bottom right panel
        ctx.fillStyle = '#1e1613';
        roundRectPath(ctx, s.x + 14, s.y + 64, s.w - 28, 106, 8);
        ctx.fill();
        ctx.fillStyle = PALETTE.brassBright;
        ctx.font = `800 11.5px ${FONT_STACK}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('CHEF CONTROLS', s.x + 26, s.y + 73);
        ctx.fillStyle = PALETTE.cream;
        ctx.font = `600 11px ${FONT_STACK}`;
        ctx.fillText('• Move: WASD / Arrows or Click Station', s.x + 26, s.y + 94);
        ctx.fillText('• Pick / Place / Assemble / Serve: Space or E', s.x + 26, s.y + 114);
        ctx.fillText('• Chop on Board: Hold F / C (or tap Space)', s.x + 26, s.y + 134);
        ctx.fillText('• Pause: P / Esc   ·   Audio: M', s.x + 26, s.y + 152);
      }
    }
  }

  function drawChefAndHeldItem(state) {
    const chef = state.chef;

    // Navigation target marker
    if (chef.navTarget) {
      const t = chef.navTarget.station;
      ctx.strokeStyle = 'rgba(244, 199, 99, 0.75)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(t.standX, t.standY, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.save();
    ctx.translate(chef.x, chef.y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.36)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chef apron & jacket
    const bob = Math.sin(chef.walkAnim) * 2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, bob, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Red/brass bistro neckerchief
    ctx.fillStyle = PALETTE.crimson;
    ctx.beginPath();
    ctx.arc(0, bob + 4, 8, 0, Math.PI);
    ctx.fill();

    // Toque (chef hat)
    ctx.fillStyle = '#fbf8f2';
    ctx.beginPath();
    ctx.arc(0, bob - 8, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cfc5b6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Held item floating in front of chef
    if (chef.heldItem) {
      const hx = chef.facingX * 26;
      const hy = chef.facingY * 22 - 8;
      ctx.fillStyle = 'rgba(25, 18, 15, 0.85)';
      ctx.beginPath();
      ctx.arc(hx, hy, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PALETTE.brassBright;
      ctx.lineWidth = 2;
      ctx.stroke();
      drawFoodGraphic(ctx, chef.heldItem, hx, hy, 0.92);
    }

    ctx.restore();
  }

  function drawParticlesAndFloatingPopups(state) {
    for (const pt of state.particles) {
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const pop of state.popups) {
      const alpha = Math.max(0, Math.min(1, pop.life / 0.6));
      ctx.globalAlpha = alpha;
      ctx.font = `800 15px ${FONT_STACK}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#110c0a';
      ctx.fillText(pop.text, pop.x + 1.5, pop.y + 1.5);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
    }
    ctx.globalAlpha = 1;

    // Live status strip along bottom kitchen aisle
    if (state.bannerText) {
      ctx.fillStyle = 'rgba(25, 18, 15, 0.9)';
      roundRectPath(ctx, 234, 536, 682, 28, 7);
      ctx.fill();
      ctx.strokeStyle = state.bannerTone === 'warn' ? PALETTE.crimson : '#694f3d';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = state.bannerTone === 'warn' ? '#ffb3ac' : PALETTE.cream;
      ctx.font = `700 12.5px ${FONT_STACK}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.bannerText, 575, 550);
    }
  }

  function drawScreenModalOverlay(state, screen, bestScore) {
    if (screen === SCREEN_PLAY) return;

    ctx.fillStyle = 'rgba(18, 12, 10, 0.56)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);

    const pw = 540;
    const ph = screen === SCREEN_TITLE ? 300 : 270;
    const px = (FIELD.width - pw) / 2;
    const py = (FIELD.height - ph) / 2 + 24;

    ctx.fillStyle = '#241a15';
    roundRectPath(ctx, px, py, pw, ph, 16);
    ctx.fill();
    ctx.strokeStyle = PALETTE.brassBright;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    if (screen === SCREEN_TITLE) {
      ctx.fillStyle = PALETTE.brassBright;
      ctx.font = `800 40px ${FONT_STACK}`;
      ctx.fillText('BRASS & BASIL', FIELD.width / 2, py + 66);
      ctx.fillStyle = PALETTE.cream;
      ctx.font = `700 18px ${FONT_STACK}`;
      ctx.fillText('BISTRO RUSH — TACTICAL KITCHEN SERVICE', FIELD.width / 2, py + 98);
      ctx.fillStyle = PALETTE.muted;
      ctx.font = `600 15px ${FONT_STACK}`;
      ctx.fillText('Prep ingredients on boards, sear on copper skillets,', FIELD.width / 2, py + 142);
      ctx.fillText('assemble dishes mid-counter & serve hot at the pass.', FIELD.width / 2, py + 166);
      ctx.fillStyle = PALETTE.emerald;
      ctx.font = `700 16px ${FONT_STACK}`;
      ctx.fillText(`Best Shift Revenue: $${bestScore}`, FIELD.width / 2, py + 206);
      ctx.fillStyle = PALETTE.brassBright;
      ctx.font = `800 20px ${FONT_STACK}`;
      ctx.fillText('PRESS SPACE OR CLICK ANYWHERE TO OPEN KITCHEN', FIELD.width / 2, py + 258);
    } else if (screen === SCREEN_PAUSED) {
      ctx.fillStyle = PALETTE.brassBright;
      ctx.font = `800 38px ${FONT_STACK}`;
      ctx.fillText('SERVICE PAUSED', FIELD.width / 2, py + 76);
      ctx.fillStyle = PALETTE.cream;
      ctx.font = `600 17px ${FONT_STACK}`;
      ctx.fillText('The copper range is on hold.', FIELD.width / 2, py + 126);
      ctx.fillStyle = PALETTE.emerald;
      ctx.font = `800 20px ${FONT_STACK}`;
      ctx.fillText('PRESS P OR SPACE TO RESUME', FIELD.width / 2, py + 200);
    } else if (screen === SCREEN_OVER) {
      ctx.fillStyle = PALETTE.brassBright;
      ctx.font = `800 36px ${FONT_STACK}`;
      ctx.fillText('DINNER SHIFT COMPLETE!', FIELD.width / 2, py + 64);
      ctx.fillStyle = PALETTE.emerald;
      ctx.font = `800 32px ${MONO_FONT}`;
      ctx.fillText(`$${state.score} EARNED`, FIELD.width / 2, py + 118);
      ctx.fillStyle = PALETTE.cream;
      ctx.font = `700 16px ${FONT_STACK}`;
      ctx.fillText(
        `${state.dishesServed} Dishes Served  ·  Best Combo x${Math.max(1, state.maxCombo)}  ·  Record: $${bestScore}`,
        FIELD.width / 2,
        py + 162
      );
      ctx.fillStyle = PALETTE.brassBright;
      ctx.font = `800 20px ${FONT_STACK}`;
      ctx.fillText('PRESS SPACE OR CLICK TO START NEXT SHIFT', FIELD.width / 2, py + 222);
    }
  }

  function draw(state, screen, bestScore) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);

    drawKitchenFloorAndCounters(state);
    drawOrderTicketBoard(state);
    drawShiftTimerAndScoreHud(state);
    drawCounterIngredients(state);
    drawChoppingAndCookingStations(state);
    drawMidAssemblyStation(state);
    drawReadyToServePass(state);
    drawChefAndHeldItem(state);
    drawParticlesAndFloatingPopups(state);
    drawScreenModalOverlay(state, screen, bestScore);
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw };
}
