import { useEffect, useRef, useState } from "react";

export default function useVoiceCommands({
  helperName,
  onNext,
  onPrevious,
  onRepeat,
  onHelp,
}) {
  const recognitionRef = useRef(null);

  const [listening, setListening] =
    useState(false);

  const [transcript, setTranscript] =
    useState("");

  const [supported, setSupported] =
    useState(true);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-AU";

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onresult = (event) => {
      const result =
        event.results[0][0].transcript
          .toLowerCase()
          .trim();

      setTranscript(result);

      handleCommand(result);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  function handleCommand(command) {
    const cleanCommand =
      command.toLowerCase();

    const helper =
      helperName?.toLowerCase();

    let instruction = cleanCommand;

    if (
      helper &&
      cleanCommand.includes(helper)
    ) {
      instruction = cleanCommand
        .replace(`hey ${helper}`, "")
        .replace(helper, "")
        .trim();
    }

    if (
      instruction.includes("next") ||
      instruction.includes("continue")
    ) {
      onNext?.();
      return;
    }

    if (
      instruction.includes("previous") ||
      instruction.includes("go back") ||
      instruction.includes("back")
    ) {
      onPrevious?.();
      return;
    }

    if (
      instruction.includes("repeat") ||
      instruction.includes("again")
    ) {
      onRepeat?.();
      return;
    }

    if (
      instruction.includes("help") ||
      instruction.includes("need help")
    ) {
      onHelp?.();
    }
  }

  function startListening() {
    if (
      !supported ||
      !recognitionRef.current
    ) {
      return;
    }

    try {
      recognitionRef.current.start();
    } catch {
      // Recognition is already active.
    }
  }

  return {
    supported,
    listening,
    transcript,
    startListening,
  };
}