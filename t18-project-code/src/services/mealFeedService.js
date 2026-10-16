
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

import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import app, { database } from "../firebase";

const storage = getStorage(app);
const UPLOAD_TIMEOUT_MS = 180000;

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

function readableUploadError(error) {
  const code = error?.code || "";

  if (code === "storage/unauthorized") {
    return new Error(
      "Firebase Storage denied the photo upload. Check your Storage security rules and authentication."
    );
  }

  if (code === "storage/unauthenticated") {
    return new Error(
      "Firebase Storage requires authentication. This app is not signed in to Firebase Authentication."
    );
  }

  if (code === "storage/quota-exceeded") {
    return new Error(
      "Firebase Storage quota exceeded. Check your Firebase plan and usage."
    );
  }

  if (code === "storage/retry-limit-exceeded") {
    return new Error(
      "Firebase Storage could not finish the upload. Check your connection and Storage configuration."
    );
  }

  if (code === "storage/canceled") {
    return new Error(
      "The photo upload was cancelled."
    );
  }

  if (code.startsWith("storage/")) {
    return new Error(
      `Firebase photo upload failed (${code}). Check the browser console for details.`
    );
  }

  return error instanceof Error
    ? error
    : new Error("Photo upload failed.");
}

async function uploadMealPhoto(photo, path) {
  const destination = storageRef(storage, path);

  const uploadTask = uploadBytesResumable(
    destination,
    photo,
    {
      contentType:
        photo.type || "application/octet-stream",
    }
  );

  await new Promise((resolve, reject) => {
    let settled = false;
    let timeout;

    function finish(error) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }

    timeout = setTimeout(() => {
      finish(
        new Error(
          "Photo upload timed out after 3 minutes. Check Firebase Storage permissions and your connection."
        )
      );
      uploadTask.cancel();
    }, UPLOAD_TIMEOUT_MS);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percentage = Math.round(
          (snapshot.bytesTransferred /
            Math.max(snapshot.totalBytes, 1)) *
            100
        );

        console.info(
          `Meal photo upload: ${percentage}%`
        );
      },
      (error) => {
        console.error(
          "Firebase Storage upload error:",
          error.code,
          error.message
        );

        finish(readableUploadError(error));
      },
      () => finish()
    );
  });

  return getDownloadURL(destination);
}

export async function postMealReview(
  review,
  room,
  user
) {
  const path = roomPath(room);

  const memberId =
    room?.memberId ||
    user?.memberId ||
    user?.id;

  if (!memberId) {
    throw new Error(
      "Your room membership is missing. Rejoin the room before posting."
    );
  }

  let image = review.recipeImage || "";

  try {
    if (review.photo) {
      image = await uploadMealPhoto(
        review.photo,
        `meal-photos/${
          room.code || room.roomCode
        }/${memberId}/${review.id}`
      );
    }

    const post = {
      id: review.id,
      recipeId: review.recipeId || "",
      mealName: review.mealName || "Our meal",
      members: review.members || [],
      rating: review.rating,
      tags: review.tags || [],
      caption: review.caption || "",
      image,
      hasUserPhoto: Boolean(review.photo),
      authorId: memberId,
      authorName: user?.name || "A cook",
      createdAt:
        Date.parse(review.savedAt) || Date.now(),
    };

    await update(
      ref(database, `${path}/${review.id}`),
      post
    );

    return post;
  } catch (error) {
    console.error(
      "Meal review posting failed:",
      error
    );

    if (
      error?.code?.startsWith("storage/")
    ) {
      throw readableUploadError(error);
    }

    if (
      /permission/i.test(
        `${error?.code || ""} ${error?.message || ""}`
      ) &&
      !/Storage/i.test(error?.message || "")
    ) {
      throw new Error(
        "Firebase denied access to the meal feed. Check your Realtime Database rules."
      );
    }

    throw error;
  }
}

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

      onPosts(
        posts.sort(
          (a, b) => b.createdAt - a.createdAt
        )
      );
    },
    onError
  );
}

export async function addMealComment(
  room,
  postId,
  user,
  text
) {
  const body = text.trim();

  if (!body || body.length > 300) {
    throw new Error(
      "Enter a comment of up to 300 characters."
    );
  }

  const memberId =
    room?.memberId ||
    user?.memberId ||
    user?.id;

  if (!memberId) {
    throw new Error(
      "Rejoin your room before commenting."
    );
  }

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
}

export async function toggleMealLike(
  room,
  postId,
  user
) {
  const memberId =
    room?.memberId ||
    user?.memberId ||
    user?.id;

  if (!memberId) {
    throw new Error(
      "Rejoin your cooking room before liking a meal."
    );
  }

  const result = await runTransaction(
    ref(
      database,
      `${roomPath(room)}/${postId}/likes/${memberId}`
    ),
    (current) =>
      current
        ? null
        : { name: user?.name || "A cook" }
  );

  if (!result.committed) {
    throw new Error(
      "Could not update your like. Please try again."
    );
  }
}
