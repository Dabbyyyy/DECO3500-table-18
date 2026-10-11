
import { useState } from "react";
import "./JoinRoom.css";

import {
  createRoom,
  joinRoom,
} from "../services/roomService";

export default function JoinRoom({
  user,
  setUser,
  room,
  setRoom,
  initialMode = "create",
  onContinue,
  onBack,
}) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  async function handleCreateRoom() {
    if (!user.name.trim() || !user.helperName.trim()) {
      setError("Please enter your name and helper name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await createRoom({
        name: user.name.trim(),
        helperName: user.helperName.trim(),
      });

      setRoom({
        code: result.roomCode,
        memberId: result.memberId,
        hostId: result.hostId,
        members: [
          {
            id: result.memberId,
            name: user.name.trim(),
            helperName: user.helperName.trim(),
            status: "ready",
          },
        ],
      });

      onContinue();
    } catch (err) {
      console.error("Error creating room:", err);
      setError("Could not create the room. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom() {
    if (
      !user.name.trim() ||
      !user.helperName.trim() ||
      !room.code.trim()
    ) {
      setError("Please complete all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await joinRoom(room.code, {
        name: user.name.trim(),
        helperName: user.helperName.trim(),
      });

      setRoom((previous) => ({
        ...previous,
        code: result.roomCode,
        memberId: result.memberId,
        hostId: result.hostId,
      }));

      onContinue();
    } catch (err) {
      console.error("Error joining room:", err);

      setError(
        err.message === "Room not found"
          ? "Room not found. Check the session code."
          : "Could not join the room. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    if (mode === "create") {
      handleCreateRoom();
    } else {
      handleJoinRoom();
    }
  }

  return (
    <main className="join-page">
      <div className="join-scroll">
        <button
          type="button"
          className="join-back"
          onClick={onBack}
          disabled={loading}
          aria-label="Go back"
        >
          ‹
        </button>

        <p className="join-eyebrow">COOKING SESSION</p>

        <h1>
          {mode === "create"
            ? "Start cooking together"
            : "Join your cooking group"}
        </h1>

        <p className="join-description">
          {mode === "create"
            ? "Create a shared session and invite your friends to cook together."
            : "Enter your details and the session code shared by your group."}
        </p>

        <div className="join-mode">
          <button
            type="button"
            className={mode === "create" ? "active" : ""}
            onClick={() => changeMode("create")}
            disabled={loading}
          >
            Create session
          </button>

          <button
            type="button"
            className={mode === "join" ? "active" : ""}
            onClick={() => changeMode("join")}
            disabled={loading}
          >
            Join session
          </button>
        </div>

        <form
          id="join-session-form"
          className="join-form"
          onSubmit={handleSubmit}
        >
          <div className="join-field">
            <label htmlFor="join-name">Your name</label>
            <input
              id="join-name"
              name="name"
              type="text"
              placeholder="e.g. Patricia"
              autoComplete="given-name"
              maxLength={40}
              value={user.name}
              disabled={loading}
              onChange={(event) =>
                setUser((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
            />
          </div>

          <div className="join-field">
            <label htmlFor="join-helper">
              Name your cooking helper
            </label>

            <input
              id="join-helper"
              name="helperName"
              type="text"
              placeholder="e.g. Nova"
              maxLength={30}
              value={user.helperName}
              disabled={loading}
              onChange={(event) =>
                setUser((previous) => ({
                  ...previous,
                  helperName: event.target.value,
                }))
              }
            />

            <small>
              This is the name you'll use for voice commands
              while cooking.
            </small>
          </div>

          {mode === "join" && (
            <div className="join-field">
              <label htmlFor="join-code">
                Session code
              </label>

              <input
                id="join-code"
                name="sessionCode"
                type="text"
                placeholder="KTCN-482"
                autoCapitalize="characters"
                maxLength={12}
                value={room.code}
                disabled={loading}
                onChange={(event) =>
                  setRoom((previous) => ({
                    ...previous,
                    code: event.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
          )}

          {error && (
            <p className="join-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>

      <div className="join-bottom">
        <div className="join-note">
          Each cook gets their own named assistant so voice
          commands never overlap.
        </div>

        <button
          type="submit"
          form="join-session-form"
          className="join-main-button"
          disabled={loading}
        >
          {loading
            ? mode === "create"
              ? "Creating session..."
              : "Joining session..."
            : mode === "create"
              ? "Create cooking session"
              : "Join cooking session"}
        </button>
      </div>
    </main>
  );
}
