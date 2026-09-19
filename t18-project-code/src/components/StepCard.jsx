export default function StepCard({
  step,
  number,
  state = "next",
}) {
  const isDone = state === "done";
  const isCurrent = state === "current";

  return (
    <div
      style={{
        minHeight: "40px",
        padding: "6px 8px",
        display: "flex",
        alignItems: "center",
        gap: "7px",

        border: isCurrent
          ? "1px solid #d66324"
          : "1px solid #e8e0d8",

        borderRadius: "7px",

        background: isCurrent
          ? "#fffaf6"
          : "#ffffff",

        opacity: isDone ? 0.65 : 1,
      }}
    >
      <div
        style={{
          width: "23px",
          height: "23px",
          flexShrink: 0,

          display: "grid",
          placeItems: "center",

          borderRadius: "50%",

          background: isDone
            ? "#e8eee2"
            : isCurrent
              ? "#d66324"
              : "#f0ebe6",

          color: isDone
            ? "#718164"
            : isCurrent
              ? "#ffffff"
              : "#938980",

          fontSize: "7px",
          fontWeight: "700",
        }}
      >
        {isDone ? "✓" : number}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1px",
        }}
      >
        <strong
          style={{
            fontSize: "7px",
            color: "#4b4038",
          }}
        >
          {step}
        </strong>

        <span
          style={{
            fontSize: "6px",
            color: isCurrent
              ? "#d66324"
              : "#a1978e",
          }}
        >
          {isDone
            ? "Done"
            : isCurrent
              ? "Current step"
              : "Next"}
        </span>
      </div>
    </div>
  );
}