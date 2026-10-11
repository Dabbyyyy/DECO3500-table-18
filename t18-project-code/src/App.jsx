
import { useEffect, useState } from "react";
import "./App.css";

import Welcome from "./pages/Welcome";
import JoinRoom from "./pages/JoinRoom";
import Lobby from "./pages/Lobby";
import Preferences from "./pages/Preferences";
import GroupSummary from "./pages/GroupSummary";
import MealSelection from "./pages/MealSelection";
import TaskSetup from "./pages/TaskSetup";
import CookingMode from "./pages/CookingMode";
import CookComplete from "./pages/CookComplete";
import GroupProgress from "./pages/GroupProgress";
import AllTasksComplete from "./pages/AllTasksComplete";

import {
  subscribeToRoom,
  changeRoomScreen,
} from "./services/roomService";

const defaultPreferences = {
  dietary: ["No Allergies"],
  cuisine: "Any",
  budget: "$8–12 per person",
  cookingTime: "Under 30 min",
  difficulty: "Easy",
  foodLikes: [],
  ready: false,
};

function App() {
  const [screen, setScreen] = useState("welcome");
  const [joinMode, setJoinMode] = useState("create");

  const [user, setUser] = useState({
    name: "",
    helperName: "",
  });

  const [room, setRoom] = useState({
    code: "",
    members: [],
  });

  const [preferences, setPreferences] =
    useState(defaultPreferences);

  const [meal, setMeal] = useState(null);
  const [taskAssignments, setTaskAssignments] =
    useState([]);

  const [helpingMember, setHelpingMember] =
    useState(null);

  const [sharedTask, setSharedTask] =
    useState(null);

  function openJoinRoom(mode) {
    setJoinMode(mode);
    setScreen("join");
  }

  function restartSession() {
    setScreen("welcome");
    setJoinMode("create");

    setUser({
      name: "",
      helperName: "",
    });

    setRoom({
      code: "",
      members: [],
    });

    setPreferences(defaultPreferences);
    setMeal(null);
    setTaskAssignments([]);
    setHelpingMember(null);
    setSharedTask(null);
  }

  async function startCooking() {
    if (!room.code) return;

    await changeRoomScreen(room.code, "cooking");
    setScreen("cooking");
  }

  async function backToMeal() {
    if (!room.code) return;

    await changeRoomScreen(room.code, "meal");
    setScreen("meal");
  }

  return (
    <div className="app-shell">
      <div className="phone-app">
        {screen === "welcome" && (
          <Welcome
            onContinue={() =>
              openJoinRoom("create")
            }
            onJoin={() =>
              openJoinRoom("join")
            }
          />
        )}

        {screen === "join" && (
          <JoinRoom
            user={user}
            setUser={setUser}
            room={room}
            setRoom={setRoom}
            initialMode={joinMode}
            onContinue={() =>
              setScreen("lobby")
            }
            onBack={() =>
              setScreen("welcome")
            }
          />
        )}

        {screen === "lobby" && (
          <Lobby
            user={user}
            room={room}
            setRoom={setRoom}
            onContinue={() =>
              setScreen("preferences")
            }
            onBack={() =>
              setScreen("join")
            }
          />
        )}

        {screen === "preferences" && (
          <Preferences
            user={user}
            room={room}
            setRoom={setRoom}
            preferences={preferences}
            setPreferences={setPreferences}
            onContinue={() =>
              setScreen("summary")
            }
            onBack={() =>
              setScreen("lobby")
            }
          />
        )}

        {screen === "summary" && (
          <GroupSummary
            room={room}
            setRoom={setRoom}
            onContinue={() =>
              setScreen("meal")
            }
            onBack={() =>
              setScreen("preferences")
            }
          />
        )}

        {screen === "meal" && (
          <MealSelection
            room={room}
            setRoom={setRoom}
            setMeal={setMeal}
            onContinue={() =>
              setScreen("tasks")
            }
            onBack={() =>
              setScreen("summary")
            }
          />
        )}

       {screen === "tasks" && (
          <TaskSetup
            meal={meal || room.selectedRecipe}
            user={{
              ...user,
              memberId: room.memberId,
            }}
            room={room}
            onContinue={startCooking}
            onBack={backToMeal}
          />
        )}

        {screen === "cooking" && (
          <CookingMode
            meal={meal || room.selectedRecipe}
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
            onProgress={() =>
              setScreen("progress")
            }
          />
        )}

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
            sharedTask={sharedTask}
            setSharedTask={setSharedTask}
            onBack={() =>
              setScreen("cookComplete")
            }
            onAllComplete={() =>
              setScreen("allComplete")
            }
          />
        )}

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
    </div>
  );
}

export default App;
