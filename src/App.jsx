import { useEffect, useMemo, useState } from "react";
import "./index.css";

const initialQuestions = [
  {
    id: 1,
    question: "Two Sum",
    category: "DSA",
    difficulty: "Easy",
    status: "Completed",
  },
  {
    id: 2,
    question: "Reverse a String",
    category: "DSA",
    difficulty: "Easy",
    status: "Completed",
  },
  {
    id: 3,
    question: "Binary Search",
    category: "DSA",
    difficulty: "Medium",
    status: "In Progress",
  },
  {
    id: 4,
    question: "Git merge vs rebase",
    category: "Git / Tools",
    difficulty: "Medium",
    status: "Pending",
  },
  {
    id: 5,
    question: "Explain REST API",
    category: "Technical",
    difficulty: "Easy",
    status: "Completed",
  },
  {
    id: 6,
    question: "JavaScript Closures",
    category: "Technical",
    difficulty: "Medium",
    status: "In Progress",
  },
  {
    id: 7,
    question: "React useEffect",
    category: "Technical",
    difficulty: "Medium",
    status: "Pending",
  },
];

const defaultActivity = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 4 },
  { day: "Wed", count: 2 },
  { day: "Thu", count: 5 },
  { day: "Fri", count: 3 },
  { day: "Sat", count: 6 },
  { day: "Sun", count: 3 },
];

const getSavedQuestions = () => {
  try {
    const saved = localStorage.getItem("interviewQuestions");

    if (!saved) {
      return initialQuestions;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return initialQuestions;
    }

    return parsed.map((item, index) => ({
      id: item.id ?? Date.now() + index,
      question: item.question || "Untitled Question",
      category: item.category || "Technical",
      difficulty: item.difficulty || "Easy",
      status: item.status || "Pending",
    }));
  } catch {
    return initialQuestions;
  }
};

const getSavedActivity = () => {
  try {
    const saved = localStorage.getItem("interviewActivity");

    if (!saved) {
      return defaultActivity;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return defaultActivity;
    }

    return parsed;
  } catch {
    return defaultActivity;
  }
};

const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function App() {
  const [questions, setQuestions] =
    useState(getSavedQuestions);

  const [activity, setActivity] =
    useState(getSavedActivity);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [difficultyFilter, setDifficultyFilter] =
    useState("All");

  const [showModal, setShowModal] =
    useState(false);

  const [editingQuestion, setEditingQuestion] =
    useState(null);

  const [deleteId, setDeleteId] =
    useState(null);

  const [selectedDay, setSelectedDay] =
    useState(null);

  const [toast, setToast] = useState(null);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "Technical",
    difficulty: "Easy",
  });

  /* ================================
     SAVE DATA
  ================================= */

  useEffect(() => {
    localStorage.setItem(
      "interviewQuestions",
      JSON.stringify(questions)
    );
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(
      "interviewActivity",
      JSON.stringify(activity)
    );
  }, [activity]);

  /* ================================
     TOAST
  ================================= */

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  /* ================================
     STATISTICS
  ================================= */

  const totalQuestions = questions.length;

  const completedQuestions = questions.filter(
    (item) => item.status === "Completed"
  ).length;

  const inProgressQuestions = questions.filter(
    (item) => item.status === "In Progress"
  ).length;

  const pendingQuestions = questions.filter(
    (item) => item.status === "Pending"
  ).length;

  const progress =
    totalQuestions === 0
      ? 0
      : Math.round(
          (completedQuestions / totalQuestions) * 100
        );

  /* ================================
     CATEGORY STATISTICS
  ================================= */

  const categoryStats = useMemo(
    () => ({
      DSA: questions.filter(
        (q) => q.category === "DSA"
      ).length,

      "Git / Tools": questions.filter(
        (q) => q.category === "Git / Tools"
      ).length,

      Technical: questions.filter(
        (q) => q.category === "Technical"
      ).length,
    }),
    [questions]
  );

  /* ================================
     FILTERED QUESTIONS
  ================================= */

  const filteredQuestions = useMemo(() => {
    return questions.filter((item) => {
      const question =
        item.question || "";

      const category =
        item.category || "Technical";

      const status =
        item.status || "Pending";

      const difficulty =
        item.difficulty || "Easy";

      return (
        question
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (categoryFilter === "All" ||
          category === categoryFilter) &&
        (statusFilter === "All" ||
          status === statusFilter) &&
        (difficultyFilter === "All" ||
          difficulty === difficultyFilter)
      );
    });
  }, [
    questions,
    search,
    categoryFilter,
    statusFilter,
    difficultyFilter,
  ]);

  /* ================================
     FILTER SHORTCUTS
  ================================= */

  const filterByStatus = (status) => {
    setSearch("");
    setCategoryFilter("All");
    setDifficultyFilter("All");
    setStatusFilter(status);

    document
      .querySelector(".question-tracker")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const showAllQuestions = () => {
    clearFilters();

    document
      .querySelector(".question-tracker")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  /* ================================
     ADD QUESTION
  ================================= */

  const handleAddQuestion = (e) => {
    e.preventDefault();

    if (!newQuestion.question.trim()) {
      showToast(
        "Please enter a question.",
        "error"
      );
      return;
    }

    const question = {
      id: Date.now(),
      question: newQuestion.question.trim(),
      category: newQuestion.category,
      difficulty: newQuestion.difficulty,
      status: "Pending",
    };

    setQuestions((prev) => [
      ...prev,
      question,
    ]);

    setActivity((prev) =>
      prev.map((item, index) =>
        index === 0
          ? {
              ...item,
              count: item.count + 1,
            }
          : item
      )
    );

    setNewQuestion({
      question: "",
      category: "Technical",
      difficulty: "Easy",
    });

    setShowModal(false);

    showToast(
      "Question added successfully!"
    );
  };

  /* ================================
     EDIT QUESTION
  ================================= */

  const openEditModal = (question) => {
    setEditingQuestion(question);

    setNewQuestion({
      question: question.question,
      category: question.category,
      difficulty: question.difficulty,
    });

    setShowModal(true);
  };

  const handleEditQuestion = (e) => {
    e.preventDefault();

    if (!newQuestion.question.trim()) {
      showToast(
        "Please enter a question.",
        "error"
      );
      return;
    }

    setQuestions((prev) =>
      prev.map((item) =>
        item.id === editingQuestion.id
          ? {
              ...item,
              question:
                newQuestion.question.trim(),
              category:
                newQuestion.category,
              difficulty:
                newQuestion.difficulty,
            }
          : item
      )
    );

    setEditingQuestion(null);

    setNewQuestion({
      question: "",
      category: "Technical",
      difficulty: "Easy",
    });

    setShowModal(false);

    showToast(
      "Question updated successfully!"
    );
  };

  /* ================================
     STATUS CHANGE
  ================================= */

  const handleStatusChange = (
    id,
    newStatus
  ) => {
    const oldQuestion = questions.find(
      (item) => item.id === id
    );

    if (!oldQuestion) return;

    setQuestions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    if (
      oldQuestion.status !== "Completed" &&
      newStatus === "Completed"
    ) {
      setActivity((prev) =>
        prev.map((item, index) =>
          index === 0
            ? {
                ...item,
                count: item.count + 1,
              }
            : item
        )
      );
    }

    if (
      oldQuestion.status === "Completed" &&
      newStatus !== "Completed"
    ) {
      setActivity((prev) =>
        prev.map((item, index) =>
          index === 0
            ? {
                ...item,
                count: Math.max(
                  0,
                  item.count - 1
                ),
              }
            : item
        )
      );
    }

    showToast(
      `Status changed to ${newStatus}`
    );
  };

  /* ================================
     DELETE
  ================================= */

  const confirmDelete = () => {
    if (!deleteId) return;

    setQuestions((prev) =>
      prev.filter(
        (item) => item.id !== deleteId
      )
    );

    setDeleteId(null);

    showToast(
      "Question deleted successfully!"
    );
  };

  /* ================================
     RESET
  ================================= */

  const resetQuestions = () => {
    setQuestions(
      initialQuestions.map((item) => ({
        ...item,
      }))
    );

    setActivity(
      defaultActivity.map((item) => ({
        ...item,
      }))
    );

    clearFilters();

    showToast(
      "Tracker has been reset."
    );
  };

  /* ================================
     CLEAR FILTERS
  ================================= */

  function clearFilters() {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setDifficultyFilter("All");
  }

  /* ================================
     MODAL CLOSE
  ================================= */

  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);

    setNewQuestion({
      question: "",
      category: "Technical",
      difficulty: "Easy",
    });
  };

  /* ================================
     DAILY TARGET
  ================================= */

  const dailyTarget = 5;

  const dailyProgress = Math.min(
    Math.round(
      (completedQuestions / dailyTarget) *
        100
    ),
    100
  );

  const maxActivity = Math.max(
    ...activity.map((item) => item.count),
    1
  );

  return (
    <div className="app">

      {/* ============================
          SIDEBAR
      ============================= */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            ✓
          </div>

          <div>
            <h2>Interview Prep</h2>
            <p>Tracker</p>
          </div>

        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() =>
              document
                .querySelector(
                  ".question-tracker"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <span>☷</span>
            Questions
          </button>

          <button
            className="nav-item"
            onClick={() => {
              setEditingQuestion(null);
              setShowModal(true);
            }}
          >
            <span>＋</span>
            Add Question
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="daily-target">

            <div className="daily-target-top">
              <div>
                <p>Daily Target</p>

                <strong>
                  {completedQuestions} /{" "}
                  {dailyTarget}
                </strong>
              </div>

              <span>
                {dailyProgress}%
              </span>
            </div>

            <div className="target-bar">

              <span
                style={{
                  width: `${dailyProgress}%`,
                }}
              ></span>

            </div>

            <small>
              {dailyProgress >= 100
                ? "Target completed! 🎉"
                : "Keep practicing every day"}
            </small>

          </div>

        </div>

      </aside>

      {/* ============================
          MAIN
      ============================= */}

      <main className="main-content">

        {/* HEADER */}

        <header className="page-header">

          <div>

            <span className="eyebrow">
              WEEKLY PREPARATION
            </span>

            <h1>
              Interview Practice Tracker
            </h1>

            <p>
              Track your interview preparation
              and stay consistent.
            </p>

          </div>

          <div className="header-actions">

            <button
              className="btn btn-secondary"
              onClick={resetQuestions}
            >
              Reset
            </button>

            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingQuestion(null);
                setShowModal(true);
              }}
            >
              + Add Question
            </button>

          </div>

        </header>

        {/* ============================
            STATS
        ============================= */}

        <section className="stats-grid">

          <button
            className={`stat-card stat-button ${
              statusFilter === "All" &&
              !search &&
              categoryFilter === "All" &&
              difficultyFilter === "All"
                ? "selected"
                : ""
            }`}
            onClick={showAllQuestions}
          >

            <div className="stat-icon neutral">
              ▦
            </div>

            <div>
              <span>Total Questions</span>

              <strong>
                {totalQuestions}
              </strong>

              <small>
                Across all categories
              </small>
            </div>

          </button>

          <button
            className={`stat-card stat-button ${
              statusFilter === "Completed"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              filterByStatus("Completed")
            }
          >

            <div className="stat-icon success">
              ✓
            </div>

            <div>
              <span>Completed</span>

              <strong>
                {completedQuestions}
              </strong>

              <small>
                Questions finished
              </small>
            </div>

          </button>

          <button
            className={`stat-card stat-button ${
              statusFilter === "In Progress"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              filterByStatus("In Progress")
            }
          >

            <div className="stat-icon progress-icon">
              ↗
            </div>

            <div>
              <span>In Progress</span>

              <strong>
                {inProgressQuestions}
              </strong>

              <small>
                Currently practicing
              </small>
            </div>

          </button>

          <button
            className={`stat-card stat-button ${
              statusFilter === "Pending"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              filterByStatus("Pending")
            }
          >

            <div className="stat-icon pending">
              ◷
            </div>

            <div>
              <span>Pending</span>

              <strong>
                {pendingQuestions}
              </strong>

              <small>
                Need attention
              </small>
            </div>

          </button>

        </section>

        {/* ============================
            OVERVIEW
        ============================= */}

        <section className="overview-grid">

          {/* PROGRESS */}

          <div className="card progress-card">

            <div className="card-header">

              <div>
                <h2>
                  Overall Progress
                </h2>

                <p>
                  Completion percentage based
                  on stored questions
                </p>
              </div>

              <strong className="progress-number">
                {progress}%
              </strong>

            </div>

            <div className="progress-track">

              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              ></div>

            </div>

            <div className="category-stats">

              <button
                className="category-stat"
                onClick={() => {
                  setCategoryFilter("DSA");
                  setStatusFilter("All");
                  setDifficultyFilter("All");
                  setSearch("");

                  document
                    .querySelector(
                      ".question-tracker"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                <span className="dot purple"></span>

                <div>
                  <strong>
                    {categoryStats.DSA}
                  </strong>

                  <small>DSA</small>
                </div>
              </button>

              <button
                className="category-stat"
                onClick={() => {
                  setCategoryFilter(
                    "Git / Tools"
                  );
                  setStatusFilter("All");
                  setDifficultyFilter("All");
                  setSearch("");

                  document
                    .querySelector(
                      ".question-tracker"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                <span className="dot blue"></span>

                <div>
                  <strong>
                    {
                      categoryStats[
                        "Git / Tools"
                      ]
                    }
                  </strong>

                  <small>
                    Git / Tools
                  </small>
                </div>
              </button>

              <button
                className="category-stat"
                onClick={() => {
                  setCategoryFilter(
                    "Technical"
                  );
                  setStatusFilter("All");
                  setDifficultyFilter("All");
                  setSearch("");

                  document
                    .querySelector(
                      ".question-tracker"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                <span className="dot orange"></span>

                <div>
                  <strong>
                    {
                      categoryStats.Technical
                    }
                  </strong>

                  <small>
                    Technical
                  </small>
                </div>
              </button>

            </div>

          </div>

          {/* ACTIVITY */}

          <div className="card activity-card">

            <div className="card-header">

              <div>
                <h2>
                  Weekly Activity
                </h2>

                <p>
                  Your practice consistency
                </p>
              </div>

              <span className="week-badge">
                This week
              </span>

            </div>

            <div className="activity-chart">

              {activity.map(
                (item) => {

                  const height =
                    Math.max(
                      18,
                      (item.count /
                        maxActivity) *
                        100
                    );

                  return (
                    <button
                      className={`bar-column ${
                        selectedDay ===
                        item.day
                          ? "active"
                          : ""
                      }`}
                      key={item.day}
                      onClick={() =>
                        setSelectedDay(
                          item.day
                        )
                      }
                    >

                      <div className="bar-tooltip">
                        {item.count} questions
                      </div>

                      <div className="bar-wrapper">

                        <div
                          className="activity-bar"
                          style={{
                            height: `${height}%`,
                          }}
                        ></div>

                      </div>

                      <span>
                        {item.day}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

            {selectedDay && (
              <div className="activity-message">
                <strong>
                  {selectedDay}
                </strong>

                {" "}was selected — click another
                day to view its activity.
              </div>
            )}

          </div>

        </section>

        {/* ============================
            QUESTION TRACKER
        ============================= */}

        <section className="card question-tracker">

          <div className="tracker-header">

            <div>
              <h2>
                Question Tracker
              </h2>

              <p>
                Search, filter and manage your
                interview questions.
              </p>
            </div>

            <span className="question-count">
              {filteredQuestions.length} questions
            </span>

          </div>

          {/* FILTERS */}

          <div className="filters">

            <div className="search-box">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All
              </option>

              <option value="DSA">
                DSA
              </option>

              <option value="Git / Tools">
                Git / Tools
              </option>

              <option value="Technical">
                Technical
              </option>

            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Pending">
                Pending
              </option>

            </select>

            <select
              value={difficultyFilter}
              onChange={(e) =>
                setDifficultyFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All
              </option>

              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>

            </select>

          </div>

          {(search ||
            categoryFilter !== "All" ||
            statusFilter !== "All" ||
            difficultyFilter !== "All") && (

            <button
              className="clear-filters"
              onClick={clearFilters}
            >
              Clear filters ×
            </button>

          )}

          {/* QUESTIONS */}

          <div className="questions-list">

            {filteredQuestions.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  🔎
                </div>

                <h3>
                  No questions found
                </h3>

                <p>
                  Try changing your filters
                  or add a new question.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setShowModal(true)
                  }
                >
                  + Add Question
                </button>

              </div>

            ) : (

              filteredQuestions.map(
                (item) => (

                  <div
                    className="question-row"
                    key={item.id}
                  >

                    <div className="question-info">

                      <h3>
                        {item.question}
                      </h3>

                      <div className="question-meta">

                        <span
                          className={`category-badge category-${slugify(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>

                        <span
                          className={`difficulty-badge difficulty-${slugify(
                            item.difficulty
                          )}`}
                        >
                          {item.difficulty}
                        </span>

                      </div>

                    </div>

                    <div className="question-actions">

                      <select
                        className={`status-select status-${slugify(
                          item.status
                        )}`}
                        value={
                          item.status
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            item.id,
                            e.target.value
                          )
                        }
                      >

                        <option value="Pending">
                          Pending
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                      </select>

                      <button
                        className="edit-btn"
                        onClick={() =>
                          openEditModal(
                            item
                          )
                        }
                        title="Edit question"
                      >
                        ✎
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          setDeleteId(
                            item.id
                          )
                        }
                        title="Delete question"
                      >
                        ×
                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </section>

      </main>

      {/* ============================
          ADD / EDIT MODAL
      ============================= */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  {editingQuestion
                    ? "Edit Question"
                    : "Add Question"}
                </h2>

                <p>
                  {editingQuestion
                    ? "Update your interview question."
                    : "Add a new question to your tracker."}
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                editingQuestion
                  ? handleEditQuestion
                  : handleAddQuestion
              }
            >

              <div className="form-group">

                <label>
                  Question
                </label>

                <input
                  type="text"
                  placeholder="e.g. Explain JavaScript closures"
                  value={
                    newQuestion.question
                  }
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      question:
                        e.target.value,
                    })
                  }
                  autoFocus
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    value={
                      newQuestion.category
                    }
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        category:
                          e.target.value,
                      })
                    }
                  >

                    <option value="DSA">
                      DSA
                    </option>

                    <option value="Technical">
                      Technical
                    </option>

                    <option value="Git / Tools">
                      Git / Tools
                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Difficulty
                  </label>

                  <select
                    value={
                      newQuestion.difficulty
                    }
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        difficulty:
                          e.target.value,
                      })
                    }
                  >

                    <option value="Easy">
                      Easy
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Hard">
                      Hard
                    </option>

                  </select>

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingQuestion
                    ? "Save Changes"
                    : "Add Question"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ============================
          DELETE MODAL
      ============================= */}

      {deleteId && (

        <div
          className="modal-overlay"
          onClick={() =>
            setDeleteId(null)
          }
        >

          <div
            className="delete-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="delete-icon">
              !
            </div>

            <h2>
              Delete this question?
            </h2>

            <p>
              This action cannot be undone.
            </p>

            <div className="modal-actions">

              <button
                className="btn btn-secondary"
                onClick={() =>
                  setDeleteId(null)
                }
              >
                Cancel
              </button>

              <button
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ============================
          TOAST
      ============================= */}

      {toast && (

        <div
          className={`toast toast-${toast.type}`}
        >

          <span>
            {toast.type === "error"
              ? "!"
              : "✓"}
          </span>

          {toast.message}

        </div>

      )}

    </div>
  );
}

export default App;