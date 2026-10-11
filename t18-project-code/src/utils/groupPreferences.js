
const BUDGET_LIMITS = {
  "Under $8": 8,
  "$8–12 per person": 12,
  "$12–20 per person": 20,
};

const TIME_LIMITS = {
  "Under 30 min": 30,
  "Under 45 min": 45,
  "Under 60 min": 60,
};

const DIFFICULTY_ORDER = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

function mostPopular(values) {
  const counts = {};

  for (const value of values) {
    if (!value || value === "Any") continue;
    counts[value] = (counts[value] || 0) + 1;
  }

  const ranked = Object.entries(counts).sort(
    (a, b) => b[1] - a[1]
  );

  if (!ranked.length) {
    return {
      value: "Any",
      count: 0,
      tied: false,
    };
  }

  const highest = ranked[0][1];
  const tied = ranked.filter(
    ([, count]) => count === highest
  );

  return {
    value: tied.map(([name]) => name).join(", "),
    count: highest,
    tied: tied.length > 1,
  };
}

export function getGroupSummary(members = []) {
  const prefs = members.map(
    (member) => member.preferences || {}
  );

  const restrictions = [
    ...new Set(
      prefs.flatMap((pref) =>
        (pref.dietary || []).filter(
          (item) =>
            item !== "No Allergies" &&
            item !== "None"
        )
      )
    ),
  ];

  const cuisine = mostPopular(
    prefs.map((pref) => pref.cuisine)
  );

  const budgets = prefs
    .map((pref) => BUDGET_LIMITS[pref.budget])
    .filter((value) => Number.isFinite(value));

  const times = prefs
    .map((pref) => TIME_LIMITS[pref.cookingTime])
    .filter((value) => Number.isFinite(value));

  const difficulties = prefs
    .map((pref) => pref.difficulty)
    .filter((value) => DIFFICULTY_ORDER[value]);

  const foodCounts = {};

  prefs.forEach((pref) => {
    (pref.foodLikes || []).forEach((food) => {
      foodCounts[food] = (foodCounts[food] || 0) + 1;
    });
  });

  const popularFoods = Object.entries(foodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  const budgetLimit = budgets.length
    ? Math.min(...budgets)
    : null;

  const timeLimit = times.length
    ? Math.min(...times)
    : null;

  const difficulty = difficulties.length
    ? [...difficulties].sort(
        (a, b) =>
          DIFFICULTY_ORDER[a] - DIFFICULTY_ORDER[b]
      )[0]
    : "Any";

  return {
    memberCount: members.length,
    restrictions,
    cuisine,
    budgetLimit,
    timeLimit,
    difficulty,
    popularFoods,
  };
}
