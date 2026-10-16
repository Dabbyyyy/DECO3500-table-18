
import "./AllTasksComplete.css";

function asArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value).filter(Boolean);
  }

  return [];
}

export default function AllTasksComplete({
  user = {},
  meal = {},
  room = {},
  taskAssignments = [],
  onContinue,
}) {
  const tasks = asArray(taskAssignments);

  const members = asArray(room.members);

  const completedTasks = tasks.filter(
    (task) => task.status === "done"
  );

  const allTasksFinished =
    tasks.length > 0 &&
    completedTasks.length === tasks.length;

  const cookNames = [
    ...new Set([
      ...members.map((member) => member.name),
      ...tasks.map((task) => task.assignedTo),
    ].filter(Boolean)),
  ];

  const mealName =
    meal.title ||
    meal.name ||
    room.selectedRecipe?.title ||
    room.selectedRecipe?.name ||
    "Your meal";

  return (
    <main className="all-complete-page">
      <div className="all-complete-decoration all-complete-decoration-one" />
      <div className="all-complete-decoration all-complete-decoration-two" />

      <section className="all-complete-content">
        <p className="all-complete-label">
          COOKING FINISHED
        </p>

        <div className="all-complete-check">
          <span>✓</span>
        </div>

        <h1>
          Everyone's
          <br />
          ready!
        </h1>

        <p className="all-complete-description">
          You've finished cooking together.
          Your meal is ready to enjoy!
        </p>

        <div className="all-complete-members">
          <div className="all-complete-avatars">
            {cookNames.slice(0, 6).map((name, index) => (
              <div
                className="all-complete-avatar"
                key={`${name}-${index}`}
                title={name}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          <p>
            Made together by{" "}
            <strong>
              {cookNames.length > 0
                ? cookNames.join(", ")
                : user.name || "your group"}
            </strong>
          </p>
        </div>

        <div className="all-complete-meal-card">
          <div className="all-complete-meal-icon">
            {meal.icon || "🍽️"}
          </div>

          <div className="all-complete-meal-info">
            <span>YOUR MEAL</span>
            <h2>{mealName}</h2>
          </div>

          <span className="all-complete-meal-tick">
            ✓ Ready
          </span>
        </div>

        <div className="all-complete-reminder">
          <div className="all-complete-reminder-icon">
            ♡
          </div>

          <p>
            <strong>Well done!</strong> Your meal is ready.
            Set the table, share your meal with everyone,
            and don't forget to clean up afterwards.
          </p>
        </div>

        <button
          type="button"
          className="all-complete-continue"
          onClick={onContinue}
          disabled={!onContinue}
        >
          Post to feed
          <span aria-hidden="true">→</span>
        </button>

        <p className="all-complete-footer-note">
          The cooking is done. Now it's time to enjoy
          the moment together.
        </p>

        {!allTasksFinished && (
          <p className="all-complete-sync-note">
            {completedTasks.length} of {tasks.length}{" "}
            cooking tasks are marked complete.
          </p>
        )}
      </section>
    </main>
  );
}
