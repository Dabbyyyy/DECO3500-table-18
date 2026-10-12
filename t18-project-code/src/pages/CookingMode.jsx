import { useEffect, useMemo, useState } from "react";

import "./CookingMode.css";

import ProgressBar from "../components/ProgressBar";
import StepCard from "../components/StepCard";
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

function speak(message) {
  if (!("speechSynthesis" in window) || !message) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-AU";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
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
  const [timerRemaining, setTimerRemaining] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
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
      setEquipment(updatedRoom.cookingSetup?.equipment || {});
    });
  }, [roomCode, setTaskAssignments]);

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
    totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  useEffect(() => {
    if (!activeTaskId) return;

    if (activeTaskStatus === "waiting" && roomCode) {
      updateCookingTask(roomCode, activeTaskId, {
        status: "cooking",
      }).catch(console.error);
    }
  }, [
    activeTaskId,
    activeTaskStatus,
    roomCode,
  ]);

  useEffect(() => {
    if (!timerRunning) return undefined;

    const interval = window.setInterval(() => {
      setTimerRemaining((remaining) => {
        if (remaining == null || remaining > 1) {
          return remaining == null ? null : remaining - 1;
        }

        window.clearInterval(interval);
        setTimerRunning(false);
        setMessage("Timer finished!");
        speak("Your cooking timer is finished.");
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

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
      await updateCookingTask(roomCode, activeTask.id, changes);
    }
  }

  function previousStep() {
    if (currentStep <= 0) return;

    const nextStep = currentStep - 1;
    setMessage("");
    saveTaskChanges({ currentStep: nextStep }).catch(console.error);
  }

  function nextStep() {
    if (!activeTask) return;

    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setMessage("");
      saveTaskChanges({ currentStep: nextStep }).catch(console.error);
      return;
    }

    finishTask();
  }

  function repeatInstruction() {
    const instruction = activeTask?.steps?.[currentStep];
    if (!instruction) return;

    setMessage(`Repeating: ${instruction}`);
    speak(instruction);
  }

  function requestHelp() {
    const nextState = !needsHelp;

    saveTaskChanges({ needsHelp: nextState }).catch(console.error);
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
      setMessage("Task complete. Your next task is ready.");
      return;
    }

    onComplete();
  }

  function startTimer(seconds) {
    setTimerRemaining(seconds);
    setTimerRunning(true);
    setMessage(`Timer started for ${formatTimer(seconds)}.`);
    const spokenDuration =
      seconds < 60
        ? `${seconds} seconds`
        : `${Math.ceil(seconds / 60)} minutes`;
    speak(`Timer started for ${spokenDuration}.`);
  }

  async function answerQuestion(question) {
    const step = activeTask?.steps?.[currentStep];
    const fallback = step
      ? `For this step: ${step} Follow the recipe quantities and ask another cook if you are unsure.`
      : "I couldn't find a current recipe step.";

    if (helperBusy) return;

    setHelperBusy(true);
    setMessage("Nova is thinking...");

    try {
      const result = await askCookingHelper({
        question,
        recipe: meal,
        task: activeTask,
        currentStep: step,
        equipment,
      });

      setMessage(`Nova: ${result.answer}`);
      speak(result.answer);
    } catch (error) {
      console.error("Nova cooking helper failed:", error);
      setMessage(`Nova: ${fallback}`);
      speak(fallback);
    } finally {
      setHelperBusy(false);
    }
  }

  function getStepState(index) {
    if (index < currentStep) return "done";
    if (index === currentStep) return "current";
    return "next";
  }

  const {
    supported,
    listening,
    transcript,
    error: voiceError,
    startListening,
  } = useVoiceCommands({
    helperName: user.helperName || "Nova",
    onNext: nextStep,
    onPrevious: previousStep,
    onRepeat: repeatInstruction,
    onHelp: requestHelp,
    onTimer: startTimer,
    onQuestion: answerQuestion,
  });

  if (!meal || !activeTask) {
    return (
      <main className="cooking-empty">
        <h2>No active task</h2>
        <p>
          Your assigned tasks are complete, or no task has been assigned
          to you yet.
        </p>
        <button type="button" onClick={onProgress || onBack}>
          View group progress
        </button>
      </main>
    );
  }

  return (
    <main className="cooking-page">
      <section className="cooking-left">
        <div>
          <button
            type="button"
            className="cooking-back"
            onClick={onBack}
            aria-label="Back to task setup"
          >
            ←
          </button>

          <p className="cooking-label">YOUR TASK</p>
          <p className="helper-name">
            HEY {(user.helperName || "NOVA").toUpperCase()}
          </p>
          <h1>{activeTask.name}</h1>

          <div className="cooking-task-meta">
            <span aria-hidden="true">{activeTask.icon || "🍳"}</span>
            <p>
              {activeTask.estimatedTime
                ? `${activeTask.estimatedTime} min · `
                : ""}
              {activeTask.difficulty || "Easy"}
            </p>
          </div>
        </div>

        <div className="current-instruction">
          <div className="instruction-number">{currentStep + 1}</div>
          <div>
            <span>
              STEP {currentStep + 1} OF {totalSteps}
            </span>
            <h2>{activeTask.steps[currentStep]}</h2>
          </div>
        </div>

        <VoiceButton
          supported={supported}
          listening={listening}
          onClick={startListening}
        />

        {(transcript || voiceError) && (
          <p className="voice-transcript" aria-live="polite">
            {voiceError || `Heard: “${transcript}”`}
          </p>
        )}

        {timerRemaining != null && (
          <div className="cooking-timer" aria-live="polite">
            <div>
              <span>COOKING TIMER</span>
              <strong>{formatTimer(timerRemaining)}</strong>
            </div>
            <button
              type="button"
              onClick={() => setTimerRunning((running) => !running)}
              disabled={timerRemaining === 0}
            >
              {timerRunning ? "Pause" : "Resume"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimerRemaining(null);
                setTimerRunning(false);
              }}
            >
              Clear
            </button>
          </div>
        )}

        <div className="cooking-controls">
          <button
            type="button"
            className="previous-button"
            onClick={previousStep}
            disabled={currentStep === 0}
          >
            ← Previous
          </button>
          <button
            type="button"
            className="next-button"
            onClick={nextStep}
          >
            {currentStep === totalSteps - 1
              ? "Finish task ✓"
              : "Next step →"}
          </button>
        </div>
      </section>

      <section className="cooking-right">
        <div className="cooking-progress-header">
          <div>
            <p>COOKING NOW</p>
            <h2>{meal.title || meal.name}</h2>
          </div>
          <span>{Math.round(progress)}%</span>
        </div>

        <ProgressBar value={progress} />

        <div className="cooking-step-list">
          {activeTask.steps.map((step, index) => (
            <StepCard
              key={`${activeTask.id}-${index}`}
              step={step}
              number={index + 1}
              state={getStepState(index)}
            />
          ))}
        </div>

        <div className="cooking-bottom">
          <div className="quick-actions">
            <button type="button" onClick={repeatInstruction}>
              ↻ <span>Repeat</span>
            </button>
            <button
              type="button"
              className={needsHelp ? "help-active" : ""}
              onClick={requestHelp}
            >
              ? <span>{needsHelp ? "Help sent" : "I need help"}</span>
            </button>
            <button type="button" onClick={() => startTimer(300)}>
              ◷ <span>5 min timer</span>
            </button>
            <button type="button" onClick={onProgress}>
              ◉ <span>Group</span>
            </button>
          </div>

          {message && (
            <div className="cooking-message" aria-live="polite">
              {message}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
