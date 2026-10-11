
import "./Welcome.css";

export default function Welcome({ onContinue, onJoin }) {
  return (
    <main className="welcome-page">
      <div className="welcome-centre">
        <div className="welcome-icon" aria-hidden="true">
          <svg
            width="42"
            height="42"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 19h28v18a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V19Z" />
            <path d="M7 19h34" />
            <path d="M24 19v-7" />
            <path d="M24 12c0-5 8-5 8-9" />
            <path d="M15 13l18-5" />
          </svg>
        </div>

        <h1>ktchn</h1>

        <p>
          Coordinate the cooking, not just the calendar.
          Plan, cook, and eat together — one shared plan
          at a time.
        </p>
      </div>

      <div className="welcome-actions">
        <button
          type="button"
          className="welcome-primary"
          onClick={onContinue}
        >
          Start a new session
        </button>

        <button
          type="button"
          className="welcome-secondary"
          onClick={onJoin}
        >
          Join with session code
        </button>
      </div>
    </main>
  );
}
