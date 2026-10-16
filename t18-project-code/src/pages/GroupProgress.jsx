
import { useEffect, useMemo, useState } from "react";
import { subscribeToRoom } from "../services/roomService";
import "./GroupProgress.css";

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (value && typeof value === "object") {
    return Object.values(value).filter(Boolean);
  }

  return [];
}

function normaliseTasks(assignments, members) {
  return asArray(assignments).map((task, index) => {
    const owner = members.find(
      (member) =>
        String(member.id) === String(task.assignedToId)
    );

    return {
      ...task,
      id: String(task.id ?? `task-${index}`),
      name: task.name || task.title || `Task ${index + 1}`,
      assignedTo: owner?.name || task.assignedTo || "",
      steps: asArray(task.steps),
      currentStep: Number(task.currentStep) || 0,
      status: task.status || "waiting",
      needsHelp: Boolean(task.needsHelp),
    };
  });
}

export default function GroupProgress({
  user = {},
  room = {},
  taskAssignments = [],
  onBack,
  onHelp,
  setHelpingMember,
  onAllComplete,
}) {
  const [liveRoom, setLiveRoom] = useState(null);

  const roomCode = room.code || room.roomCode || "";
  const memberId =
    room.memberId || user.memberId || user.id || "";

  useEffect(() => {
    if (!roomCode) return undefined;

    return subscribeToRoom(roomCode, (updatedRoom) => {
      if (updatedRoom) setLiveRoom(updatedRoom);
    });
  }, [roomCode]);

  const members = useMemo(
    () => asArray(liveRoom?.members || room.members),
    [liveRoom?.members, room.members]
  );

  const tasks = useMemo(() => {
    const source =
      liveRoom?.cookingSetup?.assignments ??
      taskAssignments;

    return normaliseTasks(source, members);
  }, [
    liveRoom?.cookingSetup?.assignments,
    taskAssignments,
    members,
  ]);

  const totalTasks = tasks.length;

  const finishedTasks = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const allDone =
    totalTasks > 0 && finishedTasks === totalTasks;

  const overallProgress = totalTasks
    ? Math.round((finishedTasks / totalTasks) * 100)
    : 0;

  const myTasks = tasks.filter(
    (task) =>
      String(task.assignedToId) === String(memberId)
  );

  const myUnfinishedTasks = myTasks.filter(
    (task) => task.status !== "done"
  );

  const memberProgress = members.map((member) => {
    const memberTasks = tasks.filter(
      (task) =>
        String(task.assignedToId) === String(member.id)
    );

    const completed = memberTasks.filter(
      (task) => task.status === "done"
    ).length;

    const currentTask = memberTasks.find(
      (task) => task.status !== "done"
    );

    const needsHelp = memberTasks.some(
      (task) =>
        task.needsHelp && task.status !== "done"
    );

    const percent = memberTasks.length
      ? Math.round(
          (completed / memberTasks.length) * 100
        )
      : 0;

    return {
      ...member,
      memberTasks,
      completed,
      currentTask,
      needsHelp,
      percent,
      isMe: String(member.id) === String(memberId),
      finished:
        memberTasks.length > 0 &&
        completed === memberTasks.length,
    };
  });

  function handleOfferHelp(member) {
    if (!member.currentTask || member.isMe) return;

    const task = member.currentTask;

    setHelpingMember?.({
      name: member.name,
      task: task.name,
      taskId: task.id,
      taskData: task,
      memberId: member.id,
    });

    onHelp?.();
  }

  function handleReturn() {
    // This must only navigate back.
    // Never update task status or step progress here.
    onBack?.();
  }

  return (
    <main className="gp-page">
      <header className="gp-topbar">
        <button
          type="button"
          className="gp-back"
          onClick={handleReturn}
        >
          <span aria-hidden="true">←</span>
          Back
        </button>

        <span className="gp-room-code">
          {roomCode || "KTCHN SESSION"}
        </span>
      </header>

      <section className="gp-heading">
        <p className="gp-eyebrow">COOKING TOGETHER</p>

        <h1>Group progress</h1>

        <p>
          See how everyone is doing and help each other
          finish the meal.
        </p>
      </section>

      <section className="gp-overview">
        <div className="gp-overview-top">
          <div>
            <span>GROUP PROGRESS</span>
            <h2>
              {finishedTasks} of {totalTasks} tasks done
            </h2>
          </div>

          <strong>{overallProgress}%</strong>
        </div>

        <div className="gp-track">
          <div
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <p>
          {allDone
            ? "Everyone has finished their cooking tasks!"
            : "Keep going! You're making progress together."}
        </p>
      </section>

      <section className="gp-members-section">
        <div className="gp-section-heading">
          <h2>Everyone's progress</h2>

          <span>
            {members.length}{" "}
            {members.length === 1 ? "cook" : "cooks"}
          </span>
        </div>

        <div className="gp-member-grid">
          {memberProgress.map((member) => (
            <article
              className={`gp-member-card ${
                member.isMe ? "gp-my-card" : ""
              } ${
                member.needsHelp ? "gp-needs-help" : ""
              }`}
              key={member.id}
            >
              <div className="gp-member-top">
                <div className="gp-avatar">
                  {(member.name || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="gp-member-details">
                  <h3>
                    {member.name || "Cook"}
                    {member.isMe && (
                      <span className="gp-you"> (You)</span>
                    )}
                  </h3>

                  <p>
                    Helper: {member.helperName || "Nova"}
                  </p>
                </div>

                <span
                  className={`gp-status ${
                    member.finished
                      ? "gp-status-done"
                      : member.needsHelp
                        ? "gp-status-help"
                        : "gp-status-cooking"
                  }`}
                >
                  {member.finished
                    ? "✓ Done"
                    : member.needsHelp
                      ? "Needs help"
                      : member.memberTasks.length
                        ? "Cooking"
                        : "No tasks"}
                </span>
              </div>

              <div className="gp-member-task">
                <span>CURRENT TASK</span>

                <strong>
                  {member.finished
                    ? "All tasks completed"
                    : member.currentTask?.name ||
                      "No active task"}
                </strong>
              </div>

              <div className="gp-member-progress">
                <div className="gp-progress-label">
                  <span>
                    {member.completed} of{" "}
                    {member.memberTasks.length} tasks
                  </span>

                  <strong>{member.percent}%</strong>
                </div>

                <div className="gp-track gp-small-track">
                  <div
                    style={{
                      width: `${member.percent}%`,
                    }}
                  />
                </div>
              </div>

              {member.needsHelp && !member.isMe && (
                <button
                  type="button"
                  className="gp-help-button"
                  onClick={() => handleOfferHelp(member)}
                >
                  Offer help →
                </button>
              )}

              {!member.needsHelp &&
                !member.isMe &&
                !member.finished &&
                member.currentTask && (
                  <button
                    type="button"
                    className="gp-outline-button"
                    onClick={() => handleOfferHelp(member)}
                  >
                    Help this cook
                  </button>
                )}
            </article>
          ))}
        </div>
      </section>

      <footer className="gp-footer">
        <div className="gp-footer-message">
          {allDone
            ? "All cooking tasks are complete."
            : myUnfinishedTasks.length
              ? "Your cooking step is saved. You can return whenever you're ready."
              : "You've finished your tasks. You can help another cook while waiting."}
        </div>

        {allDone ? (
          <button
            type="button"
            className="gp-primary-button"
            onClick={() => {
              if (onAllComplete) {
                onAllComplete();
              } else {
                handleReturn();
              }
            }}
          >
            {onAllComplete
              ? "Continue to meal →"
              : "Back"}
          </button>
        ) : (
          <button
            type="button"
            className="gp-primary-button"
            onClick={handleReturn}
          >
            {myUnfinishedTasks.length
              ? "Return to cooking →"
              : "Back to my tasks →"}
          </button>
        )}
      </footer>
    </main>
  );
}
