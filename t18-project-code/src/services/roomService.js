import {
  ref,
  set,
  get,
  update,
  onValue,
} from "firebase/database";

import { database } from "../firebase";

export function generateRoomCode() {
  const number = Math.floor(100 + Math.random() * 900);
  return `KTCN-${number}`;
}

function getDefaultPreferences() {
  return {
    area: "Any",
    category: "Any",
    ingredient: "Any",
    cookingConfidence: "Beginner",
    ready: false,
  };
}

export async function createRoom(user) {
  let roomCode = generateRoomCode();
  let roomSnapshot = await get(ref(database, `rooms/${roomCode}`));

  while (roomSnapshot.exists()) {
    roomCode = generateRoomCode();
    roomSnapshot = await get(ref(database, `rooms/${roomCode}`));
  }

  const memberId = crypto.randomUUID();

  const roomData = {
    code: roomCode,
    hostId: memberId,
    screen: "lobby",
    createdAt: Date.now(),
    members: {
      [memberId]: {
        id: memberId,
        name: user.name,
        helperName: user.helperName || "",
        status: "ready",
        joinedAt: Date.now(),
        preferences: getDefaultPreferences(),
      },
    },
  };

  await set(ref(database, `rooms/${roomCode}`), roomData);

  return {
    roomCode,
    memberId,
    hostId: memberId,
  };
}

export async function joinRoom(roomCode, user) {
  const cleanCode = roomCode.trim().toUpperCase();
  const roomRef = ref(database, `rooms/${cleanCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error("Room not found");
  }

  const roomData = snapshot.val();
  const memberId = crypto.randomUUID();

  await set(ref(database, `rooms/${cleanCode}/members/${memberId}`), {
    id: memberId,
    name: user.name,
    helperName: user.helperName || "",
    status: "ready",
    joinedAt: Date.now(),
    preferences: getDefaultPreferences(),
  });

  return {
    roomCode: cleanCode,
    memberId,
    hostId: roomData.hostId,
  };
}

export function subscribeToRoom(roomCode, callback) {
  if (!roomCode) return () => {};

  const roomRef = ref(database, `rooms/${roomCode}`);

  return onValue(roomRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const data = snapshot.val();

    callback({
      ...data,
      members: data.members ? Object.values(data.members) : [],
    });
  });
}

export async function changeRoomScreen(roomCode, screen) {
  if (!roomCode) return;

  await update(ref(database, `rooms/${roomCode}`), {
    screen,
  });
}

export async function updateMemberStatus(roomCode, memberId, status) {
  if (!roomCode || !memberId) return;

  await update(ref(database, `rooms/${roomCode}/members/${memberId}`), {
    status,
  });
}

export async function updateMemberPreferences(
  roomCode,
  memberId,
  preferences
) {
  if (!roomCode || !memberId) return;

  await set(
    ref(database, `rooms/${roomCode}/members/${memberId}/preferences`),
    preferences
  );
}

export async function updateMemberPreference(
  roomCode,
  memberId,
  field,
  value
) {
  if (!roomCode || !memberId || !field) return;

  await update(
    ref(database, `rooms/${roomCode}/members/${memberId}/preferences`),
    {
      [field]: value,
      ready: false,
    }
  );
}

export async function setMemberReady(roomCode, memberId, ready) {
  if (!roomCode || !memberId) return;

  await update(
    ref(database, `rooms/${roomCode}/members/${memberId}/preferences`),
    { ready }
  );
}

export async function setMealSuggestions(roomCode, meals, searchProfile) {
  if (!roomCode) return;

  await update(ref(database, `rooms/${roomCode}`), {
    mealSuggestions: meals,
    mealSearchProfile: searchProfile,
  });
}

export async function clearMealSuggestions(roomCode) {
  if (!roomCode) return;

  await update(ref(database, `rooms/${roomCode}`), {
    mealSuggestions: null,
    mealSearchProfile: null,
    selectedRecipe: null,
  });
}

export async function setSelectedRecipe(roomCode, recipe) {
  if (!roomCode) return;

  await set(ref(database, `rooms/${roomCode}/selectedRecipe`), recipe);
}
