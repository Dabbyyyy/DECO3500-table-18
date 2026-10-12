import { useEffect, useState } from "react";

import "./GroupProgress.css";

import ProgressBar from "../components/ProgressBar";
import {
  changeRoomScreen,
  setCookingActivity,
  subscribeToRoom,
} from "../services/roomService";

export default function GroupProgress({
  user,
  meal,
  room,
  taskAssignments,
  setTaskAssignments,
  sharedTask,
  onBack,
  onAllComplete,
}) {
  const roomCode = room.code || room.roomCode;
  const memberId = room.memberId || user.memberId || user.id;
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!roomCode) return undefined;

    return subscribeToRoom(roomCode, (updatedRoom) => {
      if (!updatedRoom) return;

      const assignments = Array.isArray(
        updatedRoom.cookingSetup?.assignments
      )
        ? updatedRoom.cookingSetup.assignments
        : Object.values(
            updatedRoom.cookingSetup?.assignments || {}
          );

      const mappedAssignments = assignments
        .filter(Boolean)
        .map((task, index) => {
          const owner = updatedRoom.members.find(
            (member) =>
              String(member.id) === String(task.assignedToId)
          );

          return {
            ...task,
            id: String(task.id ?? `task-${index}`),
            name: task.name || task.title || `Task ${index + 1}`,
            assignedTo: owner?.name || task.assignedTo || null,
            status: task.status || "waiting",
          };
        });

      setTaskAssignments(mappedAssignments);

      const roomActivities = Object.values(
        updatedRoom.cookingActivities || {}
      );

      roomActivities.forEach((activity) => {
        if (activity?.type !== "helping") return;

        const targetTask = mappedAssignments.find(
          (task) =>
            String(task.id) === String(activity.targetTaskId)
        );

        if (targetTask?.status === "done") {
          setCookingActivity(
            roomCode,
            activity.helperId,
            null
          ).catch(console.error);
        }
      });

      setActivities(
        roomActivities.filter((activity) => {
          if (activity?.status !== "active") return false;
          if (activity.type !== "helping") return true;

          const targetTask = mappedAssignments.find(
            (task) =>
              String(task.id) === String(activity.targetTaskId)
          );

          return targetTask?.status !== "done";
        })
      );

      if (updatedRoom.screen === "allComplete") {
        onAllComplete();
      }
    });
  }, [onAllComplete, roomCode, setTaskAssignments]);

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

  const activeHelping = activities.filter((activity) => {
    if (activity.type !== "helping") return false;

    const targetTask = taskAssignments.find(
      (task) =>
        String(task.id) === String(activity.targetTaskId)
    );

    return targetTask && targetTask.status !== "done";
  });

  const sharedActivities = activities.filter(
    (activity) =>
      activity.type === "cleanup" || activity.type === "table"
  );

  function helperForTask(task) {
    return activeHelping.find(
      (activity) =>
        String(activity.targetTaskId) === String(task.id)
    );
  }

  function getStatus(task) {
    if (task.status === "done") {
      return "Done";
    }

    const helper = helperForTask(task);

    if (helper) {
      return `Getting help from ${helper.helperName}`;
    }

    if (task.needsHelp) {
      return "Needs help";
    }

    return task.status === "waiting" ? "Waiting" : "Cooking";
  }

  async function continueToFinished() {
    await changeRoomScreen(roomCode, "allComplete");
    onAllComplete();
  }

  async function finishSharedActivity(activity) {
    await setCookingActivity(roomCode, activity.helperId, null);
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
              {meal?.title || meal?.name}
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

            const helper = helperForTask(task);

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

                  {helper && (
                    <small>
                      {helper.helperName} is helping
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

          {sharedActivities.length ? (
            sharedActivities.map((activity) => (
              <div
                className="progress-member-card shared-progress-card"
                key={`${activity.helperId}-${activity.type}`}
              >
                <div className="progress-task-icon">
                  {activity.type === "table" ? "🍽️" : "🧽"}
                </div>

                <div className="progress-task-info">
                  <strong>
                    {activity.type === "table"
                      ? "Prepare table"
                      : "Cleanup"}
                  </strong>
                  <span>{activity.helperName} is helping</span>
                </div>

                {String(activity.helperId) === String(memberId) ? (
                  <button
                    type="button"
                    className="shared-complete-button"
                    onClick={() => finishSharedActivity(activity)}
                  >
                    ✓ Mark done
                  </button>
                ) : (
                  <div className="progress-status shared-status">
                    In progress
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="progress-member-card shared-progress-card">
              <div className="progress-task-icon">
                {sharedTask === "table" ? "🍽️" : "🧽"}
              </div>
              <div className="progress-task-info">
                <strong>Shared tasks</strong>
                <span>Available after your cooking task</span>
              </div>
              <div className="progress-status shared-status">
                Unclaimed
              </div>
            </div>
          )}

        </div>


        <div className="group-progress-bottom">

          {activeHelping.map((activity) => (
            <div
              className="helping-message"
              key={`${activity.helperId}-${activity.targetTaskId}`}
            >
              🤝 {activity.helperName} is helping{" "}
              <strong>{activity.targetName}</strong> with{" "}
              {activity.targetTaskName}.
            </div>
          ))}


          {allCookingDone ? (

            <button
              className="all-complete-button"
              onClick={continueToFinished}
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
