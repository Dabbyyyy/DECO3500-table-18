export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled = false,
  onClick,
  type = "button",
}) {
  const styles = {
    primary: {
      background: "#d66324",
      color: "#ffffff",
      border: "1px solid #d66324",
    },

    secondary: {
      background: "#ffffff",
      color: "#5f554d",
      border: "1px solid #dfd6ce",
    },

    soft: {
      background: "#f3ede4",
      color: "#6f645c",
      border: "1px solid transparent",
    },
  };

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "9px 14px",
        borderRadius: "7px",
        fontSize: "8px",
        fontWeight: "700",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}