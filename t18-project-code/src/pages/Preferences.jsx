import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./Preferences.css";

import {
  subscribeToRoom,
  updateMemberPreference,
  setMemberReady,
  clearMealSuggestions,
  changeRoomScreen,
} from "../services/roomService";

import {
  getAreas,
  getCategories,
  getIngredients,
} from "../services/themealdbService";

/* ---------------------------------
   Searchable dropdown
---------------------------------- */

function SearchDropdown({
  label,
  description,
  value,
  options,
  placeholder,
  onChange,
  members = [],
  field,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return options;
    }

    return options.filter((option) =>
      option.toLowerCase().includes(text)
    );
  }, [options, search]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function selectOption(option) {
    onChange(option);
    setOpen(false);
    setSearch("");
  }

  function getInitial(name) {
    return name?.trim()?.charAt(0)?.toUpperCase() || "?";
  }

  return (
    <div className="preference-field">
      <div className="field-heading">
        <div>
          <h3>{label}</h3>
          <p>{description}</p>
        </div>

        <span className="api-badge">API</span>
      </div>

      <div
        className={`search-dropdown ${open ? "open" : ""}`}
        ref={dropdownRef}
      >
        <button
          type="button"
          className="dropdown-trigger"
          onClick={() => setOpen((previous) => !previous)}
        >
          <span>
            {value === "Any" ? placeholder : value}
          </span>

          <span className="dropdown-arrow">
            {open ? "▲" : "▼"}
          </span>
        </button>

        {open && (
          <div className="dropdown-menu">
            <div className="dropdown-search-wrap">
              <span className="search-icon">⌕</span>

              <input
                autoFocus
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={`Search ${label.toLowerCase()}...`}
              />
            </div>

            <div className="dropdown-options">
              <button
                type="button"
                className={`dropdown-option ${
                  value === "Any" ? "selected" : ""
                }`}
                onClick={() => selectOption("Any")}
              >
                <span>{placeholder}</span>

                {value === "Any" && (
                  <span className="option-check">✓</span>
                )}
              </button>

              {filteredOptions.map((option, index) => (
                <button
                  type="button"
                  key={`${field}-${option}-${index}`}
                  className={`dropdown-option ${
                    value === option ? "selected" : ""
                  }`}
                  onClick={() => selectOption(option)}
                >
                  <span>{option}</span>

                  {value === option && (
                    <span className="option-check">✓</span>
                  )}
                </button>
              ))}

              {filteredOptions.length === 0 && (
                <div className="no-dropdown-results">
                  No matching options
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="group-choice-row">
        {members.map((member) => {
          const memberValue =
            member.preferences?.[field] || "Any";

          return (
            <div
              className="group-choice-person"
              key={member.id}
              title={`${member.name}: ${memberValue}`}
            >
              <span className="group-choice-avatar">
                {getInitial(member.name)}
              </span>

              <span className="group-choice-name">
                {member.name}
              </span>

              <span className="group-choice-value">
                {memberValue === "Any"
                  ? "No preference"
                  : memberValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------
   Preferences page
---------------------------------- */

export default function Preferences({
  user,
  room,
  setRoom,
  preferences,
  setPreferences,
  onContinue,
  onBack,
}) {
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [error, setError] = useState("");

  const currentMember = useMemo(
    () =>
      room.members?.find(
        (member) => member.id === room.memberId
      ) || null,
    [room.members, room.memberId]
  );

  const isHost = room.memberId === room.hostId;

  /* Load real TheMealDB preference options */

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        setLoadingOptions(true);

        const [
          areaData,
          categoryData,
          ingredientData,
        ] = await Promise.all([
          getAreas(),
          getCategories(),
          getIngredients(),
        ]);

        if (cancelled) return;

        setAreas(areaData);
        setCategories(categoryData);
        setIngredients(ingredientData);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            "Could not load food options from TheMealDB."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  /* Listen to room changes */

  useEffect(() => {
    if (!room.code) return;

    const unsubscribe = subscribeToRoom(
      room.code,
      (updatedRoom) => {
        if (!updatedRoom) return;

        setRoom((previous) => ({
          ...updatedRoom,
          memberId: previous.memberId,
        }));

        if (updatedRoom.screen === "meal") {
          onContinue();
        }
      }
    );

    return unsubscribe;
  }, [room.code, setRoom, onContinue]);

  /* Keep this device's preference state synced */

  useEffect(() => {
    if (!currentMember?.preferences) return;

    setPreferences({
      area:
        currentMember.preferences.area || "Any",

      category:
        currentMember.preferences.category || "Any",

      ingredient:
        currentMember.preferences.ingredient || "Any",

      cookingConfidence:
        currentMember.preferences.cookingConfidence ||
        "Beginner",

      ready:
        currentMember.preferences.ready === true,
    });
  }, [currentMember, setPreferences]);

  /* Save immediately when a preference changes */

  async function choose(field, value) {
    const next = {
      ...preferences,
      [field]: value,
      ready: false,
    };

    // Immediate local update.
    setPreferences(next);
    setError("");

    try {
      await updateMemberPreference(
        room.code,
        room.memberId,
        field,
        value
      );

      // Old meal suggestions no longer match.
      await clearMealSuggestions(room.code);
    } catch (err) {
      console.error(err);

      setError(
        "Could not save that choice. Please try again."
      );
    }
  }

  async function markReady() {
    try {
      setError("");

      await setMemberReady(
        room.code,
        room.memberId,
        true
      );

      setPreferences((previous) => ({
        ...previous,
        ready: true,
      }));
    } catch (err) {
      console.error(err);

      setError("Could not mark you as ready.");
    }
  }

  const readyMembers =
    room.members?.filter(
      (member) => member.preferences?.ready
    ) || [];

  const everyoneReady =
    room.members?.length > 0 &&
    readyMembers.length === room.members.length;

  async function continueToMeals() {
    if (!isHost) return;

    if (!everyoneReady) {
      setError("Wait until everyone is ready.");
      return;
    }

    await changeRoomScreen(room.code, "meal");
  }

  function getInitial(name) {
    return (
      name?.trim()?.charAt(0)?.toUpperCase() || "?"
    );
  }

  return (
    <div className="preferences-page">
      {/* LEFT SIDE */}

      <aside className="preferences-sidebar">
        <button
          className="preferences-back"
          onClick={onBack}
        >
          ← Back
        </button>

        <span className="preferences-step">
          STEP 2
        </span>

        <h1>Build your group meal</h1>

        <p className="preferences-description">
          Choose what you feel like cooking. Everyone
          can make their own choices and see what the
          group prefers.
        </p>

        <div className="your-profile">
          <span className="sidebar-label">
            YOUR PROFILE
          </span>

          <div className="profile-person">
            <div className="profile-avatar">
              {getInitial(user.name)}
            </div>

            <div>
              <strong>{user.name || "You"}</strong>

              <span>
                {preferences.ready
                  ? "Ready to find meals"
                  : "Choosing preferences"}
              </span>
            </div>
          </div>
        </div>

        <div className="group-status">
          <div className="group-status-header">
            <span>GROUP STATUS</span>

            <strong>
              {readyMembers.length}/
              {room.members?.length || 0} ready
            </strong>
          </div>

          <div className="member-ready-list">
            {room.members?.map((member) => (
              <div
                className="ready-member"
                key={member.id}
              >
                <div className="ready-member-left">
                  <div className="mini-avatar">
                    {getInitial(member.name)}
                  </div>

                  <span>
                    {member.name}

                    {member.id === room.hostId
                      ? " · Admin"
                      : ""}
                  </span>
                </div>

                <span
                  className={
                    member.preferences?.ready
                      ? "ready-check complete"
                      : "ready-check"
                  }
                >
                  {member.preferences?.ready
                    ? "✓"
                    : "…"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE */}

      <main className="preferences-main">
        <header className="preferences-main-header">
          <div>
            <span className="preferences-eyebrow">
              YOUR FOOD PREFERENCES
            </span>

            <h2>What sounds good?</h2>

            <p>
              Pick a few things you would enjoy
              cooking together.
            </p>
          </div>

          <div className="room-pill">
            {room.code}
          </div>
        </header>

        <div className="preferences-content">
          {loadingOptions ? (
            <div className="preference-loading">
              <div className="preference-spinner" />

              <div>
                <strong>
                  Loading food choices…
                </strong>

                <span>
                  Getting options from TheMealDB
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="preference-grid">
                <SearchDropdown
                  label="Cuisine / region"
                  description="What style of food sounds good?"
                  value={preferences.area || "Any"}
                  options={areas}
                  placeholder="Any cuisine"
                  field="area"
                  members={room.members || []}
                  onChange={(value) =>
                    choose("area", value)
                  }
                />

                <SearchDropdown
                  label="Meal category"
                  description="What kind of meal should we make?"
                  value={
                    preferences.category || "Any"
                  }
                  options={categories}
                  placeholder="Any category"
                  field="category"
                  members={room.members || []}
                  onChange={(value) =>
                    choose("category", value)
                  }
                />

                <SearchDropdown
                  label="Main ingredient"
                  description="Anything you feel like cooking with?"
                  value={
                    preferences.ingredient || "Any"
                  }
                  options={ingredients}
                  placeholder="Any ingredient"
                  field="ingredient"
                  members={room.members || []}
                  onChange={(value) =>
                    choose("ingredient", value)
                  }
                />

                <div className="preference-field">
                  <div className="field-heading">
                    <div>
                      <h3>Cooking confidence</h3>

                      <p>
                        Helps us divide tasks later.
                      </p>
                    </div>

                    <span className="table18-badge">
                      TABLE 18
                    </span>
                  </div>

                  <div className="confidence-options">
                    {[
                      "Beginner",
                      "Comfortable",
                      "Experienced",
                    ].map((level) => (
                      <button
                        type="button"
                        key={level}
                        className={`confidence-button ${
                          preferences.cookingConfidence ===
                          level
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          choose(
                            "cookingConfidence",
                            level
                          )
                        }
                      >
                        <span className="confidence-title">
                          {level}
                        </span>

                        <span className="confidence-copy">
                          {level === "Beginner"
                            ? "Simple tasks"
                            : level === "Comfortable"
                            ? "Everyday cooking"
                            : "More involved tasks"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="preference-note">
                <strong>
                  How recommendations work
                </strong>

                <span>
                  We combine the group's cuisine,
                  category and ingredient choices to
                  find meals from TheMealDB.
                </span>
              </div>
            </>
          )}
        </div>

        <footer className="preferences-footer">
          <div className="preferences-footer-status">
            {error ? (
              <span className="preferences-error">
                {error}
              </span>
            ) : preferences.ready ? (
              <span className="ready-message">
                ✓ You are ready
              </span>
            ) : (
              <span>
                Choices save automatically
              </span>
            )}
          </div>

          <div className="preferences-actions">
            <button
              className={`ready-button ${
                preferences.ready
                  ? "is-ready"
                  : ""
              }`}
              onClick={markReady}
              disabled={preferences.ready}
            >
              {preferences.ready
                ? "Ready ✓"
                : "I'm ready"}
            </button>

            {isHost ? (
              <button
                className="find-meals-button"
                disabled={!everyoneReady}
                onClick={continueToMeals}
              >
                Find suggested meals →
              </button>
            ) : (
              <button
                className="find-meals-button"
                disabled
              >
                Waiting for admin
              </button>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}