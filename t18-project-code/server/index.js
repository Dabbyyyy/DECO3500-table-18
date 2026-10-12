
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  recommendRecipes,
} from "./services/recommendationService.js";

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Node 20.12+ can load a local .env without another dependency.
// Deployment environments can provide the same values directly.
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(path.join(__dirname, ".env"));
  } catch {
    // A local .env is optional. Never fall back to a client-side key.
  }
}

app.use(cors());
app.use(express.json());

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

// Check that the API is running.
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

// Get all recipes.
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

// Get available cuisines.
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

// Generate recommendations for the group.
app.post("/api/recipes/recommend", (req, res) => {
  try {
    const { members, equipment = null } = req.body || {};

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
          ? "No recipes matched the dietary and equipment requirements."
          : "Recommendations generated successfully.",
      dietaryNotice:
        "Prototype recipe data is not verified for allergy safety. Check ingredient labels and cross-contact risks.",
    });
  } catch (error) {
    console.error("Recommendation error:", error);

    res.status(500).json({
      error: "Could not generate recommendations.",
      message: error.message,
    });
  }
});

// Give short, contextual answers to hands-free cooking questions.
// The API key stays on the Express server and is never returned to React.
app.post("/api/cooking-help", async (req, res) => {
  const {
    question,
    recipe = null,
    task = null,
    currentStep = null,
    equipment = {},
  } = req.body || {};

  if (!question || typeof question !== "string") {
    return res.status(400).json({
      error: "A cooking question is required.",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: "Nova AI is not configured on the server.",
      code: "AI_NOT_CONFIGURED",
    });
  }

  const availableEquipment = Object.entries(equipment)
    .filter(([, available]) => Boolean(available))
    .map(([name]) => name);

  const cookingContext = {
    recipe: recipe
      ? {
          title: recipe.title || recipe.name,
          ingredients: recipe.ingredients || [],
          allergens: recipe.allergens || [],
        }
      : null,
    task: task
      ? {
          title: task.title || task.name,
          steps: task.steps || [],
        }
      : null,
    currentStep,
    availableEquipment,
    question: question.slice(0, 500),
  };

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
          messages: [
            {
              role: "system",
              content:
                "You are Nova, a hands-free cooking helper. Answer in no more than three short, practical sentences using the supplied recipe, current step, and equipment. Never change or advance a task. For food-safety questions, be cautious, recommend an appropriate food thermometer when relevant, and say when the cook should check authoritative local guidance rather than guessing.",
            },
            {
              role: "user",
              content: JSON.stringify(cookingContext),
            },
          ],
          max_tokens: 180,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini cooking helper error:", {
        status: response.status,
        requestId:
          response.headers.get("x-request-id") ||
          response.headers.get("x-goog-request-id"),
        message: data?.error?.message,
      });

      return res.status(502).json({
        error: "Nova could not answer right now.",
      });
    }

    const answer = data.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(502).json({
        error: "Nova returned an empty answer.",
      });
    }

    return res.json({ answer });
  } catch (error) {
    console.error("Cooking helper request failed:", error);

    return res.status(502).json({
      error: "Nova could not connect to the AI service.",
    });
  }
});

// Get one recipe by ID.
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `ktchn Recipe API running on port ${PORT}`
  );
});
