import { useState } from "react";
import "./App.css";

// Pages
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
  // Current screen
  const [screen, setScreen] = useState("welcome");


  // Current user
  const [user, setUser] = useState({
    name: "",
    helperName: "",
  });


  // Cooking room
  const [room, setRoom] = useState({
    code: "",
    members: [],
  });


  // Group food preferences
  const [preferences, setPreferences] = useState({
    dietary: "",
    cuisine: "Any",
    budget: "",
    cookingTime: "",
    difficulty: "Easy",
    likes: "",
  });


  // Selected meal
  const [meal, setMeal] = useState(null);


  // Cooking task assignments
  const [taskAssignments, setTaskAssignments] = useState([]);


  // Person the current user is helping
  const [helpingMember, setHelpingMember] = useState(null);


  // Optional shared task
  const [sharedTask, setSharedTask] = useState(null);


  // Reset everything when the session finishes
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
      dietary: "",
      cuisine: "Any",
      budget: "",
      cookingTime: "",
      difficulty: "Easy",
      likes: "",
    });

    setMeal(null);
    setTaskAssignments([]);
    setHelpingMember(null);
    setSharedTask(null);
  }


  return (
    <div className="app-shell">

      <div className="phone-app">

        {/* =========================
            WELCOME
        ========================= */}

        {screen === "welcome" && (
          <Welcome
            onContinue={() => setScreen("join")}
          />
        )}


        {/* =========================
            JOIN / CREATE ROOM
        ========================= */}

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


        {/* =========================
            COOKING LOBBY
        ========================= */}

        {screen === "lobby" && (
          <Lobby
            user={user}
            room={room}

            onContinue={() =>
              setScreen("preferences")
            }

            onBack={() =>
              setScreen("join")
            }
          />
        )}


        {/* =========================
            PREFERENCES
        ========================= */}

        {screen === "preferences" && (
          <Preferences
            user={user}

            preferences={preferences}

            setPreferences={setPreferences}

            onContinue={() =>
              setScreen("meal")
            }

            onBack={() =>
              setScreen("lobby")
            }
          />
        )}


        {/* =========================
            MEAL SELECTION
        ========================= */}

        {screen === "meal" && (
          <MealSelection
            preferences={preferences}

            setMeal={setMeal}

            onContinue={() =>
              setScreen("tasks")
            }

            onBack={() =>
              setScreen("preferences")
            }
          />
        )}


        {/* =========================
            TASK SETUP
        ========================= */}

        {screen === "tasks" && (
          <TaskSetup
            meal={meal}
            user={user}
            room={room}

            setTaskAssignments={
              setTaskAssignments
            }

            onContinue={() =>
              setScreen("cooking")
            }

            onBack={() =>
              setScreen("meal")
            }
          />
        )}


        {/* =========================
            COOKING MODE
        ========================= */}

        {screen === "cooking" && (
          <CookingMode
            meal={meal}

            user={user}

            room={room}

            taskAssignments={
              taskAssignments
            }

            setTaskAssignments={
              setTaskAssignments
            }

            onComplete={() =>
              setScreen("cookComplete")
            }

            onBack={() =>
              setScreen("tasks")
            }
          />
        )}


        {/* =========================
            INDIVIDUAL COOK COMPLETE
        ========================= */}

        {screen === "cookComplete" && (
          <CookComplete
            user={user}

            meal={meal}

            taskAssignments={
              taskAssignments
            }

            setHelpingMember={
              setHelpingMember
            }

            // Help another cook
            onHelp={() => {
              setSharedTask(null);
              setScreen("progress");
            }}

            // Start cleanup
            onCleanup={() => {
              setHelpingMember(null);
              setSharedTask("cleanup");
              setScreen("progress");
            }}

            // Prepare table
            onTable={() => {
              setHelpingMember(null);
              setSharedTask("table");
              setScreen("progress");
            }}

            // Just view group progress
            onProgress={() => {
              setScreen("progress");
            }}
          />
        )}


        {/* =========================
            GROUP PROGRESS
        ========================= */}

        {screen === "progress" && (
          <GroupProgress
            user={user}

            meal={meal}

            room={room}

            taskAssignments={
              taskAssignments
            }

            setTaskAssignments={
              setTaskAssignments
            }

            helpingMember={
              helpingMember
            }

            setHelpingMember={
              setHelpingMember
            }

            sharedTask={
              sharedTask
            }

            setSharedTask={
              setSharedTask
            }

            onBack={() =>
              setScreen("cookComplete")
            }

            onAllComplete={() =>
              setScreen("allComplete")
            }
          />
        )}


        {/* =========================
            ALL TASKS COMPLETE
        ========================= */}

        {screen === "allComplete" && (
          <AllTasksComplete
            user={user}

            meal={meal}

            room={room}

            taskAssignments={
              taskAssignments
            }

            onRestart={restartSession}
          />
        )}

      </div>


      {/* =========================
          PORTRAIT PHONE MESSAGE
      ========================= */}

      <div className="portrait-message">

        <h2>
          Rotate your phone
        </h2>

        <p>
          This cooking experience works best
          in landscape mode.
        </p>

      </div>

    </div>
  );
}


export default App;