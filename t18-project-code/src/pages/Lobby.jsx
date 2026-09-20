import { useEffect } from "react";
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
  const members = room.members || [];

  const isHost =
    room.memberId === room.hostId;


  // =========================
  // LIVE FIREBASE ROOM
  // =========================

  useEffect(() => {
    if (!room.code) {
      return;
    }


    const unsubscribe = subscribeToRoom(
      room.code,
      (updatedRoom) => {
        if (!updatedRoom) {
          return;
        }


        setRoom((currentRoom) => ({
          ...currentRoom,
          ...updatedRoom,

          // Keep this device's identity
          memberId:
            currentRoom.memberId,
        }));


        // If the host changes the shared
        // room screen, everyone follows
        if (
          updatedRoom.screen ===
          "preferences"
        ) {
          onContinue();
        }
      }
    );


    return unsubscribe;
  }, [
    room.code,
    setRoom,
    onContinue,
  ]);


  // =========================
  // COPY ROOM CODE
  // =========================

  async function copyRoomCode() {
    try {
      await navigator.clipboard.writeText(
        room.code
      );

      alert(
        `Room code ${room.code} copied!`
      );
    } catch (error) {
      console.error(
        "Could not copy room code:",
        error
      );

      alert(
        `Room code: ${room.code}`
      );
    }
  }


  // =========================
  // ADMIN CONTINUE
  // =========================

  async function handleContinue() {
    if (!isHost) {
      return;
    }


    try {
      await changeRoomScreen(
        room.code,
        "preferences"
      );

      // We do NOT manually call
      // onContinue here.
      //
      // Firebase changes the screen,
      // then every device receives
      // the update through the listener.
    } catch (error) {
      console.error(
        "Could not continue:",
        error
      );

      alert(
        "Could not start the next step."
      );
    }
  }


  return (
    <div className="lobby-page">

      {/* LEFT */}

      <section className="lobby-left">

        <div>

          <button
            className="lobby-back"
            onClick={onBack}
          >
            ←
          </button>


          <p className="lobby-label">
            SESSION CODE
          </p>


          <div className="room-code-row">

            <h3>
              {room.code}
            </h3>


            <button
              className="copy-code"
              onClick={copyRoomCode}
            >
              Copy
            </button>

          </div>


          <h1>
            Cooking lobby
          </h1>


          <p className="lobby-description">
            Waiting for everyone to join before
            picking tonight's meal.
          </p>

        </div>


        <div>

          <div className="lobby-tip">

            {isHost ? (
              <>
                You are the room admin. Continue
                when everyone has joined.
              </>
            ) : (
              <>
                Waiting for the room admin to
                continue.
              </>
            )}

          </div>


          {isHost ? (

            <button
              className="lobby-continue"
              onClick={handleContinue}
            >
              {members.length} joined · Continue
            </button>

          ) : (

            <button
              className="lobby-continue lobby-waiting-button"
              disabled
            >
              {members.length} joined · Waiting for admin
            </button>

          )}

        </div>

      </section>


      {/* RIGHT */}

      <section className="lobby-right">

        <p className="lobby-group-title">
          Your cooking group
        </p>


        <div className="member-grid">

          {members.map(
            (member, index) => {

              const memberIsHost =
                member.id === room.hostId;


              return (
                <div
                  className="member-card"
                  key={
                    member.id || index
                  }
                >

                  <div
                    className={`member-avatar avatar-${
                      index % 3
                    }`}
                  >
                    {member.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>


                  <div className="member-info">

                    <strong>
                      {member.name}
                    </strong>


                    <span>
                      Hey {member.helperName}
                    </span>

                  </div>


                  <span className="joined-badge">
                    {memberIsHost
                      ? "Admin"
                      : "Joined"}
                  </span>

                </div>
              );
            }
          )}


          {/* WAITING SLOT */}

          <div className="member-card waiting-card">

            <div className="member-avatar waiting-avatar">
              ?
            </div>


            <div className="member-info">

              <strong>
                Waiting...
              </strong>

              <span>
                Share room code
              </span>

            </div>


            <span className="waiting-dot" />

          </div>

        </div>

      </section>

    </div>
  );
}