import { useEffect, useRef, useState } from "react";

function getTimerSeconds(command) {
  const match = command.match(
    /(\d+(?:\.\d+)?)\s*(second|minute|hour)s?/
  );

  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier =
    unit === "hour" ? 3600 : unit === "minute" ? 60 : 1;

  return Math.min(Math.round(amount * multiplier), 7200);
}

export default function useVoiceCommands({
  helperName,
  onNext,
  onPrevious,
  onRepeat,
  onHelp,
  onTimer,
  onQuestion,
}) {
  const recognitionRef = useRef(null);
  const handlersRef = useRef({});

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported] = useState(
    () =>
      Boolean(
        window.SpeechRecognition ||
          window.webkitSpeechRecognition
      )
  );
  const [error, setError] = useState("");

  useEffect(() => {
    handlersRef.current = {
      helperName,
      onNext,
      onPrevious,
      onRepeat,
      onHelp,
      onTimer,
      onQuestion,
    };
  });

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-AU";

    recognition.onstart = () => {
      setError("");
      setListening(true);
    };

    recognition.onend = () => setListening(false);

    recognition.onerror = (event) => {
      setListening(false);
      setError(
        event.error === "not-allowed"
          ? "Microphone permission is blocked."
          : "I couldn't hear that. Please try again."
      );
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript
        .toLowerCase()
        .trim();

      setTranscript(command);

      const handlers = handlersRef.current;
      const helper = handlers.helperName?.toLowerCase();
      let instruction = command;

      if (helper && command.includes(helper)) {
        instruction = command
          .replace(`hey ${helper}`, "")
          .replace(helper, "")
          .trim();
      }

      if (
        instruction.includes("next") ||
        instruction.includes("continue")
      ) {
        handlers.onNext?.();
        return;
      }

      if (
        instruction.includes("previous") ||
        instruction.includes("go back") ||
        instruction === "back"
      ) {
        handlers.onPrevious?.();
        return;
      }

      if (
        instruction.includes("repeat") ||
        instruction.includes("again")
      ) {
        handlers.onRepeat?.();
        return;
      }

      const timerSeconds = getTimerSeconds(instruction);

      if (instruction.includes("timer") && timerSeconds) {
        handlers.onTimer?.(timerSeconds);
        return;
      }

      if (
        instruction.includes("need help") ||
        instruction === "help"
      ) {
        handlers.onHelp?.();
        return;
      }

      handlers.onQuestion?.(instruction);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  function startListening() {
    if (!supported || !recognitionRef.current) return;

    try {
      setTranscript("");
      setError("");
      recognitionRef.current.start();
    } catch {
      // The browser throws if recognition is already active.
    }
  }

  return {
    supported,
    listening,
    transcript,
    error,
    startListening,
  };
}
