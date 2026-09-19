import "./Welcome.css";

export default function Welcome({ onContinue }) {
  return (
    <div className="welcome-page">
      <section className="welcome-left">
        <div>
          <p className="welcome-eyebrow">TABLE 18</p>

          <h1>
            Cook <span className="welcome-highlight">together</span>,
            <br />
            without the confusion.
          </h1>

          <p className="welcome-subtitle">
            Join your group, choose a meal and let the app help everyone
            understand what to do next.
          </p>
        </div>

        <button className="welcome-button" onClick={onContinue}>
          Start cooking
        </button>
      </section>

      <section className="welcome-right">
        <div className="welcome-card">
          <span>1</span>
          <p>Join your cooking group</p>
        </div>

        <div className="welcome-card">
          <span>2</span>
          <p>Choose a meal together</p>
        </div>

        <div className="welcome-card">
          <span>3</span>
          <p>Follow your task and help others</p>
        </div>
      </section>
    </div>
  );
}