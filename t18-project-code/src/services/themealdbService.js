const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TheMealDB request failed (${response.status}).`);
  }

  return response.json();
}

// Remove duplicate API values and sort them alphabetically.
function cleanList(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export async function getAreas() {
  const data = await fetchJson(`${BASE_URL}/list.php?a=list`);

  return cleanList(
    (data.meals || []).map((item) => item.strArea?.trim())
  );
}

export async function getCategories() {
  const data = await fetchJson(`${BASE_URL}/list.php?c=list`);

  return cleanList(
    (data.meals || []).map((item) => item.strCategory?.trim())
  );
}

export async function getIngredients() {
  const data = await fetchJson(`${BASE_URL}/list.php?i=list`);

  return cleanList(
    (data.meals || []).map((item) => item.strIngredient?.trim())
  );
}

async function filterMeals(type, value) {
  if (!value || value === "Any") {
    return null;
  }

  const encoded = encodeURIComponent(value);

  const data = await fetchJson(
    `${BASE_URL}/filter.php?${type}=${encoded}`
  );

  return data.meals || [];
}

function intersectMealLists(lists) {
  const activeLists = lists.filter(Array.isArray);

  if (activeLists.length === 0) {
    return [];
  }

  const [first, ...rest] = activeLists;

  return first.filter((meal) =>
    rest.every((list) =>
      list.some((otherMeal) => otherMeal.idMeal === meal.idMeal)
    )
  );
}

export async function findMeals({
  area = "Any",
  category = "Any",
  ingredient = "Any",
} = {}) {
  const activeFilters = [
    area !== "Any",
    category !== "Any",
    ingredient !== "Any",
  ].filter(Boolean).length;

  // No filters selected: show a few random meals.
  if (activeFilters === 0) {
    const requests = Array.from({ length: 6 }, () =>
      fetchJson(`${BASE_URL}/random.php`)
    );

    const results = await Promise.all(requests);

    const uniqueMeals = [];

    results.forEach((result) => {
      const meal = result.meals?.[0];

      if (
        meal &&
        !uniqueMeals.some(
          (existingMeal) => existingMeal.idMeal === meal.idMeal
        )
      ) {
        uniqueMeals.push(meal);
      }
    });

    return uniqueMeals.map(normaliseMeal);
  }

  // The free API filters one dimension at a time.
  // We fetch each chosen filter and find the meals shared by all lists.
  const [areaMeals, categoryMeals, ingredientMeals] =
    await Promise.all([
      filterMeals("a", area),
      filterMeals("c", category),
      filterMeals("i", ingredient),
    ]);

  const matches = intersectMealLists([
    areaMeals,
    categoryMeals,
    ingredientMeals,
  ]);

  return matches.slice(0, 12).map(normaliseMeal);
}

export async function getMealDetails(idMeal) {
  const data = await fetchJson(
    `${BASE_URL}/lookup.php?i=${encodeURIComponent(idMeal)}`
  );

  const meal = data.meals?.[0];

  if (!meal) {
    throw new Error("Could not load this meal.");
  }

  return normaliseMeal(meal);
}

export function normaliseMeal(meal) {
  const ingredients = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim();
    const measure = meal[`strMeasure${index}`]?.trim();

    if (ingredient) {
      ingredients.push({
        ingredient,
        measure: measure || "",
      });
    }
  }

  return {
    id: meal.idMeal,
    idMeal: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    area: meal.strArea || "",
    category: meal.strCategory || "",
    instructions: meal.strInstructions || "",
    youtube: meal.strYoutube || "",
    source: meal.strSource || "",
    ingredients,
  };
}