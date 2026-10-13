import { useEffect, useState } from "react";
import { subscribeMealFeed, addMealComment, toggleMealLike } from "../services/mealFeedService";
import "./SharedMealFeed.css";

function relativeTime(timestamp, now) {
  const elapsed = Math.max(0, now - Number(timestamp));
  if (!Number.isFinite(elapsed)) return "";
  if (elapsed < 60000) return "Just now";
  if (elapsed < 3600000) return `${Math.floor(elapsed / 60000)}m`;
  if (elapsed < 86400000) return `${Math.floor(elapsed / 3600000)}h`;
  return `${Math.floor(elapsed / 86400000)}d`;
}

function teamNames(names) {
  if (names.length < 2) return names[0] || "Your cooking team";
  return `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
}

function MealPost({ post, room, user, onBack, onCookTogether, now }) {
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [liking, setLiking] = useState(false);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const members = Array.isArray(post.members) ? post.members : Object.values(post.members || {});
  const comments = Object.entries(post.comments || {}).map(([id, value]) => ({ ...value, id })).sort((a, b) => a.createdAt - b.createdAt);
  const likes = Object.entries(post.likes || {});
  const memberId = room.memberId || user?.memberId || user?.id;
  const liked = likes.some(([id]) => id === memberId);
  const likedNames = likes.slice(0, 2).map(([, like]) => like.name || "A cook");
  const numericRating = Number(post.rating);
  const rating = Number.isFinite(numericRating) ? numericRating.toFixed(1) : "—";

  async function submitComment(event) {
    event.preventDefault();
    if (sending || !comment.trim()) return;
    setSending(true);
    setError("");
    try { await addMealComment(room, post.id, user, comment); setComment(""); }
    catch { setError("Could not send your comment. Check your connection or room access and try again."); }
    finally { setSending(false); }
  }

  async function toggleLike() {
    if (liking) return;
    setLiking(true);
    setError("");
    try { await toggleMealLike(room, post.id, user); }
    catch { setError("Could not update your like. Please try again."); }
    finally { setLiking(false); }
  }

  return (
    <article className="meal-feed-post">
      <header className="meal-feed-post-header">
        <button type="button" className="meal-feed-back" onClick={onBack} aria-label="Back to meal complete">‹</button>
        <div><h1>{teamNames(members)}</h1><p>{relativeTime(post.createdAt, now)} · Cooked together</p></div>
      </header>
      {post.image && !imageFailed ? <div className="meal-feed-photo"><img src={post.image} alt={post.mealName} onError={() => setImageFailed(true)} /></div> : <div className="meal-feed-photo meal-feed-placeholder">Our shared meal</div>}
      <div className="meal-feed-title-row"><h2>{post.mealName}</h2><span className="meal-feed-rating" aria-label={`${rating} out of 5 stars`}>★ {rating}</span></div>
      {post.caption && <p className="meal-feed-caption">{post.caption}</p>}
      <div className="meal-feed-likes">
        <button type="button" onClick={toggleLike} aria-label={liked ? "Unlike this meal" : "Like this meal"} aria-pressed={liked} disabled={liking}><span aria-hidden="true">{liked ? "♥" : "♡"}</span> {likes.length}</button>
        <p>{likedNames.length ? `Liked by ${likedNames.join(", ")}${likes.length > 2 ? " and others" : ""}` : "Be the first to like this meal"}</p>
      </div>
      <section className="meal-feed-comments" aria-label={`Comments on ${post.mealName}`}>
        <h3>Comments · {comments.length}</h3>
        {!comments.length && <p className="meal-feed-muted">Be the first to leave a comment.</p>}
        {comments.map((item) => <div className="meal-feed-comment" key={item.id}>
          <span className="meal-feed-comment-avatar" aria-hidden="true">{item.authorName?.charAt(0).toUpperCase() || "?"}</span>
          <div><p className="meal-feed-comment-author"><strong>{item.authorName}</strong> <span>{relativeTime(item.createdAt, now)}</span></p><p className="meal-feed-comment-text">{item.text}</p></div>
        </div>)}
      </section>
      <footer className="meal-feed-post-footer">
        {error && <p className="meal-feed-error" role="alert">{error}</p>}
        <form onSubmit={submitComment}>
          <label className="meal-feed-sr-only" htmlFor={`comment-${post.id}`}>Add a comment</label>
          <input id={`comment-${post.id}`} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment…" maxLength={300} disabled={sending} />
          <button type="submit" aria-label={sending ? "Sending comment" : "Send comment"} disabled={sending || !comment.trim()}>{sending ? "…" : "→"}</button>
        </form>
        <button type="button" className="meal-feed-cook" onClick={onCookTogether}>Cook this together</button>
      </footer>
    </article>
  );
}

export default function SharedMealFeed({ room, user, onBack, onCookTogether, justPosted }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    try {
      return subscribeMealFeed(room, (items) => { setPosts(items); setLoading(false); setError(""); }, () => {
        setLoading(false);
        setError("Could not load the group feed. Check your connection and Firebase database permissions.");
      });
    } catch (failure) { queueMicrotask(() => { setError(failure.message); setLoading(false); }); }
  }, [room, retry]);
  const selected = posts.find((post) => post.id === selectedId) || posts[0];

  return (
    <main className="meal-feed-page">
      {justPosted && <p className="meal-feed-sr-only" role="status">Your meal was posted to the group.</p>}
      {posts.length > 1 && <nav className="meal-feed-picker" aria-label="Choose a meal post"><label htmlFor="meal-feed-select">Group meals</label><select id="meal-feed-select" value={selected?.id || ""} onChange={(event) => setSelectedId(event.target.value)}>{posts.map((post) => <option key={post.id} value={post.id}>{post.mealName} — {new Date(post.createdAt).toLocaleDateString()}</option>)}</select></nav>}
      {!selected && <button type="button" className="meal-feed-back" onClick={onBack} aria-label="Back to meal complete">‹</button>}
      {loading && <p className="meal-feed-muted" role="status">Loading your group’s meals…</p>}
      {error && <div role="alert"><p className="meal-feed-error">{error}</p><button type="button" onClick={() => { setError(""); setLoading(true); setRetry((value) => value + 1); }}>Try again</button></div>}
      {!loading && !error && !posts.length && <p className="meal-feed-muted">No meals posted yet. Add a photo and review to share your first meal.</p>}
      {selected && <MealPost key={selected.id} post={selected} room={room} user={user} onBack={onBack} onCookTogether={onCookTogether} now={now} />}
    </main>
  );
}