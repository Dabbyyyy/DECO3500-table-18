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
  onContinue,
  onBack,
}) {
  const [mode, setMode] = useState("join");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =========================
  // CREATE ROOM
  // =========================

  async function handleCreateRoom() {
    if (
      !user.name.trim() ||
      !user.helperName.trim()
    ) {
      setError(
        "Please enter your name and helper name."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      // Create room in Firebase
      const result = await createRoom(user);

      // Save room + current member locally
      setRoom({
        code: result.roomCode,

        memberId: result.memberId,

        members: [
          {
            id: result.memberId,
            name: user.name,
            helperName: user.helperName,
            status: "ready",
          },
        ],
      });

      onContinue();
    } catch (err) {
      console.error(
        "Error creating room:",
        err
      );

      setError(
        "Could not create the room. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }


  // =========================
  // JOIN ROOM
  // =========================

  async function handleJoinRoom() {
    if (
      !user.name.trim() ||
      !user.helperName.trim() ||
      !room.code.trim()
    ) {
      setError(
        "Please complete all fields."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      // Join existing Firebase room
      const result = await joinRoom(
        room.code,
        user
      );

      // Save room + current member ID locally
      setRoom((currentRoom) => ({
        ...currentRoom,

        code: result.roomCode,

        memberId: result.memberId,
      }));

      onContinue();
    } catch (err) {
      console.error(
        "Error joining room:",
        err
      );

      if (err.message === "Room not found") {
        setError(
          "Room not found. Check the room code and try again."
        );
      } else {
        setError(
          "Could not join the room. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="join-page">

      {/* =========================
          LEFT SIDE
      ========================= */}

      <section className="join-left">

        <div>

          <button
            className="back-button"
            onClick={onBack}
            disabled={loading}
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


      {/* =========================
          RIGHT SIDE
      ========================= */}

      <section className="join-right">

        {/* JOIN / CREATE SWITCH */}

        <div className="join-mode">

          <button
            className={
              mode === "join"
                ? "active"
                : ""
            }
            onClick={() => {
              setMode("join");
              setError("");
            }}
            disabled={loading}
          >
            Join room
          </button>


          <button
            className={
              mode === "create"
                ? "active"
                : ""
            }
            onClick={() => {
              setMode("create");
              setError("");
            }}
            disabled={loading}
          >
            Create room
          </button>

        </div>


        {/* FORM */}

        <div className="join-form">

          {/* YOUR NAME */}

          <div className="input-group">

            <label>
              Your name
            </label>

            <input
              type="text"
              placeholder="e.g. Patricia"

              value={user.name}

              disabled={loading}

              onChange={(e) =>
                setUser({
                  ...user,
                  name: e.target.value,
                })
              }
            />

          </div>


          {/* HELPER NAME */}

          <div className="input-group">

            <label>
              Name your cooking helper
            </label>

            <input
              type="text"
              placeholder="e.g. Nova"

              value={user.helperName}

              disabled={loading}

              onChange={(e) =>
                setUser({
                  ...user,
                  helperName:
                    e.target.value,
                })
              }
            />


            <small>
              You'll use this name for
              voice commands while cooking.
            </small>

          </div>


          {/* ROOM CODE */}

          {mode === "join" && (

            <div className="input-group">

              <label>
                Room code
              </label>

              <input
                type="text"
                placeholder="KTCN-482"

                value={room.code}

                disabled={loading}

                onChange={(e) =>
                  setRoom({
                    ...room,

                    code:
                      e.target.value
                        .toUpperCase(),
                  })
                }
              />

            </div>

          )}

        </div>


        {/* ERROR MESSAGE */}

        {error && (

          <p className="join-error">
            {error}
          </p>

        )}


        {/* MAIN BUTTON */}

        <button
          className="join-main-button"

          disabled={loading}

          onClick={
            mode === "join"
              ? handleJoinRoom
              : handleCreateRoom
          }
        >

          {loading
            ? mode === "join"
              ? "Joining..."
              : "Creating..."
            : mode === "join"
              ? "Join cooking room"
              : "Create cooking room"}

        </button>

      </section>

    </div>
  );
}