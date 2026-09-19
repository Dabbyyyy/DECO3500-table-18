export function generateRoomCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = Math.floor(
    100 + Math.random() * 900
  );

  const letters =
    characters[
      Math.floor(
        Math.random() * characters.length
      )
    ] +
    characters[
      Math.floor(
        Math.random() * characters.length
      )
    ];

  return `${letters}-${numbers}`;
}


export function createRoom(user) {
  const member = {
    id: crypto.randomUUID(),
    name: user.name,
    helperName: user.helperName,
    status: "joined",
  };

  return {
    code: generateRoomCode(),

    createdAt: Date.now(),

    members: [member],

    selectedMeal: null,

    status: "lobby",
  };
}


export function joinRoomLocally(
  currentRoom,
  user
) {
  const member = {
    id: crypto.randomUUID(),
    name: user.name,
    helperName: user.helperName,
    status: "joined",
  };

  return {
    ...currentRoom,

    members: [
      ...(currentRoom.members || []),
      member,
    ],
  };
}


export function updateMemberStatus(
  room,
  memberName,
  status
) {
  return {
    ...room,

    members: room.members.map((member) =>
      member.name === memberName
        ? {
            ...member,
            status,
          }
        : member
    ),
  };
}