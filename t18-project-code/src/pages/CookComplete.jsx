import { useEffect } from "react";

import "./CookComplete.css";
import {
  setCookingActivity,
  subscribeToRoom,
} from "../services/roomService";

export default function CookComplete({
  user,
  meal,
  room,
  taskAssignments,
  setHelpingMember,
  onHelp,
  onCleanup,
  onTable,
  onProgress,
  onAllComplete,
}) {
  const roomCode = room.code || room.roomCode;
  const memberId = room.memberId || user.memberId || user.id;

  useEffect(() => {
    if (!roomCode) return undefined;

    return subscribeToRoom(roomCode, (updatedRoom) => {
      if (updatedRoom?.screen === "allComplete") {
        setCookingActivity(roomCode, memberId, null).catch(
          console.error
        );
        onAllComplete?.();
      }
    });
  }, [memberId, onAllComplete, roomCode]);

  // Find other cooks who are still working
  const unfinishedTasks = taskAssignments.filter(
    (task) =>
      task.status !== "done" &&
      task.assignedTo &&
      task.assignedTo !== user.name
  );

  const suggestedTask = unfinishedTasks[0];

  async function handleHelp() {
    if (!suggestedTask) return;

    const helpDetails = {
      name: suggestedTask.assignedTo,
      task: suggestedTask.name,
      taskId: suggestedTask.id,
      taskData: suggestedTask,
    };

    await setCookingActivity(roomCode, memberId, {
      type: "helping",
      helperName: user.name,
      targetMemberId: suggestedTask.assignedToId || null,
      targetName: suggestedTask.assignedTo,
      targetTaskId: suggestedTask.id,
      targetTaskName:
        suggestedTask.name || suggestedTask.title || "Cooking task",
      status: "active",
    });

    setHelpingMember(helpDetails);

    onHelp();
  }

  async function startSharedTask(type) {
    await setCookingActivity(roomCode, memberId, {
      type,
      helperName: user.name,
      status: "active",
    });

    if (type === "cleanup") {
      onCleanup();
    } else {
      onTable();
    }
  }

  return (
    <div className="cook-complete-page">

      {/* LEFT SIDE */}

      <section className="cook-complete-left">

        <div>
          <p className="cook-complete-label">
            YOUR TASK IS DONE
          </p>

          <div className="cook-complete-check">
            ✓
          </div>

          <h1>
            Nice work,
            <br />
            {user.name}!
          </h1>

          <p className="cook-complete-description">
            Your part is finished, but the group may
            still be cooking. You can help someone else
            or get the shared space ready.
          </p>
        </div>


        <div className="cook-complete-meal">

          <div className="cook-complete-meal-icon">
            {meal?.icon}
          </div>

          <div>
            <span>COOKING TOGETHER</span>

            <strong>
              {meal?.title || meal?.name}
            </strong>
          </div>

        </div>

      </section>


      {/* RIGHT SIDE */}

      <section className="cook-complete-right">

        <div className="cook-complete-heading">

          <p>WHAT NOW?</p>

          <h2>
            Keep the group moving.
          </h2>

          <span>
            Choose what you'd like to do next.
          </span>

        </div>


        <div className="cook-action-grid">

          {/* HELP */}

          {suggestedTask ? (

            <button
              className="cook-action-card recommended-action"
              onClick={handleHelp}
            >

              <div className="cook-action-top">

                <div className="cook-action-icon orange-icon">
                  🤝
                </div>

                <span className="recommended-label">
                  RECOMMENDED
                </span>

              </div>


              <div className="cook-action-content">

                <small>
                  HELP ANOTHER COOK
                </small>

                <h3>
                  Help {suggestedTask.assignedTo}
                </h3>

                <p>
                  They're still working on{" "}
                  <strong>
                    {suggestedTask.name || suggestedTask.title}
                  </strong>.
                </p>

              </div>


              <div className="cook-action-footer">
                Help out
                <span>→</span>
              </div>

            </button>

          ) : (

            <div className="cook-action-card no-help-card">

              <div className="cook-action-icon">
                ✓
              </div>

              <div className="cook-action-content">

                <small>
                  GROUP UPDATE
                </small>

                <h3>
                  Everyone is done
                </h3>

                <p>
                  There are no other cooking tasks
                  waiting for help.
                </p>

              </div>

            </div>

          )}


          {/* CLEANUP */}

          <button
            className="cook-action-card"
            onClick={() => startSharedTask("cleanup")}
          >

            <div className="cook-action-icon">
              🧽
            </div>

            <div className="cook-action-content">

              <small>
                SHARED TASK
              </small>

              <h3>
                Start cleanup
              </h3>

              <p>
                Clear used tools and make space while
                the others finish cooking.
              </p>

            </div>

            <div className="cook-action-footer">
              Start
              <span>→</span>
            </div>

          </button>


          {/* TABLE */}

          <button
            className="cook-action-card"
            onClick={() => startSharedTask("table")}
          >

            <div className="cook-action-icon">
              🍽️
            </div>

            <div className="cook-action-content">

              <small>
                SHARED TASK
              </small>

              <h3>
                Prepare the table
              </h3>

              <p>
                Get plates and cutlery ready for
                everyone.
              </p>

            </div>

            <div className="cook-action-footer">
              Prepare
              <span>→</span>
            </div>

          </button>


          {/* PROGRESS */}

          <button
            className="cook-action-card"
            onClick={onProgress}
          >

            <div className="cook-action-icon">
              ◉
            </div>

            <div className="cook-action-content">

              <small>
                GROUP AWARENESS
              </small>

              <h3>
                View group progress
              </h3>

              <p>
                See what everyone is doing and how
                close dinner is.
              </p>

            </div>

            <div className="cook-action-footer">
              View progress
              <span>→</span>
            </div>

          </button>

        </div>

      </section>

    </div>
  );
}
