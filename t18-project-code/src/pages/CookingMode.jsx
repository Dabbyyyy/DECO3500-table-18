import { useEffect, useMemo, useRef, useState } from "react";
import { speak } from "../services/speechService";
import "./CookingMode.css";

import VoiceButton from "../components/VoiceButton";
import useVoiceCommands from "../hooks/useVoiceCommands";
import {
  subscribeToRoom,
  updateCookingTask,
} from "../services/roomService";
import { askCookingHelper } from "../services/recipeService";

function normaliseAssignments(assignments, members = []) {
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
      steps: Array.isArray(task.steps) ? task.steps : [],
    };
  });
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainder
  ).padStart(2, "0")}`;
}

export default function CookingMode({
  meal,
  user,
  room,
  taskAssignments,
  setTaskAssignments,
  onComplete,
  onBack,
  onProgress,
}) {
  const [message, setMessage] = useState("");
  const lastSpokenStep = useRef(null);

  const [timerMinutes, setTimerMinutes] = useState(5);
  const [showTimer, setShowTimer] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(null);
  const [timerInitial, setTimerInitial] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const [helpRequests, setHelpRequests] = useState([]);
  const [helperBusy, setHelperBusy] = useState(false);
  const [equipment, setEquipment] = useState(
    room.cookingSetup?.equipment || {}
  );

  const roomCode = room.code || room.roomCode;
  const memberId = room.memberId || user.memberId || user.id;

  useEffect(() => {
    if (!roomCode) return undefined;

    return subscribeToRoom(roomCode, (updatedRoom) => {
      if (!updatedRoom) return;

      setTaskAssignments(
        normaliseAssignments(
          updatedRoom.cookingSetup?.assignments,
          updatedRoom.members
        )
      );

      setEquipment(
        updatedRoom.cookingSetup?.equipment || {}
      );

      const assignments = Array.isArray(
        updatedRoom.cookingSetup?.assignments
      )
        ? updatedRoom.cookingSetup.assignments
        : Object.values(
            updatedRoom.cookingSetup?.assignments || {}
          );

      setHelpRequests(
        assignments.filter(
          (task) =>
            task.needsHelp &&
            task.status !== "done" &&
            String(task.assignedToId) !== String(memberId)
        )
      );
    });
  }, [roomCode, setTaskAssignments, memberId]);

  const userTasks = useMemo(
    () =>
      taskAssignments.filter((task) => {
        const belongsToMember =
          memberId && task.assignedToId
            ? String(task.assignedToId) === String(memberId)
            : task.assignedTo === user.name;

        return belongsToMember && task.status !== "done";
      }),
    [memberId, taskAssignments, user.name]
  );

  const activeTask = userTasks[0];
  const totalSteps = activeTask?.steps?.length || 0;

  const currentStep = activeTask
    ? Math.max(
        0,
        Math.min(activeTask.currentStep || 0, totalSteps - 1)
      )
    : 0;

  const needsHelp = Boolean(activeTask?.needsHelp);
  const activeTaskId = activeTask?.id;
  const activeTaskStatus = activeTask?.status;

  const progress =
    totalSteps > 0
      ? ((currentStep + 1) / totalSteps) * 100
      : 0;

  // Read instructions when the cooking step changes.
  useEffect(() => {
    if (!activeTaskId || !activeTask?.steps?.[currentStep]) {
      return;
    }

    const key = `${activeTaskId}:${currentStep}`;

    if (lastSpokenStep.current === key) return;

    lastSpokenStep.current = key;
    speak(activeTask.steps[currentStep]);
  }, [activeTaskId, currentStep, activeTask?.steps]);

  // Mark an assigned task as cooking.
  useEffect(() => {
    if (!activeTaskId) return;

    if (activeTaskStatus === "waiting" && roomCode) {
      updateCookingTask(roomCode, activeTaskId, {
        status: "cooking",
      }).catch(console.error);
    }
  }, [activeTaskId, activeTaskStatus, roomCode]);

  // Countdown timer.
  useEffect(() => {
    if (!timerRunning) return undefined;

    const interval = window.setInterval(() => {
      setTimerRemaining((remaining) => {
        if (remaining == null) return null;
        return Math.max(0, remaining - 1);
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  // Announce timer completion.
  useEffect(() => {
    if (timerRemaining !== 0 || !timerRunning) return;

    setTimerRunning(false);
    setMessage("Timer finished!");
    speak("Your cooking timer is finished.");
  }, [timerRemaining, timerRunning]);

  async function saveTaskChanges(changes) {
    if (!activeTask) return;

    setTaskAssignments((current) =>
      current.map((task) =>
        String(task.id) === String(activeTask.id)
          ? { ...task, ...changes }
          : task
      )
    );

    if (roomCode) {
      await updateCookingTask(
        roomCode,
        activeTask.id,
        changes
      );
    }
  }

  function previousStep() {
    if (currentStep <= 0) return;

    setMessage("");

    saveTaskChanges({
      currentStep: currentStep - 1,
    }).catch(console.error);
  }

  function nextStep() {
    if (!activeTask) return;

    if (currentStep < totalSteps - 1) {
      setMessage("");

      saveTaskChanges({
        currentStep: currentStep + 1,
      }).catch(console.error);

      return;
    }

    finishTask().catch(console.error);
  }

  function repeatInstruction() {
    const instruction = activeTask?.steps?.[currentStep];
    if (!instruction) return;

    setMessage(`Repeating: ${instruction}`);
    speak(instruction);
  }

  function requestHelp() {
    const nextState = !needsHelp;

    saveTaskChanges({
      needsHelp: nextState,
    }).catch(console.error);

    setMessage(
      nextState
        ? "Help requested. Your group can see it."
        : "Help request cancelled."
    );
  }

  async function finishTask() {
    if (!activeTask) return;

    await saveTaskChanges({
      status: "done",
      currentStep: Math.max(totalSteps - 1, 0),
      needsHelp: false,
      completedAt: Date.now(),
    });

    if (userTasks.length > 1) {
      setMessage(
        "Task complete. Your next task is ready."
      );
      return;
    }

    onComplete?.();
  }

  // Start a timer from either the UI or voice.
  function startTimer(seconds) {
    if (
      !Number.isFinite(seconds) ||
      seconds < 1 ||
      seconds > 7200
    ) {
      setMessage(
        "Choose a timer between 1 second and 2 hours."
      );
      return;
    }

    setTimerMinutes(Math.ceil(seconds / 60));
    setTimerRemaining(seconds);
    setTimerInitial(seconds);
    setTimerRunning(true);
    setShowTimer(true);

    setMessage(
      `Timer started for ${formatTimer(seconds)}.`
    );

    const spokenDuration =
      seconds < 60
        ? `${seconds} seconds`
        : `${Math.ceil(seconds / 60)} minutes`;

    speak(`Timer started for ${spokenDuration}.`);
  }

  function pauseTimer() {
    if (timerRemaining == null || !timerRunning) return;

    setTimerRunning(false);
    setShowTimer(true);
    setMessage("Timer paused.");
  }

  function resumeTimer() {
    if (timerRemaining == null || timerRemaining <= 0) {
      setMessage("Start a timer first.");
      return;
    }

    setShowTimer(true);
    setTimerRunning(true);
    setMessage("Timer resumed.");
  }

  function resetTimer() {
    if (timerInitial == null) {
      setMessage("Start a timer first.");
      return;
    }

    setTimerRunning(false);
    setTimerRemaining(timerInitial);
    setShowTimer(true);

    setMessage(
      `Timer reset to ${formatTimer(timerInitial)}. Press Resume to start.`
    );
  }

  function announceTimer() {
    if (timerRemaining == null) {
      setMessage("No timer has been set.");
      speak("You have not started a timer yet.");
      return;
    }

    setShowTimer(true);

    const mins = Math.floor(timerRemaining / 60);
    const secs = timerRemaining % 60;

    const response =
      `${mins} minutes and ${secs} seconds remaining.`;

    setMessage(response);
    speak(response);
  }

  async function answerQuestion(question) {
    const step = activeTask?.steps?.[currentStep];
    if (helperBusy) return;

    setHelperBusy(true);

    const helperName = user.helperName || "Nova";
    setMessage(`${helperName} is thinking...`);

    try {
      const result = await askCookingHelper({
        question,
        recipe: meal,
        task: activeTask,
        currentStep: step,
        equipment,
      });

      setMessage(`${helperName}: ${result.answer}`);
      speak(result.answer);
    } catch (error) {
      console.error(
        "Cooking helper failed:",
        error
      );

      const errorMessage =
        error?.message?.includes("not configured")
          ? "The AI cooking helper needs a server API key. Please ask another cook for help."
          : "I cannot reach the cooking assistant right now. Please ask another cook for help.";

      setMessage(`${helperName}: ${errorMessage}`);
      speak(errorMessage);
    } finally {
      setHelperBusy(false);
    }
  }

  const {
    supported,
    listening,
    transcript,
    error: voiceError,
    startListening,
  } = useVoiceCommands({
    helperName: user.helperName || "Nova",
    autoStart: false,
    onNext: nextStep,
    onPrevious: previousStep,
    onRepeat: repeatInstruction,
    onHelp: requestHelp,
    onTimer: startTimer,
    onTimerPause: pauseTimer,
    onTimerResume: resumeTimer,
    onTimerReset: resetTimer,
    onTimerRemaining: announceTimer,
    onProgress: () => onProgress?.(),
    onQuestion: answerQuestion,
  });

  if (!meal || !activeTask) {
    return (
      <main className="cooking-empty">
        <h2>No active task</h2>
        <p>
          Your assigned tasks are complete, or no task
          has been assigned to you yet.
        </p>
        <button
          type="button"
          onClick={onProgress || onBack}
        >
          View group progress
        </button>
      </main>
    );
  }

  return (
    <main className="cooking-page cooking-prototype">
      <button
        type="button"
        className="cooking-back"
        onClick={onBack}
        aria-label="Back to task setup"
      >
        ‹
      </button>

      <div
        className="cooking-utility-icons"
        aria-label="Cooking tools"
      >
        <button
          type="button"
          title="Voice commands"
          aria-label="Start voice commands"
          onClick={startListening}
        >
          ♩
        </button>

        <button
          type="button"
          title="Timer"
          aria-label="Set timer"
          onClick={() => setShowTimer((value) => !value)}
        >
          ◷
        </button>

        <button
          type="button"
          title="Ask for help"
          aria-label="Ask for help"
          onClick={requestHelp}
        >
          ✋
        </button>
      </div>

      <section className="cooking-centre">
        <p className="cooking-eyebrow">
          COOKING MODE · STEP {currentStep + 1} OF{" "}
          {totalSteps}
        </p>

        <p className="cooking-task-label">
          YOUR TASK · {activeTask.name}
        </p>

        <h1>{activeTask.steps[currentStep]}</h1>

        <div className="cooking-prototype-controls">
          <button
            className="primary"
            type="button"
            onClick={nextStep}
          >
            {currentStep === totalSteps - 1
              ? "Finish task ✓"
              : "Next →"}
          </button>

          <button
            type="button"
            onClick={repeatInstruction}
          >
            Repeat
          </button>

          <button
            type="button"
            onClick={previousStep}
            disabled={currentStep === 0}
          >
            Previous
          </button>

          <button
            type="button"
            onClick={() => setShowTimer((value) => !value)}
          >
            Timer
          </button>

          <button
            type="button"
            className={needsHelp ? "help-active" : ""}
            onClick={requestHelp}
          >
            {needsHelp ? "Help sent ✓" : "Need help"}
          </button>

          <button
            type="button"
            onClick={onProgress}
          >
            Group progress
          </button>
        </div>

        <p className="cooking-voice-hint">
          Voice commands{" "}
          {listening ? "listening" : "available"} —
          tap the microphone and say
          “Hey {user.helperName || "Nova"}, next step”.
        </p>

        <div className="cooking-voice-control">
          <VoiceButton
            supported={supported}
            listening={listening}
            onClick={startListening}
          />
        </div>

        {(transcript || voiceError) && (
          <p
            className="cooking-feedback"
            aria-live="polite"
          >
            {voiceError || `Heard: “${transcript}”`}
          </p>
        )}

        {message && (
          <p
            className="cooking-feedback"
            aria-live="polite"
          >
            {message}
          </p>
        )}

        {helpRequests.length > 0 && (
          <p
            className="cooking-feedback"
            role="status"
          >
            Someone needs help.{" "}
            <button
              type="button"
              onClick={onProgress}
            >
              View group
            </button>
          </p>
        )}

        {showTimer && (
          <div className="cooking-timer-popover">
            <label htmlFor="ktchn-timer-minutes">
              Timer (minutes)
            </label>

            <input
              id="ktchn-timer-minutes"
              type="number"
              min="1"
              max="120"
              value={timerMinutes}
              onChange={(event) =>
                setTimerMinutes(Number(event.target.value))
              }
            />

            <button
              type="button"
              onClick={() => startTimer(timerMinutes * 60)}
            >
              Start
            </button>

            {timerRemaining !== null && (
              <>
                <strong
                  role="timer"
                  aria-label="Time remaining"
                >
                  {formatTimer(timerRemaining)}
                </strong>

                <button
                  type="button"
                  onClick={
                    timerRunning ? pauseTimer : resumeTimer
                  }
                  disabled={timerRemaining === 0}
                >
                  {timerRunning ? "Pause" : "Resume"}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                >
                  Reset
                </button>
              </>
            )}
          </div>
        )}
      </section>

      <div className="cooking-floating-progress">
        <span>Session progress</span>

        <strong>{Math.round(progress)}%</strong>

        <small>
          {currentStep + 1} of {totalSteps} steps
        </small>

        <div className="cooking-progress-track">
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>
    </main>
  );
}