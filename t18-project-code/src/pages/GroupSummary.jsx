
import { useEffect, useState } from "react";
import "./GroupSummary.css";

import { getGroupSummary } from "../utils/groupPreferences";

import {
  subscribeToRoom,
  changeRoomScreen,
} from "../services/roomService";

export default function GroupSummary({
  room,
  setRoom,
  onContinue,
  onBack,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const members = room.members || [];
  const isHost = room.memberId === room.hostId;
  const summary = getGroupSummary(members);

  useEffect(() => {
    if (!room.code) return;

    return subscribeToRoom(room.code, (updatedRoom) => {
      if (!updatedRoom) return;

      setRoom((previous) => ({
        ...updatedRoom,
        memberId: previous.memberId,
      }));

      if (updatedRoom.screen === "meal") {
        onContinue();
      }

      if (updatedRoom.screen === "preferences") {
        onBack();
      }
    });
  }, [room.code, setRoom, onContinue, onBack]);

  async function goBack() {
    if (!isHost || busy) return;

    try {
      setBusy(true);
      await changeRoomScreen(room.code, "preferences");
    } catch (err) {
      console.error(err);
      setError("Could not return to preferences.");
      setBusy(false);
    }
  }

  async function findMeals() {
    if (!isHost || busy) return;

    try {
      setBusy(true);
      setError("");
      await changeRoomScreen(room.code, "meal");
    } catch (err) {
      console.error(err);
      setError("Could not open meal selection.");
      setBusy(false);
    }
  }

  const cuisineText =
    summary.cuisine.value === "Any"
      ? "No specific preference"
      : summary.cuisine.tied
        ? `Mixed: ${summary.cuisine.value}`
        : `${summary.cuisine.value} (${summary.cuisine.count} of ${summary.memberCount})`;

  const rows = [
    {
      icon: "♡",
      label: "Dietary needs",
      value: summary.restrictions.length
        ? summary.restrictions.join(", ")
        : "No restrictions selected",
    },
    {
      icon: "◉",
      label: "Most popular cuisine",
      value: cuisineText,
    },
    {
      icon: "$",
      label: "Shared budget limit",
      value: summary.budgetLimit !== null
        ? `Up to $${summary.budgetLimit} per person`
        : "No budget selected",
    },
    {
      icon: "◷",
      label: "Cooking time limit",
      value: summary.timeLimit !== null
        ? `Up to ${summary.timeLimit} minutes`
        : "No time limit selected",
    },
    {
      icon: "★",
      label: "Preferred difficulty",
      value: summary.difficulty,
    },
    {
      icon: "♥",
      label: "Popular ingredients",
      value: summary.popularFoods.length
        ? summary.popularFoods
            .map(
              (food) =>
                `${food.name} (${food.count})`
            )
            .join(", ")
        : "No favourites selected",
    },
  ];

  return (
    <main className="group-summary-page">
      <div className="group-summary-scroll">
        <button
          type="button"
          className="summary-back"
          onClick={goBack}
          disabled={!isHost || busy}
          aria-label="Back to preferences"
        >
          ‹
        </button>

        <p className="summary-eyebrow">
          GROUP SUMMARY
        </p>

        <h1>Here's what works for everyone.</h1>

        <p className="summary-description">
          We've combined everyone's choices to help
          find a meal your group can cook together.
        </p>

        <section className="summary-card">
          <div className="summary-card-heading">
            <span className="summary-heading-icon">♧</span>
            <strong>
              Group of {summary.memberCount} cooks
            </strong>
          </div>

          {rows.map((row) => (
            <div className="summary-row" key={row.label}>
              <div className="summary-row-icon">
                {row.icon}
              </div>

              <div className="summary-row-content">
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            </div>
          ))}
        </section>

        <section className="summary-explanation">
          <div className="summary-explanation-title">
            <span>✦</span>
            <strong>How we'll choose your meal</strong>
          </div>

          <p>
            We'll check everyone's dietary requirements
            first, then consider budget, cooking time,
            difficulty, and the group's favourite foods.
          </p>
        </section>

        <div className="summary-members">
          <strong>Your cooking group</strong>

          <div className="summary-member-list">
            {members.map((member) => (
              <div
                className="summary-member"
                key={member.id}
              >
                <span className="summary-member-avatar">
                  {member.name?.charAt(0).toUpperCase() || "?"}
                </span>
                <span>{member.name}</span>
                <span className="summary-member-check">
                  {member.preferences?.ready ? "✓ Ready" : "Not ready"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="summary-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <footer className="summary-footer">
        <button
          type="button"
          className="summary-continue"
          onClick={findMeals}
          disabled={!isHost || busy}
        >
          {isHost
            ? busy
              ? "Loading..."
              : "Find meals for our group →"
            : "Waiting for admin"}
        </button>

        <small>
          {isHost
            ? "Ready to explore your meal options?"
            : "The admin will continue for everyone."}
        </small>
      </footer>
    </main>
  );
}
