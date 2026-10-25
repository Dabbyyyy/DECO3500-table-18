# KTCHN
### Cook Together, Step by Step

ktchn is a collaborative cooking application designed to help university students cook together in a more organised and enjoyable way.

When cooking with others, it can sometimes be confusing to decide who should do what, how to divide responsibilities, and how to keep track of everyone's progress.

Our app aims to address these problems through shared meal selection, recipe recommendations, task assignments, individual cooking instructions, real-time group progress, and a voice cooking assistant.

This project was developed by **Table 18 for DECO3500**.

---

## 1. Project Overview

### Problem Space

Cooking together requires communication and coordination between group members. However, students sharing a kitchen may experience several difficulties:

- Unclear cooking responsibilities.
- Confusion about which tasks should be completed first.
- Difficulty keeping track of other members' progress.
- Limited kitchen equipment and space.
- Frequent interruptions when checking recipe instructions.

### Our Solution

ktchn provides a shared cooking experience where users can organise their responsibilities and follow individual cooking instructions while staying connected with their group.

Rather than having everyone follow the same recipe instructions, ktchn divides cooking responsibilities into smaller tasks and allows members to track the group's progress.

### Target Users

University students and young adults who cook together, especially those who find it difficult to coordinate responsibilities in a shared kitchen.

---

## 2. Key Features

### Create and Join Cooking Rooms

Users can create a cooking session or join an existing room using a unique room code.

Features include:

- Creating a cooking room.
- Joining a room using a code.
- Entering a name and selecting a cooking helper.
- Viewing group members in the lobby.
- Synchronising room information across connected devices.

We use Firebase Realtime Database to keep the cooking session updated between group members.

### Cooking Preferences

Before selecting a meal, users can enter their cooking preferences.

These include:

- Preferred cuisine.
- Dietary requirements.
- Favourite ingredients.
- Cooking difficulty.
- Available cooking time.
- Budget.

The app considers the group's preferences when recommending meals.

### Recipe Recommendations

ktchn includes a recipe recommendation feature to help groups decide what to cook together.

During development, we initially explored using TheMealDB API. However, we later created our own recipe database to have more control over the recipe information, cooking tasks, and recommendations.

Our current system uses a locally stored recipe dataset and a rule-based recommendation algorithm.

The system compares available recipes with the group's preferences and recommends meals that may be suitable for everyone.

### Task Assignment

After selecting a meal, users can organise cooking responsibilities.

Features include:

- Viewing available cooking tasks.
- Assigning tasks to group members.
- Viewing individual responsibilities.
- Following task-specific cooking instructions.
- Tracking task completion.
- Requesting help from other members.

This helps reduce confusion and encourages group members to participate in the cooking process.

### Cooking Mode

Cooking Mode provides individual step-by-step instructions based on each member's assigned tasks.

Users can:

- View their current cooking instruction.
- Move to the next or previous step.
- Repeat instructions.
- Track their task progress.
- Mark tasks as completed.
- Request assistance.
- Use a cooking timer.
- Open Group Progress.

The interface is designed to keep instructions simple and reduce unnecessary interactions while cooking.

### Voice Cooking Assistant

ktchn includes a voice cooking assistant to support hands-free interaction.

Users can select a helper name and use voice commands to interact with cooking instructions.

Example commands include:

- "Hey Sam, next step"
- "Hey Sam, previous step"
- "Hey Sam, repeat"
- "Hey Sam, show group progress"

The assistant also uses text-to-speech to read cooking instructions aloud.

This feature is intended to reduce the need to touch the screen while preparing ingredients or handling cooking equipment.

**Current limitation:** Voice recognition is still experimental. Some commands, particularly navigation and timer controls, may not work consistently.

### Cooking Timer

The app includes a countdown timer that users can control manually.

Users can:

- Set a timer duration.
- Start a countdown.
- Pause the timer.
- Resume the timer.
- Reset the countdown.
- View the remaining time.

Voice-controlled timer commands are not fully functional and are included in future development.

### Real-Time Group Progress

The Group Progress screen allows users to see how everyone is doing during cooking.

Features include:

- Viewing overall group progress.
- Checking each member's current task.
- Tracking individual task completion.
- Identifying members who need help.
- Offering assistance to other members.

This helps group members stay aware of each other's progress without constantly asking what everyone is doing.

### Shared Meal Feed

After completing a cooking session, users can interact through the shared meal feed.

Features include:

- Sharing completed meals using recipe images.
- Adding captions and ratings.
- Adding tags.
- Tagging group members.
- Liking and commenting on posts.

The current prototype uses existing recipe images rather than allowing users to upload their own photos.

---

## 3. How Recipe Recommendations Work

ktchn uses our own recipe database and a rule-based recommendation algorithm to suggest meals based on the group's cooking preferences.

During development, we initially explored using TheMealDB API. However, we later decided to create our own recipe dataset to have more control over the recipe information, cooking instructions, and task assignments.

### Recipe Database

Our recipe database is stored locally in:

`server/data/recipes.json`

The database contains meals from different cuisines, including Japanese, Indonesian, Italian, Thai, and other categories.

Each recipe contains information such as:

- Recipe name and description.
- Cuisine and category.
- Ingredients and quantities.
- Cooking time and difficulty.
- Estimated cost per person.
- Dietary tags and allergens.
- Required kitchen equipment.
- Cooking tasks and step-by-step instructions.
- Recipe image information.

Having our own recipe dataset allows us to organise cooking information in a consistent format and provide tasks that can be assigned to different group members.

### Step 1 — Collect Group Preferences

Before selecting a meal, each member enters their cooking preferences.

The recommendation system can consider:

- Cuisine preferences.
- Dietary requirements.
- Favourite ingredients.
- Budget.
- Cooking time.
- Cooking difficulty.

These preferences are used to identify recipes that may be suitable for the group.

### Step 2 — Request Recipe Recommendations

The frontend sends the group's preferences to our custom Express backend through the following endpoint:

`POST /api/recipes/recommend`

The backend is implemented in:

`server/index.js`

An example request structure is:

```json
{
  "members": [
    {
      "name": "Sam",
      "cuisine": "Italian",
      "dietary": [],
      "foodLikes": ["Pasta"],
      "budget": "Under $12",
      "cookingTime": "30 minutes",
      "difficulty": "Easy"
    },
    {
      "name": "Alex",
      "cuisine": "Asian",
      "dietary": ["Vegetarian"],
      "foodLikes": ["Rice"],
      "budget": "Under $12",
      "cookingTime": "30 minutes",
      "difficulty": "Easy"
    }
  ]
}
```

This is an example of the request structure rather than an actual cooking session.

### Step 3 — Retrieve and Filter Recipes

The backend reads the recipe information from the local JSON database.

The recommendation algorithm is implemented in:

`server/services/recommendationService.js`

Before ranking recipes, the system checks whether they meet the group's dietary requirements and available kitchen equipment.

Recipes that do not meet these requirements are excluded from the recommendations.

For example, if a member selects a vegetarian diet, recipes that are not tagged as vegetarian or vegan will be excluded.

The system also checks certain allergen restrictions using the dietary tags and allergen information stored in the recipe database.

However, these checks are part of a university prototype and should not be treated as verified allergy safety information.

### Step 4 — Score and Rank Recipes

After filtering, the remaining recipes are scored based on how well they match the group's preferences.

The algorithm uses a weighted scoring system.

| Preference | How It Affects the Score |
|---|---|
| Cuisine | Adds 8 points for a matching cuisine preference |
| Favourite ingredients | Adds 3 points for each matching ingredient preference |
| Budget | Adds 4 points if the recipe fits the member's budget, or subtracts 8 if it exceeds it |
| Cooking time | Adds 4 points if the recipe fits the member's available time, or subtracts 8 if it exceeds it |
| Difficulty | Adds 3 points if the recipe is within the preferred difficulty, or subtracts 5 if it is too difficult |

The system calculates these scores across group members.

Recipes with higher scores are ranked above recipes with lower scores.

This helps the app recommend meals that match more of the group's preferences rather than only considering one member's choices.

### Step 5 — Return Recommended Recipes

After scoring and ranking the recipes, the backend returns up to **12 recommendations**.

Each recommendation includes its recipe information, match score, and matching reasons.

For example, the system may explain that a recipe:

- Matches the group's cuisine preferences.
- Includes favourite ingredients.
- Fits everyone's selected budget.
- Fits everyone's cooking time.
- Matches the group's preferred difficulty level.

These explanations help users understand why certain meals are recommended.

### Step 6 — Group Meal Selection

The recommended meals are displayed in the app for users to review.

Group members can compare the recipes and choose which meal they want to cook together.

Once a recipe is selected, its cooking tasks and instructions are used to support task assignment and Cooking Mode.

### Current Limitations

Although our recommendation system considers multiple preferences, it may not always find a recipe that satisfies everyone.

For example, different group members may have conflicting cuisine preferences, budgets, or cooking requirements.

The recommendation system also depends on the recipes available in our local database rather than retrieving unlimited recipes from an external service.

Future improvements could include:

- Expanding the recipe database.
- Improving preference matching.
- Better handling of conflicting group preferences.
- Stronger ingredient and allergen verification.
- More flexible recipe filtering.
- Clearer explanations for recommended meals.

---

## 4. Download and Install the Android App

ktchn is available as an Android APK for prototype testing.

### Download the APK

**[Download KTCHN.apk](https://github.com/Dabbyyyy/DECO3500-table-18/raw/refs/heads/main/KTCHN.apk)**

Alternatively, you can download it manually:

1. Open the [GitHub repository](https://github.com/Dabbyyyy/DECO3500-table-18).
2. Find `KTCHN.apk` in the main repository folder.
3. Click the APK file.
4. Select **Download** or **View raw** to download it to your device.

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
