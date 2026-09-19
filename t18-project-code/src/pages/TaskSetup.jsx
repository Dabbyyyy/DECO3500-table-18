import { useState } from "react";
import "./TaskSetup.css";

export default function TaskSetup({
  meal,
  user,
  room,
  setTaskAssignments,
  onContinue,
  onBack,
}) {
  const members =
    room.members && room.members.length > 0
      ? room.members
      : [
          {
            id: "user",
            name: user.name || "Patricia",
            helperName: user.helperName || "Nova",
          },
        ];

  const [assignments, setAssignments] = useState(() => {
    if (!meal) return [];

    return meal.tasks.map((task, index) => ({
      ...task,
      assignedTo:
        members[index % members.length]?.name || null,
    }));
  });

  const [selectedTask, setSelectedTask] = useState(null);

  function claimTask(taskId) {
    setAssignments((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignedTo: user.name,
            }
          : task
      )
    );
  }

  function unclaimTask(taskId) {
    setAssignments((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignedTo: null,
            }
          : task
      )
    );
  }

  function swapTask(taskId) {
    setSelectedTask(
      selectedTask === taskId ? null : taskId
    );
  }

  function assignToMember(taskId, memberName) {
    setAssignments((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignedTo: memberName,
            }
          : task
      )
    );

    setSelectedTask(null);
  }

  function startCooking() {
    setTaskAssignments(assignments);
    onContinue();
  }

  if (!meal) {
    return (
      <div className="task-page">
        <div className="task-error">
          <h2>No meal selected</h2>

          <button onClick={onBack}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-page">

      {/* LEFT SIDE */}

      <section className="task-left">

        <div>
          <button
            className="task-back"
            onClick={onBack}
            aria-label="Go back"
          >
            ←
          </button>

          <p className="task-step">
            STEP 4 · TASK SETUP
          </p>

          <h1>
            Who's doing
            <br />
            what?
          </h1>

          <p className="task-description">
            We've divided the meal into smaller
            tasks so everyone knows where to start.
            You can swap or claim tasks before cooking.
          </p>

          <div className="task-meal-summary">
            <span className="task-meal-icon">
              {meal.icon}
            </span>

            <div>
              <strong>
                {meal.name}
              </strong>

              <span>
                {meal.time} min · {meal.cooks} cooks
              </span>
            </div>
          </div>
        </div>

        <div className="task-left-bottom">

          <div className="task-tip">
            <strong>Working together</strong>

            <span>
              Tasks are divided to help everyone
              get started. You can still help each
              other while cooking.
            </span>
          </div>

          <button
            className="start-cooking-button"
            onClick={startCooking}
          >
            Everyone ready · Start cooking
          </button>

        </div>

      </section>


      {/* RIGHT SIDE */}

      <section className="task-right">

        <div className="task-right-heading">

          <div>
            <p>YOUR COOKING GROUP</p>

            <h2>
              Task assignments
            </h2>
          </div>

          <span>
            {assignments.length} tasks
          </span>

        </div>


        <div className="task-list">

          {assignments.map((task) => {

            const isCurrentUser =
              task.assignedTo === user.name;

            const isSelecting =
              selectedTask === task.id;

            return (
              <div
                className={`task-card ${
                  isCurrentUser
                    ? "task-card-yours"
                    : ""
                }`}
                key={task.id}
              >

                <div className="task-icon">
                  {task.icon}
                </div>


                <div className="task-info">

                  <div className="task-name-row">

                    <strong>
                      {task.name}
                    </strong>

                    {isCurrentUser && (
                      <span className="your-task-badge">
                        YOURS
                      </span>
                    )}

                  </div>


                  <div className="task-details">

                    <span>
                      {task.estimatedTime} min
                    </span>

                    <span>·</span>

                    <span>
                      {task.difficulty}
                    </span>

                    {task.equipment?.length > 0 && (
                      <>
                        <span>·</span>

                        <span>
                          {task.equipment.join(", ")}
                        </span>
                      </>
                    )}

                  </div>


                  <div className="assigned-person">

                    <span className="assigned-avatar">
                      {task.assignedTo
                        ? task.assignedTo
                            .charAt(0)
                            .toUpperCase()
                        : "?"}
                    </span>

                    <span>
                      {task.assignedTo ||
                        "Unclaimed"}
                    </span>

                  </div>


                  {isSelecting && (
                    <div className="swap-menu">

                      <p>
                        Give this task to:
                      </p>

                      <div className="swap-options">

                        {members.map(
                          (member, index) => (
                            <button
                              key={
                                member.id ||
                                `${member.name}-${index}`
                              }
                              onClick={() =>
                                assignToMember(
                                  task.id,
                                  member.name
                                )
                              }
                            >
                              {member.name}
                            </button>
                          )
                        )}

                      </div>

                    </div>
                  )}

                </div>


                <div className="task-actions">

                  {!task.assignedTo ? (

                    <button
                      className="claim-button"
                      onClick={() =>
                        claimTask(task.id)
                      }
                    >
                      Claim
                    </button>

                  ) : (

                    <button
                      className="swap-button"
                      onClick={() =>
                        swapTask(task.id)
                      }
                    >
                      {isSelecting
                        ? "Cancel"
                        : "Swap"}
                    </button>

                  )}

                  {isCurrentUser && (
                    <button
                      className="release-button"
                      onClick={() =>
                        unclaimTask(task.id)
                      }
                    >
                      Release
                    </button>
                  )}

                </div>

              </div>
            );
          })}


          {/* EXTRA SHARED TASK */}

          <div className="task-card shared-task-card">

            <div className="task-icon">
              🍽️
            </div>

            <div className="task-info">

              <div className="task-name-row">
                <strong>
                  Table & cleanup
                </strong>

                <span className="optional-badge">
                  LATER
                </span>
              </div>

              <div className="task-details">
                <span>
                  Available when your cooking
                  task is finished
                </span>
              </div>

              <div className="assigned-person">

                <span className="assigned-avatar unclaimed-avatar">
                  ?
                </span>

                <span>
                  Unclaimed
                </span>

              </div>

            </div>

            <div className="task-actions">
              <button
                className="disabled-claim-button"
                disabled
              >
                Later
              </button>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}