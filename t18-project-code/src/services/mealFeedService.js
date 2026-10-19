
import {
  ref,
  update,
  push,
  onValue,
  query,
  orderByChild,
  limitToLast,
  runTransaction,
} from "firebase/database";

import { database } from "../firebase";

// Get the Firebase path for the cooking room.
function roomPath(room) {
  const code = room?.code || room?.roomCode;

  if (
    !code ||
    [".", "#", "$", "[", "]", "/"].some(
      (character) => code.includes(character)
    )
  ) {
    throw new Error(
      "Rejoin your cooking room before sharing."
    );
  }

  return `rooms/${code}/mealPosts`;
}

// Get the current member's ID.
function getMemberId(room, user) {
  return (
    room?.memberId ||
    user?.memberId ||
    user?.id ||
    null
  );
}

// Get an existing recipe image URL.
// No Firebase Storage uploads are used.
function getRecipeImage(review) {
  const image =
    review?.recipeImage ||
    review?.image ||
    review?.imageUrl ||
    review?.image_url ||
    "";

  return typeof image === "string" ? image : "";
}

// Post a completed meal review.
// Saves text, ratings and an existing recipe image URL
// directly to Firebase Realtime Database.
export async function postMealReview(
  review,
  room,
  user
) {
  const path = roomPath(room);

  const memberId = getMemberId(room, user);

  if (!memberId) {
    throw new Error(
      "Your room membership is missing. Rejoin the room before posting."
    );
  }

  if (!review?.id) {
    throw new Error(
      "Meal review ID is missing."
    );
  }

  const rating = Number(review.rating);

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new Error(
      "Choose a rating between 1 and 5 stars."
    );
  }

  const image = getRecipeImage(review);

  const post = {
    id: review.id,

    recipeId: review.recipeId || "",

    mealName: review.mealName || "Our meal",

    members: review.members || [],

    rating,

    tags: review.tags || [],

    caption: String(
      review.caption || ""
    ).trim().slice(0, 300),

    // Reuse the existing recipe image.
    // This is only a URL or image path.
    image,
    recipeImage: image,

    // No photo upload.
    hasUserPhoto: false,

    authorId: memberId,

    authorName: user?.name || "A cook",

    createdAt:
      Date.parse(review.savedAt) || Date.now(),
  };

  try {
    await update(
      ref(database, `${path}/${review.id}`),
      post
    );

    console.info(
      "Meal review posted successfully:",
      review.id
    );

    return post;
  } catch (error) {
    console.error(
      "Meal review posting failed:",
      error
    );

    if (
      /permission/i.test(
        `${error?.code || ""} ${error?.message || ""}`
      )
    ) {
      throw new Error(
        "Firebase denied access to the meal feed. Check your Realtime Database rules."
      );
    }

    throw new Error(
      error?.message ||
      "Could not post your meal review."
    );
  }
}

// Subscribe to the cooking group's meal feed.
// Updates automatically when a meal is posted,
// liked or commented on.
export function subscribeMealFeed(
  room,
  onPosts,
  onError
) {
  const feed = query(
    ref(database, roomPath(room)),
    orderByChild("createdAt"),
    limitToLast(50)
  );

  return onValue(
    feed,
    (snapshot) => {
      const posts = Object.entries(
        snapshot.val() || {}
      ).map(([id, post]) => ({
        ...post,
        id,
      }));

      posts.sort(
        (a, b) =>
          Number(b.createdAt || 0) -
          Number(a.createdAt || 0)
      );

      onPosts(posts);
    },
    (error) => {
      console.error(
        "Meal feed subscription failed:",
        error
      );

      onError?.(error);
    }
  );
}

// Add a comment to a meal post.
export async function addMealComment(
  room,
  postId,
  user,
  text
) {
  const body = String(text || "").trim();

  if (!body || body.length > 300) {
    throw new Error(
      "Enter a comment of up to 300 characters."
    );
  }

  const memberId = getMemberId(room, user);

  if (!memberId) {
    throw new Error(
      "Rejoin your room before commenting."
    );
  }

  if (!postId) {
    throw new Error(
      "Meal post ID is missing."
    );
  }

  try {
    await push(
      ref(
        database,
        `${roomPath(room)}/${postId}/comments`
      ),
      {
        text: body,

        authorId: memberId,

        authorName: user?.name || "A cook",

        createdAt: Date.now(),
      }
    );
  } catch (error) {
    console.error(
      "Could not add meal comment:",
      error
    );

    throw new Error(
      "Could not send your comment. Check your connection and try again."
    );
  }
}

// Like or unlike a meal post.
export async function toggleMealLike(
  room,
  postId,
  user
) {
  const memberId = getMemberId(room, user);

  if (!memberId) {
    throw new Error(
      "Rejoin your cooking room before liking a meal."
    );
  }

  if (!postId) {
    throw new Error(
      "Meal post ID is missing."
    );
  }

  try {
    const result = await runTransaction(
      ref(
        database,
        `${roomPath(room)}/${postId}/likes/${memberId}`
      ),
      (current) =>
        current
          ? null
          : {
              name: user?.name || "A cook",
            }
    );

    if (!result.committed) {
      throw new Error(
        "Could not update your like."
      );
    }
  } catch (error) {
    console.error(
      "Could not toggle meal like:",
      error
    );

    throw new Error(
      "Could not update your like. Please try again."
    );
  }
}
