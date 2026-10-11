
import { useEffect, useMemo, useRef, useState } from "react";
import "./MealSelection.css";

import { getRecommendedRecipes } from "../services/recipeService";
import { getGroupSummary } from "../utils/groupPreferences";

import {
  subscribeToRoom,
  changeRoomScreen,
  setMealSuggestions,
  setSelectedRecipe,
} from "../services/roomService";

// Recipe image or fallback
function RecipeVisual({ recipe, compact = false }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [recipe?.id, recipe?.image]);

  if (recipe?.image && !imageFailed) {
    return (
      <img
        className="meal-photo"
        src={recipe.image}
        alt={recipe.title}
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className={`meal-illustration ${
        compact ? "meal-illustration-small" : ""
      }`}
      aria-label={`${recipe?.title || "Meal"} illustration`}
      role="img"
    >
      <span>🍲</span>
    </div>
  );
}

export default function MealSelection({
  room,
  setRoom,
  setMeal,
  onContinue,
  onBack,
}) {
  const [viewingRecipeId, setViewingRecipeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState("");

  const requestStarted = useRef(false);
  const navigationStarted = useRef(false);

  const members = room.members || [];
  const isHost = room.memberId === room.hostId;

  const summary = useMemo(
    () => getGroupSummary(members),
    [members]
  );

  const memberPreferences = useMemo(
    () =>
      members.map((member) => ({
        name: member.name,
        ...(member.preferences || {}),
      })),
    [members]
  );

  const recipes = Array.isArray(room.mealSuggestions)
    ? room.mealSuggestions
    : [];

  const selectedRecipe = room.selectedRecipe || null;

  // Everyone can browse independently.
  const featuredRecipe =
    recipes.find(
      (recipe) => recipe.id === viewingRecipeId
    ) ||
    recipes.find(
      (recipe) => recipe.id === selectedRecipe?.id
    ) ||
    recipes[0] ||
    null;

  const alternatives = recipes.filter(
    (recipe) => recipe.id !== featuredRecipe?.id
  );

  // Listen for shared Firebase navigation.
  useEffect(() => {
    if (!room.code) return;

    const unsubscribe = subscribeToRoom(
      room.code,
      (updatedRoom) => {
        if (!updatedRoom) return;

        setRoom((previous) => ({
          ...updatedRoom,
          memberId: previous.memberId,
        }));

        if (
          updatedRoom.screen === "tasks" &&
          !navigationStarted.current
        ) {
          navigationStarted.current = true;

          if (updatedRoom.selectedRecipe) {
            setMeal(updatedRoom.selectedRecipe);
          }

          onContinue();
        }

        if (
          updatedRoom.screen === "summary" &&
          !navigationStarted.current
        ) {
          navigationStarted.current = true;
          onBack();
        }
      }
    );

    return unsubscribe;
  }, [room.code, setRoom, setMeal, onContinue, onBack]);

  // Admin loads recommendations and shares them.
  useEffect(() => {
    if (!isHost || !room.code) return;
    if (recipes.length > 0) return;
    if (requestStarted.current) return;

    requestStarted.current = true;

    async function loadRecommendations() {
      setLoading(true);
      setError("");

      try {
        const recommendations =
          await getRecommendedRecipes(
            memberPreferences
          );

        if (!recommendations.length) {
          setError(
            "No suitable recipes were found. Please review the group's preferences."
          );
          return;
        }

        await setMealSuggestions(
          room.code,
          recommendations,
          {
            source: "ktchn-api",
            generatedAt: Date.now(),
          }
        );

        await setSelectedRecipe(
          room.code,
          recommendations[0]
        );

        setMeal(recommendations[0]);
      } catch (err) {
        console.error(
          "Recipe API error:",
          err
        );

        setError(
          err.message ||
            "Could not load meal recommendations."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [
    isHost,
    room.code,
    recipes.length,
    memberPreferences,
    setMeal,
  ]);

  function viewRecipe(recipe) {
    if (!recipe || choosing) return;

    setViewingRecipeId(recipe.id);
    setError("");
  }

  // Admin confirms the final recipe.
  async function confirmRecipe() {
    if (
      !isHost ||
      !featuredRecipe ||
      choosing
    ) {
      return;
    }

    try {
      setChoosing(true);
      setError("");

      await setSelectedRecipe(
        room.code,
        featuredRecipe
      );

      setMeal(featuredRecipe);

      // Shared screen for both devices.
      await changeRoomScreen(
        room.code,
        "tasks"
      );

      // Local fallback, in case the listener
      // has not navigated yet.
      if (!navigationStarted.current) {
        navigationStarted.current = true;
        onContinue();
      }
    } catch (err) {
      console.error(
        "Meal confirmation error:",
        err
      );

      setError(
        "Could not confirm this meal. Please try again."
      );
    } finally {
      setChoosing(false);
    }
  }

  async function goBack() {
    if (!isHost || choosing) return;

    try {
      setChoosing(true);
      setError("");

      await changeRoomScreen(
        room.code,
        "summary"
      );

      if (!navigationStarted.current) {
        navigationStarted.current = true;
        onBack();
      }
    } catch (err) {
      console.error(err);
      setError(
        "Could not return to the group summary."
      );
    } finally {
      setChoosing(false);
    }
  }

  const cuisineLabel =
    summary.cuisine.value === "Any"
      ? "All cuisines"
      : summary.cuisine.value;

  return (
    <main className="meal-selection-page">
      <div className="meal-selection-scroll">
        <button
          type="button"
          className="meal-back"
          onClick={goBack}
          disabled={!isHost || choosing}
          aria-label="Back to group summary"
        >
          ‹
        </button>

        <p className="meal-eyebrow">
          CHOOSE A MEAL
        </p>

        <h1>Pick together.</h1>

        <p className="meal-description">
          Explore the meals on your own phone,
          then discuss your favourites with
          your group.
        </p>

        <div className="meal-group-tags">
          <span>{cuisineLabel}</span>

          {summary.budgetLimit !== null && (
            <span>
              Up to ${summary.budgetLimit}/person
            </span>
          )}

          {summary.timeLimit !== null && (
            <span>
              Up to {summary.timeLimit} min
            </span>
          )}
        </div>

        {loading && recipes.length === 0 && (
          <div className="meal-message">
            <span className="meal-loading-icon">
              🍳
            </span>

            <h2>Finding your meals…</h2>

            <p>
              Matching recipes with your
              group's choices.
            </p>
          </div>
        )}

        {!isHost &&
          recipes.length === 0 &&
          !error && (
            <div className="meal-message">
              <h2>
                Waiting for recommendations
              </h2>

              <p>
                The admin is finding recipes
                for everyone.
              </p>
            </div>
          )}

        {error && (
          <div
            className="meal-error"
            role="alert"
          >
            <strong>
              Something went wrong
            </strong>

            <p>{error}</p>

            {isHost && (
              <button
                type="button"
                onClick={goBack}
              >
                Review group preferences
              </button>
            )}
          </div>
        )}

        {featuredRecipe && (
          <>
            <div className="meal-section-label">
              <span>
                RECOMMENDED FOR YOUR GROUP
              </span>

              <span className="meal-recommendation-badge">
                {featuredRecipe.id ===
                recipes[0]?.id
                  ? "Top match"
                  : "Exploring"}
              </span>
            </div>

            <article className="meal-featured">
              <div className="meal-featured-image">
                <RecipeVisual
                  recipe={featuredRecipe}
                />
              </div>

              <div className="meal-featured-body">
                <div className="meal-featured-heading">
                  <div>
                    <p className="meal-featured-cuisine">
                      {featuredRecipe.cuisine}
                    </p>

                    <h2>
                      {featuredRecipe.title}
                    </h2>
                  </div>
                </div>

                <p className="meal-featured-description">
                  {featuredRecipe.description}
                </p>

                <div className="meal-meta">
                  <span>
                    ◷ {featuredRecipe.minutes} min
                  </span>

                  <span>
                    ★ {featuredRecipe.difficulty}
                  </span>

                  <span>
                    ♧ {members.length} cooks
                  </span>
                </div>

                <div className="meal-equipment">
                  <strong>
                    Kitchen equipment
                  </strong>

                  <p>
                    {featuredRecipe.equipment?.join(
                      " · "
                    ) || "Not specified"}
                  </p>
                </div>

                <div className="meal-ingredients">
                  <strong>Ingredients</strong>

                  <div className="meal-ingredient-list">
                    {(
                      featuredRecipe.ingredients ||
                      []
                    ).map(
                      (ingredient, index) => (
                        <span
                          key={`${ingredient.name}-${index}`}
                        >
                          {ingredient.name}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="meal-match-note">
                  <span>✦</span>

                  <div>
                    <strong>
                      Suggested for your group
                    </strong>

                    <p>
                      {featuredRecipe.matchReasons
                        ?.length
                        ? featuredRecipe.matchReasons
                            .slice(0, 3)
                            .join(" · ")
                        : "Ranked using your group's preferences."}
                    </p>
                  </div>
                </div>

                <div className="meal-cost">
                  <span>
                    Estimated cost per person
                  </span>

                  <strong>
                    $
                    {Number(
                      featuredRecipe.costPerPerson ||
                        0
                    ).toFixed(2)}
                  </strong>
                </div>
              </div>
            </article>

            {alternatives.length > 0 && (
              <section className="meal-alternatives">
                <div className="meal-alternatives-heading">
                  <h2>
                    Other meals to consider
                  </h2>

                  <p>
                    Tap any recipe to view its
                    details. Everyone can
                    explore independently.
                  </p>
                </div>

                <div className="meal-alternative-list">
                  {alternatives.map(
                    (recipe) => (
                      <button
                        key={recipe.id}
                        type="button"
                        className="meal-alternative"
                        onClick={() =>
                          viewRecipe(recipe)
                        }
                        disabled={choosing}
                      >
                        <div className="meal-alternative-image">
                          <RecipeVisual
                            recipe={recipe}
                            compact
                          />
                        </div>

                        <div className="meal-alternative-content">
                          <strong>
                            {recipe.title}
                          </strong>

                          <span>
                            {recipe.minutes} min
                            {" · "}
                            {recipe.difficulty}
                          </span>

                          <small>
                            $
                            {Number(
                              recipe.costPerPerson ||
                                0
                            ).toFixed(2)}
                            /person
                          </small>
                        </div>

                        <span className="meal-alternative-arrow">
                          ›
                        </span>
                      </button>
                    )
                  )}
                </div>
              </section>
            )}

            <div
              style={{
                marginTop: "18px",
                padding: "13px",
                borderRadius: "11px",
                background: "#f1e8dd",
                color: "#705849",
                fontSize: "11px",
                lineHeight: 1.6,
              }}
            >
              <strong
                style={{
                  display: "block",
                  marginBottom: "4px",
                  color: "#3f2d26",
                }}
              >
                Discuss before deciding
              </strong>

              Compare the recipes with your
              group. Only the admin can
              confirm the final choice
              after everyone agrees.
            </div>
          </>
        )}
      </div>

      <footer className="meal-selection-footer">
        {isHost ? (
          <button
            type="button"
            className="meal-continue"
            disabled={
              !featuredRecipe || choosing
            }
            onClick={confirmRecipe}
          >
            {choosing
              ? "Confirming..."
              : featuredRecipe
                ? `Choose ${featuredRecipe.title} →`
                : "Choose a meal"}
          </button>
        ) : (
          <div
            style={{
              padding: "13px",
              borderRadius: "12px",
              background: "#f1e8dd",
              color: "#654b3d",
              textAlign: "center",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            Explore recipes and discuss
            with your group
          </div>
        )}
      </footer>
    </main>
  );
}
