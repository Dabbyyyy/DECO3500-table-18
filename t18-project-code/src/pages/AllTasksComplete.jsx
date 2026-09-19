import "./AllTasksComplete.css";

export default function AllTasksComplete({
  user,
  meal,
  room,
  taskAssignments,
  onRestart,
}) {
  const cookNames = [
    ...new Set(
      taskAssignments
        .map((task) => task.assignedTo)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="all-complete-page">

      <section className="all-complete-left">

        <div>

          <p className="all-complete-label">
            ALL TASKS COMPLETE
          </p>

          <div className="celebration-icon">
            ✓
          </div>

          <h1>
            Everything's
            <br />
            ready.
          </h1>

          <p className="all-complete-description">
            Everyone has finished their part.
            Bring everything together and enjoy
            the meal you made as a group.
          </p>

        </div>


        <button
          className="new-session-button"
          onClick={onRestart}
        >
          Finish session
        </button>

      </section>


      <section className="all-complete-right">

        <div className="final-meal-card">

          <div className="final-meal-icon">
            {meal?.icon}
          </div>

          <p>DINNER IS READY</p>

          <h2>
            {meal?.name}
          </h2>

          <span>
            Made together by{" "}
            {cookNames.length > 0
              ? cookNames.join(", ")
              : user.name}
          </span>

        </div>


        <div className="completed-task-list">

          {taskAssignments.map((task) => (

            <div
              className="completed-task"
              key={`${task.id}-${task.assignedTo}`}
            >

              <div>
                <span>
                  {task.icon}
                </span>

                <div>
                  <strong>
                    {task.name}
                  </strong>

                  <small>
                    {task.assignedTo}
                  </small>
                </div>
              </div>

              <span className="complete-tick">
                ✓ Done
              </span>

            </div>

          ))}

        </div>


        <div className="together-message">
          <span>🍽️</span>

          <div>
            <strong>
              Time to eat together.
            </strong>

            <p>
              The technology has done its job.
              Now the focus goes back to the group.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}