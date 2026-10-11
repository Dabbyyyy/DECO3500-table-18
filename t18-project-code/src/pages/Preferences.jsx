
import { useEffect, useState } from "react";
import "./Preferences.css";

import {
  subscribeToRoom,
  updateMemberPreferences,
  clearMealSuggestions,
  changeRoomScreen,
} from "../services/roomService";

const DEFAULTS = {
  dietary: ["No Allergies"],
  cuisine: "Any",
  budget: "$8–12 per person",
  cookingTime: "Under 30 min",
  difficulty: "Easy",
  foodLikes: [],
  ready: false,
};

const FIELDS = [
  {
    key: "dietary",
    title: "Dietary",
    icon: "♡",
    hint: "Restrictions and food needs",
    multiple: true,
    options: [
      "No Allergies",
      "Vegetarian",
      "Vegan",
      "Dairy Free",
      "Gluten Free",
      "No Soy",
      "No Wheat",
      "No Egg",
    ],
  },
  {
    key: "cuisine",
    title: "Cuisine",
    icon: "◉",
    hint: "What sounds good?",
    options: [
      "Any",
      "Japanese",
      "Asian",
      "Indian",
      "Italian",
      "Mexican",
      "Thai",
      "Indonesian",
      "Korean",
      "Vietnamese",
      "Chinese",
      "Greek",
      "Mediterranean",
      "Middle Eastern",
      "Moroccan",
      "Australian",
    ],
  },
  {
    key: "budget",
    title: "Budget",
    icon: "$",
    hint: "Estimated cost per person",
    options: [
      "Under $8",
      "$8–12 per person",
      "$12–20 per person",
    ],
  },
  {
    key: "cookingTime",
    title: "Cooking Time",
    icon: "◷",
    hint: "How much time do you have?",
    options: [
      "Under 30 min",
      "Under 45 min",
      "Under 60 min",
    ],
  },
  {
    key: "difficulty",
    title: "Difficulty",
    icon: "★",
    hint: "Your cooking comfort level",
    options: ["Easy", "Medium", "Hard"],
  },
  {
    key: "foodLikes",
    title: "Food Likes",
    icon: "♥",
    hint: "Ingredients you enjoy",
    multiple: true,
    options: [
      "Rice",
      "Chicken",
      "Pasta",
      "Vegetables",
      "Egg",
      "Potato",
      "Tomato",
      "Chickpeas",
    ],
  },
];

function displayValue(value) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Any";
  }
  return value || "Any";
}

export default function Preferences({
  user,
  room,
  setRoom,
  preferences,
  setPreferences,
  onContinue,
  onBack,
}) {
  const [activeField, setActiveField] = useState(null);
  const [cuisineSearch, setCuisineSearch] = useState("");
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const members = room.members || [];
  const isHost = room.memberId === room.hostId;

  const currentMember = members.find(
    (member) => member.id === room.memberId
  );

  const saved = currentMember?.preferences || null;

  const values = {
    ...DEFAULTS,
    ...(saved || {}),
    ...(draft || {}),
  };

  const readyCount = members.filter(
    (member) => member.preferences?.ready === true
  ).length;

  const everyoneReady =
    members.length > 0 && readyCount === members.length;

  useEffect(() => {
    if (!room.code) return;

    return subscribeToRoom(room.code, (updatedRoom) => {
      if (!updatedRoom) return;

      setRoom((previous) => ({
        ...updatedRoom,
        memberId: previous.memberId,
      }));

      if (updatedRoom.screen === "summary") {
        onContinue();
      }
    });
  }, [room.code, setRoom, onContinue]);

  function openField(field) {
    setCuisineSearch("");
    setActiveField(field);
  }

  function updateDraft(next) {
    setDraft(next);
    setPreferences(next);
    setError("");
  }

  function selectOption(field, option) {
    if (values.ready) return;

    let nextValue = option;

    if (field.multiple) {
      const current = Array.isArray(values[field.key])
        ? values[field.key]
        : [];

      if (field.key === "dietary") {
        if (option === "No Allergies") {
          nextValue = ["No Allergies"];
        } else {
          const withoutDefault = current.filter(
            (item) => item !== "No Allergies"
          );

          nextValue = withoutDefault.includes(option)
            ? withoutDefault.filter((item) => item !== option)
            : [...withoutDefault, option];

          if (!nextValue.length) {
            nextValue = ["No Allergies"];
          }
        }
      } else {
        nextValue = current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option];
      }
    }

    updateDraft({
      ...values,
      [field.key]: nextValue,
      ready: false,
    });
  }

  async function saveReady(ready) {
    if (!room.code || !room.memberId || busy) return;

    setBusy(true);
    setError("");

    const next = {
      ...values,
      ready,
    };

    try {
      await updateMemberPreferences(
        room.code,
        room.memberId,
        next
      );

      await clearMealSuggestions(room.code);

      setPreferences(next);
      setDraft(null);
    } catch (err) {
      console.error(err);
      setError("Could not save your choices. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function reviewGroup() {
    if (!isHost || !everyoneReady || busy) return;

    try {
      setBusy(true);
      setError("");
      await changeRoomScreen(room.code, "summary");
    } catch (err) {
      console.error(err);
      setError("Could not open the group summary.");
      setBusy(false);
    }
  }

  return (
    <main className="preferences-page">
      <div className="preferences-scroll">
        <button
          type="button"
          className="pref-back"
          onClick={onBack}
          aria-label="Go back"
        >
          ‹
        </button>

        <p className="pref-eyebrow">PREFERENCES</p>

        <h1>What does everyone want or need?</h1>

        <p className="pref-description">
          Choose what works for you. We'll combine
          everyone's input to find a meal for the group.
        </p>

        <div className="pref-section-heading">
          <strong>Your input</strong>
          <span>{values.ready ? "Saved ✓" : "Tap to edit"}</span>
        </div>

        <div className="pref-grid">
          {FIELDS.map((field) => (
            <button
              key={field.key}
              type="button"
              className={`pref-tile ${
                activeField?.key === field.key
                  ? "pref-tile-active"
                  : ""
              }`}
              onClick={() => openField(field)}
            >
              <span className="pref-tile-top">
                <span className="pref-tile-icon">
                  {field.icon}
                </span>
                <span className="pref-tile-arrow">›</span>
              </span>

              <span className="pref-tile-label">
                {field.title}
              </span>

              <span className="pref-tile-value">
                {displayValue(values[field.key])}
              </span>
            </button>
          ))}
        </div>

        <div className="pref-group-note">
          <span className="pref-group-note-icon">♧</span>

          <div>
            <strong>
              {members.length} cook
              {members.length === 1 ? "" : "s"} in your session
            </strong>
            <p>
              Everyone makes their own selections.
              You'll review the combined preferences next.
            </p>
          </div>
        </div>

        <div className="pref-ready-status">
          <div className="pref-ready-status-top">
            <strong>Group progress</strong>
            <span>
              {readyCount}/{members.length} ready
            </span>
          </div>

          <div className="pref-ready-people">
            {members.map((member) => (
              <div
                key={member.id}
                className="pref-ready-person"
              >
                <span
                  className={
                    member.preferences?.ready
                      ? "pref-avatar is-ready"
                      : "pref-avatar"
                  }
                >
                  {member.name?.charAt(0).toUpperCase() || "?"}
                </span>
                <small>
                  {member.id === room.memberId
                    ? "You"
                    : member.name}
                </small>
                {member.preferences?.ready && (
                  <span className="pref-person-check">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="pref-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <footer className="preferences-footer">
        <button
          type="button"
          className="pref-ready-button"
          disabled={busy}
          onClick={() => saveReady(!values.ready)}
        >
          {values.ready
            ? "Edit my choices"
            : busy
              ? "Saving..."
              : "Mark as ready"}
        </button>

        <button
          type="button"
          className="pref-continue-button"
          disabled={!isHost || !everyoneReady || busy}
          onClick={reviewGroup}
        >
          {isHost
            ? "Review group →"
            : "Waiting for admin"}
        </button>

        <small className="pref-footer-note">
          {everyoneReady
            ? "Everyone is ready!"
            : `Waiting for ${members.length - readyCount} cook(s)`}
        </small>
      </footer>

      {activeField && (
        <div
          className="pref-modal-overlay"
          onClick={() => setActiveField(null)}
        >
          <section
            className="pref-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Choose ${activeField.title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pref-modal-handle" />

            <div className="pref-modal-header">
              <div>
                <p className="pref-eyebrow">
                  YOUR PREFERENCES
                </p>
                <h2>{activeField.title}</h2>
                <p>{activeField.hint}</p>
              </div>

              <button
                type="button"
                className="pref-modal-close"
                onClick={() => setActiveField(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {values.ready ? (
              <p className="pref-modal-locked">
                Press "Edit my choices" before changing
                your saved preferences.
              </p>
            ) : (
              <>
                {activeField.key === "cuisine" && (
                  <input
                    type="search"
                    aria-label="Search cuisines"
                    placeholder="Search cuisines..."
                    value={cuisineSearch}
                    onChange={(event) => setCuisineSearch(event.target.value)}
                    style={{
                      display: "block",
                      width: "calc(100% - 40px)",
                      margin: "0 20px 12px",
                      padding: "12px 14px",
                      border: "1px solid #e9d9cb",
                      borderRadius: "10px",
                      background: "#fff",
                      color: "#3f2d26",
                      fontSize: "14px",
                    }}
                  />
                )}
                <div className="pref-modal-options">
                {activeField.options
                  .filter((option) =>
                    activeField.key !== "cuisine" ||
                    option.toLowerCase().includes(cuisineSearch.trim().toLowerCase())
                  )
                  .map((option) => {
                  const selected = activeField.multiple
                    ? (values[activeField.key] || [])
                        .includes(option)
                    : values[activeField.key] === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      className={
                        selected
                          ? "pref-option selected"
                          : "pref-option"
                      }
                      onClick={() =>
                        selectOption(activeField, option)
                      }
                    >
                      <span>{option}</span>
                      <span className="pref-option-check">
                        {selected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
                {activeField.key === "cuisine" &&
                  !activeField.options.some((option) =>
                    option.toLowerCase().includes(cuisineSearch.trim().toLowerCase())
                  ) && (
                    <p style={{ padding: "12px 20px", color: "#766358" }}>
                      No cuisines found.
                    </p>
                  )}
                </div>
              </>
            )}

            <button
              type="button"
              className="pref-modal-done"
              onClick={() => setActiveField(null)}
            >
              Done
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
