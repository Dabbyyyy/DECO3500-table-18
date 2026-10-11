Hey guys! I've pushed the latest ktchn code to `main`, so you can start working on your parts.

Here's a quick overview of the project and what you guys need to do.

### Project directory

Everything is inside `t18-project-code/`.

- `src/pages/` – All the app screens (JSX and CSS)
- `src/components/` – Reusable components like cooking steps and voice buttons
- `src/hooks/` – Custom hooks, including `useVoiceCommands.js`
- `src/services/` – Firebase room synchronisation and recipe API
- `src/utils/` – Helper functions
- `src/App.jsx` – Main navigation and screen flow
- `src/App.css` and `src/index.css` – Global styling
- `src/firebase.js` – Firebase configuration
- `server/` – Backend API and recipe dataset

### How to run

Open the project in Codespaces or VS Code.

**Terminal 1 – Frontend**

```bash
cd t18-project-code
npm install
npm run dev
```

**Terminal 2 – Backend**

```bash
cd t18-project-code/server
npm install
npm run dev
```

If you're already inside `t18-project-code`, you don't need to `cd` into it again.

The frontend and backend need to be running together for the recipe recommendations to work. Check `server/package.json` if the backend uses a different start script.

### 1. Ji Jien – Landscape Cooking Flow

**Deadline: Monday, 12 October, midnight (PR submitted)**

You'll be working on the cooking flow, from Cooking Mode until the group finishes cooking, based on the Figma designs I shared.

**Main requirements:**

- The cooking screens must be in **landscape orientation**.
- When users enter Cooking Mode in portrait, show a **"Rotate your phone to landscape"** screen with a rotation icon.
- Once they rotate their phone, the cooking interface should appear automatically.
- Make sure the layout works on different phone sizes, not just the Figma frame.
- Show each person's assigned cooking tasks and step-by-step instructions from the selected recipe.
- Users should be able to go to the next step, repeat instructions, go back, use a timer, and ask for help.
- Include Group Progress, Task Finished, Helping Others, and Cooking Finished screens.
- Keep the current cream, brown, and burnt-orange theme.

**Voice commands and AI cooking helper**

This is an important part because we want users to interact with the app without constantly touching their phones while cooking.

Users should be able to say things like:

- "Hey Nova, next step"
- "Hey Nova, repeat that"
- "Hey Nova, start a timer for 5 minutes"
- "Hey Nova, how do I cook this rice?"
- "Hey Nova, how do I know when the chicken is cooked?"

The helper should respond using voice, not just text.

For example, if someone asks how to cook rice, Nova should explain the process clearly based on the recipe and the equipment available.

**Suggested implementation (most efficient approach):**

We already have `src/hooks/useVoiceCommands.js`, so please check and reuse it first rather than starting from scratch.

I suggest using:

1. **Web Speech API (SpeechRecognition)** for recognising commands and **SpeechSynthesis** for reading instructions aloud. This is the simplest option for our React prototype, although browser support varies.
2. **Rule-based commands** for actions like Next, Previous, Repeat, Timer, and Need Help. These should work without calling AI.
3. **AI API through our Express backend** for open-ended cooking questions like "How do I prepare this ingredient?" or "What can I use instead of a wok?" Send the current recipe, step, and available equipment as context so the response is relevant.
4. **Text-to-speech** to read the AI response aloud.

You can look into Voxpow if needed, but I'd recommend trying the existing hook and browser APIs first to avoid unnecessary dependencies and setup.

For the wake phrase "Hey Nova", please note that browser speech recognition isn't guaranteed to listen continuously, especially on mobile. A microphone button with a clear listening indicator is a good fallback. If continuous wake-word detection is unreliable, prioritise a working tap-to-talk helper instead.

Please don't put AI API keys directly in React. Any AI requests should go through `server/`, using environment variables.

Also, make sure the AI helper gives short, practical cooking guidance and doesn't automatically advance or change tasks without the user's command. For food safety questions, use reliable guidance rather than guessing.

**Firebase integration:**

Please use the existing room data, selected recipe, members, and task assignments. The cooking steps and group progress should update across devices.

You can edit or add files inside `src/pages/`, `src/components/`, and `src/hooks/`. You can also add backend endpoints if needed.

Try not to change the existing Meal Selection, Cooking Setup, Task Assignment, or Firebase room functions unless necessary. Let me know if you need to edit shared files like `App.jsx` or `roomService.js`.

### 2. Wai Hiin – Meal Completion and Social Features

**Deadline: Tuesday, 13 October, midnight (PR submitted)**

Please wait until I review and merge Ji Jien's PR into `main`. I'll message you when it's ready so you can pull the latest changes and start.

Your task is to implement the remaining screens after cooking, based on the Figma designs:

- Meal Complete – show the finished recipe, group members, and options to save the meal, add a photo, cook again, or end the session.
- Photo Review – let users upload or take a photo, rate the meal, add tags and a caption.
- Shared Meal Feed – show the posted meal, photo, rating, caption, group members, and comments.

Please make sure the screens are connected to the actual selected recipe and group members rather than hardcoded examples.

You can add new JSX/CSS files and reusable components as needed. Keep the styling consistent with the rest of the app.

For the feed, Firebase can be used to save meal posts and comments. For photos, use suitable image storage rather than storing large image files directly in Realtime Database.

### GitHub workflow – IMPORTANT

**Please don't push directly to `main`.** I want to review the changes before merging them.

First, pull the latest `main` and create your own branch:

```bash
git switch main
git pull origin main
git switch -c feature/your-name
```

Once you're done:

```bash
git add .
git commit -m "Implement assigned features"
git push -u origin feature/your-name
```

Then go to GitHub → Pull Requests → New Pull Request, select your branch as the source and `main` as the target, and create the PR.

Please send me the PR link when you're done. Don't merge it yourself.

Make sure your code runs and test the relevant screens before submitting. Also, don't commit `.env` files or API keys.

### Final review – Wednesday, 14 October

I'll review and test the full app on Wednesday, including navigation, responsiveness, voice commands, Firebase synchronisation, and the overall cooking flow.

**Timeline:**

- **Monday midnight:** Ji Jien finishes and submits PR.
- **After Ji Jien's PR is merged:** I'll inform Wai Hiin to start.
- **Tuesday midnight:** Wai Hiin finishes and submits PR.
- **Wednesday:** I'll review and test everything.

Please make sure the PR is submitted by the deadline, not just saved locally. Thanks guys!

**Existing files for the Cooking Flow**

Btw, we already have these files inside `src/pages/` from the previous development:

- `CookingMode.jsx` / `CookingMode.css` – Cooking instructions, steps, voice commands and timers
- `GroupProgress.jsx` / `GroupProgress.css` – Overall cooking progress and everyone's task status
- `CookComplete.jsx` / `CookComplete.css` – Screen after someone finishes their assigned tasks
- `AllTasksComplete.jsx` / `AllTasksComplete.css` – Screen when everyone has finished cooking

You can reuse these files, completely rewrite the code inside them, or delete and create new files if that's easier. The current code is from our previous development, so you don't have to follow its existing structure or design.

Just make sure the final implementation follows the Figma designs, supports landscape orientation, includes the rotate-phone prompt, and has working voice commands and the Nova cooking assistant.

**Important:** If you rename or delete any files, make sure you update their imports and navigation in `App.jsx` so the app doesn't break. Please also keep the Firebase integration working across devices.

Feel free to restructure the code however you think is best, as long as everything works and is included in your PR by Monday midnight.
