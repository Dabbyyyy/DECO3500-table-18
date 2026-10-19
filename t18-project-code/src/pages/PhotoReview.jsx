
import { useEffect, useRef, useState } from "react";
import { postMealReview } from "../services/mealFeedService";
import "./PhotoReview.css";

const availableTags = [
  "Tasty",
  "Fair task split",
  "On time",
  "Would cook again",
];

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === "object") {
    return Object.values(value).filter(Boolean);
  }
  return [];
}

export default function PhotoReview({
  meal,
  room,
  user,
  draft,
  onDraftChange,
  onBack,
  onSaved,
}) {
  const recipe = meal || room?.selectedRecipe;
  const mealName = recipe?.title || recipe?.name || "Our meal";

  const recipeImage =
    recipe?.image ||
    recipe?.imageUrl ||
    recipe?.image_url ||
    recipe?.thumbnail ||
    recipe?.strMealThumb ||
    "";

  const roomMembers = asArray(room?.members);

  const [rating, setRating] = useState(draft?.rating || 0);
  const [tags, setTags] = useState(draft?.tags || []);
  const [caption, setCaption] = useState(draft?.caption || "");
  const [taggedIds, setTaggedIds] = useState(
    draft?.taggedIds || []
  );
  const [imageFailed, setImageFailed] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const reviewId = useRef(
    draft?.id || crypto.randomUUID()
  );

  // Save review progress without storing image files.
  useEffect(() => {
    onDraftChange?.({
      id: reviewId.current,
      rating,
      tags,
      caption,
      taggedIds,
      recipeImage,
    });
  }, [
    rating,
    tags,
    caption,
    taggedIds,
    recipeImage,
    onDraftChange,
  ]);

  async function submitReview(event) {
    event.preventDefault();

    if (saving) return;

    if (!rating) {
      setError("Choose a star rating before posting.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const review = {
        id: reviewId.current,
        recipeId: recipe?.id || null,
        mealName,
        recipeImage,

        // Image URL only. No file or upload.
        image: recipeImage,

        members: roomMembers
          .filter((member) =>
            taggedIds.includes(String(member.id))
          )
          .map((member) => member.name || "A cook"),

        taggedIds,
        rating,
        tags,
        caption: caption.trim(),
        savedAt: new Date().toISOString(),
      };

      await postMealReview(review, room, user);

      onDraftChange?.(review);
      onSaved?.();
    } catch (failure) {
      console.error("Could not post meal review:", failure);
      setError(
        failure?.message ||
        "Could not post your meal. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="photo-review-page">
      <button
        type="button"
        className="photo-review-back"
        onClick={onBack}
        disabled={saving}
        aria-label="Back to meal complete"
      >
        ‹
      </button>

      <header className="photo-review-header">
        <p className="photo-review-label">
          SHARE YOUR MEAL
        </p>
        <h1>How did it turn out?</h1>
      </header>

      <form onSubmit={submitReview}>
        <fieldset disabled={saving}>
          <legend className="photo-review-sr-only">
            Your meal review
          </legend>

          {/* Existing recipe image */}
          <section className="photo-review-section">
            <h2>Your cooked meal</h2>

            <div className="photo-review-preview">
              {recipeImage && !imageFailed ? (
                <img
                  src={recipeImage}
                  alt={mealName}
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <p>{mealName}</p>
              )}
            </div>

            <p className="photo-review-image-note">
              Recipe image used for your shared meal.
              No photo upload required.
            </p>
          </section>

          {/* Rating */}
          <section className="photo-review-section">
            <h2>Rate the meal</h2>

            <div
              className="photo-review-stars"
              role="group"
              aria-label="Meal rating"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star} ${
                    star === 1 ? "star" : "stars"
                  }`}
                  aria-pressed={rating === star}
                  className={
                    rating >= star ? "selected" : ""
                  }
                  onClick={() => {
                    setRating(star);
                    setError("");
                  }}
                >
                  {rating >= star ? "★" : "☆"}
                </button>
              ))}
            </div>
          </section>

          {/* Tags */}
          <section className="photo-review-section">
            <h2>What went well?</h2>

            <div className="photo-review-tags">
              {availableTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  aria-pressed={tags.includes(tag)}
                  onClick={() =>
                    setTags((current) =>
                      current.includes(tag)
                        ? current.filter(
                            (value) => value !== tag
                          )
                        : [...current, tag]
                    )
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Caption */}
          <section className="photo-review-section">
            <label htmlFor="meal-review-caption">
              Caption
            </label>

            <textarea
              id="meal-review-caption"
              value={caption}
              onChange={(event) =>
                setCaption(event.target.value)
              }
              maxLength={300}
              rows={3}
              placeholder="What made this meal special?"
            />

            <p className="photo-review-count">
              {caption.length}/300
            </p>
          </section>

          {/* Cooking team */}
          <section className="photo-review-section">
            <h2>Tag your cooking team</h2>

            <div className="photo-review-tags">
              {roomMembers.map((member) => {
                const id = String(member.id);

                return (
                  <label
                    key={id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginRight: 12,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={taggedIds.includes(id)}
                      onChange={(event) =>
                        setTaggedIds((current) =>
                          event.target.checked
                            ? [...current, id]
                            : current.filter(
                                (value) => value !== id
                              )
                        )
                      }
                    />

                    {member.name || "Cook"}
                  </label>
                );
              })}
            </div>
          </section>
        </fieldset>

        {error && (
          <p
            className="photo-review-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <footer className="photo-review-footer">
          <p>
            Your recipe image and review will be
            shared with this cooking group.
          </p>

          <button type="submit" disabled={saving}>
            {saving ? "Posting…" : "Post to feed"}
          </button>
        </footer>
      </form>
    </main>
  );
}
