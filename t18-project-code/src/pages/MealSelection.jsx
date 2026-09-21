import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./MealSelection.css";

import {
  findMeals,
  getMealDetails,
} from "../services/themealdbService";

import {
  subscribeToRoom,
  changeRoomScreen,
  setMealSuggestions,
  setSelectedRecipe,
} from "../services/roomService";

/* --------------------------------
   Find the group's most common
   selection for one preference
--------------------------------- */

function mostCommon(values) {
  const filtered = values.filter(
    (value) => value && value !== "Any"
  );

  if (filtered.length === 0) {
    return "Any";
  }

  const counts = {};

  filtered.forEach((value) => {
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
}

export default function MealSelection({
  room,
  setRoom,
  setMeal,
  onContinue,
  onBack,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestStarted = useRef(false);

  const isHost = room.memberId === room.hostId;

  /* --------------------------------
     Build group search profile
  --------------------------------- */

  const searchProfile = useMemo(() => {
    const readyMembers =
      room.members?.filter(
        (member) => member.preferences?.ready
      ) || [];

    const source =
      readyMembers.length > 0
        ? readyMembers
        : room.members || [];

    return {
      area: mostCommon(
        source.map(
          (member) =>
            member.preferences?.area
        )
      ),

      category: mostCommon(
        source.map(
          (member) =>
            member.preferences?.category
        )
      ),

      ingredient: mostCommon(
        source.map(
          (member) =>
            member.preferences?.ingredient
        )
      ),
    };
  }, [room.members]);

  /* --------------------------------
     Listen to Firebase room
  --------------------------------- */

  useEffect(() => {
    if (!room.code) return;

    return subscribeToRoom(
      room.code,
      (updatedRoom) => {
        if (!updatedRoom) return;

        setRoom((previous) => ({
          ...updatedRoom,
          memberId: previous.memberId,
        }));

        if (updatedRoom.selectedRecipe) {
          setMeal(updatedRoom.selectedRecipe);
        }

        if (updatedRoom.screen === "tasks") {
          onContinue();
        }

        if (
          updatedRoom.screen === "preferences"
        ) {
          onBack();
        }
      }
    );
  }, [
    room.code,
    setRoom,
    setMeal,
    onContinue,
    onBack,
  ]);

  /* --------------------------------
     Admin fetches recommendations
  --------------------------------- */

  useEffect(() => {
    if (!isHost) return;

    if (room.mealSuggestions?.length) {
      return;
    }

    if (requestStarted.current) {
      return;
    }

    requestStarted.current = true;

    async function loadSuggestions() {
      try {
        setLoading(true);
        setError("");

        const meals = await findMeals(
          searchProfile
        );

        if (meals.length === 0) {
          setError(
            "No meals matched all three group filters. Go back and make one preference broader, such as choosing Any category or Any ingredient."
          );

          return;
        }

        await setMealSuggestions(
          room.code,
          meals,
          searchProfile
        );
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Could not load meal suggestions."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSuggestions();
  }, [
    isHost,
    room.code,
    room.mealSuggestions,
    searchProfile.area,
    searchProfile.category,
    searchProfile.ingredient,
  ]);

  const recipes = room.mealSuggestions || [];

  const selectedRecipe =
    room.selectedRecipe || null;

  /* --------------------------------
     Select recipe
  --------------------------------- */

  async function chooseRecipe(recipe) {
    if (!isHost) return;

    try {
      setLoading(true);
      setError("");

      const fullMeal =
        await getMealDetails(
          recipe.idMeal || recipe.id
        );

      await setSelectedRecipe(
        room.code,
        fullMeal
      );

      setMeal(fullMeal);
    } catch (err) {
      console.error(err);

      setError(
        "Could not load the selected meal."
      );
    } finally {
      setLoading(false);
    }
  }

  async function continueWithRecipe() {
    if (!isHost || !selectedRecipe) {
      return;
    }

    await changeRoomScreen(
      room.code,
      "tasks"
    );
  }

  async function goBack() {
    if (!isHost) return;

    await changeRoomScreen(
      room.code,
      "preferences"
    );
  }

  return (
    <div className="meal-selection-page">

      {/* =========================
          HEADER
      ========================== */}

      <header className="meal-selection-header">
        <div className="meal-header-content">
          <span className="meal-eyebrow">
            GROUP MEAL
          </span>

          <h1>Suggested meals</h1>

          <p>
            Recommendations use your group's
            cuisine, category and ingredient
            choices.
          </p>
        </div>

        <div className="meal-room-code">
          {room.code}
        </div>
      </header>

      {/* =========================
          FILTER SUMMARY
      ========================== */}

      <div className="meal-filter-bar">
        <div className="meal-filter-inner">

          <span className="meal-filter-chip">
            <strong>Cuisine</strong>
            {searchProfile.area}
          </span>

          <span className="meal-filter-chip">
            <strong>Category</strong>
            {searchProfile.category}
          </span>

          <span className="meal-filter-chip">
            <strong>Ingredient</strong>
            {searchProfile.ingredient}
          </span>

        </div>
      </div>

      {/* =========================
          RESULTS
      ========================== */}

      <main className="meal-results">

        {loading &&
          recipes.length === 0 && (
            <div className="meal-state">

              <div className="meal-loader" />

              <h2>Finding meals…</h2>

              <p>
                Matching everyone's preferences.
              </p>

            </div>
          )}

        {!isHost &&
          recipes.length === 0 &&
          !error && (
            <div className="meal-state">

              <div className="meal-loader" />

              <h2>
                Waiting for suggestions…
              </h2>

              <p>
                The admin is finding meals for
                the group.
              </p>

            </div>
          )}

        {error && (
          <div className="meal-state">

            <h2>No matching meals</h2>

            <p>{error}</p>

            {isHost && (
              <button
                className="state-change-button"
                onClick={goBack}
              >
                Change preferences
              </button>
            )}

          </div>
        )}

        {!error &&
          recipes.length > 0 && (
            <div className="recipe-grid">

              {recipes.map(
                (recipe, index) => {
                  const recipeId =
                    recipe.id ||
                    recipe.idMeal;

                  const selectedId =
                    selectedRecipe?.id ||
                    selectedRecipe?.idMeal;

                  const selected =
                    String(selectedId) ===
                    String(recipeId);

                  return (
                    <button
                      type="button"
                      key={`${recipeId}-${index}`}
                      className={`recipe-card ${
                        selected
                          ? "selected"
                          : ""
                      }`}
                      disabled={
                        !isHost || loading
                      }
                      onClick={() =>
                        chooseRecipe(recipe)
                      }
                    >

                      <div className="recipe-image">

                        <img
                          src={recipe.image}
                          alt={recipe.title}
                        />

                        {selected && (
                          <span className="selected-badge">
                            Selected
                          </span>
                        )}

                      </div>

                      <div className="recipe-info">

                        <h3>
                          {recipe.title}
                        </h3>

                        <div className="recipe-meta">

                          <span>
                            {recipe.area ||
                              searchProfile.area ||
                              "Meal"}
                          </span>

                          {recipe.category && (
                            <span>
                              {
                                recipe.category
                              }
                            </span>
                          )}

                        </div>

                      </div>

                    </button>
                  );
                }
              )}

            </div>
          )}

      </main>

      {/* =========================
          FOOTER
      ========================== */}

      <footer className="meal-selection-footer">

        <button
          className="meal-back-button"
          disabled={!isHost}
          onClick={goBack}
        >
          {isHost
            ? "← Change preferences"
            : "Admin controls navigation"}
        </button>

        {isHost ? (
          <button
            className="meal-continue-button"
            disabled={
              !selectedRecipe || loading
            }
            onClick={continueWithRecipe}
          >
            Cook this meal →
          </button>
        ) : (
          <div className="meal-waiting">

            {selectedRecipe
              ? `Admin selected ${selectedRecipe.title}`
              : "Waiting for admin to choose a meal…"}

          </div>
        )}

      </footer>

    </div>
  );
}