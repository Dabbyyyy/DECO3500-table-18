
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

function getMemberLabel(member, myId) {
  if (!member) return "Unclaimed";

  const isMe = String(member.id) === String(myId);
  return `${member.name || "Member"}${isMe ? " (You)" : ""}`;
}

function prepareAssignments(assignments, members) {
  const tasks = Array.isArray(assignments)
    ? assignments
    : Object.values(assignments || {});

  return tasks.filter(Boolean).map((task, index) => {
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
      assignedTo: owner?.name || task.assignedTo || null,
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
  const [error, setError] = useState("");
  const [showEveryone, setShowEveryone] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const navigationStarted = useRef(false);

  const roomCode = room.code || room.roomCode;

  // Listen directly to Firebase so changes appear
  // immediately on every device.
  useEffect(() => {
    if (!roomCode) return;

    setLiveRoom(null);

    const unsubscribe = subscribeToRoom(
      roomCode,
      (updatedRoom) => {
        if (updatedRoom) {
          setLiveRoom(updatedRoom);

          if (
            updatedRoom.screen === "cooking" &&
            !navigationStarted.current
          ) {
            navigationStarted.current = true;

            const updatedMembers = Array.isArray(
              updatedRoom.members
            )
              ? updatedRoom.members
              : Object.values(updatedRoom.members || {});

            setTaskAssignments?.(
              prepareAssignments(
                updatedRoom.cookingSetup?.assignments,
                updatedMembers
              )
            );
            onRoomStart?.();
          }
        }
      }
    );

    return () => unsubscribe();
  }, [roomCode, onRoomStart, setTaskAssignments]);

  const currentRoom = liveRoom || room;

  // The local member ID is not stored at the
  // root of the Firebase room.
  const myId =
    room.memberId ||
    user.memberId ||
    user.id ||
    null;

  const isHost = Boolean(
    myId &&
      currentRoom.hostId &&
      String(myId) === String(currentRoom.hostId)
  );

  const members = useMemo(() => {
    const data = currentRoom.members;

    if (Array.isArray(data)) {
      return data.filter(Boolean);
    }

    if (data && typeof data === "object") {
      return Object.values(data).filter(Boolean);
    }

    return [];
  }, [currentRoom.members]);

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
      String(setup.recipeId) === recipeId
  );

  const stage = setupReady
    ? setup.stage || "equipment"
    : "equipment";

  const equipment = setupReady
    ? setup.equipment || {}
    : {};

  const assignments = useMemo(() => {
    if (!setupReady) return [];

    const data = setup.assignments;

    if (Array.isArray(data)) {
      return data.filter(Boolean);
    }

    if (data && typeof data === "object") {
      return Object.values(data).filter(Boolean);
    }

    return [];
  }, [setupReady, setup?.assignments]);

  const allTasksAssigned =
    assignments.length > 0 &&
    assignments.every(
      (task) => Boolean(task.assignedToId)
    );

  // Initialise Firebase setup only when needed.
  useEffect(() => {
    if (
      !isHost ||
      !roomCode ||
      !selectedMeal ||
      !members.length ||
      setupReady
    ) {
      return;
    }

    let cancelled = false;

    setInitializing(true);
    setError("");

    initializeCookingSetup(
      roomCode,
      selectedMeal,
      members
    )
      .catch((err) => {
        if (!cancelled) {
          console.error(
            "Cooking setup initialization failed:",
            err
          );
          setError(
            err.message ||
              "Could not prepare cooking setup."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setInitializing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    isHost,
    roomCode,
    recipeId,
    setupReady,
    selectedMeal,
    members,
  ]);

  async function perform(action) {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await action();
    } catch (err) {
      console.error("Task setup error:", err);
      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function proceed() {
    if (!isHost || !setupReady || busy) return;

    await perform(() =>
      setCookingSetupStage(roomCode, "assignment")
    );
  }

  async function goBack() {
    if (!isHost || busy) return;

    if (stage === "assignment") {
      await perform(() =>
        setCookingSetupStage(roomCode, "equipment")
      );
      return;
    }

    if (typeof onBack === "function") {
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

      if (
        typeof setTaskAssignments === "function"
      ) {
        setTaskAssignments(finalAssignments);
      }

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
            Please choose a recipe before
            setting up your kitchen.
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

            {initializing && (
              <p className="kt-task-hint">
                Preparing your cooking setup...
              </p>
            )}

            {!setupReady &&
              !initializing &&
              isHost && (
                <p className="kt-task-hint">
                  Waiting for the kitchen setup
                  to load from Firebase.
                </p>
              )}

            {!isHost && (
              <p className="kt-task-hint">
                Waiting for the room admin to
                confirm the kitchen equipment.
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
              {initializing
                ? "Preparing setup..."
                : isHost
                  ? "Proceed to Assign Tasks"
                  : "Waiting for admin"}
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
              and the rest is up to you!
              Claim and reassign tasks as
              you see fit.
            </p>
          </header>

          <section className="kt-task-content kt-assignment-content">
            <div className="kt-assignment-list">
              {assignments
                .filter(
                  (task) =>
                    showEveryone ||
                    (Boolean(myId) &&
                      String(task.assignedToId) ===
                        String(myId)) ||
                    !task.assignedToId
                )
                .map((task) => {
                  const mine =
                    Boolean(myId) &&
                    String(task.assignedToId) ===
                      String(myId);

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
                      key={task.id}
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
                                  task.id,
                                  myId
                                );
                              } else {
                                setEditingTask(
                                  editingTask === task.id
                                    ? null
                                    : task.id
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

                      {editingTask === task.id && (
                        <div className="kt-swap-panel">
                          <p>
                            Assign this task to:
                          </p>

                          <div className="kt-swap-choices">
                            {members.map(
                              (member) => (
                                <button
                                  key={member.id}
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    changeAssignment(
                                      task.id,
                                      member.id
                                    )
                                  }
                                >
                                  {getMemberLabel(
                                    member,
                                    myId
                                  )}
                                </button>
                              )
                            )}

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                changeAssignment(
                                  task.id,
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
                              task.id,
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
                  No tasks are available for
                  this recipe yet.
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
              {isHost
                ? "Start Cooking"
                : "Waiting for admin to start"}
            </button>
          </footer>
        </>
      )}
    </main>
  );
}
