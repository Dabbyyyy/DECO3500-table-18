
import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

export async function stopSpeaking() {
  if (Capacitor.isNativePlatform()) {
    await TextToSpeech.stop();
  } else if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export async function speak(message) {
  if (!message) return;

  try {
    await stopSpeaking();

    if (Capacitor.isNativePlatform()) {
      await TextToSpeech.speak({
        text: String(message),
        lang: "en-AU",
        rate: 0.95,
        pitch: 1,
        volume: 1,
      });
      return;
    }

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        String(message)
      );
      utterance.lang = "en-AU";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error("Text-to-speech failed:", error);
  }
}
