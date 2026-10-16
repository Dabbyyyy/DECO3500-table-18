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
  autoStart = false,
  onNext,
  onPrevious,
  onRepeat,
  onHelp,
  onTimer,
  onQuestion,
}) {
  const recognitionRef = useRef(null);
  const autoStartRef = useRef(autoStart);
  const stoppedRef = useRef(false);
  const restartRef = useRef(null);
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
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-AU";

    recognition.onstart = () => {
      setError("");
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
      if (autoStartRef.current && !stoppedRef.current) {
        restartRef.current = window.setTimeout(() => {
          try { recognition.start(); } catch { /* browser may block automatic restart */ }
        }, 900);
      }
    };

    recognition.onerror = (event) => {
      setListening(false);
      if (["not-allowed", "service-not-allowed", "audio-capture"].includes(event.error)) {
        stoppedRef.current = true;
      }
      const messages = {
        "not-allowed":
          "Microphone permission is blocked. Allow it in your browser's site settings.",
        "service-not-allowed":
          "Voice recognition is blocked by this browser. Try Chrome or Edge.",
        "audio-capture":
          "No microphone was found. Check your microphone settings.",
        "no-speech":
          "No speech was detected. Tap the button and try again.",
        network:
          "Voice recognition could not reach the browser service. Check your connection.",
      };

      setError(
        messages[event.error] ||
          "Voice recognition could not start. Try Chrome or Edge."
      );
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript
        .toLowerCase()
        .trim();

      setTranscript(command);

      const handlers = handlersRef.current;
      const helper = (handlers.helperName || "nova").toLowerCase().trim();
      // Never respond to another person's helper name or unnamed speech.
      const wakePattern = new RegExp(`(?:^|\\b)hey\\s+${helper.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      const match = command.match(wakePattern);
      if (!match) return;
      const instruction = command.slice(match.index + match[0].length).trim();
      if (!instruction) return;

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
    if (autoStartRef.current) {
      // Permission may require an earlier user gesture; retry via mic button.
      restartRef.current = window.setTimeout(() => {
        if (!stoppedRef.current) {
          try { recognition.start(); } catch { /* browser gesture required */ }
        }
      }, 350);
    }

    return () => {
      stoppedRef.current = true;
      window.clearTimeout(restartRef.current);
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  async function startListening() {
    if (!supported || !recognitionRef.current) {
      setError(
        "Voice recognition is unavailable in this browser. Try Chrome or Edge."
      );
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      return;
    }

    try {
      setTranscript("");
      setError("");

      // Explicitly request microphone access so permission failures are
      // visible instead of making the button appear unresponsive.
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
      }

      stoppedRef.current = false;
      recognitionRef.current.start();
    } catch (startError) {
      setListening(false);

      if (
        startError?.name === "NotAllowedError" ||
        startError?.name === "SecurityError"
      ) {
        setError(
          "Microphone permission is blocked. Allow it in your browser's site settings."
        );
        return;
      }

      if (startError?.name !== "InvalidStateError") {
        setError(
          "Voice recognition could not start. Try Chrome or Edge."
        );
      }
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
