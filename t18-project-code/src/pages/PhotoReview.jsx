import { useEffect, useRef, useState } from "react";
import { postMealReview } from "../services/mealFeedService";
import "./PhotoReview.css";

const availableTags = ["Tasty", "Fair task split", "On time", "Would cook again"];
const maxPhotoBytes = 10 * 1024 * 1024;

export default function PhotoReview({ meal, room, user, draft, onDraftChange, onBack, onSaved }) {
  const [photo, setPhoto] = useState(draft?.photo || null);
  const [rating, setRating] = useState(draft?.rating || 0);
  const [tags, setTags] = useState(draft?.tags || []);
  const [caption, setCaption] = useState(draft?.caption || "");
  const [preview, setPreview] = useState(() => draft?.photo ? URL.createObjectURL(draft.photo) : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const reviewId = useRef(draft?.id || crypto.randomUUID());
  const uploadInput = useRef(null);
  const cameraInput = useRef(null);
  const recipe = meal || room?.selectedRecipe;
  const mealName = recipe?.title || recipe?.name || "Our meal";

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  useEffect(() => {
    onDraftChange({ id: reviewId.current, photo, rating, tags, caption });
  }, [photo, rating, tags, caption, onDraftChange]);

  function selectPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > maxPhotoBytes) {
      setError("Choose a photo smaller than 10 MB.");
      return;
    }
    setError("");
    setPhotoError("");
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function submitReview(event) {
    event.preventDefault();
    if (saving) return;
    if (!rating) { setError("Choose a star rating before posting."); return; }
    if (photo && photoError) { setError("Replace or remove the photo before saving."); return; }
    setSaving(true);
    setError("");
    try {
      const members = Array.isArray(room?.members) ? room.members : Object.values(room?.members || {});
      const review = {
        id: reviewId.current,
        recipeId: recipe?.id || null,
        mealName,
        recipeImage: recipe?.image || "",
        members: members.map((member) => member.name || "A cook"),
        photo,
        rating,
        tags,
        caption: caption.trim(),
        savedAt: new Date().toISOString(),
      };
      await postMealReview(review, room, user);
      onDraftChange({ ...review });
      onSaved();
    } catch (failure) {
      setError(failure.message || "Could not post your meal. Please try again.");
    } finally { setSaving(false); }
  }

  return (
    <main className="photo-review-page">
      <button type="button" className="photo-review-back" onClick={onBack} disabled={saving} aria-label="Back to meal complete">‹</button>
      <header className="photo-review-header">
        <p className="photo-review-label">SHARE YOUR MEAL</p>
        <h1>How did it turn out?</h1>
      </header>
      <form onSubmit={submitReview}>
        <fieldset disabled={saving}>
          <legend className="photo-review-sr-only">Your meal review</legend>
          <section className="photo-review-section">
            <div className="photo-review-preview">
              {(preview || recipe?.image) && !photoError ? <img src={preview || recipe.image} alt={photo ? "Your finished meal" : mealName} onError={() => setPhotoError("This image could not be displayed. Choose another photo.")} /> : <p>Add a photo of your finished dish</p>}
              <button type="button" className="photo-review-retake" onClick={() => cameraInput.current.click()}>▣ Retake</button>
            </div>
            {photoError && <p className="photo-review-error" role="alert">{photoError}</p>}
            <input ref={uploadInput} type="file" accept="image/*" onChange={selectPhoto} hidden />
            <input ref={cameraInput} type="file" accept="image/*" capture="environment" onChange={selectPhoto} hidden />
            <div className="photo-review-photo-actions">
              <button type="button" onClick={() => uploadInput.current.click()}>{photo ? "Change photo" : "Upload photo"}</button>
            </div>
            {photo && <button type="button" className="photo-review-link" onClick={() => { setPhoto(null); setPreview(""); setPhotoError(""); }}>Remove photo</button>}
          </section>
          <section className="photo-review-section">
            <h2>Rate the meal</h2>
            <div className="photo-review-stars" role="group" aria-label="Meal rating">
              {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" aria-label={`${star} ${star === 1 ? "star" : "stars"}`} aria-pressed={rating === star} className={rating >= star ? "selected" : ""} onClick={() => { setRating(star); setError(""); }}>{rating >= star ? "★" : "☆"}</button>)}
            </div>
            <p className="photo-review-sr-only" aria-live="polite">{rating ? `${rating} out of 5 stars` : "Choose 1–5 stars"}</p>
          </section>
          <section className="photo-review-section">
            <h2>What went well?</h2>
            <div className="photo-review-tags">
              {availableTags.map((tag) => <button type="button" key={tag} aria-pressed={tags.includes(tag)} onClick={() => setTags((current) => current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag])}>{tag}</button>)}
            </div>
          </section>
          <section className="photo-review-section">
            <label htmlFor="meal-review-caption">Caption</label>
            <textarea id="meal-review-caption" value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={300} rows={3} placeholder="What made this meal special?" />
            <p className="photo-review-count">{caption.length}/300</p>
          </section>
          <p className="photo-review-tagged">♧ Tagged: {(Array.isArray(room?.members) ? room.members : Object.values(room?.members || {})).map((member) => member.name || "A cook").join(", ") || "Your cooking team"}</p>
        </fieldset>
        {error && <p className="photo-review-error" role="alert">{error}</p>}
        <footer className="photo-review-footer">
          <p>Your photo and review will be shared with this cooking group.</p>
          <button type="submit" disabled={saving}>{saving ? "Posting…" : "Post to feed"}</button>
        </footer>
      </form>
    </main>
  );
}