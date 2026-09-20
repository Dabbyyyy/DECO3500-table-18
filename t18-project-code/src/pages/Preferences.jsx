import { useEffect } from "react";

import "./Preferences.css";

import {
  subscribeToRoom,
  updateMemberPreference,
  changeRoomScreen,
} from "../services/roomService";


const cuisineOptions = [
  "Any",
  "Japanese",
  "Indonesian",
  "Korean",
  "Italian",
  "Mexican",
];


export default function Preferences({
  user,
  room,
  setRoom,
  preferences,
  setPreferences,
  onContinue,
  onBack,
}) {
  const members =
    room.members || [];


  const isHost =
    room.memberId === room.hostId;


  const currentMember =
    members.find(
      (member) =>
        member.id === room.memberId
    );


  const currentCuisine =
    currentMember?.preferences?.cuisine ||
    "Any";


  // =========================
  // LIVE FIREBASE ROOM
  // =========================

  useEffect(() => {
    if (!room.code) {
      return;
    }


    const unsubscribe =
      subscribeToRoom(
        room.code,
        (updatedRoom) => {
          if (!updatedRoom) {
            return;
          }


          setRoom(
            (currentRoom) => ({
              ...currentRoom,

              ...updatedRoom,

              memberId:
                currentRoom.memberId,
            })
          );


          // Everyone follows the admin
          // to Meal Selection
          if (
            updatedRoom.screen ===
            "meal"
          ) {
            onContinue();
          }
        }
      );


    return unsubscribe;
  }, [
    room.code,
    setRoom,
    onContinue,
  ]);


  // =========================
  // LOCAL PREFERENCES
  // =========================

  function updatePreference(
    field,
    value
  ) {
    setPreferences(
      (current) => ({
        ...current,

        [field]: value,
      })
    );
  }


  // =========================
  // CUISINE
  // =========================

  async function selectCuisine(
    cuisine
  ) {
    try {
      // Update this device's
      // local preference too
      setPreferences(
        (current) => ({
          ...current,

          cuisine,
        })
      );


      // Save to Firebase
      await updateMemberPreference(
        room.code,
        room.memberId,
        "cuisine",
        cuisine
      );
    } catch (error) {
      console.error(
        "Could not update cuisine:",
        error
      );
    }
  }


  // =========================
  // ADMIN CONTINUE
  // =========================

  async function handleContinue() {
    if (!isHost) {
      return;
    }


    try {
      await changeRoomScreen(
        room.code,
        "meal"
      );
    } catch (error) {
      console.error(
        "Could not continue:",
        error
      );

      alert(
        "Could not continue to meal selection."
      );
    }
  }


  return (
    <div className="preferences-page">

      {/* =========================
          LEFT SIDE
      ========================= */}

      <section className="preferences-left">

        <div>

          <button
            className="preferences-back"
            onClick={onBack}
          >
            ←
          </button>


          <p className="preferences-step">
            STEP 2 · PREFERENCES
          </p>


          <h1>
            What does everyone
            <br />
            want or need?
          </h1>


          <p className="preferences-description">
            Add your preferences before choosing
            a meal. Everyone can see the group's
            choices while deciding together.
          </p>

        </div>


        <div className="preferences-user">

          <div className="preferences-avatar">
            {user.name
              ?.charAt(0)
              .toUpperCase() || "?"}
          </div>


          <div>

            <span>
              Your preferences
            </span>

            <strong>
              {user.name || "Cook"}
            </strong>

          </div>

        </div>

      </section>


      {/* =========================
          RIGHT SIDE
      ========================= */}

      <section className="preferences-right">

        <div>

          <p className="preferences-heading">
            Group preferences
          </p>


          {/* =====================
              CUISINE
          ===================== */}

          <div className="cuisine-section">

            <label className="preference-section-label">
              CUISINE
            </label>


            <div className="cuisine-grid">

              {cuisineOptions.map(
                (cuisine) => {

                  const selectedMembers =
                    members.filter(
                      (member) =>
                        (
                          member
                            .preferences
                            ?.cuisine ||
                          "Any"
                        ) === cuisine
                    );


                  const isSelected =
                    currentCuisine ===
                    cuisine;


                  return (
                    <button
                      key={cuisine}

                      type="button"

                      className={
                        isSelected
                          ? "cuisine-option selected"
                          : "cuisine-option"
                      }

                      onClick={() =>
                        selectCuisine(
                          cuisine
                        )
                      }
                    >

                      <span className="cuisine-name">
                        {cuisine}
                      </span>


                      <div className="cuisine-members">

                        {selectedMembers.map(
                          (
                            member,
                            index
                          ) => (

                            <div
                              key={
                                member.id
                              }

                              className={`cuisine-member-avatar avatar-${
                                index % 3
                              }`}

                              title={
                                member.name
                              }
                            >
                              {member.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                          )
                        )}

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          </div>


          {/* =====================
              OTHER PREFERENCES
          ===================== */}

          <div className="preferences-grid preferences-other-grid">

            {/* DIETARY */}

            <div className="preference-field">

              <label>
                Dietary
              </label>


              <select
                value={
                  preferences.dietary
                }

                onChange={(e) =>
                  updatePreference(
                    "dietary",
                    e.target.value
                  )
                }
              >

                <option value="">
                  No allergies
                </option>

                <option value="Vegetarian">
                  Vegetarian
                </option>

                <option value="Vegan">
                  Vegan
                </option>

                <option value="Halal">
                  Halal
                </option>

                <option value="Gluten free">
                  Gluten free
                </option>

                <option value="Dairy free">
                  Dairy free
                </option>

              </select>

            </div>


            {/* BUDGET */}

            <div className="preference-field">

              <label>
                Budget
              </label>


              <select
                value={
                  preferences.budget
                }

                onChange={(e) =>
                  updatePreference(
                    "budget",
                    e.target.value
                  )
                }
              >

                <option value="">
                  Any budget
                </option>

                <option value="Under $8">
                  Under $8 per person
                </option>

                <option value="$8-$12">
                  $8–12 per person
                </option>

                <option value="$12-$18">
                  $12–18 per person
                </option>

              </select>

            </div>


            {/* COOKING TIME */}

            <div className="preference-field">

              <label>
                Cooking time
              </label>


              <select
                value={
                  preferences.cookingTime
                }

                onChange={(e) =>
                  updatePreference(
                    "cookingTime",
                    e.target.value
                  )
                }
              >

                <option value="">
                  Any time
                </option>

                <option value="Under 20 min">
                  Under 20 min
                </option>

                <option value="Under 30 min">
                  Under 30 min
                </option>

                <option value="Under 45 min">
                  Under 45 min
                </option>

              </select>

            </div>


            {/* DIFFICULTY */}

            <div className="preference-field">

              <label>
                Difficulty
              </label>


              <select
                value={
                  preferences.difficulty
                }

                onChange={(e) =>
                  updatePreference(
                    "difficulty",
                    e.target.value
                  )
                }
              >

                <option value="Easy">
                  Easy
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Any">
                  Any
                </option>

              </select>

            </div>


            {/* FOOD LIKES */}

            <div className="preference-field">

              <label>
                Food likes
              </label>


              <input
                type="text"

                placeholder="Rice, chicken..."

                value={
                  preferences.likes
                }

                onChange={(e) =>
                  updatePreference(
                    "likes",
                    e.target.value
                  )
                }
              />

            </div>

          </div>

        </div>


        {/* =====================
            BOTTOM
        ===================== */}

        <div className="preferences-bottom">

          {isHost ? (

            <p>
              Everyone can choose their own
              preferences. Continue when your
              group is ready.
            </p>

          ) : (

            <p>
              Choose your preferences, then wait
              for the room admin to continue.
            </p>

          )}


          {isHost ? (

            <button
              onClick={
                handleContinue
              }
            >
              See suggested meals
            </button>

          ) : (

            <button
              className="preferences-waiting-button"
              disabled
            >
              Waiting for admin
            </button>

          )}

        </div>

      </section>

    </div>
  );
}