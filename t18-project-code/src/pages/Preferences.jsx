import "./Preferences.css";

export default function Preferences({
  user,
  preferences,
  setPreferences,
  onContinue,
  onBack,
}) {
  function updatePreference(field, value) {
    setPreferences((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div className="preferences-page">

      {/* LEFT SIDE */}
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
            Add your preferences before choosing a meal.
            We'll combine everyone's input to find something
            that works for the group.
          </p>
        </div>

        <div className="preferences-user">
          <div className="preferences-avatar">
            {user.name?.charAt(0).toUpperCase() || "?"}
          </div>

          <div>
            <span>Your preferences</span>
            <strong>{user.name || "Cook"}</strong>
          </div>
        </div>
      </section>


      {/* RIGHT SIDE */}
      <section className="preferences-right">

        <div>
          <p className="preferences-heading">
            Your input
          </p>

          <div className="preferences-grid">

            {/* DIETARY */}
            <div className="preference-field">
              <label>Dietary</label>

              <select
                value={preferences.dietary}
                onChange={(e) =>
                  updatePreference(
                    "dietary",
                    e.target.value
                  )
                }
              >
                <option value="">No allergies</option>
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


            {/* CUISINE */}
            <div className="preference-field">
              <label>Cuisine</label>

              <select
                value={preferences.cuisine}
                onChange={(e) =>
                  updatePreference(
                    "cuisine",
                    e.target.value
                  )
                }
              >
                <option value="Any">
                  Japanese, Any
                </option>

                <option value="Asian">
                  Asian
                </option>

                <option value="Japanese">
                  Japanese
                </option>

                <option value="Korean">
                  Korean
                </option>

                <option value="Indonesian">
                  Indonesian
                </option>

                <option value="Italian">
                  Italian
                </option>

                <option value="Mexican">
                  Mexican
                </option>
              </select>
            </div>


            {/* BUDGET */}
            <div className="preference-field">
              <label>Budget</label>

              <select
                value={preferences.budget}
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
              <label>Cooking time</label>

              <select
                value={preferences.cookingTime}
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
              <label>Difficulty</label>

              <select
                value={preferences.difficulty}
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
              <label>Food likes</label>

              <input
                type="text"
                placeholder="Rice, chicken..."
                value={preferences.likes}
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


        <div className="preferences-bottom">

          <p>
            Your choices will be combined with the
            rest of the cooking group's preferences.
          </p>

          <button onClick={onContinue}>
            See suggested meals
          </button>

        </div>

      </section>

    </div>
  );
}