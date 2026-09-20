import {
  ref,
  set,
  get,
  update,
  onValue,
} from "firebase/database";

import { database } from "../firebase";


// =========================
// GENERATE ROOM CODE
// =========================

export function generateRoomCode() {
  const number = Math.floor(
    100 + Math.random() * 900
  );

  return `KTCN-${number}`;
}


// =========================
// CREATE ROOM
// =========================

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

        preferences: {
          cuisine: "Any",
        },
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


// =========================
// JOIN ROOM
// =========================

export async function joinRoom(
  roomCode,
  user
) {
  const cleanCode = roomCode
    .trim()
    .toUpperCase();


  const roomRef = ref(
    database,
    `rooms/${cleanCode}`
  );


  const snapshot = await get(roomRef);


  if (!snapshot.exists()) {
    throw new Error("Room not found");
  }


  const roomData = snapshot.val();

  const memberId = crypto.randomUUID();


  await set(
    ref(
      database,
      `rooms/${cleanCode}/members/${memberId}`
    ),
    {
      id: memberId,

      name: user.name,

      helperName:
        user.helperName || "",

      status: "ready",

      joinedAt: Date.now(),

      preferences: {
        cuisine: "Any",
      },
    }
  );


  return {
    roomCode: cleanCode,
    memberId,
    hostId: roomData.hostId,
  };
}


// =========================
// LIVE ROOM LISTENER
// =========================

export function subscribeToRoom(
  roomCode,
  callback
) {
  if (!roomCode) {
    return () => {};
  }


  const roomRef = ref(
    database,
    `rooms/${roomCode}`
  );


  const unsubscribe = onValue(
    roomRef,
    (snapshot) => {
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
    }
  );


  return unsubscribe;
}


// =========================
// CHANGE SHARED SCREEN
// =========================

export async function changeRoomScreen(
  roomCode,
  screen
) {
  if (!roomCode) {
    return;
  }


  await update(
    ref(database, `rooms/${roomCode}`),
    {
      screen,
    }
  );
}


// =========================
// UPDATE MEMBER STATUS
// =========================

export async function updateMemberStatus(
  roomCode,
  memberId,
  status
) {
  if (!roomCode || !memberId) {
    return;
  }


  await update(
    ref(
      database,
      `rooms/${roomCode}/members/${memberId}`
    ),
    {
      status,
    }
  );
}


// =========================
// UPDATE MEMBER PREFERENCE
// =========================

export async function updateMemberPreference(
  roomCode,
  memberId,
  field,
  value
) {
  if (
    !roomCode ||
    !memberId ||
    !field
  ) {
    return;
  }


  await update(
    ref(
      database,
      `rooms/${roomCode}/members/${memberId}/preferences`
    ),
    {
      [field]: value,
    }
  );
}