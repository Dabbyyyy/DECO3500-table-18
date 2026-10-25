import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  recommendRecipes,
} from "./services/recommendationService.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// ENVIRONMENT VARIABLES
// ==========================================

// Load optional server/.env configuration before reading PORT.
// Requires Node.js 20.12 or newer.
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(path.join(__dirname, ".env"));
  } catch (error) {
    console.warn(
      "No server/.env file loaded. Using existing environment variables."
    );
  }
}

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// RECIPE DATABASE
// ==========================================

const RECIPES_FILE = path.join(
  __dirname,
  "data",
  "recipes.json"
);

function loadRecipes() {
  const contents = fs.readFileSync(
    RECIPES_FILE,
    "utf8"
  );

  const recipes = JSON.parse(contents);

  if (!Array.isArray(recipes)) {
    throw new Error(
      "recipes.json must contain an array of recipes."
    );
  }

  return recipes;
}

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  try {
    const recipes = loadRecipes();

    res.json({
      status: "ok",
      service: "ktchn Recipe API",
      recipeCount: recipes.length,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// ==========================================
// GET ALL RECIPES
// ==========================================

app.get("/api/recipes", (req, res) => {
  try {
    res.json(loadRecipes());
  } catch (error) {
    res.status(500).json({
      error: "Could not load recipes.",
      message: error.message,
    });
  }
});

// ==========================================
// GET AVAILABLE CUISINES
// ==========================================

app.get("/api/cuisines", (req, res) => {
  try {
    const cuisines = [
      ...new Set(
        loadRecipes()
          .map((recipe) => recipe.cuisine)
          .filter(Boolean)
      ),
    ].sort();

    res.json({
      cuisines,
      total: cuisines.length,
    });
  } catch (error) {
    res.status(500).json({
      error: "Could not load cuisines.",
    });
  }
});

// ==========================================
// RECIPE RECOMMENDATIONS
// ==========================================

app.post("/api/recipes/recommend", (req, res) => {
  try {
    const {
      members,
      equipment = null,
    } = req.body || {};

    if (!Array.isArray(members)) {
      return res.status(400).json({
        error: "members must be an array.",
      });
    }

    const recipes = loadRecipes();

    const recommendations = recommendRecipes(
      recipes,
      members,
      equipment
    );

    res.json({
      recommendations,
      total: recommendations.length,
      databaseSize: recipes.length,
      message:
        recommendations.length === 0
          ? "No recipes matched the requirements."
          : "Recommendations generated successfully.",
      dietaryNotice:
        "Prototype recipes are not verified for allergy safety. Check ingredient labels and cross-contact risks.",
    });
  } catch (error) {
    console.error(
      "Recommendation error:",
      error
    );

    res.status(500).json({
      error: "Could not generate recommendations.",
      message: error.message,
    });
  }
});

// ==========================================
// GET RECIPE BY ID
// ==========================================

app.get("/api/recipes/:id", (req, res) => {
  try {
    const recipes = loadRecipes();

    const recipe = recipes.find(
      (item) => item.id === req.params.id
    );

    if (!recipe) {
      return res.status(404).json({
        error: "Recipe not found.",
      });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({
      error: "Could not load recipe details.",
      message: error.message,
    });
  }
});

// ==========================================
// START BACKEND SERVER
// ==========================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `ktchn Recipe API running on port ${PORT}`
  );
});