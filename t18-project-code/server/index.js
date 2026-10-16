
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

// Load server/.env before reading PORT or API keys.
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
      novaConfigured: Boolean(
        process.env.OPENAI_API_KEY
      ),
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
// NOVA - OPENAI COOKING ASSISTANT
// ==========================================

app.post("/api/cooking-help", async (req, res) => {
  const {
    question,
    recipe = null,
    task = null,
    currentStep = null,
    equipment = {},
  } = req.body || {};

  // Validate question
  if (
    typeof question !== "string" ||
    !question.trim()
  ) {
    return res.status(400).json({
      error: "A cooking question is required.",
    });
  }

  // Check OpenAI configuration
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error:
        "Nova AI is not configured on the server.",
      code: "AI_NOT_CONFIGURED",
    });
  }

  // Available kitchen equipment
  const availableEquipment =
    equipment &&
    typeof equipment === "object" &&
    !Array.isArray(equipment)
      ? Object.entries(equipment)
          .filter(([, available]) =>
            Boolean(available)
          )
          .map(([name]) => name)
      : [];

  // Build cooking context
  const cookingContext = {
    recipe: recipe
      ? {
          title:
            recipe.title ||
            recipe.name ||
            "Unknown recipe",
          ingredients:
            recipe.ingredients || [],
          allergens:
            recipe.allergens || [],
        }
      : null,

    task: task
      ? {
          title:
            task.title ||
            task.name ||
            "Current task",
          steps:
            task.steps || [],
        }
      : null,

    currentStep,
    availableEquipment,
    question: question.trim().slice(0, 500),
  };

  try {
    // Send request to OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${process.env.OPENAI_API_KEY}`,
        },

        body: JSON.stringify({
          model:
            process.env.OPENAI_MODEL ||
            "gpt-4.1-mini",

          messages: [
            {
              role: "system",
              content: `
You are Nova, a friendly AI cooking
assistant for the ktchn group cooking app.

Your role is to help students cook
together confidently and safely.

Guidelines:

1. Answer cooking questions clearly.
2. Keep responses short and practical.
3. Use simple, conversational English.
4. Give instructions that are easy to
   understand when spoken aloud.
5. Use the recipe and task context
   provided by the application.
6. Help users understand cooking
   techniques, ingredients, and timing.
7. Give safe food handling advice
   when necessary.
8. Do not automatically complete,
   skip, or advance cooking tasks.
9. Do not claim to control timers,
   devices, or kitchen equipment.
10. If information is missing,
    ask a short follow-up question.

Respond in 1 to 3 short sentences.
Avoid unnecessary explanations.
              `.trim(),
            },

            {
              role: "user",
              content:
                JSON.stringify(cookingContext),
            },
          ],

          max_tokens: 180,
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    // Handle OpenAI errors
    if (!response.ok) {
      console.error(
        "OpenAI API error:",
        JSON.stringify(
          {
            status: response.status,
            error: data?.error,
          },
          null,
          2
        )
      );

      return res.status(502).json({
        error:
          "Nova could not answer right now.",
      });
    }

    // Extract Nova's answer
    const answer =
      data?.choices?.[0]?.message?.content;

    if (
      typeof answer !== "string" ||
      !answer.trim()
    ) {
      console.error(
        "Nova returned an empty answer:",
        data
      );

      return res.status(502).json({
        error:
          "Nova returned an empty answer.",
      });
    }

    // Return answer to React frontend
    return res.json({
      answer: answer.trim(),
    });
  } catch (error) {
    console.error(
      "Nova connection failed:",
      error
    );

    return res.status(502).json({
      error:
        "Nova could not connect to OpenAI.",
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

  console.log(
    `Nova AI: ${
      process.env.OPENAI_API_KEY
        ? "Configured with OpenAI"
        : "Missing OPENAI_API_KEY"
    }`
  );

  console.log(
    `OpenAI model: ${
      process.env.OPENAI_MODEL ||
      "gpt-4.1-mini"
    }`
  );
});
