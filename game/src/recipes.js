// Ingredient definitions, multi-step bistro recipes, order tickets, and assembly validation.

export const PREP_RAW = 'raw';
export const PREP_CHOPPED = 'chopped';
export const PREP_COOKED = 'cooked';
export const PREP_BURNT = 'burnt';

export const INGREDIENTS = {
  ribeye: {
    id: 'ribeye',
    label: 'Ribeye',
    short: 'Steak',
    needsChop: true,
    needsCook: 'skillet',
    chopTime: 1.4,
    cookTime: 3.6,
    burnTime: 8.5,
    color: '#b83b3b',
    accent: '#f1c2b8',
  },
  salmon: {
    id: 'salmon',
    label: 'Salmon',
    short: 'Salmon',
    needsChop: true,
    needsCook: 'skillet',
    chopTime: 1.3,
    cookTime: 3.3,
    burnTime: 8.0,
    color: '#ea7554',
    accent: '#ffd0bf',
  },
  tomato: {
    id: 'tomato',
    label: 'Tomato',
    short: 'Tomato',
    needsChop: true,
    needsCook: false,
    chopTime: 1.1,
    cookTime: 0,
    burnTime: 0,
    color: '#d93829',
    accent: '#6ab04c',
  },
  truffle: {
    id: 'truffle',
    label: 'Truffle',
    short: 'Truffle',
    needsChop: true,
    needsCook: false,
    chopTime: 1.2,
    cookTime: 0,
    burnTime: 0,
    color: '#463730',
    accent: '#9c7e65',
  },
  noodles: {
    id: 'noodles',
    label: 'Noodles',
    short: 'Noodles',
    needsChop: false,
    needsCook: 'skillet',
    chopTime: 0,
    cookTime: 3.0,
    burnTime: 7.5,
    color: '#f2c94c',
    accent: '#fff1b8',
  },
  dough: {
    id: 'dough',
    label: 'Dough',
    short: 'Dough',
    needsChop: true,
    needsCook: 'oven',
    chopTime: 1.3,
    cookTime: 3.4,
    burnTime: 8.5,
    color: '#f3dfb9',
    accent: '#d9a760',
  },
  potato: {
    id: 'potato',
    label: 'Potato',
    short: 'Frites',
    needsChop: true,
    needsCook: 'skillet',
    chopTime: 1.2,
    cookTime: 3.2,
    burnTime: 8.0,
    color: '#cfa15a',
    accent: '#f7d98e',
  },
  basil: {
    id: 'basil',
    label: 'Basil',
    short: 'Basil',
    needsChop: true,
    needsCook: false,
    chopTime: 1.0,
    cookTime: 0,
    burnTime: 0,
    color: '#3aa655',
    accent: '#8ee49e',
  },
  lemon: {
    id: 'lemon',
    label: 'Lemon',
    short: 'Lemon',
    needsChop: true,
    needsCook: false,
    chopTime: 1.0,
    cookTime: 0,
    burnTime: 0,
    color: '#f5d13b',
    accent: '#fff5b5',
  },
  egg: {
    id: 'egg',
    label: 'Egg',
    short: 'Egg',
    needsChop: false,
    needsCook: 'skillet',
    chopTime: 0,
    cookTime: 2.8,
    burnTime: 7.2,
    color: '#f7efe2',
    accent: '#f5a623',
  },
};

export const RECIPES = [
  {
    id: 'steak-frites',
    name: 'Truffle Steak Frites',
    shortName: 'Steak Frites',
    reward: 60,
    patience: 48,
    accent: '#b84234',
    steps: [
      { ingredient: 'ribeye', targetState: PREP_COOKED, label: 'Seared Steak' },
      { ingredient: 'potato', targetState: PREP_COOKED, label: 'Crispy Frites' },
      { ingredient: 'truffle', targetState: PREP_CHOPPED, label: 'Shaved Truffle' },
    ],
  },
  {
    id: 'miso-ramen',
    name: 'Golden Miso Ramen',
    shortName: 'Miso Ramen',
    reward: 48,
    patience: 42,
    accent: '#d98a2b',
    steps: [
      { ingredient: 'noodles', targetState: PREP_COOKED, label: 'Boiled Noodles' },
      { ingredient: 'egg', targetState: PREP_COOKED, label: 'Soft Egg' },
      { ingredient: 'basil', targetState: PREP_CHOPPED, label: 'Chopped Herbs' },
    ],
  },
  {
    id: 'citrus-salmon',
    name: 'Citrus Glazed Salmon',
    shortName: 'Citrus Salmon',
    reward: 54,
    patience: 44,
    accent: '#ea7554',
    steps: [
      { ingredient: 'salmon', targetState: PREP_COOKED, label: 'Seared Salmon' },
      { ingredient: 'lemon', targetState: PREP_CHOPPED, label: 'Sliced Lemon' },
      { ingredient: 'basil', targetState: PREP_CHOPPED, label: 'Herb Glaze' },
    ],
  },
  {
    id: 'margherita-pizza',
    name: 'Woodfire Margherita',
    shortName: 'Margherita',
    reward: 52,
    patience: 45,
    accent: '#c84b31',
    steps: [
      { ingredient: 'dough', targetState: PREP_COOKED, label: 'Baked Crust' },
      { ingredient: 'tomato', targetState: PREP_CHOPPED, label: 'Crushed Tomato' },
      { ingredient: 'basil', targetState: PREP_CHOPPED, label: 'Fresh Basil' },
    ],
  },
  {
    id: 'truffle-noodles',
    name: 'Truffle Silk Noodles',
    shortName: 'Truffle Noodles',
    reward: 56,
    patience: 46,
    accent: '#a98443',
    steps: [
      { ingredient: 'noodles', targetState: PREP_COOKED, label: 'Silky Noodles' },
      { ingredient: 'truffle', targetState: PREP_CHOPPED, label: 'Diced Truffle' },
      { ingredient: 'egg', targetState: PREP_COOKED, label: 'Poached Yolk' },
    ],
  },
];

export function getRecipeById(recipeId) {
  return RECIPES.find((recipe) => recipe.id === recipeId) ?? RECIPES[0];
}

export function getRequiredReadyState(ingredientId) {
  const def = INGREDIENTS[ingredientId];
  if (!def) return PREP_RAW;
  if (def.needsCook) return PREP_COOKED;
  if (def.needsChop) return PREP_CHOPPED;
  return PREP_RAW;
}

export function createIngredientItem(ingredientId, state = PREP_RAW) {
  return {
    kind: 'ingredient',
    ingredientId,
    state,
  };
}

export function createOrderTicket(ticketNumber, recipe, rushScale = 1) {
  const maxPatience = Math.max(28, Math.round(recipe.patience / rushScale));
  return {
    id: ticketNumber,
    recipeId: recipe.id,
    recipe,
    patience: maxPatience,
    maxPatience,
    reward: recipe.reward,
    pulse: 0,
  };
}

export function findMatchingRecipesForItem(item, orders) {
  if (!item || item.kind !== 'ingredient' || item.state === PREP_BURNT) return [];
  const matches = [];
  for (const order of orders) {
    const step = order.recipe.steps.find(
      (s) => s.ingredient === item.ingredientId && s.targetState === item.state
    );
    if (step) matches.push(order.recipe);
  }
  if (matches.length > 0) return matches;
  return RECIPES.filter((recipe) =>
    recipe.steps.some((s) => s.ingredient === item.ingredientId && s.targetState === item.state)
  );
}

export function checkIngredientFitsAssembly(assembly, item, orders) {
  if (!item || item.kind !== 'ingredient' || item.state === PREP_BURNT) {
    return { ok: false, reason: 'Finish prepping or discard burnt food first.' };
  }
  if (!assembly) {
    const candidates = findMatchingRecipesForItem(item, orders);
    if (candidates.length === 0) {
      return { ok: false, reason: 'Prep this ingredient before plating.' };
    }
    return { ok: true, recipe: candidates[0] };
  }
  const recipe = getRecipeById(assembly.recipeId);
  const alreadyAdded = new Set(assembly.addedIngredients);
  const neededStep = recipe.steps.find(
    (s) => s.ingredient === item.ingredientId && s.targetState === item.state && !alreadyAdded.has(s.ingredient)
  );
  if (!neededStep) {
    return { ok: false, reason: `${recipe.shortName} needs other prepped ingredients.` };
  }
  return { ok: true, recipe };
}

export function advanceDishAssembly(assembly, item, orders) {
  const check = checkIngredientFitsAssembly(assembly, item, orders);
  if (!check.ok) return { ok: false, assembly, completedPlate: null, reason: check.reason };

  const recipe = check.recipe;
  const added = assembly ? [...assembly.addedIngredients, item.ingredientId] : [item.ingredientId];
  const nextAssembly = {
    kind: 'assembly',
    recipeId: recipe.id,
    addedIngredients: added,
    totalSteps: recipe.steps.length,
  };

  if (added.length >= recipe.steps.length) {
    return {
      ok: true,
      assembly: null,
      completedPlate: {
        kind: 'plate',
        recipeId: recipe.id,
        quality: 1,
      },
      reason: `${recipe.shortName} plated! Take to Service Pass.`,
    };
  }

  return {
    ok: true,
    assembly: nextAssembly,
    completedPlate: null,
    reason: `Added ${INGREDIENTS[item.ingredientId].short} to ${recipe.shortName} (${added.length}/${recipe.steps.length}).`,
  };
}

export function isPlateReadyToServe(item, orders) {
  if (!item || item.kind !== 'plate') return null;
  return orders.find((order) => order.recipeId === item.recipeId) ?? null;
}
