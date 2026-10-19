
import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition as NativeSpeech } from "@capacitor-community/speech-recognition";

const isNative = Capacitor.isNativePlatform();

function getTimerSeconds(command) {
  const match = command.match(
    /(\d+(?:\.\d+)?)\s*(second|minute|hour)s?/
  );

  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2];

  const multiplier =
    unit === "hour" ? 3600 :
    unit === "minute" ? 60 : 1;

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
  onProgress,
  onQuestion,
}) {
  const recognitionRef = useRef(null);
  const handlersRef = useRef({});
  const listeningRef = useRef(false);
  const mountedRef = useRef(false);
  const listenerHandlesRef = useRef([]);

  const lastCommandRef = useRef({
    command: "",
    time: 0,
  });

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const [supported, setSupported] = useState(
    () =>
      isNative ||
      Boolean(
        window.SpeechRecognition ||
        window.webkitSpeechRecognition
      )
  );

  useEffect(() => {
    handlersRef.current = {
      helperName,
      onNext,
      onPrevious,
      onRepeat,
      onHelp,
      onTimer,
      onProgress,
      onQuestion,
    };
  });

  const updateListening = useCallback((value) => {
    listeningRef.current = value;

    if (mountedRef.current) {
      setListening(value);
    }
  }, []);

  const handleCommand = useCallback((rawText) => {
    const command = String(rawText || "")
      .toLowerCase()
      .trim();

    if (!command) return;

    if (mountedRef.current) {
      setTranscript(command);
    }

    const handlers = handlersRef.current;
    const helper = String(
      handlers.helperName || "nova"
    ).toLowerCase().trim();

    const escapedHelper = helper.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const wakePattern = new RegExp(
      `(?:^|\\b)hey\\s+${escapedHelper}\\b`,
      "i"
    );

    const match = command.match(wakePattern);
    if (!match) return;

    const instruction = command
      .slice(match.index + match[0].length)
      .trim();

    if (!instruction) return;

    let actionName = "";
    let action = null;

    // Group progress
    if (
      instruction.includes("group progress") ||
      instruction.includes("show progress") ||
      instruction.includes("everyone's progress") ||
      instruction.includes("everyone progress")
    ) {
      actionName = "progress";
      action = () => handlers.onProgress?.();
    }

    // Next step
    else if (
      instruction.includes("next") ||
      instruction.includes("continue")
    ) {
      actionName = "next";
      action = () => handlers.onNext?.();
    }

    // Previous step
    else if (
      instruction.includes("previous") ||
      instruction.includes("go back") ||
      instruction === "back"
    ) {
      actionName = "previous";
      action = () => handlers.onPrevious?.();
    }

    // Repeat instruction
    else if (
      instruction.includes("repeat") ||
      instruction.includes("again")
    ) {
      actionName = "repeat";
      action = () => handlers.onRepeat?.();
    }

    // Timer
    else if (instruction.includes("timer")) {
      const seconds = getTimerSeconds(instruction);

      if (seconds) {
        actionName = `timer:${seconds}`;
        action = () => handlers.onTimer?.(seconds);
      }
    }

    // Help request
    else if (
      instruction.includes("need help") ||
      instruction === "help" ||
      instruction.includes("request help")
    ) {
      actionName = "help";
      action = () => handlers.onHelp?.();
    }

    if (!action) return;

    // Prevent duplicate partial recognition results.
    const now = Date.now();

    if (
      lastCommandRef.current.command === actionName &&
      now - lastCommandRef.current.time < 2500
    ) {
      return;
    }

    lastCommandRef.current = {
      command: actionName,
      time: now,
    };

    action();
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    let disposed = false;
    let browserRecognition = null;
    const handles = [];

    async function setupNative() {
      try {
        const { available } = await NativeSpeech.available();

        if (disposed) return;

        setSupported(Boolean(available));

        if (!available) {
          setError(
            "Speech recognition is unavailable on this device."
          );
          return;
        }

        const partialListener = await NativeSpeech.addListener(
          "partialResults",
          (data) => {
            if (disposed) return;

            const result = data.matches?.[0];
            if (result) handleCommand(result);
          }
        );

        if (disposed) {
          await partialListener.remove();
          return;
        }

        handles.push(partialListener);

        const stateListener = await NativeSpeech.addListener(
          "listeningState",
          ({ status }) => {
            if (disposed) return;
            updateListening(status === "started");
          }
        );

        if (disposed) {
          await stateListener.remove();
          return;
        }

        handles.push(stateListener);
        listenerHandlesRef.current = handles;
      } catch (setupError) {
        console.error("Native speech setup failed:", setupError);

        if (!disposed) {
          setError("Could not initialise speech recognition.");
        }
      }
    }

    function setupBrowser() {
      const BrowserRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!BrowserRecognition) {
        setSupported(false);
        return;
      }

      browserRecognition = new BrowserRecognition();

      browserRecognition.lang = "en-AU";
      browserRecognition.continuous = false;
      browserRecognition.interimResults = false;

      browserRecognition.onstart = () => {
        if (disposed) return;
        setError("");
        updateListening(true);
      };

      browserRecognition.onend = () => {
        if (disposed) return;
        updateListening(false);
      };

      browserRecognition.onerror = (event) => {
        if (disposed) return;

        updateListening(false);

        const messages = {
          "not-allowed": "Microphone permission was denied.",
          "service-not-allowed": "Speech recognition is blocked.",
          "audio-capture": "No microphone was found.",
          "no-speech": "No speech detected. Try again.",
          network: "Speech recognition network error.",
        };

        setError(
          messages[event.error] ||
          "Voice recognition could not start."
        );
      };

      browserRecognition.onresult = (event) => {
        if (disposed) return;

        const result =
          event.results[event.resultIndex]?.[0]?.transcript;

        if (result) handleCommand(result);
      };

      recognitionRef.current = browserRecognition;
    }

    if (isNative) {
      void setupNative();
    } else {
      setupBrowser();
    }

    return () => {
      disposed = true;
      mountedRef.current = false;
      listeningRef.current = false;

      if (browserRecognition) {
        browserRecognition.abort();
      }

      recognitionRef.current = null;

      if (isNative) {
        void NativeSpeech.stop().catch(() => {});

        for (const handle of handles) {
          void handle.remove().catch(console.error);
        }

        listenerHandlesRef.current = [];
      }
    };
  }, [handleCommand, updateListening]);

  const startListening = useCallback(async () => {
    if (!supported) {
      setError(
        "Speech recognition is not available on this device."
      );
      return;
    }

    if (listeningRef.current) {
      try {
        if (isNative) {
          await NativeSpeech.stop();
        } else {
          recognitionRef.current?.stop();
        }
      } catch (stopError) {
        console.error("Could not stop recognition:", stopError);
      }

      updateListening(false);
      return;
    }

    setError("");
    setTranscript("");

    try {
      if (isNative) {
        const permission =
          await NativeSpeech.requestPermissions();

        if (permission.speechRecognition !== "granted") {
          setError(
            "Microphone permission is required."
          );
          return;
        }

        const { available } = await NativeSpeech.available();

        if (!available) {
          setError(
            "Android speech recognition is unavailable."
          );
          return;
        }

        await NativeSpeech.start({
          language: "en-AU",
          maxResults: 1,
          partialResults: true,
          popup: false,
        });
      } else {
        if (!recognitionRef.current) {
          setError("Browser speech recognition is unavailable.");
          return;
        }

        recognitionRef.current.start();
      }
    } catch (startError) {
      console.error("Speech recognition failed:", startError);
      updateListening(false);

      setError(
        startError?.message ||
        "Could not start voice recognition."
      );
    }
  }, [supported, updateListening]);

  return {
    supported,
    listening,
    transcript,
    error,
    startListening,
  };
}
