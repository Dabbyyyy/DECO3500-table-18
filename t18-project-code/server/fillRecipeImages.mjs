
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RECIPES_PATH = path.join(
  __dirname,
  "data",
  "recipes.json"
);

const REPORT_PATH = path.join(
  __dirname,
  "data",
  "image-review.json"
);

const API = "https://commons.wikimedia.org/w/api.php";

const REQUEST_DELAY = 6000;
const MAX_RETRIES = 4;

const BAD_MATCHES = new Set([
  "ginger-tofu-stir-fry",
  "vietnamese-chicken-noodle-bowl",
  "vietnamese-fresh-spring-rolls",
]);

const SEARCH_ALIASES = {
  "chicken-katsu-rice": [
    "chicken katsu",
    "chicken cutlet rice",
  ],
  "tofu-teriyaki-bowl": [
    "teriyaki tofu",
    "tofu rice bowl",
  ],
  "japanese-vegetable-rice-bowl": [
    "japanese vegetable rice",
    "vegetable donburi",
  ],
  "vegetable-sushi-bowl": [
    "sushi bowl",
    "vegetarian chirashi sushi",
  ],
  "ginger-tofu-stir-fry": [
    "ginger tofu stir fry",
    "tofu stir fry",
  ],
  "thai-basil-chicken": [
    "pad kra pao",
    "thai basil chicken",
  ],
  "thai-green-vegetable-curry": [
    "thai green curry",
    "green vegetable curry",
  ],
  "thai-peanut-noodles": [
    "thai peanut noodles",
    "peanut noodles",
  ],
  "thai-coconut-tofu-soup": [
    "tom kha tofu",
    "thai coconut soup",
  ],
  "indonesian-nasi-goreng": [
    "nasi goreng",
    "indonesian fried rice",
  ],
  "indonesian-tempeh-rice-bowl": [
    "tempeh rice bowl",
    "tempeh with rice",
  ],
  "gado-gado-inspired-bowl": [
    "gado gado",
    "indonesian vegetable salad",
  ],
  "soto-ayam-inspired-soup": [
    "soto ayam",
    "indonesian chicken soup",
  ],
  "indian-chana-masala": [
    "chana masala",
    "chickpea curry",
  ],
  "red-lentil-dal": [
    "red lentil dal",
    "masoor dal",
  ],
  "palak-tofu": [
    "palak tofu",
    "palak paneer",
  ],
  "chicken-tikka-rice-bowl": [
    "chicken tikka rice",
    "chicken tikka",
  ],
  "potato-pea-curry": [
    "aloo matar",
    "potato pea curry",
  ],
  "mexican-black-bean-tacos": [
    "black bean tacos",
    "vegetarian tacos",
  ],
  "chicken-fajita-rice-bowl": [
    "chicken fajita bowl",
    "chicken fajitas",
  ],
  "bean-and-corn-quesadillas": [
    "bean quesadilla",
    "corn quesadilla",
  ],
  "sweet-potato-burrito-bowl": [
    "sweet potato burrito bowl",
    "vegetarian burrito bowl",
  ],
  "mexican-lentil-tacos": [
    "lentil tacos",
    "vegetarian tacos",
  ],
  "pesto-vegetable-pasta": [
    "pesto pasta",
    "vegetable pesto pasta",
  ],
  "creamy-mushroom-pasta": [
    "mushroom pasta",
    "creamy mushroom pasta",
  ],
  "lentil-bolognese": [
    "lentil bolognese",
    "vegetarian bolognese",
  ],
  "caprese-chickpea-salad": [
    "chickpea caprese salad",
    "chickpea salad",
  ],
  "vegetable-risotto": [
    "vegetable risotto",
    "mushroom risotto",
  ],
  "greek-chicken-rice-bowl": [
    "greek chicken rice",
    "greek chicken bowl",
  ],
  "greek-chickpea-salad": [
    "greek chickpea salad",
    "chickpea salad",
  ],
  "lemon-potato-tray-bake": [
    "greek lemon potatoes",
    "roasted lemon potatoes",
  ],
  "mediterranean-couscous-bowl": [
    "mediterranean couscous",
    "couscous salad",
  ],
  "hummus-roasted-veg-wrap": [
    "hummus vegetable wrap",
    "vegetarian wrap",
  ],
  "falafel-rice-bowl": [
    "falafel rice bowl",
    "falafel plate",
  ],
  shakshuka: [
    "shakshuka",
    "eggs in tomato sauce",
  ],
  "lemon-herb-chicken-couscous": [
    "chicken couscous",
    "lemon chicken couscous",
  ],
  "korean-tofu-rice-bowl": [
    "korean tofu bowl",
    "tofu bibimbap",
  ],
  "korean-beef-lettuce-cups": [
    "korean beef lettuce wraps",
    "beef lettuce wraps",
  ],
  "vietnamese-chicken-noodle-bowl": [
    "bun ga vietnamese",
    "vietnamese chicken vermicelli",
  ],
  "vietnamese-fresh-spring-rolls": [
    "goi cuon",
    "vietnamese fresh spring rolls",
  ],
  "chinese-garlic-bok-choy-tofu": [
    "bok choy tofu",
    "tofu bok choy stir fry",
  ],
  "chinese-chicken-vegetable-noodles": [
    "chicken vegetable noodles",
    "chicken chow mein",
  ],
  "moroccan-chickpea-stew": [
    "moroccan chickpea stew",
    "chickpea tagine",
  ],
  "moroccan-chicken-couscous": [
    "moroccan chicken couscous",
    "chicken couscous",
  ],
  "australian-pumpkin-soup": [
    "pumpkin soup",
    "roasted pumpkin soup",
  ],
};

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function cleanHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function validLicense(value) {
  return /^(CC BY|CC0|Public domain|PD-|CC-BY)/i.test(
    value || ""
  );
}

function getRetryDelay(header, attempt) {
  const seconds = Number(header);

  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.max(seconds * 1000, 10000);
  }

  if (header) {
    const date = Date.parse(header);

    if (!Number.isNaN(date)) {
      return Math.max(date - Date.now(), 10000);
    }
  }

  return Math.min(10000 * 2 ** attempt, 120000);
}

let lastRequest = 0;

async function requestCommons(params) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const elapsed = Date.now() - lastRequest;

    if (elapsed < REQUEST_DELAY) {
      await wait(REQUEST_DELAY - elapsed);
    }

    lastRequest = Date.now();

    const response = await fetch(
      `${API}?${new URLSearchParams(params)}`
    );

    const retryable =
      response.status === 429 ||
      response.status === 503;

    if (retryable) {
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `HTTP ${response.status}: retry limit reached`
        );
      }

      const delay = getRetryDelay(
        response.headers.get("Retry-After"),
        attempt
      );

      console.log(
        `  Rate limited (${response.status}). Waiting ${Math.ceil(delay / 1000)}s...`
      );

      await wait(delay);
      continue;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (
      data.error?.code === "maxlag" ||
      data.error?.code === "ratelimited"
    ) {
      if (attempt === MAX_RETRIES) {
        throw new Error(data.error.info || data.error.code);
      }

      const delay = getRetryDelay(
        response.headers.get("Retry-After"),
        attempt
      );

      await wait(delay);
      continue;
    }

    if (data.error) {
      throw new Error(data.error.info || data.error.code);
    }

    return data;
  }
}

async function searchImages(query) {
  const data = await requestCommons({
    action: "query",
    generator: "search",
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1000",
    maxlag: "5",
    format: "json",
  });

  return Object.values(data.query?.pages || {});
}

const BAD_WORDS = [
  "fried spring rolls",
  "crispy spring rolls",
  "spring roll fried",
  "chicken noodle soup us",
  "with tuna",
  "illustration",
  "drawing",
  "cartoon",
  "poster",
  "logo",
  "menu",
];

const STOP_WORDS = new Set([
  "with",
  "and",
  "the",
  "style",
  "inspired",
  "bowl",
  "rice",
  "one",
  "pan",
]);

function scoreImage(page, query, recipe) {
  const filename = normalize(
    page.title?.replace(/^File:/, "")
  );

  if (
    BAD_WORDS.some((word) =>
      filename.includes(normalize(word))
    )
  ) {
    return -100;
  }

  if (/\b(svg|gif|pdf|tif|tiff)\b/.test(filename)) {
    return -100;
  }

  const queryWords = normalize(query)
    .split(" ")
    .filter(
      (word) =>
        word.length > 2 && !STOP_WORDS.has(word)
    );

  let score = 0;

  for (const word of queryWords) {
    if (filename.includes(word)) {
      score += 4;
    }
  }

  if (
    queryWords.length &&
    queryWords.every((word) =>
      filename.includes(word)
    )
  ) {
    score += 10;
  }

  const titleWords = normalize(recipe.title)
    .split(" ")
    .filter(
      (word) =>
        word.length > 3 && !STOP_WORDS.has(word)
    );

  for (const word of titleWords) {
    if (filename.includes(word)) {
      score += 2;
    }
  }

  return score;
}

async function saveRecipes(recipes) {
  await fs.writeFile(
    RECIPES_PATH,
    JSON.stringify(recipes, null, 2) + "\n",
    "utf8"
  );
}

async function saveReport(recipes) {
  const report = recipes.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image || null,
    imageSourcePage: recipe.imageSourcePage || null,
    imageCredit: recipe.imageCredit || null,
    imageLicense: recipe.imageLicense || null,
    status: recipe.image
      ? recipe.imageMatchStatus || "Existing image"
      : "Missing image",
  }));

  await fs.writeFile(
    REPORT_PATH,
    JSON.stringify(report, null, 2) + "\n",
    "utf8"
  );
}

const recipes = JSON.parse(
  await fs.readFile(RECIPES_PATH, "utf8")
);

if (!Array.isArray(recipes)) {
  throw new Error("recipes.json must be an array.");
}

// Clear the known incorrect images from the first run.
for (const recipe of recipes) {
  if (BAD_MATCHES.has(recipe.id)) {
    recipe.image = null;
    delete recipe.imageSourcePage;
    delete recipe.imageCredit;
    delete recipe.imageLicense;
    delete recipe.imageMatchStatus;
  }
}

await saveRecipes(recipes);

let added = 0;
let missing = 0;
let errors = 0;

console.log(
  `\nSearching images for ${recipes.length} recipes...\n`
);

for (const [index, recipe] of recipes.entries()) {
  if (recipe.image) {
    console.log(
      `${index + 1}/${recipes.length} KEEP: ${recipe.title}`
    );
    continue;
  }

  const searches = [
    ...(SEARCH_ALIASES[recipe.id] || []),
    recipe.imageSearchQuery || recipe.title,
  ];

  const uniqueSearches = [...new Set(searches)];

  let found = false;
  let failed = false;

  for (const query of uniqueSearches) {
    try {
      const pages = await searchImages(query);

      const candidates = pages
        .map((page) => {
          const info = page.imageinfo?.[0];
          const metadata = info?.extmetadata || {};

          const license = cleanHtml(
            metadata.LicenseShortName?.value
          );

          return {
            page,
            imageUrl: info?.thumburl || info?.url,
            source: info?.descriptionurl,
            credit: cleanHtml(
              metadata.Artist?.value
            ),
            license,
            score: scoreImage(page, query, recipe),
          };
        })
        .filter(
          (item) =>
            item.imageUrl &&
            item.source &&
            validLicense(item.license) &&
            item.score >= 8
        )
        .sort((a, b) => b.score - a.score);

      const best = candidates[0];

      if (best) {
        recipe.image = best.imageUrl;
        recipe.imageSourcePage = best.source;
        recipe.imageCredit =
          best.credit ||
          "See Wikimedia Commons file page";
        recipe.imageLicense = best.license;
        recipe.imageMatchStatus =
          "Automatically matched; manually review";

        added++;
        found = true;

        console.log(
          `${index + 1}/${recipes.length} FOUND: ${recipe.title}`
        );
        console.log(`  ${best.page.title}`);

        break;
      }
    } catch (error) {
      console.log(
        `${index + 1}/${recipes.length} ERROR: ${recipe.title}`
      );
      console.log(`  ${error.message}`);

      failed = true;
      break;
    }
  }

  if (!found) {
    if (failed) {
      errors++;
    } else {
      missing++;
      console.log(
        `${index + 1}/${recipes.length} NOT FOUND: ${recipe.title}`
      );
    }
  }

  // Save each recipe
  await saveRecipes(recipes);
  await saveReport(recipes);
}

await saveRecipes(recipes);
await saveReport(recipes);

const totalImages = recipes.filter(
  (recipe) => Boolean(recipe.image)
).length;

console.log("\n---------------------------");
console.log("IMAGE SEARCH COMPLETED");
console.log("---------------------------");
console.log(`Total recipes: ${recipes.length}`);
console.log(`New images added: ${added}`);
console.log(`Recipes with images: ${totalImages}`);
console.log(`Still missing: ${recipes.length - totalImages}`);
console.log(`Search errors: ${errors}`);
console.log(`Review report: ${REPORT_PATH}`);
