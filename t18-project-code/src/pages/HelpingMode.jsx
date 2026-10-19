
import { useEffect, useRef, useState } from "react";
import {
  speak,
  stopSpeaking,
} from "../services/speechService";
import "./CookingMode.css";
import "./HelpingMode.css";

import VoiceButton from "../components/VoiceButton";
import useVoiceCommands from "../hooks/useVoiceCommands";
import { askCookingHelper } from "../services/recipeService";
import {
  setCookingActivity,
  subscribeToRoom,
} from "../services/roomService";


export default function HelpingMode({
  room,
  user,
  meal,
  helpingMember,
  onExit,
  onProgress,
  onAllComplete,
}) {
  const [task, setTask] = useState(
    helpingMember?.taskData || null
  );
  const [stepIndex, setStepIndex] = useState(
    Number(helpingMember?.taskData?.currentStep) || 0
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const lastSpoken = useRef(null);

  const roomCode = room?.code || room?.roomCode;
  const memberId =
    room?.memberId || user?.memberId || user?.id;

  const steps = Array.isArray(task?.steps)
    ? task.steps
    : [];

  const safeStep = Math.max(
    0,
    Math.min(stepIndex, Math.max(steps.length - 1, 0))
  );

  const taskDone = task?.status === "done";
  const helperName = user?.helperName || "Nova";
  const cookName = helpingMember?.name || "another cook";

  // Listen for the assigned cook's real task updates.
  useEffect(() => {
    if (!roomCode || !helpingMember?.taskId) {
      return undefined;
    }

    return subscribeToRoom(roomCode, (updatedRoom) => {
      if (!updatedRoom) return;

      if (updatedRoom.screen === "allComplete") {
        onAllComplete?.();
        return;
      }

      const raw =
        updatedRoom.cookingSetup?.assignments || [];

      const assignments = Array.isArray(raw)
        ? raw
        : Object.values(raw);

      const updatedTask = assignments.find(
        (item) =>
          String(item.id) ===
          String(helpingMember.taskId)
      );

      if (!updatedTask) return;

      setTask({
        ...updatedTask,
        name:
          updatedTask.name ||
          updatedTask.title ||
          "Cooking task",
      });

      if (updatedTask.status === "done") {
        setMessage(
          `${cookName} finished this task. Nice teamwork!`
        );
      }
    });
  }, [
    roomCode,
    helpingMember?.taskId,
    cookName,
    onAllComplete,
  ]);

  // Read each instruction aloud when it changes.
  useEffect(() => {
    const instruction = steps[safeStep];
    if (!instruction || taskDone) return;

    const key = `${task?.id}:${safeStep}`;
    if (lastSpoken.current === key) return;

    lastSpoken.current = key;
    speak(instruction);
  }, [task?.id, safeStep, taskDone, steps]);

  function previousStep() {
    setStepIndex((current) =>
      Math.max(0, current - 1)
    );
    setMessage("");
  }

  function nextStep() {
    if (safeStep < steps.length - 1) {
      setStepIndex(safeStep + 1);
      setMessage("");
    } else {
      setMessage(
        "You've reached the last instruction. The assigned cook will complete the task. You can finish helping now."
      );
    }
  }

  function repeatInstruction() {
    const instruction = steps[safeStep];
    if (!instruction) return;

    setMessage(`Repeating: ${instruction}`);
    speak(instruction);
  }

  async function askNova(question) {
    if (busy || !question?.trim()) return;

    setBusy(true);
    setMessage(`${helperName} is thinking...`);

    try {
      const result = await askCookingHelper({
        question,
        recipe: meal,
        task,
        currentStep: steps[safeStep] || "",
        equipment: room?.cookingSetup?.equipment || {},
      });

      const answer =
        result?.answer || "I couldn't find an answer.";

      setMessage(`${helperName}: ${answer}`);
      speak(answer);
    } catch (error) {
      console.error("Nova helper error:", error);
      setMessage(
        `${helperName} is unavailable right now. Please ask your cooking partner.`
      );
    } finally {
      setBusy(false);
    }
  }

  async function stopHelping() {
    if (leaving) return;

    setLeaving(true);
    window.speechSynthesis?.cancel();

    try {
      if (roomCode && memberId) {
        await setCookingActivity(
          roomCode,
          memberId,
          null
        );
      }
    } catch (error) {
      console.error(
        "Could not clear helping activity:",
        error
      );
    } finally {
      onExit?.();
    }
  }

  const {
    supported,
    listening,
    transcript,
    error: voiceError,
    startListening,
  } = useVoiceCommands({
    helperName,
    autoStart: true,
    onNext: nextStep,
    onPrevious: previousStep,
    onRepeat: repeatInstruction,
    onQuestion: askNova,
  });

  if (!task) {
    return (
      <main className="cooking-empty">
        <h2>Task unavailable</h2>
        <p>
          This cooking task is no longer available.
        </p>
        <button type="button" onClick={stopHelping}>
          Return to my tasks
        </button>
      </main>
    );
  }

  const progress = steps.length
    ? ((safeStep + 1) / steps.length) * 100
    : 0;

  return (
    <main className="cooking-page cooking-prototype helping-prototype">
      <button
        type="button"
        className="cooking-back"
        onClick={stopHelping}
        aria-label="Stop helping"
        disabled={leaving}
      >
        ‹
      </button>

      <div className="cooking-utility-icons">
        <button
          type="button"
          title="Voice commands"
          onClick={startListening}
        >
          ♩
        </button>
      </div>

      <section className="cooking-centre">
        <p className="cooking-eyebrow">
          HELPING {cookName.toUpperCase()} · STEP{" "}
          {steps.length ? safeStep + 1 : 0} OF{" "}
          {steps.length}
        </p>

        <p className="cooking-task-label">
          SHARED TASK · {task.name}
        </p>

        <h1>
          {taskDone
            ? `${cookName} has completed this task!`
            : steps[safeStep] ||
              "No instructions available."}
        </h1>

        <p className="helping-prototype-note">
          You're helping {cookName}. They remain
          responsible for completing this task.
        </p>

        <div className="cooking-prototype-controls">
          <button
            type="button"
            className="primary"
            onClick={
              taskDone ||
              safeStep === steps.length - 1
                ? stopHelping
                : nextStep
            }
            disabled={leaving}
          >
            {taskDone ||
            safeStep === steps.length - 1
              ? "Finish helping ✓"
              : "Next →"}
          </button>

          <button
            type="button"
            onClick={repeatInstruction}
            disabled={taskDone || !steps.length}
          >
            Repeat
          </button>

          <button
            type="button"
            onClick={previousStep}
            disabled={taskDone || safeStep === 0}
          >
            Previous
          </button>

          <button
            type="button"
            onClick={onProgress}
          >
            Group progress
          </button>

          <button
            type="button"
            onClick={stopHelping}
            disabled={leaving}
          >
            Back to my tasks
          </button>
        </div>

        <p className="cooking-voice-hint">
          Say “Hey {helperName}, next step”
          or ask a cooking question.
        </p>

        <div className="cooking-voice-control">
          <VoiceButton
            supported={supported}
            listening={listening}
            onClick={startListening}
          />
        </div>

        {(message || voiceError || transcript) && (
          <p
            className="cooking-feedback"
            aria-live="polite"
          >
            {voiceError ||
              message ||
              `Heard: “${transcript}”`}
          </p>
        )}
      </section>

      <div className="cooking-floating-progress">
        <span>Instruction progress</span>
        <strong>{Math.round(progress)}%</strong>
        <small>
          {steps.length ? safeStep + 1 : 0} of{" "}
          {steps.length} steps
        </small>
        <div className="cooking-progress-track">
          <div
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </main>
  );
}
