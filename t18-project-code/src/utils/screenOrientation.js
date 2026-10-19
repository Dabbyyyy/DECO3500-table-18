
import { Capacitor } from "@capacitor/core";
import { ScreenOrientation } from "@capacitor/screen-orientation";

export async function setLandscape() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await ScreenOrientation.lock({
      orientation: "landscape",
    });
  } catch (error) {
    console.error("Failed to set landscape:", error);
  }
}

export async function setPortrait() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await ScreenOrientation.lock({
      orientation: "portrait",
    });
  } catch (error) {
    console.error("Failed to set portrait:", error);
  }
}
