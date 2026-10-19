# ktchn 
### Cook Together, Step by Step

**ktchn** is a collaborative cooking application designed to help university students cook together in a more organised, interactive, and enjoyable way.

Cooking with others can sometimes be confusing, especially when group members are unsure about their responsibilities, what to do next, or how everyone else is progressing.

ktchn addresses these challenges by providing shared meal selection, task assignment, step-by-step cooking instructions, real-time group progress tracking, and a voice cooking assistant.

The application was developed as part of the **DECO3500 Table 18 university project**.

---

## 1. Project Overview

### Problem Space

Cooking together requires communication, coordination, and awareness of what others are doing. However, students sharing a kitchen may experience difficulties such as:

- Unclear division of cooking responsibilities.
- Confusion about the order of cooking tasks.
- Difficulty keeping track of other group members' progress.
- Limited kitchen space and equipment.
- Frequent interruptions when checking instructions on a device.

### Our Solution

ktchn provides a shared cooking experience where group members can plan, organise, and complete their cooking tasks together.

Rather than displaying a single recipe for everyone to follow, the application assigns responsibilities to individual cooks while maintaining awareness of the group's overall progress.

### Target Users

University students and young adults who cook together, particularly those who have difficulty coordinating cooking responsibilities in shared kitchens.

---

## 2. Key Features

### Create and Join Cooking Rooms

Users can create a cooking session or join an existing room using a unique room code.

- Create a shared cooking room.
- Join using a room code.
- Enter a name and select a cooking helper.
- View other members in the lobby.
- Synchronise group information across connected devices.

Firebase Realtime Database supports shared room information and real-time updates.

### Cooking Preferences and Meal Selection

Before cooking, group members can select their preferences to help identify suitable recipes.

- Select cuisine preferences.
- Specify dietary requirements.
- Consider cooking difficulty and available time.
- Explore recommended meals.
- Participate in shared meal selection.

This helps the group make cooking decisions together rather than relying on one person.

### Task Assignment

Once a meal is selected, cooking responsibilities can be divided among group members.

- View assigned cooking tasks.
- Identify who is responsible for each task.
- Follow individual cooking instructions.
- Track task completion.
- Request assistance when needed.

The goal is to reduce confusion and support more balanced participation during group cooking.

### Step-by-Step Cooking Mode

Cooking Mode provides a simplified interface to help users focus on their current responsibilities.

Features include:

- Individual cooking instructions.
- Next and previous step navigation.
- Repeat instruction functionality.
- Task progress indicators.
- Task completion controls.
- Help requests.
- Cooking timer controls.
- Access to group progress.

The interface is designed to reduce unnecessary interaction while cooking.

### Voice Cooking Assistant

ktchn includes a voice assistant intended to support hands-free interactions during cooking.

Users can select a helper name and interact with the assistant through speech recognition.

Example commands include:

- "Hey Sam, next step"
- "Hey Sam, previous step"
- "Hey Sam, repeat"
- "Hey Sam, show group progress"

The assistant also uses text-to-speech to read cooking instructions aloud.

**Current limitation:** Voice recognition and navigation are still being refined. Some commands, including navigation to Group Progress, may not respond consistently.

Voice-controlled timer commands, such as starting, pausing, resuming, and resetting a countdown, are not yet reliably functional and are included in future development.

### Cooking Timer

Cooking Mode includes a countdown timer to help users manage cooking durations.

Users can manually:

- Set a timer duration.
- Start a countdown.
- Pause the timer.
- Resume the countdown.
- Reset the timer to its original duration.
- View the remaining time.

The countdown is currently managed within Cooking Mode and may reset when the user navigates away from that screen.

### Real-Time Group Progress

The Group Progress screen provides an overview of the shared cooking session.

Users can:

- View the group's overall completion percentage.
- Check each member's current task.
- See individual task progress.
- Identify members who need assistance.
- Offer help to another cook.
- Return to their own cooking instructions.

This feature supports awareness and coordination between group members.

### Shared Meal Feed

ktchn includes a shared meal feed where users can share and reflect on their completed cooking experiences.

Features include:

- Displaying completed meals using recipe images.
- Adding ratings and captions.
- Adding descriptive tags.
- Tagging group members.
- Liking and commenting on meal posts.

The prototype uses existing recipe images rather than uploading photographs from the user's device.

---

## 3. Download and Install the Android App

ktchn is available as an Android APK for prototype testing.

### Download

1. Visit the [ktchn GitHub Releases page](https://github.com/Dabbyyyy/DECO3500-table-18/releases).
2. Open the latest available release.
3. Scroll to the **Assets** section.
4. Download the APK file, such as `ktchn.apk`.
5. Wait for the download to finish.

**Note:** The APK download will only become available after it has been uploaded to a published GitHub Release.

### Install on Android

1. Open the downloaded APK using your phone's Files app or browser.
2. If Android blocks the installation, open the relevant settings and allow installation from that source.
3. Return to the APK and select **Install**.
4. Once installation is complete, select **Open**.
5. Grant microphone permission if you want to test voice recognition.

Only install APK files from sources you trust. The installation permission can be disabled again afterwards.

### Important Notes

- The APK is intended for Android devices.
- The application is a university prototype, not a production-ready application.
- Some functionality requires an internet connection.
- Some features may behave differently across Android devices.
- Voice recognition depends on device support and microphone permissions.
- The provided APK is a debug build intended for testing.

---

## 4. How to Use ktchn

**Step 1 — Create or Join a Room**

Open the application and create a cooking room, or join an existing room using a code provided by another group member.

**Step 2 — Enter Your Details**

Enter your name and choose a cooking helper.

**Step 3 — Set Cooking Preferences**

Choose your preferred cuisine, dietary requirements, and other available cooking preferences.

**Step 4 — Select a Meal**

Explore recommended recipes and decide what to cook with your group.

**Step 5 — Organise Cooking Tasks**

Review the cooking tasks and assign responsibilities among group members.

**Step 6 — Start Cooking**

Follow your individual step-by-step instructions in Cooking Mode. Use the on-screen controls to navigate instructions, manage timers, and request help.

**Step 7 — Check Group Progress**

Open Group Progress to see how other members are doing and offer assistance when needed.

**Step 8 — Complete and Share**

Once cooking is finished, complete the session and explore the shared meal feed.

---

## 5. Technology Stack

| Technology | Purpose |
|---|---|
| React | Building the user interface |
| JavaScript | Application functionality and interactions |
| Vite | Frontend development and build tooling |
| CSS | Styling, responsive layouts, and visual design |
| Firebase Realtime Database | Real-time room synchronisation and shared cooking data |
| Capacitor | Converting the React application into an Android application |
| Android SDK | Android application development and building |
| Gradle | Generating the Android APK |
| Native Speech Recognition | Recognising spoken commands |
| Native Text-to-Speech | Reading cooking instructions aloud |

---

## 6. Run the Project Locally

### Requirements

Before running the project, make sure you have:

- Node.js
- npm
- Git
- A compatible development environment
- The required Firebase configuration

### Clone the Repository

```bash
git clone https://github.com/Dabbyyyy/DECO3500-table-18.git
```

Navigate to the application folder:

```bash
cd DECO3500-table-18/t18-project-code
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Configure the environment variables required by the project's Firebase and API integrations.

Keep sensitive credentials in local environment files and do not commit secrets to GitHub.

### Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal.

---

## 7. Build the Android APK

The Android application is built using Capacitor and Gradle.

### Step 1 — Build the React Application

```bash
npm run build
```

### Step 2 — Synchronise Capacitor

```bash
npx cap sync android
```

### Step 3 — Build the APK

Navigate to the Android directory:

```bash
cd android
```

Run:

```bash
./gradlew assembleDebug
```

The build requires a configured Android SDK and compatible Java environment.

### Step 4 — Locate the APK

After a successful build, the APK can be found at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

This APK can be installed on an Android device for testing.

For public distribution, a properly signed release build is recommended.

---

## 8. Known Limitations

ktchn is currently a functional university prototype with several features that require further development and testing.

| Feature | Current limitation |
|---|---|
| Voice-controlled timer | Commands to start, pause, resume, and reset the timer do not work reliably |
| Voice navigation | Opening Group Progress through voice commands may not work consistently |
| Speech recognition | Recognition may stop after an utterance and require users to activate the microphone again |
| Timer persistence | The countdown may reset when navigating away from Cooking Mode |
| Android compatibility | Testing has been limited to a small number of devices |
| Internet connectivity | Real-time synchronisation and online services require network access |

These limitations do not prevent users from exploring the application's main collaborative cooking workflow, but they may affect certain interactions.

---

## 9. Future Development

Several improvements could be implemented to enhance ktchn's functionality, usability, and reliability.

### Improve Voice-Controlled Timer

Develop more reliable voice commands that allow users to:

- Start a countdown by specifying a duration.
- Pause and resume an existing timer.
- Reset or cancel a countdown.
- Ask the assistant how much time is remaining.
- Receive spoken notifications when a timer finishes.

This would improve hands-free interaction, particularly when users are handling ingredients or cooking equipment.

### Improve Voice Recognition and Navigation

Improve the assistant's ability to recognise commands in different environments, including noisy kitchens.

Future improvements could include:

- More accurate recognition of helper names.
- Reliable navigation between Cooking Mode and Group Progress.
- Better handling of different pronunciations and accents.
- Improved microphone activation and listening behaviour.
- Clearer feedback when a command is not recognised.

### Persistent Cooking Timer

Move timer management outside the individual Cooking Mode screen so countdowns can continue when users navigate to other sections.

Future versions could also support multiple simultaneous timers and Android notifications.

### Improve Collaborative Awareness

Expand the group progress system to provide clearer information about what each cook is doing.

Potential improvements include:

- More detailed live activity indicators.
- Notifications when someone requests assistance.
- Improved coordination when tasks depend on one another.
- More flexible reassignment of cooking responsibilities.

### Improve User Experience and Accessibility

Conduct additional usability testing to improve the overall cooking experience.

Potential improvements include:

- Larger interactive controls for cooking environments.
- Better colour contrast and readability.
- More accessible voice and touch interactions.
- Reduced screen interaction during active cooking.
- Improved responsiveness across different device sizes.

### Further Android Testing and Deployment

Test ktchn across more Android devices and versions to identify compatibility issues.

Future work could include performance optimisation, improved error handling, production signing, and distribution through an official application store.

---

## 10. Project Status

**Status: University Prototype — Development and Testing**

ktchn demonstrates a collaborative cooking experience using shared task coordination, real-time updates, cooking instructions, and an experimental voice assistant.

The main focus of the project is exploring how interactive technology can support communication, coordination, and awareness during collaborative cooking.

Some features remain experimental and have been documented as known limitations and future development opportunities.

---

## 11. Project Team

Developed by **Table 18** as part of DECO3500.

**GitHub Repository:** https://github.com/Dabbyyyy/DECO3500-table-18

**Android Downloads:** https://github.com/Dabbyyyy/DECO3500-table-18/releases