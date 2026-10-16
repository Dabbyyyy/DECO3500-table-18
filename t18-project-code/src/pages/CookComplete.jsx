
import { useEffect, useMemo, useState } from "react";
import { subscribeToRoom } from "../services/roomService";
import "./CookComplete.css";

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (value && typeof value === "object") {
    return Object.values(value).filter(Boolean);
  }

  return [];
}

export default function CookComplete({
  user = {},
  room = {},
  taskAssignments = [],
  onProgress,
  onHelp,
  setHelpingMember,
  onAllComplete,
  onBack,
}) {
  const [liveRoom, setLiveRoom] = useState(null);

  const roomCode = room.code || room.roomCode || "";
  const memberId =
    room.memberId || user.memberId || user.id || "";

  useEffect(() => {
    if (!roomCode) return undefined;

    return subscribeToRoom(roomCode, (updatedRoom) => {
      if (updatedRoom) {
        setLiveRoom(updatedRoom);
      }
    });
  }, [roomCode]);

  const members = useMemo(
    () => asArray(liveRoom?.members || room.members),
    [liveRoom?.members, room.members]
  );

  const tasks = useMemo(
    () =>
      asArray(
        liveRoom?.cookingSetup?.assignments ??
          taskAssignments
      ),
    [liveRoom?.cookingSetup?.assignments, taskAssignments]
  );

  const myTasks = tasks.filter(
    (task) =>
      String(task.assignedToId) === String(memberId)
  );

  const myCompletedTasks = myTasks.filter(
    (task) => task.status === "done"
  );

  const myTasksFinished =
    myTasks.length > 0 &&
    myCompletedTasks.length === myTasks.length;

  const completedCount = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const allFinished =
    tasks.length > 0 && completedCount === tasks.length;

  const otherCooks = members
    .filter(
      (member) =>
        String(member.id) !== String(memberId)
    )
    .map((member) => {
      const memberTasks = tasks.filter(
        (task) =>
          String(task.assignedToId) === String(member.id)
      );

      const unfinishedTask = memberTasks.find(
        (task) => task.status !== "done"
      );

      return {
        ...member,
        unfinishedTask,
        needsHelp: memberTasks.some(
          (task) =>
            task.needsHelp && task.status !== "done"
        ),
        finished:
          memberTasks.length > 0 &&
          memberTasks.every(
            (task) => task.status === "done"
          ),
      };
    });

  const cooksNeedingHelp = otherCooks.filter(
    (member) => member.needsHelp
  );

  const cooksStillCooking = otherCooks.filter(
    (member) => Boolean(member.unfinishedTask)
  );

  function offerHelp(member) {
    if (!member.unfinishedTask) return;

    setHelpingMember?.({
      name: member.name,
      memberId: member.id,
      task: member.unfinishedTask.name ||
        member.unfinishedTask.title ||
        "Cooking task",
      taskId: member.unfinishedTask.id,
      taskData: member.unfinishedTask,
    });

    onHelp?.();
  }

  return (
    <main className="cc-page">
      <header className="cc-topbar">
        <button
          type="button"
          className="cc-back"
          onClick={onBack}
          aria-label="Back"
        >
          ←
        </button>

        <span className="cc-session">
          {roomCode || "KTCHN SESSION"}
        </span>
      </header>

      <section className="cc-main">
        <div className="cc-celebration">
          <div className="cc-checkmark">✓</div>

          <p className="cc-eyebrow">
            TASK FINISHED
          </p>

          <h1>
            {allFinished
              ? "Everyone's done!"
              : "You're all done!"}
          </h1>

          <p className="cc-description">
            {allFinished
              ? "All cooking tasks are complete. Your meal is ready!"
              : "Nice work! You've finished your cooking tasks. Let's see how the rest of your group is doing."}
          </p>
        </div>

        <div className="cc-summary">
          <div className="cc-summary-item">
            <strong>{myCompletedTasks.length}</strong>
            <span>
              Your completed tasks
            </span>
          </div>

          <div className="cc-summary-divider" />

          <div className="cc-summary-item">
            <strong>
              {completedCount}/{tasks.length}
            </strong>
            <span>
              Group tasks finished
            </span>
          </div>

          <div className="cc-summary-divider" />

          <div className="cc-summary-item">
            <strong>
              {members.length}
            </strong>
            <span>
              Group members
            </span>
          </div>
        </div>

        {!allFinished && (
          <section className="cc-help-section">
            <h2>What's next?</h2>

            <p>
              You can help another cook or wait
              until everyone finishes.
            </p>

            {cooksNeedingHelp.length > 0 && (
              <div className="cc-help-list">
                {cooksNeedingHelp.map((member) => (
                  <article
                    className="cc-help-card"
                    key={member.id}
                  >
                    <div className="cc-member-avatar">
                      {(member.name || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="cc-help-details">
                      <strong>
                        {member.name || "Cook"}
                      </strong>

                      <span>
                        Needs help with{" "}
                        {member.unfinishedTask?.name ||
                          member.unfinishedTask?.title ||
                          "cooking"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => offerHelp(member)}
                    >
                      Help →
                    </button>
                  </article>
                ))}
              </div>
            )}

            {cooksNeedingHelp.length === 0 &&
              cooksStillCooking.length > 0 && (
                <p className="cc-waiting-note">
                  {cooksStillCooking.length}{" "}
                  {cooksStillCooking.length === 1
                    ? "person is"
                    : "people are"}{" "}
                  still cooking. You can check their
                  progress or offer to help.
                </p>
              )}

            {cooksNeedingHelp.length === 0 &&
              cooksStillCooking.length === 0 && (
                <p className="cc-waiting-note">
                  Waiting for the group to finish.
                </p>
              )}
          </section>
        )}

        <div className="cc-actions">
          {allFinished ? (
            <button
              type="button"
              className="cc-primary"
              onClick={onAllComplete}
            >
              Continue →
            </button>
          ) : (
            <>
              <button
                type="button"
                className="cc-primary"
                onClick={onProgress}
              >
                View group progress →
              </button>

              {cooksNeedingHelp.length === 0 &&
                cooksStillCooking.length > 0 && (
                  <button
                    type="button"
                    className="cc-secondary"
                    onClick={() =>
                      offerHelp(cooksStillCooking[0])
                    }
                  >
                    Offer to help
                  </button>
                )}
            </>
          )}
        </div>

        {!myTasksFinished && (
          <p className="cc-unfinished-note">
            You still have unfinished cooking tasks.
            Return to cooking to complete them.
          </p>
        )}
      </section>
    </main>
  );
}
