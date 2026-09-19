export default function VoiceButton({
  listening,
  supported = true,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!supported}
      style={{
        width: "100%",
        padding: "7px 9px",

        display: "flex",
        alignItems: "center",

        gap: "7px",

        border: listening
          ? "1px solid #d66324"
          : "1px solid transparent",

        borderRadius: "7px",

        background: listening
          ? "#fff3eb"
          : "#f3ede4",

        color: "#5b5048",

        textAlign: "left",

        cursor: supported
          ? "pointer"
          : "default",
      }}
    >
      <div
        style={{
          width: "25px",
          height: "25px",
          flexShrink: 0,

          display: "grid",
          placeItems: "center",

          borderRadius: "50%",

          background: "#fff8f2",

          fontSize: "11px",
        }}
      >
        {listening ? "●" : "🎙"}
      </div>

      <div>
        <strong
          style={{
            display: "block",
            fontSize: "7px",
          }}
        >
          {!supported
            ? "Voice unavailable"
            : listening
              ? "Listening..."
              : "Voice commands"}
        </strong>

        <span
          style={{
            fontSize: "6px",
            color: "#91867d",
          }}
        >
          {supported
            ? "Tap to start listening"
            : "Use the buttons instead"}
        </span>
      </div>
    </button>
  );
}