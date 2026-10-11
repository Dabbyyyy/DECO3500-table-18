
import { useEffect, useState } from "react";
import "./Lobby.css";

import {
  subscribeToRoom,
  changeRoomScreen,
} from "../services/roomService";

export default function Lobby({
  user,
  room,
  setRoom,
  onContinue,
  onBack,
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const members = room.members || [];
  const isHost = room.memberId === room.hostId;

  useEffect(() => {
    if (!room.code) return;

    return subscribeToRoom(room.code, (updatedRoom) => {
      if (!updatedRoom) return;

      setRoom((previous) => ({
        ...updatedRoom,
        memberId: previous.memberId,
      }));

      if (updatedRoom.screen === "preferences") {
        onContinue();
      }
    });
  }, [room.code, setRoom, onContinue]);

  async function copyRoomCode() {
    try {
      await navigator.clipboard.writeText(room.code);
      setMessage("Session code copied!");
    } catch (error) {
      console.error(error);
      setMessage(`Share this code: ${room.code}`);
    }
  }

  async function handleContinue() {
    if (!isHost || busy) return;

    try {
      setBusy(true);
      setMessage("");

      await changeRoomScreen(room.code, "preferences");
    } catch (error) {
      console.error(error);
      setMessage("Could not continue. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="lobby-page">
      <div className="lobby-scroll">
        <button
          type="button"
          className="lobby-back"
          onClick={onBack}
          aria-label="Go back"
        >
          ‹
        </button>

        <p className="lobby-label">SESSION CODE</p>

        <button
          type="button"
          className="lobby-room-code"
          onClick={copyRoomCode}
          title="Tap to copy session code"
        >
          {room.code}
          <span aria-hidden="true"> ⧉</span>
        </button>

        <h1>Cooking lobby</h1>

        <p className="lobby-description">
          Waiting for everyone to join before picking
          tonight's meal.
        </p>

        <div className="lobby-members">
          {members.map((member, index) => {
            const isCurrentUser =
              member.id === room.memberId;

            return (
              <div
                key={member.id || index}
                className={`lobby-member ${
                  isCurrentUser ? "is-you" : ""
                }`}
              >
                <div
                  className={`lobby-avatar avatar-${
                    index % 4
                  }`}
                >
                  {member.name
                    ?.charAt(0)
                    .toUpperCase() || "?"}
                </div>

                <div className="lobby-member-details">
                  <strong>
                    {isCurrentUser ? "You" : member.name}
                  </strong>

                  <span>
                    Hey {member.helperName || "Helper"}
                  </span>
                </div>

                <span className="lobby-member-status">
                  Joined
                </span>
              </div>
            );
          })}

          <div className="lobby-member lobby-empty">
            <div className="lobby-avatar lobby-avatar-empty">
              ?
            </div>

            <div className="lobby-member-details">
              <span>Waiting...</span>
            </div>
          </div>
        </div>

        {message && (
          <p className="lobby-message" role="status">
            {message}
          </p>
        )}
      </div>

      <div className="lobby-bottom">
        <div className="lobby-tip">
          {isHost
            ? "Each cook gets their own named assistant so voice commands never overlap."
            : "Waiting for the session admin to continue once everyone has joined."}
        </div>

        <button
          type="button"
          className="lobby-continue"
          disabled={!isHost || busy}
          onClick={handleContinue}
        >
          {isHost
            ? busy
              ? "Continuing..."
              : `Continue (${members.length})`
            : `Waiting for admin (${members.length})`}
        </button>
      </div>
    </main>
  );
}
