
async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The recipe API returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Recipe API request failed."
    );
  }

  return data;
}

export async function getRecipes() {
  return fetchJSON("/api/recipes");
}

export async function getRecipeDetails(id) {
  return fetchJSON(
    `/api/recipes/${encodeURIComponent(id)}`
  );
}

export async function getCuisines() {
  const data = await fetchJSON("/api/cuisines");
  return data.cuisines || [];
}

export async function getRecommendedRecipes(
  members,
  equipment = null
) {
  const data = await fetchJSON(
    "/api/recipes/recommend",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        members,
        equipment,
      }),
    }
  );

  return data.recommendations || [];
}

export async function askCookingHelper(context) {
  return fetchJSON("/api/cooking-help", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(context),
  });
}
