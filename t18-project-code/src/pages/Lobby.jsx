import "./Lobby.css";

export default function Lobby({
  user,
  room,
  onContinue,
  onBack,
}) {
  const members = room.members || [];

  function copyRoomCode() {
    navigator.clipboard.writeText(room.code);

    alert(`Room code ${room.code} copied!`);
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
            <h3>{room.code}</h3>

            <button
              className="copy-code"
              onClick={copyRoomCode}
            >
              Copy
            </button>
          </div>

          <h1>Cooking lobby</h1>

          <p className="lobby-description">
            Waiting for everyone to join before
            picking tonight's meal.
          </p>
        </div>

        <div>
          <div className="lobby-tip">
            Each cook gets their own named helper
            so voice commands never overlap.
          </div>

          <button
            className="lobby-continue"
            onClick={onContinue}
          >
            {members.length} joined · Continue
          </button>
        </div>

      </section>


      {/* RIGHT */}

      <section className="lobby-right">

        <p className="lobby-group-title">
          Your cooking group
        </p>

        <div className="member-grid">

          {members.map((member, index) => (
            <div
              className="member-card"
              key={member.id || index}
            >

              <div
                className={`member-avatar avatar-${index % 3}`}
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
                Joined
              </span>

            </div>
          ))}


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