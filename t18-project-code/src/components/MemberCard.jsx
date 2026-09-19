export default function MemberCard({
  member,
  index = 0,
  showStatus = true,
}) {
  const avatarBackgrounds = [
    "#d66324",
    "#78836d",
    "#e9ad35",
    "#9a7b6c",
  ];

  const background =
    avatarBackgrounds[
      index % avatarBackgrounds.length
    ];

  return (
    <div
      style={{
        minHeight: "60px",
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#ffffff",
        border: "1px solid #e7ded5",
        borderRadius: "9px",
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          background,
          color: "white",
          fontSize: "11px",
          fontWeight: "700",
        }}
      >
        {member.name?.charAt(0).toUpperCase() ||
          "?"}
      </div>

      <div
        style={{
          minWidth: 0,
          display: "flex",
          flex: 1,
          flexDirection: "column",
        }}
      >
        <strong
          style={{
            fontSize: "10px",
            color: "#40362f",
          }}
        >
          {member.name}
        </strong>

        <span
          style={{
            marginTop: "2px",
            fontSize: "7px",
            color: "#9a9189",
          }}
        >
          {member.task
            ? member.task
            : `Hey ${member.helperName || "Helper"}`}
        </span>
      </div>

      {showStatus && (
        <span
          style={{
            padding: "4px 7px",
            borderRadius: "20px",
            background:
              member.status === "done"
                ? "#e9eee4"
                : "#f1eee9",
            color:
              member.status === "done"
                ? "#718164"
                : "#847970",
            fontSize: "6px",
            fontWeight: "700",
          }}
        >
          {member.status === "done"
            ? "Done"
            : member.status === "cooking"
              ? "Cooking"
              : "Joined"}
        </span>
      )}
    </div>
  );
}