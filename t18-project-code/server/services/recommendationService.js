
const MAX_RESULTS = 12;

const ASIAN_CUISINES = new Set([
  "asian",
  "japanese",
  "thai",
  "indonesian",
  "korean",
  "vietnamese",
  "chinese",
]);

const DIFFICULTY = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const INGREDIENT_GROUPS = {
  rice: ["rice"],
  chicken: ["chicken"],
  pasta: ["pasta", "spaghetti", "penne"],
  vegetables: [
    "vegetable", "broccoli", "carrot", "spinach",
    "capsicum", "zucchini", "lettuce", "cabbage",
    "bok choy", "green beans", "peas", "pumpkin",
    "cucumber", "mushroom",
  ],
  egg: ["egg"],
  potato: ["potato"],
  tomato: ["tomato"],
  chickpeas: ["chickpea"],
};

const ALLERGEN_RULES = {
  "no soy": "soy",
  "no wheat": "wheat",
  "no egg": "egg",
};

function normalise(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    return [value];
  }
  return [];
}

function parseLimit(value) {
  if (typeof value === "number") return value;

  const numbers = String(value ?? "")
    .match(/\d+(?:\.\d+)?/g)
    ?.map(Number);

  if (!numbers?.length) return null;

  // "$8–12 per person" => 12
  // "Under $8" => 8
  return Math.max(...numbers);
}

function difficultyRank(value) {
  return DIFFICULTY[normalise(value)] || 1;
}

function ingredientMatches(recipe, selectedIngredient) {
  const key = normalise(selectedIngredient);
  const terms = INGREDIENT_GROUPS[key] || [key];

  if (!key) return false;

  return toArray(recipe.ingredients).some((ingredient) => {
    const name = normalise(
      typeof ingredient === "string"
        ? ingredient
        : ingredient.name
    );

    return terms.some((term) => name.includes(term));
  });
}

function cuisineMatches(recipeCuisine, chosenCuisine) {
  const recipe = normalise(recipeCuisine);
  const chosen = normalise(chosenCuisine);

  if (!chosen || chosen === "any") return false;

  if (recipe === chosen) return true;

  if (chosen === "asian") {
    return ASIAN_CUISINES.has(recipe);
  }

  return false;
}

function meetsDietaryRequirements(recipe, members) {
  const tags = new Set(
    toArray(recipe.dietaryTags).map(normalise)
  );

  const allergens = new Set(
    toArray(recipe.allergens).map(normalise)
  );

  for (const member of members) {
    for (const rawRestriction of toArray(member.dietary)) {
      const restriction = normalise(rawRestriction);

      if (
        !restriction ||
        restriction === "any" ||
        restriction === "no allergies"
      ) {
        continue;
      }

      if (restriction === "vegetarian") {
        if (!tags.has("vegetarian") && !tags.has("vegan")) {
          return false;
        }
      } else if (restriction === "vegan") {
        if (!tags.has("vegan")) return false;
      } else if (restriction === "dairy free") {
        if (!tags.has("dairy free")) return false;
      } else if (restriction === "gluten free") {
        if (!tags.has("gluten free")) return false;
      } else if (ALLERGEN_RULES[restriction]) {
        const allergen = ALLERGEN_RULES[restriction];

        // The prototype database has some unverified
        // allergen labels. Require an explicit "No X"
        // tag instead of assuming missing data is safe.
        const verifiedTag = tags.has(restriction);

        if (allergens.has(allergen) || !verifiedTag) {
          return false;
        }
      } else {
        // Unknown restriction: do not silently ignore it.
        return false;
      }
    }
  }

  return true;
}

function meetsEquipmentRequirements(recipe, equipment) {
  if (!Array.isArray(equipment) || equipment.length === 0) {
    return true;
  }

  const available = new Set(equipment.map(normalise));

  return toArray(recipe.equipment).every((required) =>
    available.has(normalise(required))
  );
}

function scoreRecipe(recipe, members) {
  let score = 0;

  const counts = {
    cuisine: 0,
    ingredients: 0,
    budget: 0,
    time: 0,
    difficulty: 0,
  };

  const recipeCost = Number(recipe.costPerPerson);
  const recipeMinutes = Number(recipe.minutes);
  const recipeDifficulty = difficultyRank(recipe.difficulty);

  for (const member of members) {
    if (cuisineMatches(recipe.cuisine, member.cuisine)) {
      score += 8;
      counts.cuisine++;
    }

    const likes = new Set(
      toArray(member.foodLikes).map(normalise)
    );

    for (const like of likes) {
      if (ingredientMatches(recipe, like)) {
        score += 3;
        counts.ingredients++;
      }
    }

    const budget = parseLimit(member.budget);

    if (budget !== null && Number.isFinite(recipeCost)) {
      if (recipeCost <= budget) {
        score += 4;
        counts.budget++;
      } else {
        score -= 8;
      }
    }

    const time = parseLimit(member.cookingTime);

    if (time !== null && Number.isFinite(recipeMinutes)) {
      if (recipeMinutes <= time) {
        score += 4;
        counts.time++;
      } else {
        score -= 8;
      }
    }

    if (member.difficulty) {
      if (
        recipeDifficulty <= difficultyRank(member.difficulty)
      ) {
        score += 3;
        counts.difficulty++;
      } else {
        score -= 5;
      }
    }
  }

  const reasons = [];

  if (counts.cuisine > 0) {
    reasons.push(
      `Matches ${counts.cuisine} cuisine preference(s)`
    );
  }

  if (counts.ingredients > 0) {
    reasons.push(
      `${counts.ingredients} favourite ingredient match(es)`
    );
  }

  if (members.length && counts.budget === members.length) {
    reasons.push("Fits everyone's selected budget");
  }

  if (members.length && counts.time === members.length) {
    reasons.push("Fits everyone's cooking time");
  }

  if (
    members.length &&
    counts.difficulty === members.length
  ) {
    reasons.push("Fits everyone's difficulty level");
  }

  return {
    ...recipe,
    matchScore: score,
    matchReasons: reasons,
  };
}

function recommendRecipes(recipes, members = [], equipment = null) {
  if (!Array.isArray(recipes)) {
    throw new Error("Recipes must be an array.");
  }

  if (!Array.isArray(members)) {
    throw new Error("Members must be an array.");
  }

  return recipes
    .filter((recipe) =>
      meetsDietaryRequirements(recipe, members) &&
      meetsEquipmentRequirements(recipe, equipment)
    )
    .map((recipe) => scoreRecipe(recipe, members))
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        a.title.localeCompare(b.title)
    )
    .slice(0, MAX_RESULTS);
}

export {
  recommendRecipes,
};
