import { useEffect, useState } from "react";

import "./HelpingMode.css";

import ProgressBar from "../components/ProgressBar";
import StepCard from "../components/StepCard";
import VoiceButton from "../components/VoiceButton";
import useVoiceCommands from "../hooks/useVoiceCommands";
import {
  setCookingActivity,
  subscribeToRoom,
} from "../services/roomService";

function speak(message) {
  if (!("speechSynthesis" in window) || !message) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-AU";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export default function HelpingMode({
  room,
  user,
  meal,
  helpingMember,
  onExit,
  onProgress,
  onAllComplete,
}) {
  const [task, setTask] = useState(helpingMember?.taskData || null);
  const [currentStep, setCurrentStep] = useState(
    helpingMember?.taskData?.currentStep || 0
  );
  const [message, setMessage] = useState("");

  const roomCode = room.code || room.roomCode;
  const memberId = room.memberId || user.memberId || user.id;
  const steps = Array.isArray(task?.steps) ? task.steps : [];
  const safeStep = Math.max(
    0,
    Math.min(currentStep, Math.max(steps.length - 1, 0))
  );
  const progress = steps.length
    ? ((safeStep + 1) / steps.length) * 100
    : 0;

  useEffect(() => {
    if (!roomCode || !helpingMember?.taskId) return undefined;

    return subscribeToRoom(roomCode, (updatedRoom) => {
      if (!updatedRoom) return;

      if (updatedRoom.screen === "allComplete") {
        onAllComplete?.();
        return;
      }

      const assignments = Array.isArray(
        updatedRoom.cookingSetup?.assignments
      )
        ? updatedRoom.cookingSetup.assignments
        : Object.values(
            updatedRoom.cookingSetup?.assignments || {}
          );

      const updatedTask = assignments.find(
        (item) =>
          String(item.id) === String(helpingMember.taskId)
      );

      if (!updatedTask) return;

      setTask({
        ...updatedTask,
        name:
          updatedTask.name || updatedTask.title || "Cooking task",
      });

      if (updatedTask.status === "done") {
        setMessage(
          `${helpingMember.name} finished this task. Nice teamwork!`
        );
        setCookingActivity(roomCode, memberId, null).catch(
          console.error
        );
      }
    });
  }, [
    helpingMember?.name,
    helpingMember?.taskId,
    memberId,
    onAllComplete,
    roomCode,
  ]);

  function previousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  function nextStep() {
    setCurrentStep((step) =>
      Math.min(step + 1, Math.max(steps.length - 1, 0))
    );
  }

  function repeatInstruction() {
    const instruction = steps[safeStep];
    setMessage(`Repeating: ${instruction}`);
    speak(instruction);
  }

  async function stopHelping() {
    await setCookingActivity(roomCode, memberId, null);
    onExit();
  }

  const {
    supported,
    listening,
    transcript,
    error,
    startListening,
  } = useVoiceCommands({
    helperName: user.helperName || "Nova",
    onNext: nextStep,
    onPrevious: previousStep,
    onRepeat: repeatInstruction,
    onQuestion: () =>
      setMessage(
        "Ask the assigned cook before changing their task or ingredients."
      ),
  });

  if (!task) {
    return (
      <main className="helping-empty">
        <h1>This task is no longer available.</h1>
        <button type="button" onClick={stopHelping}>
          Return to task options
        </button>
      </main>
    );
  }

  return (
    <main className="helping-page">
      <section className="helping-left">
        <div>
          <button
            className="helping-back"
            type="button"
            onClick={stopHelping}
            aria-label="Stop helping"
          >
            ←
          </button>

          <p className="helping-label">HELPING ANOTHER COOK</p>
          <h1>
            You’re helping
            <br />
            {helpingMember?.name}.
          </h1>
          <p className="helping-description">
            Work alongside them on {task.name}. The assigned cook remains
            in control of completing the task.
          </p>
        </div>

        <div className="helping-meal-card">
          <span aria-hidden="true">🤝</span>
          <div>
            <small>COOKING TOGETHER</small>
            <strong>{meal?.title || meal?.name}</strong>
          </div>
        </div>
      </section>

      <section className="helping-right">
        <header className="helping-header">
          <div>
            <p>SHARED GUIDANCE</p>
            <h2>{task.name}</h2>
          </div>
          <strong>{Math.round(progress)}%</strong>
        </header>

        <ProgressBar value={progress} />

        <div className="helping-current-step">
          <span>{safeStep + 1}</span>
          <div>
            <small>
              STEP {safeStep + 1} OF {steps.length}
            </small>
            <h3>{steps[safeStep]}</h3>
          </div>
        </div>

        <div className="helping-step-list">
          {steps.map((step, index) => (
            <StepCard
              key={`${task.id}-${index}`}
              step={step}
              number={index + 1}
              state={
                index < safeStep
                  ? "done"
                  : index === safeStep
                    ? "current"
                    : "next"
              }
            />
          ))}
        </div>

        <div className="helping-actions">
          <VoiceButton
            supported={supported}
            listening={listening}
            onClick={startListening}
          />

          {(transcript || error || message) && (
            <p className="helping-message" aria-live="polite">
              {error || message || `Heard: “${transcript}”`}
            </p>
          )}

          <div>
            <button
              type="button"
              onClick={previousStep}
              disabled={safeStep === 0}
            >
              ← Previous
            </button>
            <button type="button" onClick={repeatInstruction}>
              ↻ Repeat
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={safeStep === steps.length - 1}
            >
              Next →
            </button>
            <button type="button" onClick={onProgress}>
              Group progress
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
