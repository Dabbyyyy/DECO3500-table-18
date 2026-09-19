import { useState } from "react";
import "./MealSelection.css";

import meals from "../data/meals";

export default function MealSelection({
  preferences,
  setMeal,
  onContinue,
  onBack,
}) {
  const [selectedMeal, setSelectedMeal] = useState(meals[0]);

  function chooseMeal() {
    setMeal(selectedMeal);
    onContinue();
  }

  const otherMeals = meals.filter(
    (meal) => meal.id !== selectedMeal.id
  );

  return (
    <div className="meal-page">

      {/* LEFT SIDE */}
      <section className="meal-left">

        <div>
          <button
            className="meal-back"
            onClick={onBack}
            aria-label="Go back"
          >
            ←
          </button>

          <p className="meal-step">
            STEP 3 · CHOOSE A MEAL
          </p>

          <h1>
            Pick
            <br />
            together.
          </h1>

          <p className="meal-description">
            These meals are suggested based on the
            group's preferences. Pick one together
            before we divide the cooking tasks.
          </p>

          {/* PREFERENCE SUMMARY */}
          <div className="preference-summary">

            <p>Your preferences</p>

            <div className="preference-tags">

              {preferences?.cuisine &&
                preferences.cuisine !== "Any" && (
                  <span>
                    {preferences.cuisine}
                  </span>
                )}

              {preferences?.budget && (
                <span>
                  {preferences.budget}
                </span>
              )}

              {preferences?.cookingTime && (
                <span>
                  {preferences.cookingTime}
                </span>
              )}

              {preferences?.difficulty && (
                <span>
                  {preferences.difficulty}
                </span>
              )}

              {preferences?.dietary && (
                <span>
                  {preferences.dietary}
                </span>
              )}

            </div>

          </div>
        </div>


        <div className="meal-left-bottom">

          <div className="meal-group-note">
            <strong>Group suggestion</strong>

            <span>
              The top option is currently the
              strongest match for your cooking group.
            </span>
          </div>

          <button
            className="meal-main-button"
            onClick={chooseMeal}
          >
            Cook {selectedMeal.name}
          </button>

        </div>

      </section>


      {/* RIGHT SIDE */}
      <section className="meal-right">

        <p className="meal-right-label">
          SUGGESTED FOR YOUR GROUP
        </p>


        {/* FEATURED MEAL */}
        <div className="featured-meal">

          <div className="featured-image">
            <span>
              {selectedMeal.icon}
            </span>
          </div>


          <div className="featured-content">

            <div>

              <div className="featured-heading-row">

                <p className="meal-best-match">
                  BEST MATCH
                </p>

                <span className="vote-badge">
                  {selectedMeal.votes}{" "}
                  {selectedMeal.votes === 1
                    ? "vote"
                    : "votes"}
                </span>

              </div>


              <h2>
                {selectedMeal.name}
              </h2>


              <div className="meal-meta">

                <span>
                  {selectedMeal.time} min
                </span>

                <span>·</span>

                <span>
                  {selectedMeal.difficulty}
                </span>

                <span>·</span>

                <span>
                  {selectedMeal.cooks} cooks
                </span>

              </div>


              <p className="meal-equipment">
                {selectedMeal.equipment.join(" · ")}
              </p>


              <p className="meal-ingredients">
                {selectedMeal.ingredients.join(", ")}
              </p>

            </div>


            <div className="meal-match">
              {selectedMeal.matchText}
            </div>

          </div>

        </div>


        {/* OTHER OPTIONS */}
        <div className="alternative-heading">

          <p>
            Other options
          </p>

          <span>
            Tap to preview
          </span>

        </div>


        <div className="meal-options">

          {otherMeals.map((meal) => (

            <button
              key={meal.id}
              className="meal-option"
              onClick={() =>
                setSelectedMeal(meal)
              }
            >

              <div className="option-icon">
                {meal.icon}
              </div>


              <div className="option-info">

                <strong>
                  {meal.name}
                </strong>

                <span>
                  {meal.time} min ·{" "}
                  {meal.difficulty}
                </span>

              </div>


              <div className="option-votes">
                {meal.votes}{" "}
                {meal.votes === 1
                  ? "vote"
                  : "votes"}
              </div>

            </button>

          ))}

        </div>

      </section>

    </div>
  );
}