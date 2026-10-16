
import { useState } from "react";
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
import HelpingMode from "./pages/HelpingMode";
import GroupProgress from "./pages/GroupProgress";
import AllTasksComplete from "./pages/AllTasksComplete";
import PhotoReview from "./pages/PhotoReview";
import SharedMealFeed from "./pages/SharedMealFeed";

import LandscapeGuard from "./components/LandscapeGuard";
import { changeRoomScreen } from "./services/roomService";

const defaultPreferences = {
  dietary: ["No Allergies"],
  cuisine: "Any",
  budget: "$8–12 per person",
  cookingTime: "Under 30 min",
  difficulty: "Easy",
  foodLikes: [],
  ready: false,
};

function asArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value).filter(Boolean);
  }

  return [];
}

export default function App() {
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

  const [preferences, setPreferences] = useState(
    defaultPreferences
  );

  const [meal, setMeal] = useState(null);
  const [reviewDraft, setReviewDraft] = useState(null);
  const [reviewSaved, setReviewSaved] = useState(false);

  const [taskAssignments, setTaskAssignments] = useState([]);
  const [helpingMember, setHelpingMember] = useState(null);

  const [progressReturn, setProgressReturn] =
    useState("cooking");

  const isLandscapeFlow = [
    "cooking",
    "cookComplete",
    "helping",
    "progress",
    "allComplete",
  ].includes(screen);

  const currentMeal = meal || room.selectedRecipe;

  const currentUser = {
    ...user,
    memberId:
      room.memberId ||
      user.memberId ||
      user.id,
  };

  const memberId = currentUser.memberId;
  const tasks = asArray(taskAssignments);

  const myTasks = tasks.filter((task) => {
    if (memberId && task.assignedToId) {
      return (
        String(task.assignedToId) ===
        String(memberId)
      );
    }

    return task.assignedTo === user.name;
  });

  const myTasksFinished =
    myTasks.length > 0 &&
    myTasks.every((task) => task.status === "done");

  function openJoinRoom(mode) {
    setJoinMode(mode);
    setScreen("join");
  }

  function openProgress(from) {
    setProgressReturn(from);
    setScreen("progress");
  }

  function returnFromProgress() {
    if (
      progressReturn === "helping" &&
      helpingMember
    ) {
      setScreen("helping");
      return;
    }

    if (myTasksFinished) {
      setScreen("cookComplete");
      return;
    }

    setScreen("cooking");
  }

  function openHelping(member) {
    if (member) {
      setHelpingMember(member);
    }

    setScreen("helping");
  }

  function exitHelping() {
    setHelpingMember(null);

    if (myTasksFinished) {
      setScreen("cookComplete");
    } else {
      setScreen("cooking");
    }
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

    setPreferences({ ...defaultPreferences });
    setMeal(null);
    setReviewDraft(null);
    setReviewSaved(false);
    setTaskAssignments([]);
    setHelpingMember(null);
    setProgressReturn("cooking");
  }

  async function startCooking() {
    if (!room.code) return;

    try {
      await changeRoomScreen(
        room.code,
        "cooking"
      );

      setScreen("cooking");
    } catch (error) {
      console.error(
        "Failed to start cooking:",
        error
      );
    }
  }

  async function backToMeal() {
    if (!room.code) return;

    try {
      await changeRoomScreen(
        room.code,
        "meal"
      );

      setScreen("meal");
    } catch (error) {
      console.error(
        "Failed to return to meal selection:",
        error
      );
    }
  }

  function finishMyTasks() {
    setScreen("cookComplete");
  }

  // Called by screens that have confirmed
  // the group has finished all tasks.
  function showAllComplete() {
    setScreen("allComplete");
  }

  function openPhotoReview() {
    setScreen("photoReview");
  }

  function finishReview() {
    setReviewSaved(true);
    setScreen("mealFeed");
  }

  return (
    <div className="app-shell">
      <div
        className={`phone-app ${
          isLandscapeFlow
            ? "phone-app-landscape"
            : ""
        }`}
      >
        {/* WELCOME */}

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

        {/* JOIN ROOM */}

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

        {/* LOBBY */}

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

        {/* PREFERENCES */}

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

        {/* GROUP SUMMARY */}

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

        {/* MEAL SELECTION */}

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

        {/* TASK SETUP */}

        {screen === "tasks" && (
          <TaskSetup
            meal={currentMeal}
            user={currentUser}
            room={room}
            setTaskAssignments={setTaskAssignments}
            onContinue={startCooking}
            onRoomStart={() =>
              setScreen("cooking")
            }
            onBack={backToMeal}
          />
        )}

        {/* COOKING MODE */}

        {screen === "cooking" && (
          <LandscapeGuard>
            <CookingMode
              meal={currentMeal}
              user={currentUser}
              room={room}
              taskAssignments={taskAssignments}
              setTaskAssignments={setTaskAssignments}
              onComplete={finishMyTasks}
              onBack={() =>
                setScreen("tasks")
              }
              onProgress={() =>
                openProgress("cooking")
              }
            />
          </LandscapeGuard>
        )}

        {/* MY TASKS FINISHED */}

        {screen === "cookComplete" && (
          <LandscapeGuard>
            <CookComplete
              user={currentUser}
              meal={currentMeal}
              room={room}
              taskAssignments={taskAssignments}
              setHelpingMember={setHelpingMember}
              onHelp={() => openHelping()}
              onProgress={() =>
                openProgress("cookComplete")
              }
              onAllComplete={showAllComplete}
              onBack={() =>
                openProgress("cookComplete")
              }
            />
          </LandscapeGuard>
        )}

        {/* HELPING ANOTHER COOK */}

        {screen === "helping" && (
          <LandscapeGuard>
            <HelpingMode
              user={currentUser}
              meal={currentMeal}
              room={room}
              helpingMember={helpingMember}
              onExit={exitHelping}
              onProgress={() =>
                openProgress("helping")
              }
              onAllComplete={showAllComplete}
            />
          </LandscapeGuard>
        )}

        {/* GROUP PROGRESS */}

        {screen === "progress" && (
          <LandscapeGuard>
            <GroupProgress
              user={currentUser}
              meal={currentMeal}
              room={room}
              taskAssignments={taskAssignments}
              setHelpingMember={setHelpingMember}
              onHelp={() => openHelping()}
              onBack={returnFromProgress}
              onAllComplete={showAllComplete}
            />
          </LandscapeGuard>
        )}

        {/* EVERYONE FINISHED */}

        {screen === "allComplete" && (
          <LandscapeGuard>
            <AllTasksComplete
              user={currentUser}
              meal={currentMeal}
              room={room}
              taskAssignments={taskAssignments}
              onContinue={openPhotoReview}
            />
          </LandscapeGuard>
        )}

        {/* POST MEAL REVIEW */}

        {screen === "photoReview" && (
          <PhotoReview
            user={currentUser}
            meal={currentMeal}
            room={room}
            draft={reviewDraft}
            onDraftChange={setReviewDraft}
            onBack={() =>
              setScreen("allComplete")
            }
            onSaved={finishReview}
          />
        )}

        {/* SHARED MEAL FEED */}

        {screen === "mealFeed" && (
          <SharedMealFeed
            room={room}
            user={currentUser}
            onBack={() =>
              setScreen("allComplete")
            }
            onCookTogether={restartSession}
            justPosted={reviewSaved}
          />
        )}
      </div>
    </div>
  );
}
