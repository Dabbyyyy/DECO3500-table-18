import { useEffect, useState } from "react";

import "./LandscapeGuard.css";

function requiresRotation() {
  if (typeof window === "undefined") return false;

  const isPhoneSized = Math.min(
    window.innerWidth,
    window.innerHeight
  ) <= 600;

  return isPhoneSized && window.innerHeight > window.innerWidth;
}

export default function LandscapeGuard({ children }) {
  const [rotatePhone, setRotatePhone] = useState(
    requiresRotation
  );

  useEffect(() => {
    function checkOrientation() {
      setRotatePhone(requiresRotation());
    }

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener(
      "orientationchange",
      checkOrientation
    );

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener(
        "orientationchange",
        checkOrientation
      );
    };
  }, []);

  if (!rotatePhone) return children;

  return (
    <main className="landscape-prompt" role="status">
      <div className="landscape-phone" aria-hidden="true">
        <span />
      </div>

      <p>COOKING MODE</p>
      <h1>Rotate your phone</h1>
      <span>
        Turn your phone sideways to see your cooking steps
        and hands-free controls.
      </span>
    </main>
  );
}
