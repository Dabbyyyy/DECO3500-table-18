import { useState } from "react";
import "./JoinRoom.css";

export default function JoinRoom({
  user,
  setUser,
  room,
  setRoom,
  onContinue,
  onBack,
}) {
  const [mode, setMode] = useState("join");

  function generateRoomCode() {
    const number = Math.floor(100 + Math.random() * 900);
    return `KTCN-${number}`;
  }

  function handleCreateRoom() {
    if (!user.name.trim() || !user.helperName.trim()) {
      alert("Please enter your name and helper name.");
      return;
    }

    const newCode = generateRoomCode();

    setRoom({
      code: newCode,
      members: [
        {
          id: crypto.randomUUID(),
          name: user.name,
          helperName: user.helperName,
        },
      ],
    });

    onContinue();
  }

  function handleJoinRoom() {
    if (
      !user.name.trim() ||
      !user.helperName.trim() ||
      !room.code.trim()
    ) {
      alert("Please complete all fields.");
      return;
    }

    setRoom((current) => ({
      ...current,
      members: [
        ...current.members,
        {
          id: crypto.randomUUID(),
          name: user.name,
          helperName: user.helperName,
        },
      ],
    }));

    onContinue();
  }

  return (
    <div className="join-page">

      {/* LEFT SIDE */}

      <section className="join-left">
        <div>
          <button
            className="back-button"
            onClick={onBack}
          >
            ←
          </button>

          <p className="join-eyebrow">
            COOKING SESSION
          </p>

          <h1>
            Cook with
            <br />
            your group.
          </h1>

          <p className="join-description">
            Create a cooking room or join your
            friends using their room code.
          </p>
        </div>

        <p className="join-note">
          Everyone gets their own named helper
          for hands-free cooking.
        </p>
      </section>

      {/* RIGHT SIDE */}

      <section className="join-right">

        <div className="join-mode">
          <button
            className={mode === "join" ? "active" : ""}
            onClick={() => setMode("join")}
          >
            Join room
          </button>

          <button
            className={mode === "create" ? "active" : ""}
            onClick={() => setMode("create")}
          >
            Create room
          </button>
        </div>

        <div className="join-form">

          <div className="input-group">
            <label>Your name</label>

            <input
              type="text"
              placeholder="e.g. Patricia"
              value={user.name}
              onChange={(e) =>
                setUser({
                  ...user,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div className="input-group">
            <label>Name your cooking helper</label>

            <input
              type="text"
              placeholder="e.g. Nova"
              value={user.helperName}
              onChange={(e) =>
                setUser({
                  ...user,
                  helperName: e.target.value,
                })
              }
            />

            <small>
              You'll use this name for voice commands
              while cooking.
            </small>
          </div>

          {mode === "join" && (
            <div className="input-group">
              <label>Room code</label>

              <input
                type="text"
                placeholder="KTCN-482"
                value={room.code}
                onChange={(e) =>
                  setRoom({
                    ...room,
                    code: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
          )}

        </div>

        <button
          className="join-main-button"
          onClick={
            mode === "join"
              ? handleJoinRoom
              : handleCreateRoom
          }
        >
          {mode === "join"
            ? "Join cooking room"
            : "Create cooking room"}
        </button>

      </section>
    </div>
  );
}