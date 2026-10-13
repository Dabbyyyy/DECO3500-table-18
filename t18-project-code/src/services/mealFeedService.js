import { ref, update, push, onValue, query, orderByChild, limitToLast, runTransaction } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app, { database } from "../firebase";

const storage = getStorage(app);

function roomPath(room) {
  const code = room?.code || room?.roomCode;
  if (!code || [".", "#", "$", "[", "]", "/"].some((character) => code.includes(character))) throw new Error("Rejoin your cooking room before sharing.");
  return `rooms/${code}/mealPosts`;
}

async function uploadMealPhoto(photo, path) {
  const destination = storageRef(storage, path);
  const task = uploadBytesResumable(destination, photo, { contentType: photo.type });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      task.cancel();
      reject(new Error("Photo upload timed out. Check your connection and Firebase Storage setup, then try again."));
    }, 60000);
    task.on("state_changed", undefined, (error) => {
      clearTimeout(timeout);
      reject(error);
    }, () => { clearTimeout(timeout); resolve(); });
  });
  return getDownloadURL(destination);
}

export async function postMealReview(review, room, user) {
  const path = roomPath(room);
  const memberId = room.memberId || user?.memberId || user?.id;
  if (!memberId) throw new Error("Your room membership is missing. Rejoin the room before posting.");
  let image = review.recipeImage || "";
  try {
    if (review.photo) image = await uploadMealPhoto(review.photo, `meal-photos/${room.code || room.roomCode}/${memberId}/${review.id}`);
    const post = {
      id: review.id,
      recipeId: review.recipeId,
      mealName: review.mealName,
      members: review.members,
      rating: review.rating,
      tags: review.tags,
      caption: review.caption,
      image,
      hasUserPhoto: Boolean(review.photo),
      authorId: memberId,
      authorName: user?.name || "A cook",
      createdAt: Date.parse(review.savedAt),
    };
    // Updating keeps existing comments when this review is posted again.
    await update(ref(database, `${path}/${review.id}`), post);
    return post;
  } catch (error) {
    if (error.code?.startsWith("storage/")) throw new Error("Photo upload failed. Check that Firebase Storage is enabled and this app has upload permission, then try again.");
    if (/permission/i.test(error.code || error.message || "")) throw new Error("Firebase denied access to the meal feed. Your project owner needs to check its database rules.");
    throw error;
  }
}

export function subscribeMealFeed(room, onPosts, onError) {
  const feed = query(ref(database, roomPath(room)), orderByChild("createdAt"), limitToLast(50));
  return onValue(feed, (snapshot) => {
    const posts = Object.entries(snapshot.val() || {}).map(([id, post]) => ({ ...post, id }));
    onPosts(posts.sort((a, b) => b.createdAt - a.createdAt));
  }, onError);
}

export async function addMealComment(room, postId, user, text) {
  const body = text.trim();
  if (!body || body.length > 300) throw new Error("Enter a comment of up to 300 characters.");
  const memberId = room.memberId || user?.memberId || user?.id;
  if (!memberId) throw new Error("Rejoin your room before commenting.");
  await push(ref(database, `${roomPath(room)}/${postId}/comments`), {
    text: body,
    authorId: memberId,
    authorName: user?.name || "A cook",
    createdAt: Date.now(),
  });
}
export async function toggleMealLike(room, postId, user) {
  const memberId = room.memberId || user?.memberId || user?.id;
  if (!memberId) throw new Error("Rejoin your cooking room before liking a meal.");
  const result = await runTransaction(ref(database, `${roomPath(room)}/${postId}/likes/${memberId}`), (current) => current ? null : { name: user?.name || "A cook" });
  if (!result.committed) throw new Error("Could not update your like. Please try again.");
}