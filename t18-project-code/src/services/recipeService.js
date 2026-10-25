import recipes from "../data/recipes.json";

import {
  recommendRecipes,
} from "./recommendationService.js";

// Return all recipes from the bundled database.
export async function getRecipes() {
  return recipes;
}

// Find a recipe by its ID.
export async function getRecipeDetails(id) {
  const recipe = recipes.find(
    (item) => item.id === id
  );

  if (!recipe) {
    throw new Error(`Recipe not found: ${id}`);
  }

  return recipe;
}

// Get all available cuisines.
export async function getCuisines() {
  return [
    ...new Set(
      recipes
        .map((recipe) => recipe.cuisine)
        .filter(Boolean)
    ),
  ].sort();
}

// Recommend recipes based on members and equipment.
export async function getRecommendedRecipes(
  members,
  equipment = null
) {
  return recommendRecipes(
    recipes,
    members,
    equipment
  );
}