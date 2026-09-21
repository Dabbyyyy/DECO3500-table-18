import { useState } from "react";
import "./App.css";

import Welcome from "./pages/Welcome";
import JoinRoom from "./pages/JoinRoom";
import Lobby from "./pages/Lobby";
import Preferences from "./pages/Preferences";
import MealSelection from "./pages/MealSelection";
import TaskSetup from "./pages/TaskSetup";
import CookingMode from "./pages/CookingMode";
import CookComplete from "./pages/CookComplete";
import GroupProgress from "./pages/GroupProgress";
import AllTasksComplete from "./pages/AllTasksComplete";

function App() {
  const [screen, setScreen] = useState("welcome");

  const [user, setUser] = useState({
    name: "",
    helperName: "",
  });

  const [room, setRoom] = useState({
    code: "",
    members: [],
  });

  const [preferences, setPreferences] = useState({
    area: "Any",
    category: "Any",
    ingredient: "Any",
    cookingConfidence: "Beginner",
    ready: false,
  });

  const [meal, setMeal] = useState(null);
  const [taskAssignments, setTaskAssignments] = useState([]);
  const [helpingMember, setHelpingMember] = useState(null);
  const [sharedTask, setSharedTask] = useState(null);

  function restartSession() {
    setScreen("welcome");

    setUser({
      name: "",
      helperName: "",
    });

    setRoom({
      code: "",
      members: [],
    });

    setPreferences({
      area: "Any",
      category: "Any",
      ingredient: "Any",
      cookingConfidence: "Beginner",
      ready: false,
    });

    setMeal(null);
    setTaskAssignments([]);
    setHelpingMember(null);
    setSharedTask(null);
  }

  return (
    <div className="app-shell">
      <div className="phone-app">
        {screen === "welcome" && (
          <Welcome onContinue={() => setScreen("join")} />
        )}

        {screen === "join" && (
          <JoinRoom
            user={user}
            setUser={setUser}
            room={room}
            setRoom={setRoom}
            onContinue={() => setScreen("lobby")}
            onBack={() => setScreen("welcome")}
          />
        )}

        {screen === "lobby" && (
          <Lobby
            user={user}
            room={room}
            setRoom={setRoom}
            onContinue={() => setScreen("preferences")}
            onBack={() => setScreen("join")}
          />
        )}

        {screen === "preferences" && (
          <Preferences
            user={user}
            room={room}
            setRoom={setRoom}
            preferences={preferences}
            setPreferences={setPreferences}
            onContinue={() => setScreen("meal")}
            onBack={() => setScreen("lobby")}
          />
        )}

        {screen === "meal" && (
          <MealSelection
            room={room}
            setRoom={setRoom}
            setMeal={setMeal}
            onContinue={() => setScreen("tasks")}
            onBack={() => setScreen("preferences")}
          />
        )}

        {screen === "tasks" && (
          <TaskSetup
            meal={meal}
            user={user}
            room={room}
            setTaskAssignments={setTaskAssignments}
            onContinue={() => setScreen("cooking")}
            onBack={() => setScreen("meal")}
          />
        )}

        {screen === "cooking" && (
          <CookingMode
            meal={meal}
            user={user}
            room={room}
            taskAssignments={taskAssignments}
            setTaskAssignments={setTaskAssignments}
            onComplete={() => setScreen("cookComplete")}
            onBack={() => setScreen("tasks")}
          />
        )}

        {screen === "cookComplete" && (
          <CookComplete
            user={user}
            meal={meal}
            taskAssignments={taskAssignments}
            setHelpingMember={setHelpingMember}
            onHelp={() => {
              setSharedTask(null);
              setScreen("progress");
            }}
            onCleanup={() => {
              setHelpingMember(null);
              setSharedTask("cleanup");
              setScreen("progress");
            }}
            onTable={() => {
              setHelpingMember(null);
              setSharedTask("table");
              setScreen("progress");
            }}
            onProgress={() => setScreen("progress")}
          />
        )}

        {screen === "progress" && (
          <GroupProgress
            user={user}
            meal={meal}
            room={room}
            taskAssignments={taskAssignments}
            setTaskAssignments={setTaskAssignments}
            helpingMember={helpingMember}
            setHelpingMember={setHelpingMember}
            sharedTask={sharedTask}
            setSharedTask={setSharedTask}
            onBack={() => setScreen("cookComplete")}
            onAllComplete={() => setScreen("allComplete")}
          />
        )}

        {screen === "allComplete" && (
          <AllTasksComplete
            user={user}
            meal={meal}
            room={room}
            taskAssignments={taskAssignments}
            onRestart={restartSession}
          />
        )}
      </div>

      <div className="portrait-message">
        <h2>Rotate your phone</h2>
        <p>This cooking experience works best in landscape mode.</p>
      </div>
    </div>
  );
}

export default App;
