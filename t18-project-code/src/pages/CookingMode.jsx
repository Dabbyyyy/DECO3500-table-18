import { useEffect, useState } from "react";

import "./CookingMode.css";

import ProgressBar from "../components/ProgressBar";
import StepCard from "../components/StepCard";
import VoiceButton from "../components/VoiceButton";

import useVoiceCommands from "../hooks/useVoiceCommands";


export default function CookingMode({
  meal,
  user,
  taskAssignments,
  setTaskAssignments,
  onComplete,
  onBack,
}) {
  const userTasks =
    taskAssignments.filter(
      (task) =>
        task.assignedTo === user.name &&
        task.status !== "done"
    );

  const [activeTaskIndex, setActiveTaskIndex] =
    useState(0);

  const [currentStep, setCurrentStep] =
    useState(0);

  const [needsHelp, setNeedsHelp] =
    useState(false);

  const [message, setMessage] =
    useState("");


  const activeTask =
    userTasks[activeTaskIndex];


  useEffect(() => {
    setCurrentStep(0);
    setNeedsHelp(false);
    setMessage("");
  }, [activeTaskIndex]);


  const totalSteps =
    activeTask?.steps?.length || 0;


  const progress =
    totalSteps > 0
      ? ((currentStep + 1) /
          totalSteps) *
        100
      : 0;


  function previousStep() {
    if (currentStep > 0) {
      setCurrentStep(
        (step) => step - 1
      );

      setMessage("");
    }
  }


  function nextStep() {
    if (!activeTask) return;

    if (
      currentStep <
      activeTask.steps.length - 1
    ) {
      setCurrentStep(
        (step) => step + 1
      );

      setMessage("");

      return;
    }

    finishTask();
  }


  function repeatInstruction() {
    if (!activeTask) return;

    const instruction =
      activeTask.steps[currentStep];

    setMessage(
      `Repeat: ${instruction}`
    );

    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();

      const speech =
        new SpeechSynthesisUtterance(
          instruction
        );

      speech.lang = "en-AU";
      speech.rate = 0.95;

      window.speechSynthesis.speak(
        speech
      );
    }
  }


  function requestHelp() {
    const newState = !needsHelp;

    setNeedsHelp(newState);

    setMessage(
      newState
        ? "Help requested. Your group can see that you need help."
        : "Help request cancelled."
    );
  }


  function finishTask() {
    if (!activeTask) return;

    setTaskAssignments(
      (current) =>
        current.map((task) =>
          task.id === activeTask.id &&
          task.assignedTo ===
            user.name
            ? {
                ...task,
                status: "done",
              }
            : task
        )
    );

    onComplete();
  }


  function getStepState(index) {
    if (index < currentStep) {
      return "done";
    }

    if (index === currentStep) {
      return "current";
    }

    return "next";
  }


  const {
    supported,
    listening,
    transcript,
    startListening,
  } = useVoiceCommands({
    helperName: user.helperName,

    onNext: nextStep,

    onPrevious: previousStep,

    onRepeat: repeatInstruction,

    onHelp: requestHelp,
  });


  if (!meal || !activeTask) {
    return (
      <div className="cooking-empty">

        <h2>
          No active task
        </h2>

        <p>
          Go back and claim a cooking
          task first.
        </p>

        <button onClick={onBack}>
          ← Back to tasks
        </button>

      </div>
    );
  }


  return (
    <div className="cooking-page">

      {/* LEFT */}

      <section className="cooking-left">

        <div>

          <button
            className="cooking-back"
            onClick={onBack}
          >
            ←
          </button>


          <p className="cooking-label">
            YOUR TASK
          </p>


          <p className="helper-name">
            HEY{" "}
            {user.helperName
              ?.toUpperCase() ||
              "NOVA"}
          </p>


          <h1>
            {activeTask.name}
          </h1>


          <div className="cooking-task-meta">

            <span>
              {activeTask.icon}
            </span>

            <p>
              {
                activeTask.estimatedTime
              }{" "}
              min ·{" "}
              {activeTask.difficulty}
            </p>

          </div>

        </div>


        {/* CURRENT STEP */}

        <div className="current-instruction">

          <div className="instruction-number">
            {currentStep + 1}
          </div>

          <div>

            <span>
              STEP {currentStep + 1} OF{" "}
              {totalSteps}
            </span>

            <h2>
              {
                activeTask.steps[
                  currentStep
                ]
              }
            </h2>

          </div>

        </div>


        {/* VOICE */}

        <VoiceButton
          supported={supported}
          listening={listening}
          onClick={startListening}
        />


        {transcript && (
          <p className="voice-transcript">
            Heard: “{transcript}”
          </p>
        )}


        {/* CONTROLS */}

        <div className="cooking-controls">

          <button
            className="previous-button"
            onClick={previousStep}
            disabled={
              currentStep === 0
            }
          >
            ← Previous
          </button>


          <button
            className="next-button"
            onClick={nextStep}
          >
            {currentStep ===
            totalSteps - 1
              ? "Finish task ✓"
              : "Next step →"}
          </button>

        </div>

      </section>


      {/* RIGHT */}

      <section className="cooking-right">

        <div className="cooking-progress-header">

          <div>

            <p>
              COOKING NOW
            </p>

            <h2>
              {meal.name}
            </h2>

          </div>

          <span>
            {Math.round(progress)}%
          </span>

        </div>


        <ProgressBar
          value={progress}
        />


        {/* STEPS */}

        <div className="cooking-step-list">

          {activeTask.steps.map(
            (step, index) => (
              <StepCard
                key={`${activeTask.id}-${index}`}
                step={step}
                number={index + 1}
                state={getStepState(
                  index
                )}
              />
            )
          )}

        </div>


        {/* ACTIONS */}

        <div className="cooking-bottom">

          <div className="quick-actions">

            <button
              onClick={
                repeatInstruction
              }
            >
              ↻
              <span>
                Repeat
              </span>
            </button>


            <button
              className={
                needsHelp
                  ? "help-active"
                  : ""
              }
              onClick={requestHelp}
            >
              ?
              <span>
                {needsHelp
                  ? "Help requested"
                  : "I need help"}
              </span>
            </button>


            <button
              onClick={() =>
                setMessage(
                  "Group progress will be available here."
                )
              }
            >
              ◉
              <span>
                Group
              </span>
            </button>

          </div>


          {message && (
            <div className="cooking-message">
              {message}
            </div>
          )}

        </div>

      </section>

    </div>
  );
}