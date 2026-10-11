
import {
  ref,
  set,
  get,
  update,
  onValue,
  runTransaction,
} from "firebase/database";

import { database } from "../firebase";

export function generateRoomCode() {
  const number = Math.floor(100 + Math.random() * 900);
  return `KTCN-${number}`;
}

function getDefaultPreferences() {
  return {
    dietary: ["No Allergies"],
    cuisine: "Any",
    budget: "$8–12 per person",
    cookingTime: "Under 30 min",
    difficulty: "Easy",
    foodLikes: [],
    ready: false,
  };
}

// CREATE ROOM

export async function createRoom(user) {
  let roomCode = generateRoomCode();
  let roomSnapshot = await get(
    ref(database, `rooms/${roomCode}`)
  );

  while (roomSnapshot.exists()) {
    roomCode = generateRoomCode();
    roomSnapshot = await get(
      ref(database, `rooms/${roomCode}`)
    );
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

  await set(
    ref(database, `rooms/${roomCode}`),
    roomData
  );

  return {
    roomCode,
    memberId,
    hostId: memberId,
  };
}

// JOIN ROOM

export async function joinRoom(roomCode, user) {
  const cleanCode = roomCode.trim().toUpperCase();
  const roomRef = ref(database, `rooms/${cleanCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error("Room not found");
  }

  const roomData = snapshot.val();
  const memberId = crypto.randomUUID();

  await set(
    ref(database, `rooms/${cleanCode}/members/${memberId}`),
    {
      id: memberId,
      name: user.name,
      helperName: user.helperName || "",
      status: "ready",
      joinedAt: Date.now(),
      preferences: getDefaultPreferences(),
    }
  );

  return {
    roomCode: cleanCode,
    memberId,
    hostId: roomData.hostId,
  };
}

// REAL-TIME ROOM SUBSCRIPTION

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
      members: data.members
        ? Object.values(data.members)
        : [],
    });
  });
}

// ROOM NAVIGATION

export async function changeRoomScreen(roomCode, screen) {
  if (!roomCode) return;

  await update(ref(database, `rooms/${roomCode}`), {
    screen,
  });
}

// MEMBER STATUS

export async function updateMemberStatus(
  roomCode,
  memberId,
  status
) {
  if (!roomCode || !memberId) return;

  await update(
    ref(database, `rooms/${roomCode}/members/${memberId}`),
    { status }
  );
}

// MEMBER PREFERENCES

export async function updateMemberPreferences(
  roomCode,
  memberId,
  preferences
) {
  if (!roomCode || !memberId) return;

  await set(
    ref(
      database,
      `rooms/${roomCode}/members/${memberId}/preferences`
    ),
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
    ref(
      database,
      `rooms/${roomCode}/members/${memberId}/preferences`
    ),
    {
      [field]: value,
      ready: false,
    }
  );
}

export async function setMemberReady(
  roomCode,
  memberId,
  ready
) {
  if (!roomCode || !memberId) return;

  await update(
    ref(
      database,
      `rooms/${roomCode}/members/${memberId}/preferences`
    ),
    { ready }
  );
}

// MEAL RECOMMENDATIONS

export async function setMealSuggestions(
  roomCode,
  meals,
  searchProfile
) {
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

  await set(
    ref(database, `rooms/${roomCode}/selectedRecipe`),
    recipe
  );
}

// ============================================
// COOKING SETUP
// ============================================

// Initialise equipment and task assignments.
// A transaction prevents a second device from
// overwriting an existing setup for the recipe.

export async function initializeCookingSetup(
  roomCode,
  recipe,
  members
) {
  if (!roomCode || !recipe) return;

  const tasks = Array.isArray(recipe.tasks)
    ? recipe.tasks
    : [];

  const people = Array.isArray(members)
    ? members
    : [];

  await runTransaction(
    ref(database, `rooms/${roomCode}/cookingSetup`),
    (current) => {
      if (
        current?.recipeId === String(recipe.id) &&
        Array.isArray(current.assignments)
      ) {
        return;
      }

      return {
        recipeId: String(recipe.id),
        stage: "equipment",

        equipment: {
          Stove: true,
          "Rice Cooker": true,
          "Kitchen Counter": true,
          Knife: true,
          Wok: false,
          "Frying Pan": true,
        },

        assignments: tasks.map((task, index) => ({
          ...task,
          id: String(task.id ?? `task-${index}`),
          assignedToId: people.length
            ? people[index % people.length].id
            : null,
        })),
      };
    }
  );
}

// UPDATE EQUIPMENT

export async function updateCookingEquipment(
  roomCode,
  equipmentName,
  available
) {
  if (!roomCode) return;

  await update(
    ref(
      database,
      `rooms/${roomCode}/cookingSetup/equipment`
    ),
    {
      [equipmentName]: available,
    }
  );
}

// CHANGE SETUP SCREEN

export async function setCookingSetupStage(
  roomCode,
  stage
) {
  if (!roomCode) return;

  await update(
    ref(database, `rooms/${roomCode}/cookingSetup`),
    { stage }
  );
}

// CLAIM, RELEASE OR REASSIGN TASK

export async function assignCookingTask(
  roomCode,
  taskId,
  memberId
) {
  if (!roomCode) return;

  await runTransaction(
    ref(
      database,
      `rooms/${roomCode}/cookingSetup/assignments`
    ),
    (current) => {
      if (!Array.isArray(current)) return;

      return current.map((task) =>
        String(task.id) === String(taskId)
          ? {
              ...task,
              assignedToId: memberId || null,
            }
          : task
      );
    }
  );
}
