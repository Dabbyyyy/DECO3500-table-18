export default function ProgressBar({
  value = 0,
  showPercentage = false,
}) {
  const safeValue = Math.min(
    100,
    Math.max(0, value)
  );

  return (
    <div>
      {showPercentage && (
        <div
          style={{
            marginBottom: "4px",
            textAlign: "right",
            fontSize: "7px",
            fontWeight: "700",
            color: "#d66324",
          }}
        >
          {Math.round(safeValue)}%
        </div>
      )}

      <div
        style={{
          width: "100%",
          height: "5px",
          overflow: "hidden",
          borderRadius: "20px",
          background: "#eae3dc",
        }}
      >
        <div
          style={{
            width: `${safeValue}%`,
            height: "100%",
            borderRadius: "20px",
            background: "#d66324",
            transition: "width 0.25s ease",
          }}
        />
      </div>
    </div>
  );
}