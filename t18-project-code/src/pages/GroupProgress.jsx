import "./GroupProgress.css";

import ProgressBar from "../components/ProgressBar";

export default function GroupProgress({
  user,
  meal,
  taskAssignments,
  helpingMember,
  sharedTask,
  onBack,
  onAllComplete,
}) {
  const completedTasks = taskAssignments.filter(
    (task) => task.status === "done"
  ).length;

  const totalTasks = taskAssignments.length;

  const progress =
    totalTasks > 0
      ? (completedTasks / totalTasks) * 100
      : 0;

  const allCookingDone =
    totalTasks > 0 &&
    completedTasks === totalTasks;

  function getStatus(task) {
    if (task.status === "done") {
      return "Done";
    }

    if (
      helpingMember?.taskId === task.id
    ) {
      return `Getting help from ${user.name}`;
    }

    return "Cooking";
  }

  return (
    <div className="group-progress-page">

      {/* LEFT */}

      <section className="group-progress-left">

        <div>
          <button
            className="group-progress-back"
            onClick={onBack}
          >
            ←
          </button>

          <p className="group-progress-label">
            GROUP PROGRESS
          </p>

          <h1>
            Dinner is
            <br />
            {Math.round(progress)}% ready.
          </h1>

          <p className="group-progress-description">
            A quick view of what everyone is doing.
            No need to stop cooking and ask around.
          </p>


          <div className="large-progress">

            <div className="large-progress-info">

              <span>
                {completedTasks} of {totalTasks} tasks
              </span>

              <strong>
                {Math.round(progress)}%
              </strong>

            </div>

            <ProgressBar
              value={progress}
            />

          </div>
        </div>


        <div className="progress-meal-card">

          <div className="progress-meal-icon">
            {meal?.icon}
          </div>

          <div>
            <span>TONIGHT'S MEAL</span>

            <strong>
              {meal?.name}
            </strong>
          </div>

        </div>

      </section>


      {/* RIGHT */}

      <section className="group-progress-right">

        <div className="progress-heading">

          <div>
            <p>COOKING GROUP</p>

            <h2>
              Everyone's progress
            </h2>
          </div>

          {allCookingDone && (
            <span className="all-done-badge">
              ALL DONE
            </span>
          )}

        </div>


        <div className="progress-member-list">

          {taskAssignments.map((task) => {

            const done =
              task.status === "done";

            const isUser =
              task.assignedTo === user.name;

            const beingHelped =
              helpingMember?.taskId ===
              task.id;

            return (
              <div
                className={`progress-member-card ${
                  done
                    ? "progress-task-done"
                    : ""
                }`}
                key={`${task.id}-${task.assignedTo}`}
              >

                <div className="progress-task-icon">
                  {task.icon}
                </div>


                <div className="progress-task-info">

                  <div className="progress-name-row">

                    <strong>
                      {task.assignedTo ||
                        "Unclaimed"}
                    </strong>

                    {isUser && (
                      <span className="you-badge">
                        YOU
                      </span>
                    )}

                  </div>

                  <span>
                    {task.name}
                  </span>

                  {beingHelped && (
                    <small>
                      {user.name} is helping
                    </small>
                  )}

                </div>


                <div
                  className={`progress-status ${
                    done
                      ? "status-done"
                      : "status-cooking"
                  }`}
                >
                  {done ? "✓ " : "● "}
                  {getStatus(task)}
                </div>

              </div>
            );
          })}


          {/* SHARED TASK */}

          <div className="progress-member-card shared-progress-card">

            <div className="progress-task-icon">
              {sharedTask === "table"
                ? "🍽️"
                : "🧽"}
            </div>

            <div className="progress-task-info">

              <strong>
                {sharedTask === "table"
                  ? "Prepare table"
                  : sharedTask === "cleanup"
                    ? "Cleanup"
                    : "Shared tasks"}
              </strong>

              <span>
                {sharedTask
                  ? `${user.name} is helping`
                  : "Available after your cooking task"}
              </span>

            </div>

            <div className="progress-status shared-status">
              {sharedTask
                ? "In progress"
                : "Unclaimed"}
            </div>

          </div>

        </div>


        <div className="group-progress-bottom">

          {helpingMember && (
            <div className="helping-message">
              🤝 {user.name} is helping{" "}
              <strong>
                {helpingMember.name}
              </strong>{" "}
              with {helpingMember.task}.
            </div>
          )}


          {allCookingDone ? (

            <button
              className="all-complete-button"
              onClick={onAllComplete}
            >
              All tasks complete · Continue →
            </button>

          ) : (

            <div className="still-cooking-message">
              Some cooks are still working. Keep
              helping each other!
            </div>

          )}

        </div>

      </section>

    </div>
  );
}