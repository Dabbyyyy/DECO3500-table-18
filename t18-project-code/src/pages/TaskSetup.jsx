
import { useEffect, useMemo, useRef, useState } from "react";

import {
  subscribeToRoom,
  initializeCookingSetup,
  updateCookingEquipment,
  setCookingSetupStage,
  assignCookingTask,
} from "../services/roomService";

import "./TaskSetup.css";

const EQUIPMENT = [
  { name: "Stove", type: "Equipment" },
  { name: "Rice Cooker", type: "Equipment" },
  { name: "Kitchen Counter", type: "Prep Space" },
  { name: "Knife", type: "Equipment" },
  { name: "Wok", type: "Equipment" },
  { name: "Frying Pan", type: "Equipment" },
];

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === "object") {
    return Object.values(value).filter(Boolean);
  }
  return [];
}

function getMemberLabel(member, myId) {
  if (!member) return "Unclaimed";

  const mine = String(member.id) === String(myId);

  return `${member.name || "Member"}${mine ? " (You)" : ""}`;
}

function prepareAssignments(assignments, members) {
  return asArray(assignments).map((task, index) => {
    const owner = members.find(
      (member) =>
        String(member.id) === String(task.assignedToId)
    );

    return {
      ...task,
      id: String(task.id ?? `task-${index}`),
      name: task.name || task.title || `Task ${index + 1}`,
      estimatedTime:
        task.estimatedTime ?? task.minutes ?? null,
      assignedTo: owner?.name || null,
      status: task.status || "waiting",
      currentStep: Number(task.currentStep) || 0,
      needsHelp: Boolean(task.needsHelp),
    };
  });
}

export default function TaskSetup({
  meal,
  user = {},
  room = {},
  setTaskAssignments,
  onContinue,
  onRoomStart,
  onBack,
}) {
  const [liveRoom, setLiveRoom] = useState(null);
  const [busy, setBusy] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [initFinished, setInitFinished] = useState(false);
  const [error, setError] = useState("");
  const [showEveryone, setShowEveryone] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const navigationStarted = useRef(false);
  const initializationAttempt = useRef(null);
  const callbacksRef = useRef({});

  callbacksRef.current = {
    setTaskAssignments,
    onRoomStart,
  };

  const roomCode = room.code || room.roomCode || "";

  // Subscribe once per room, not once per render.
  useEffect(() => {
    if (!roomCode) return;

    navigationStarted.current = false;
    setLiveRoom(null);

    const unsubscribe = subscribeToRoom(
      roomCode,
      (updatedRoom) => {
        if (!updatedRoom) {
          setError("This cooking room no longer exists.");
          return;
        }

        setLiveRoom(updatedRoom);

        if (
          updatedRoom.screen === "cooking" &&
          !navigationStarted.current
        ) {
          navigationStarted.current = true;

          const members = asArray(updatedRoom.members);

          callbacksRef.current.setTaskAssignments?.(
            prepareAssignments(
              updatedRoom.cookingSetup?.assignments,
              members
            )
          );

          callbacksRef.current.onRoomStart?.();
        }
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  const currentRoom = liveRoom || room;

  // Preserve the original local identity.
  const myId =
    room.memberId || user.memberId || user.id || null;

  const hostId = currentRoom.hostId || room.hostId;

  const isHost = Boolean(
    myId &&
    hostId &&
    String(myId) === String(hostId)
  );

  const members = useMemo(
    () => asArray(currentRoom.members),
    [currentRoom.members]
  );

  const selectedMeal =
    currentRoom.selectedRecipe || meal || null;

  const recipeId =
    selectedMeal?.id == null
      ? null
      : String(selectedMeal.id);

  const setup = currentRoom.cookingSetup || null;

  const setupReady = Boolean(
    setup &&
    recipeId &&
    String(setup.recipeId) === recipeId &&
    setup.equipment &&
    setup.assignments
  );

  const stage = setupReady
    ? setup.stage || "equipment"
    : "equipment";

  const equipment = setupReady
    ? setup.equipment
    : {};

  const assignments = useMemo(
    () => setupReady ? asArray(setup.assignments) : [],
    [setupReady, setup?.assignments]
  );

  const allTasksAssigned =
    assignments.length > 0 &&
    assignments.every((task) => Boolean(task.assignedToId));

  // Firebase setup initialization.
  // Avoid repeated transactions caused by room snapshots.
  useEffect(() => {
    if (
      !isHost ||
      !roomCode ||
      !recipeId ||
      !members.length ||
      setupReady
    ) {
      if (setupReady) {
        setInitializing(false);
        setInitFinished(true);
      }
      return;
    }

    const key = `${roomCode}:${recipeId}:${retryCount}`;

    if (initializationAttempt.current === key) {
      return;
    }

    initializationAttempt.current = key;

    let active = true;

    setInitializing(true);
    setInitFinished(false);
    setError("");

    const timeout = setTimeout(() => {
      if (!active) return;

      setInitializing(false);
      setInitFinished(true);
      setError(
        "Cooking setup is taking too long. Check your Firebase connection and try again."
      );
    }, 12000);

    initializeCookingSetup(
      roomCode,
      selectedMeal,
      members
    )
      .catch((err) => {
        console.error(
          "Cooking setup initialization failed:",
          err
        );

        if (active) {
          setError(
            err.message || "Could not prepare cooking setup."
          );
        }
      })
      .finally(() => {
        clearTimeout(timeout);

        if (active) {
          setInitializing(false);
          setInitFinished(true);
        }
      });

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [
    isHost,
    roomCode,
    recipeId,
    members.length,
    setupReady,
    retryCount,
  ]);

  async function perform(action) {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await action();
    } catch (err) {
      console.error("Task setup action failed:", err);

      setError(
        err.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  function retryInitialization() {
    if (!isHost || initializing) return;

    initializationAttempt.current = null;
    setError("");
    setInitializing(false);
    setInitFinished(false);
    setRetryCount((count) => count + 1);
  }

  async function proceed() {
    if (!isHost || !setupReady || busy) return;

    await perform(() =>
      setCookingSetupStage(roomCode, "assignment")
    );
  }

  async function goBack() {
    if (busy) return;

    if (stage === "assignment") {
      if (!isHost) return;

      await perform(() =>
        setCookingSetupStage(roomCode, "equipment")
      );

      return;
    }

    if (isHost && typeof onBack === "function") {
      await perform(onBack);
    }
  }

  async function changeAssignment(taskId, memberId) {
    if (!myId || !setupReady || busy) return;

    await perform(async () => {
      await assignCookingTask(
        roomCode,
        taskId,
        memberId
      );

      setEditingTask(null);
    });
  }

  async function startCooking() {
    if (
      !isHost ||
      !setupReady ||
      !allTasksAssigned ||
      busy
    ) {
      return;
    }

    await perform(async () => {
      const finalAssignments = prepareAssignments(
        assignments,
        members
      );

      setTaskAssignments?.(finalAssignments);

      if (typeof onContinue === "function") {
        await onContinue();
      }
    });
  }

  if (!selectedMeal) {
    return (
      <main className="kt-task-page">
        <button
          className="kt-task-back"
          type="button"
          onClick={() => onBack?.()}
        >
          ‹
        </button>

        <header className="kt-task-header">
          <p className="kt-task-eyebrow">
            COOKING SETUP
          </p>

          <h1>No meal selected</h1>

          <p>
            Please choose a recipe before setting up
            your kitchen.
          </p>
        </header>
      </main>
    );
  }

  return (
    <main className="kt-task-page">
      <button
        className="kt-task-back"
        type="button"
        onClick={goBack}
        disabled={!isHost || busy}
        aria-label="Go back"
      >
        ‹
      </button>

      {stage === "equipment" ? (
        <>
          <header className="kt-task-header">
            <p className="kt-task-eyebrow">
              COOKING SETUP
            </p>

            <h1>Checking your kitchen</h1>

            <p>
              Select the equipment and preparation
              space available in your kitchen.
            </p>
          </header>

          <section className="kt-task-content">
            <h2>What’s available</h2>

            <div className="kt-equipment-list">
              {EQUIPMENT.map(({ name, type }) => {
                const available = Boolean(
                  equipment[name]
                );

                return (
                  <div
                    className="kt-equipment-row"
                    key={name}
                  >
                    <div>
                      <span className="kt-equipment-type">
                        {type}
                      </span>

                      <span className="kt-equipment-name">
                        {name}
                      </span>
                    </div>

                    <button
                      className={`kt-toggle ${
                        available ? "on" : ""
                      }`}
                      type="button"
                      role="switch"
                      aria-checked={available}
                      aria-label={`${name} available`}
                      disabled={
                        !isHost ||
                        !setupReady ||
                        busy ||
                        initializing
                      }
                      onClick={() =>
                        perform(() =>
                          updateCookingEquipment(
                            roomCode,
                            name,
                            !available
                          )
                        )
                      }
                    >
                      <span />
                    </button>
                  </div>
                );
              })}
            </div>

            {initializing && !setupReady && (
              <p className="kt-task-hint">
                Preparing your cooking setup...
              </p>
            )}

            {!setupReady &&
              !initializing &&
              isHost && (
                <p className="kt-task-hint">
                  Kitchen setup is not ready yet.
                </p>
              )}

            {!isHost && (
              <p className="kt-task-hint">
                Waiting for the room admin to confirm
                the kitchen equipment.
              </p>
            )}
          </section>

          <footer className="kt-task-footer">
            {error && (
              <p
                className="kt-task-error"
                role="alert"
              >
                {error}
              </p>
            )}

            {isHost &&
              !setupReady &&
              !initializing && (
                <button
                  className="kt-task-outline"
                  type="button"
                  onClick={retryInitialization}
                  disabled={busy}
                  style={{
                    width: "100%",
                    marginBottom: "12px",
                    padding: "12px",
                  }}
                >
                  Retry Cooking Setup
                </button>
              )}

            <button
              className="kt-task-primary"
              type="button"
              disabled={
                !isHost ||
                !setupReady ||
                busy ||
                initializing
              }
              onClick={proceed}
            >
              {initializing && !setupReady
                ? "Preparing setup..."
                : !isHost
                  ? "Waiting for admin"
                  : !setupReady
                    ? "Setup not ready"
                    : busy
                      ? "Please wait..."
                      : "Proceed to Assign Tasks"}
            </button>
          </footer>
        </>
      ) : (
        <>
          <header className="kt-task-header">
            <p className="kt-task-eyebrow">
              TASK ASSIGNMENT
            </p>

            <h1>Who’s doing what</h1>

            <p>
              The app gives an initial task split,
              and the rest is up to you! Claim and
              reassign tasks as you see fit.
            </p>
          </header>

          <section className="kt-task-content kt-assignment-content">
            <div className="kt-assignment-list">
              {assignments
                .filter(
                  (task) =>
                    showEveryone ||
                    (
                      myId &&
                      String(task.assignedToId) ===
                        String(myId)
                    ) ||
                    !task.assignedToId
                )
                .map((task, index) => {
                  const taskId = String(
                    task.id ?? `task-${index}`
                  );

                  const mine = Boolean(
                    myId &&
                    String(task.assignedToId) ===
                      String(myId)
                  );

                  const owner = members.find(
                    (member) =>
                      String(member.id) ===
                      String(task.assignedToId)
                  );

                  return (
                    <article
                      className={`kt-assignment-card ${
                        mine ? "mine" : ""
                      }`}
                      key={taskId}
                    >
                      <div className="kt-assignment-main">
                        <div className="kt-assignment-info">
                          <strong>
                            {task.title ||
                              task.name ||
                              "Cooking task"}
                          </strong>

                          <span
                            className={
                              mine
                                ? "kt-mine-label"
                                : ""
                            }
                            style={{
                              display: "block",
                              marginTop: "6px",
                              fontWeight: 600,
                              fontSize: "13px",
                            }}
                          >
                            {getMemberLabel(
                              owner,
                              myId
                            )}
                          </span>

                          {owner?.helperName && (
                            <span
                              style={{
                                display: "block",
                                marginTop: "3px",
                                fontSize: "11px",
                                color: "#826b5c",
                              }}
                            >
                              Helper: {owner.helperName}
                            </span>
                          )}
                        </div>

                        {mine ? (
                          <span className="kt-assigned-pill">
                            Assigned
                          </span>
                        ) : (
                          <button
                            className="kt-task-outline"
                            type="button"
                            disabled={
                              !myId ||
                              busy ||
                              !setupReady
                            }
                            onClick={() => {
                              if (!task.assignedToId) {
                                changeAssignment(
                                  taskId,
                                  myId
                                );
                              } else {
                                setEditingTask(
                                  editingTask === taskId
                                    ? null
                                    : taskId
                                );
                              }
                            }}
                          >
                            {task.assignedToId
                              ? "Reassign"
                              : "Claim"}
                          </button>
                        )}
                      </div>

                      {editingTask === taskId && (
                        <div className="kt-swap-panel">
                          <p>Assign this task to:</p>

                          <div className="kt-swap-choices">
                            {members.map((member) => (
                              <button
                                key={member.id}
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  changeAssignment(
                                    taskId,
                                    member.id
                                  )
                                }
                              >
                                {getMemberLabel(
                                  member,
                                  myId
                                )}
                              </button>
                            ))}

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                changeAssignment(
                                  taskId,
                                  null
                                )
                              }
                            >
                              Unassign
                            </button>
                          </div>
                        </div>
                      )}

                      {mine && (
                        <button
                          className="kt-release-link"
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            changeAssignment(
                              taskId,
                              null
                            )
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "7px",
                            marginTop: "12px",
                            padding: "10px 15px",
                            background: "#fff1e9",
                            color: "#b94115",
                            border: "1.5px solid #d76a42",
                            borderRadius: "10px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: busy
                              ? "not-allowed"
                              : "pointer",
                            opacity: busy ? 0.5 : 1,
                          }}
                        >
                          ↗ Release task
                        </button>
                      )}
                    </article>
                  );
                })}

              {!showEveryone && (
                <button
                  className="kt-see-all"
                  type="button"
                  onClick={() =>
                    setShowEveryone(true)
                  }
                >
                  See what everyone else is doing
                  <span>›</span>
                </button>
              )}

              {showEveryone && (
                <button
                  className="kt-see-all"
                  type="button"
                  onClick={() =>
                    setShowEveryone(false)
                  }
                >
                  Show my tasks
                  <span>⌃</span>
                </button>
              )}

              {!assignments.length && (
                <p className="kt-task-hint">
                  No tasks are available for this
                  recipe yet.
                </p>
              )}
            </div>
          </section>

          <footer className="kt-task-footer">
            {error && (
              <p
                className="kt-task-error"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              className="kt-task-primary"
              type="button"
              disabled={
                !isHost ||
                !setupReady ||
                busy ||
                !allTasksAssigned
              }
              onClick={startCooking}
            >
              {!isHost
                ? "Waiting for admin to start"
                : busy
                  ? "Starting..."
                  : !allTasksAssigned
                    ? "Assign all tasks first"
                    : "Start Cooking"}
            </button>
          </footer>
        </>
      )}
    </main>
  );
}
