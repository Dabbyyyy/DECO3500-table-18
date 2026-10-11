
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RECIPES_PATH = path.join(__dirname, "data", "recipes.json");
const REPORT_PATH = path.join(__dirname, "data", "image-review.json");

const SEARCH_DELAY_MS = 3500;
const MAX_RETRIES = 4;

const REVIEW_RECIPES = {
  "sweet-potato-burrito-bowl": [
    "sweet potato black bean burrito bowl",
    "vegetarian burrito bowl",
    "sweet potato rice bowl",
  ],
  "lentil-bolognese": [
    "lentil bolognese pasta",
    "vegan spaghetti bolognese",
    "vegetarian bolognese spaghetti",
  ],
  "greek-chicken-rice-bowl": [
    "Greek chicken souvlaki rice bowl",
    "chicken souvlaki rice",
    "Greek chicken bowl",
  ],
  "korean-beef-lettuce-cups": [
    "Korean beef lettuce wraps",
    "bulgogi lettuce wraps",
    "ssam beef lettuce",
  ],
  "vietnamese-chicken-noodle-bowl": [
    "Vietnamese chicken vermicelli bowl",
    "bun ga Vietnamese noodles",
    "Vietnamese chicken rice noodles",
  ],
  "japanese-vegetable-rice-bowl": [
    "Japanese vegetable donburi",
    "vegetarian Japanese rice bowl",
    "vegetable rice bowl",
  ],
  "vegetable-sushi-bowl": [
    "vegetarian sushi bowl",
    "vegan poke bowl",
    "sushi rice bowl vegetables",
  ],
  "thai-green-vegetable-curry": [
    "Thai green vegetable curry",
    "vegetarian green curry rice",
    "Thai green curry vegetables",
  ],
  "thai-peanut-noodles": [
    "Thai peanut noodles",
    "peanut sauce noodles",
    "vegetarian satay noodles",
  ],
  "indonesian-tempeh-rice-bowl": [
    "Indonesian tempeh rice",
    "tempeh rice bowl",
    "tempeh goreng nasi",
  ],
  "red-lentil-dal": [
    "red lentil dal",
    "masoor dal curry",
    "Indian lentil dal",
  ],
  "pesto-vegetable-pasta": [
    "vegetarian pesto pasta",
    "pesto pasta vegetables",
    "basil pesto spaghetti",
  ],
  "lemon-potato-tray-bake": [
    "Greek lemon roasted potatoes",
    "lemon herb baked potatoes",
    "Greek lemon potatoes",
  ],
  "caprese-chickpea-salad": [
    "caprese chickpea salad",
    "chickpea tomato mozzarella salad",
    "chickpea caprese",
  ],
  "greek-chickpea-salad": [
    "Greek chickpea salad feta",
    "Mediterranean chickpea cucumber salad",
    "Greek chickpea cucumber tomato salad",
  ],
  "moroccan-chicken-couscous": [
    "Moroccan chicken couscous",
    "chicken couscous Moroccan",
    "Moroccan chicken vegetable couscous",
  ],
  "lemon-herb-chicken-couscous": [
    "lemon chicken couscous",
    "herb chicken couscous",
    "chicken couscous salad",
  ],
};

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const recipes = JSON.parse(
  fs.readFileSync(RECIPES_PATH, "utf8")
);

let report = [];

if (fs.existsSync(REPORT_PATH)) {
  report = JSON.parse(
    fs.readFileSync(REPORT_PATH, "utf8")
  );
}

function saveFiles() {
  fs.writeFileSync(
    RECIPES_PATH,
    JSON.stringify(recipes, null, 2) + "\n"
  );

  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(report, null, 2) + "\n"
  );
}

function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

function validLicense(license) {
  const value = license.toLowerCase();

  return (
    value.includes("cc by") ||
    value.includes("cc0") ||
    value.includes("public domain")
  );
}

function isFoodPhoto(filename) {
  const name = filename.toLowerCase();

  const excluded = [
    ".svg",
    ".pdf",
    ".gif",
    "drawing",
    "painting",
    "illustration",
    "logo",
    "poster",
    "advertisement",
    "recalled",
    "recall notice",
    "food safety alert",
  ];

  return !excluded.some((word) => name.includes(word));
}

let lastRequestTime = 0;

async function requestCommons(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1000",
    format: "json",
    maxlag: "5",
  });

  const url =
    "https://commons.wikimedia.org/w/api.php?" +
    params.toString();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const elapsed = Date.now() - lastRequestTime;

    if (elapsed < SEARCH_DELAY_MS) {
      await sleep(SEARCH_DELAY_MS - elapsed);
    }

    lastRequestTime = Date.now();

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "ktchn-recipe-image-review/1.0 (educational prototype)",
          Accept: "application/json",
        },
      });

      if (response.status === 429 || response.status === 503) {
        const retryAfter = Number(
          response.headers.get("retry-after")
        );

        const delay =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : (attempt + 1) * 10000;

        console.log(
          `Rate limited. Waiting ${Math.ceil(delay / 1000)} seconds...`
        );

        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(
          data.error.info || data.error.code || "API error"
        );
      }

      return Object.values(data.query?.pages || {});
    } catch (error) {
      console.log(`Search error: ${error.message}`);

      if (attempt === MAX_RETRIES - 1) {
        return [];
      }

      await sleep((attempt + 1) * 8000);
    }
  }

  return [];
}

function parseCandidates(pages) {
  return pages
    .map((page) => {
      const info = page.imageinfo?.[0];

      if (!info) return null;

      const metadata = info.extmetadata || {};

      const license = cleanText(
        metadata.LicenseShortName?.value || ""
      );

      const credit = cleanText(
        metadata.Artist?.value || ""
      );

      const filename = page.title.replace(/^File:/, "");

      const image = info.thumburl || info.url;

      if (!image) return null;
      if (!validLicense(license)) return null;
      if (!isFoodPhoto(filename)) return null;

      return {
        title: filename,
        image,
        imageSourcePage:
          info.descriptionurl ||
          `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        imageCredit: credit,
        imageLicense: license,
      };
    })
    .filter(Boolean);
}

function updateRecipe(recipe, candidate) {
  recipe.image = candidate.image;

  let entry = report.find((item) => item.id === recipe.id);

  if (!entry) {
    entry = {
      id: recipe.id,
      title: recipe.title,
    };

    report.push(entry);
  }

  entry.image = candidate.image;
  entry.imageSourcePage = candidate.imageSourcePage;
  entry.imageCredit = candidate.imageCredit;
  entry.imageLicense = candidate.imageLicense;
  entry.status = "Manually selected; visual review required";

  saveFiles();
}

async function findCandidates(queries) {
  const found = [];
  const seen = new Set();

  for (const query of queries) {
    console.log(`\nSearching: ${query}`);

    const pages = await requestCommons(query);
    const candidates = parseCandidates(pages);

    for (const candidate of candidates) {
      if (seen.has(candidate.imageSourcePage)) continue;

      seen.add(candidate.imageSourcePage);
      found.push(candidate);
    }

    if (found.length >= 5) break;
  }

  return found;
}

async function reviewRecipe(recipe) {
  const queries = REVIEW_RECIPES[recipe.id];

  console.log("\n==================================");
  console.log(`RECIPE: ${recipe.title}`);
  console.log("==================================");

  if (recipe.image) {
    console.log("\nCurrent image:");
    console.log(recipe.image);
  } else {
    console.log("\nCurrent image: MISSING");
  }

  let searchIndex = 0;

  while (searchIndex < queries.length) {
    const candidates = await findCandidates([
      queries[searchIndex],
    ]);

    if (candidates.length === 0) {
      console.log("No suitable results for this search.");
      searchIndex++;
      continue;
    }

    console.log("\nIMAGE CANDIDATES\n");

    const choices = candidates.slice(0, 5);

    choices.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.title}`);
      console.log(`   Preview: ${candidate.image}`);
      console.log(`   Source: ${candidate.imageSourcePage}`);
      console.log(`   License: ${candidate.imageLicense}`);
      console.log("");
    });

    const answer = (
      await rl.question(
        "Choose 1-5, n=next search, s=skip, q=quit: "
      )
    )
      .trim()
      .toLowerCase();

    if (answer === "q") {
      return "quit";
    }

    if (answer === "s") {
      return "skip";
    }

    if (answer === "n") {
      searchIndex++;
      continue;
    }

    const selectedIndex = Number(answer) - 1;

    if (
      Number.isInteger(selectedIndex) &&
      selectedIndex >= 0 &&
      selectedIndex < choices.length
    ) {
      const selected = choices[selectedIndex];

      console.log("\nSelected image:");
      console.log(selected.imageSourcePage);

      const confirm = (
        await rl.question(
          "Have you checked the photo? Save it? (y/n): "
        )
      )
        .trim()
        .toLowerCase();

      if (confirm === "y") {
        updateRecipe(recipe, selected);
        console.log("Image saved successfully.");
        return "saved";
      }

      continue;
    }

    console.log("Invalid choice. Try again.");
  }

  console.log("No image selected for this recipe.");
  return "skip";
}

async function main() {
  console.log("\nKTCHN RECIPE IMAGE REVIEW");
  console.log("---------------------------");

  const targets = recipes.filter(
    (recipe) => REVIEW_RECIPES[recipe.id]
  );

  console.log(`Recipes to review: ${targets.length}`);

  for (let i = 0; i < targets.length; i++) {
    console.log(
      `\nProgress: ${i + 1}/${targets.length}`
    );

    const result = await reviewRecipe(targets[i]);

    if (result === "quit") {
      console.log("\nReview stopped. Saved changes are kept.");
      break;
    }
  }

  const imageCount = recipes.filter(
    (recipe) => Boolean(recipe.image)
  ).length;

  console.log("\nIMAGE REVIEW SUMMARY");
  console.log("---------------------------");
  console.log(`Total recipes: ${recipes.length}`);
  console.log(`Recipes with images: ${imageCount}`);
  console.log(
    `Still missing: ${recipes.length - imageCount}`
  );
  console.log("\nChanges saved to:");
  console.log(RECIPES_PATH);
  console.log(REPORT_PATH);
}

try {
  await main();
} catch (error) {
  console.error("\nUnexpected error:", error);
} finally {
  rl.close();
}
