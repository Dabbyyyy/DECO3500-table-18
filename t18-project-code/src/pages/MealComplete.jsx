
import { useState } from "react";
import "./MealComplete.css";

export default function MealComplete({
  meal,
  room,
  onAddPhoto,
  reviewSaved,
  onViewFeed,
  onShareFeedback,
  onBack,
  onCookAgain,
  onEndSession,
}) {
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  // Use the real selected recipe
  const recipe = meal || room?.selectedRecipe;
  const mealName = recipe?.title || recipe?.name || "Our meal";

  // Use actual members from the cooking room
  const members = Array.isArray(room?.members)
    ? room.members
    : Object.values(room?.members || {});

  function saveMeal() {
    if (!recipe) {
      setSaveError("No selected recipe to save.");
      return;
    }

    try {
      const existing = JSON.parse(
        localStorage.getItem("ktchn-saved-meals") || "[]"
      );

      const savedMeal = {
        recipeId: recipe.id,
        title: mealName,
        image: recipe.image || "",
        members: members.map((member) => member.name),
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "ktchn-saved-meals",
        JSON.stringify([
          ...(Array.isArray(existing) ? existing : []),
          savedMeal,
        ])
      );

      setSaved(true);
      setSaveError("");
    } catch (error) {
      console.error(error);
      setSaveError("Could not save this meal.");
    }
  }

  return (
    <main className="meal-complete-page">
      <button type="button" className="meal-complete-back" onClick={onBack} disabled={!onBack} aria-label="Back to cooking complete">
        ‹
      </button>

      <header className="meal-complete-header">
        <p className="meal-complete-label">MEAL COMPLETE</p>
        <h1>You’re all done!</h1>
        <p className="meal-complete-description">
          {members.length ? `Cooked together by ${members.map((member) => member.name || "A cook").join(", ")}.` : "Cooked together with your team."}
        </p>
      </header>

      <section className="meal-complete-card" aria-label="Your completed meal">
        <div className="meal-complete-image">
          {recipe?.image && !imageFailed ? (
            <img src={recipe.image} alt={mealName} onError={() => setImageFailed(true)} />
          ) : (
            <span aria-hidden="true">{recipe?.icon || "🍲"}</span>
          )}
        </div>
        <div className="meal-complete-details">
          <div className="meal-complete-team">
            <div className="meal-complete-avatars" aria-label="Cooking team">
              {members.map((member, index) => (
                <span className="meal-complete-avatar" key={member.id || index} title={member.name || "A cook"}>
                  {member.name?.charAt(0).toUpperCase() || "?"}
                </span>
              ))}
            </div>
            <p>Great teamwork y’all!</p>
          </div>
          <h2>{mealName}</h2>
          <div className="meal-complete-card-actions">
            <button type="button" className="meal-complete-primary" onClick={onAddPhoto} disabled={!onAddPhoto}>
              Add your photo
            </button>
            <button type="button" className="meal-complete-secondary" onClick={saveMeal} disabled={saved || !recipe}>
              {saved ? "✓ Saved" : "Save meal"}
            </button>
          </div>
          <button type="button" className="meal-complete-feedback" onClick={onShareFeedback} disabled={!onShareFeedback}>
            Share feedback
          </button>
          {reviewSaved && <p className="meal-complete-review-saved" role="status">✓ Posted to your group feed</p>}
          {saveError && <p className="meal-complete-error" role="alert">{saveError}</p>}
        </div>
      </section>

      <footer className="meal-complete-footer">
        <button type="button" className="meal-complete-secondary" onClick={onViewFeed}>View group feed</button>
        <button type="button" className="meal-complete-cook-again" onClick={onCookAgain}>Cook Again</button>
        <button type="button" className="meal-complete-primary" onClick={onEndSession}>End Session</button>
      </footer>
    </main>
  );
}