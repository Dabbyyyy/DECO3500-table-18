# KTCHN by Table 18

## Team
Aaradheya Sharma \n
Ashley Kirsten Kosasih \n
Febriani Patricia \n
Ji Jien Yee \n
Waii Hiin Ng \n

---

**A collaborative cooking experience designed for students living in shared accommodation.**

KTCHN is a DECO3500 Social & Mobile Computing design project by Table 18 at The University of Queensland, developed during Semester 2, 2026.

The project explores how social and mobile computing can support students when preparing meals together. KTCHN focuses on making collaborative cooking more coordinated by helping people divide tasks, follow cooking progress as well as keeps them aware of what is and needs to happen next.Rather than replacing the social experience of cooking together, KTCHN aims to support the people involved and make the cooking process easier to coordinate.

---

## The Problem

Cooking together can be an enjoyable social activity, but coordinating the preparation of a meal is not always straightforward.

Students sharing a kitchen may encounter difficulties such as:

- **Uneven task distribution:** One person may end up taking responsibility for most of the preparation because they know the recipe best.
- **Poor coordination:** People may not know what they should be doing, leading to confusion or unnecessary waiting.
- **Timing difficulties:** Different ingredients and dishes require different preparation and cooking times.
- **Limited kitchen space and equipment:** Multiple people working in a small kitchen can get in each other's way.
- **Difficult access to instructions:** Following recipes on a phone can be inconvenient when hands are wet, oily, or covered in ingredients.

Our research explores how technology can help address these challenges without taking away from the experience of cooking together.

## Our Concept

KTCHN explores a shared cooking experience in which participants can coordinate their contributions while preparing a meal together.

The concept focuses on supporting the cooking process itself, particularly task division, progress awareness, and timing.

The intended experience explores how participants can:

- Join a shared cooking session.
- Receive tasks that contribute to the overall meal.
- Understand what they need to do during preparation.
- Keep track of cooking progress.
- Coordinate their contributions with other participants.
- Receive relevant prompts or instructions throughout the cooking process.

These describe the intended experience. The extent to which each feature is implemented in the prototype may vary.

## Prototype

**Download the live prototype (Android APK):** [https://github.com/Dabbyyyy/DECO3500-table-18/blob/main/KTCHN.apk]

The prototype demonstrates our exploration of collaborative cooking through KTCHN.

### Install on Android

1. Download `KTCHN.apk` to your Android phone.
2. Open the downloaded APK from your Files app or browser.
3. If Android blocks the installation, allow installation from that source in your device settings.
4. Return to the APK and select **Install**.
5. Once installed, open ktchn.
6. Grant microphone permission if you want to test the voice assistant.

Only install APK files from sources you trust. You can disable the installation permission afterwards.

### Important Notes

- The APK is intended for Android devices.
- The app is a university prototype, not a production-ready application.
- Some features require an internet connection.
- Voice recognition requires microphone permission and device support.
- Some functionality may behave differently across Android devices.
- The APK is intended for development and testing.
- Backend-dependent features require access to the appropriate server.

---

## 5. How to Use ktchn

### Step 1 — Create or Join a Room

Create a new cooking room or join an existing room using a room code.

### Step 2 — Enter Your Details

Enter your name and select a voice helper.

### Step 3 — Set Cooking Preferences

Select your cuisine preferences, dietary requirements, and other available cooking options.

### Step 4 — Select a Meal

Review the recommended recipes and choose a meal together.

### Step 5 — Assign Cooking Tasks

Organise the cooking responsibilities between group members.

### Step 6 — Start Cooking

Follow your assigned instructions in Cooking Mode.

Use the on-screen controls or supported voice commands to navigate through the cooking steps.

### Step 7 — Check Group Progress

View everyone's progress and offer help when another member needs assistance.

### Step 8 — Complete and Share

Once the cooking session is finished, complete your tasks and explore the shared meal feed.

---

## 6. Technology Stack

| Technology | Purpose |
|---|---|
| React | Building the user interface |
| JavaScript | Application logic and interactions |
| Vite | Frontend development and build tooling |
| CSS | Styling and responsive layouts |
| Node.js | Running the backend server |
| Express.js | Creating backend API endpoints |
| JSON Recipe Database | Storing recipe information, ingredients, and cooking tasks |
| Rule-Based Recommendation Algorithm | Filtering, scoring, and ranking recipes based on group preferences |
| Firebase Realtime Database | Real-time cooking session synchronisation |
| Capacitor | Android application integration |
| Android SDK | Android application development |
| Gradle | Building the Android APK |
| Speech Recognition | Recognising spoken commands |
| Text-to-Speech | Reading cooking instructions aloud |

---

## 7. Run the Project Locally

### Requirements

Before running the project, make sure you have:

- Node.js
- npm
- Git
- The required Firebase configuration
- Access to any additional services used by the application

### Clone the Repository

```bash
git clone https://github.com/Dabbyyyy/DECO3500-table-18.git
```

Navigate to the project folder:

```bash
cd DECO3500-table-18/t18-project-code
```

### Install Dependencies

Install the frontend dependencies:

```bash
npm install
```

The backend is located in the `server` directory and requires its own dependencies.

```bash
cd server
npm install
```

### Configure Environment Variables

Configure the environment variables required by Firebase and the backend services.

The backend includes a `.env.example` file that can be used as a reference.

For example, the backend can be configured to run on port `3001`:

```env
PORT=3001
```

Do not commit private credentials or API secrets to GitHub.

### Start the Backend Server

From the `server` directory, start the backend using the start command configured in its `package.json`.

For a backend configured to run `index.js` directly, the command is:

```bash
node index.js
```

The backend uses port `3001` by default unless another port is configured.

Available recipe API endpoints include:

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Check backend status and recipe database availability |
| `GET /api/recipes` | Retrieve recipes from the local database |
| `GET /api/cuisines` | Retrieve available cuisine categories |
| `POST /api/recipes/recommend` | Retrieve rule-based recipe recommendations |
| `GET /api/recipes/:id` | Retrieve a specific recipe |

### Start the Frontend

Open another terminal and navigate to the application folder:

```bash
cd DECO3500-table-18/t18-project-code
```

Run:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

Make sure the frontend is configured to connect to the appropriate backend address.

---

## 8. Build the Android APK

The Android application is built using Capacitor and Gradle.

### Step 1 — Build React

From the `t18-project-code` directory, run:

```bash
npm run build
```

### Step 2 — Sync Capacitor

```bash
npx cap sync android
```

### Step 3 — Build Android

```bash
cd android
./gradlew assembleDebug
```

A configured Android SDK and compatible Java environment are required.

### Step 4 — Locate the APK

After a successful build, the APK can be found at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

This is a debug APK intended for testing.

For wider distribution, a properly signed release build would be recommended.

---

## 9. Known Limitations

As ktchn is still a university prototype, some features require further improvements.

| Feature | Current Limitation |
|---|---|
| Voice-controlled timer | Start, pause, resume, and reset commands do not work reliably |
| Voice navigation | Some navigation commands may not respond consistently |
| Speech recognition | Users may need to activate the microphone again after speaking |
| Timer persistence | The countdown may reset when leaving Cooking Mode |
| Recipe recommendations | Suggested recipes may not always match all group preferences |
| Recipe database | Recommendations are limited to recipes stored in the local dataset |
| Dietary filtering | Ingredient and allergen checking requires further improvement |
| Android compatibility | More testing is needed across different devices |
| Internet connectivity | Firebase synchronisation and online backend features require internet access |

These limitations do not prevent users from exploring the main collaborative cooking workflow, but they may affect certain interactions.

---

## 10. Future Development

### Improve Voice Recognition

We would like to improve voice recognition so users can interact with the app more reliably while cooking.

Future improvements include:

- Better recognition of different accents.
- More reliable helper name detection.
- Improved voice navigation.
- Clearer listening feedback.
- Better handling of background noise.

### Voice-Controlled Timer

Although the manual cooking timer is available, voice-controlled timer commands are not fully functional.

In future development, we would like users to:

- Start a timer using voice commands.
- Pause and resume a countdown.
- Reset or cancel a timer.
- Ask how much time is remaining.
- Receive spoken notifications when the timer finishes.

### Persistent Cooking Timer

We would also like to make the countdown continue running when users navigate between different screens.

Future versions could support multiple timers and Android notifications.

### Improve Recipe Recommendations

Our current system uses a locally stored recipe database and a rule-based recommendation algorithm.

Although this allows us to control the recipe information and matching process, the recommendations are limited to the recipes available in our dataset.

Possible improvements include:

- Expanding the recipe database.
- Better matching of cuisine preferences.
- Stronger dietary requirement filtering.
- Clearer reasons for recommendations.
- More recipe choices.
- Better handling of conflicting group preferences.
- Improved ingredient and allergen information.

### Improve Collaborative Cooking

We could further improve group coordination by adding:

- More flexible task reassignment.
- Notifications when someone requests help.
- Better support for tasks that depend on each other.
- Clearer individual and group progress information.

### Accessibility and User Experience

Future improvements could include:

- Larger interactive controls.
- Better colour contrast.
- More accessible voice interactions.
- Clearer navigation.
- Further usability testing across different devices and users.

### Further Android Development

We would like to conduct more testing across different Android devices to identify compatibility issues.

Future development could also include performance improvements, better error handling, production signing, and official app distribution.

---

## 11. Ethical Considerations

Throughout development, we considered several ethical issues related to collaborative cooking, including:

- User privacy and data protection.
- Microphone access and voice recognition consent.
- Accessibility and inclusive design.
- Fairness in task assignment.
- Physical safety in the kitchen.
- Dietary requirements and food safety.
- Recipe recommendation accuracy.
- Group awareness and social interaction.
- Privacy and consent in the shared meal feed.

For more information, see our [Ethical Considerations Wiki](https://github.com/Dabbyyyy/DECO3500-table-18/wiki/Ethical-Considerations).

---

## 12. Project Status

**Status: University Prototype — Development and Testing**

ktchn demonstrates how interactive technology can support collaborative cooking through shared responsibilities, real-time progress tracking, cooking instructions, and voice interactions.

The project also includes a custom recipe database and rule-based recommendation system to help groups choose meals based on their preferences.

Although the main cooking workflow has been developed, some features remain experimental and require further testing.

These limitations have been documented to guide future development.

---

## 13. Project Team

Developed by **Table 18** as part of DECO3500.

**GitHub Repository:** https://github.com/Dabbyyyy/DECO3500-table-18

**Android APK:** https://github.com/Dabbyyyy/DECO3500-table-18/blob/main/KTCHN.apk

**Ethical Considerations:** https://github.com/Dabbyyyy/DECO3500-table-18/wiki/Ethical-Considerations

**Research:** https://github.com/Dabbyyyy/DECO3500-table-18/tree/main/docs/research

**Design and Prototyping**: https://github.com/Dabbyyyy/DECO3500-table-18/tree/main/docs/design
                            https://www.figma.com/design/3OTwrEJZ7nNwccutJz0rSv/Table-18

**Evaluation**: https://github.com/Dabbyyyy/DECO3500-table-18/blob/main/docs/research/user%20research/evaluation.md

Additional documentation and supporting artefacts are available throughout the repository Wiki and project files.

---

## Design Approach

KTCHN follows a user-centred design process informed by research into students' experiences of collaborative meal preparation.

Our process involves:

1. **Research:** Investigating the experiences, challenges, and needs of students who cook together.
2. **Analysis:** Identifying recurring themes and opportunities from the research.
3. **Requirements:** Translating research findings into requirements for the intended cooking experience.
4. **Design:** Exploring concepts, workflows, and interface designs.
5. **Prototyping:** Developing a proof-of-concept experience that demonstrates the central design idea.
6. **Evaluation:** Gathering feedback to understand how well the design supports its intended experience.
7. **Iteration:** Reflecting on findings and refining the design where appropriate.

The repository documents the evidence, decisions, and changes behind the project rather than presenting only the final prototype.

## Limitations

KTCHN is an academic design project developed as part of DECO3500 Social & Mobile Computing.

The prototype is intended to explore a specific collaborative cooking experience, not to provide a complete commercial cooking platform.

Its implemented features, simulated interactions, and known limitations are documented alongside the prototype and design process.

---

## Project Information

| Detail | Information |
| --- | --- |
| Project | KTCHN |
| Team | Table 18 |
| Course | DECO3500 Social & Mobile Computing |
| Institution | The University of Queensland |
| Semester | Semester 2, 2026 |

## Acknowledgements

This project was developed as part of the DECO3500 Social & Mobile Computing course at The University of Queensland.

Research sources, external resources, and other relevant acknowledgements are documented in the project's supporting materials.
