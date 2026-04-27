// app.js — Smart Study Planner
// ─────────────────────────────────────────────
// All frontend logic: API calls, DOM rendering,
// event listeners, search, filter, modals
// ─────────────────────────────────────────────

// ── API Base URL ──
// Works on both localhost (dev) and production (Vercel)
const API_URL = `${window.location.origin}/api/tasks`;

// ── State ──
let currentFilter = "all";      // active filter tab
let currentSearch = "";         // live search string
let deleteTargetId = null;      // ID of task pending deletion

// ── DOM References ──
const taskList       = document.getElementById("taskList");
const loadingSpinner = document.getElementById("loadingSpinner");
const emptyState     = document.getElementById("emptyState");
const addTaskForm    = document.getElementById("addTaskForm");
const searchInput    = document.getElementById("searchInput");
const filterBtns     = document.querySelectorAll(".filter-btn");
const taskCountBadge = document.getElementById("taskCountBadge");
const toggleFormBtn  = document.getElementById("toggleFormBtn");
const taskForm       = document.querySelector(".task-form");

// Stats
const statTotal     = document.getElementById("statTotal");
const statPending   = document.getElementById("statPending");
const statCompleted = document.getElementById("statCompleted");
const progressFill  = document.getElementById("progressFill");
const progressPct   = document.getElementById("progressPct");

// Delete modal
const deleteModal      = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn  = document.getElementById("cancelDeleteBtn");

// Edit modal
const editModal     = document.getElementById("editModal");
const editForm      = document.getElementById("editForm");
const cancelEditBtn = document.getElementById("cancelEditBtn");


// ══════════════════════════════════════════
// API FUNCTIONS (fetch wrappers)
// ══════════════════════════════════════════

/**
 * Fetch all tasks from the backend.
 * Supports optional search string and filter.
 */
async function fetchTasks() {
  showLoading(true);

  try {
    // Build the query string from current state
    const params = new URLSearchParams();
    if (currentSearch) params.append("search", currentSearch);
    if (currentFilter !== "all") params.append("filter", currentFilter);

    const response = await fetch(`${API_URL}?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to fetch tasks");

    // Update stats
    updateStats(data.stats);

    // Render task cards
    renderTasks(data.tasks);
  } catch (error) {
    showToast("Could not connect to server. Is the backend running?", "error");
    console.error("fetchTasks error:", error.message);
    showLoading(false);
    showEmpty(true);
  }
}

/**
 * Create a new task via POST /tasks
 */
async function createTask(taskData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to create task");

    showToast("✅ Task added successfully!", "success");
    addTaskForm.reset();          // Clear the form
    await fetchTasks();           // Refresh the list
  } catch (error) {
    showToast(error.message, "error");
    console.error("createTask error:", error.message);
  }
}

/**
 * Toggle task completion via PUT /tasks/:id { toggle: true }
 */
async function toggleTask(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toggle: true }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    await fetchTasks(); // Refresh to reflect the new state
  } catch (error) {
    showToast(error.message, "error");
    console.error("toggleTask error:", error.message);
  }
}

/**
 * Delete a task via DELETE /tasks/:id
 */
async function deleteTask(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    showToast("🗑️ Task deleted.", "success");
    await fetchTasks();
  } catch (error) {
    showToast(error.message, "error");
    console.error("deleteTask error:", error.message);
  }
}

/**
 * Edit a task via PUT /tasks/:id with full task data
 */
async function editTask(id, taskData) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    showToast("✏️ Task updated!", "success");
    closeEditModal();
    await fetchTasks();
  } catch (error) {
    showToast(error.message, "error");
    console.error("editTask error:", error.message);
  }
}


// ══════════════════════════════════════════
// RENDERING FUNCTIONS
// ══════════════════════════════════════════

/**
 * Render an array of task objects as cards in the DOM.
 */
function renderTasks(tasks) {
  showLoading(false);

  if (!tasks || tasks.length === 0) {
    showEmpty(true);
    taskCountBadge.textContent = "0 tasks";
    return;
  }

  showEmpty(false);
  taskCountBadge.textContent = `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`;

  // Build all card HTML and inject at once (better performance)
  taskList.innerHTML = tasks.map(createTaskCard).join("");

  // Attach event listeners to each card's buttons
  attachCardListeners();
}

/**
 * Build the HTML string for a single task card.
 */
function createTaskCard(task) {
  const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
  const isToday   = isSameDay(new Date(task.dueDate), new Date());

  const dueDateStr = formatDate(task.dueDate);

  const dueDateClass = isOverdue ? "overdue-text"
                     : isToday   ? "today-text"
                     : "";

  const overdueTag = isOverdue ? `<span class="overdue-tag">Overdue</span>` : "";

  const notesHtml = task.notes
    ? `<div class="card-notes">📝 ${escapeHtml(task.notes)}</div>`
    : "";

  return `
    <div
      class="task-card ${task.completed ? "completed" : ""} ${isOverdue ? "overdue" : ""}"
      data-id="${task._id}"
      data-priority="${task.priority}"
    >
      <!-- Header: checkbox + title + action buttons -->
      <div class="card-header">
        <div class="card-title-wrap">
          <!-- Toggle button acts as a visual checkbox -->
          <button
            class="task-toggle"
            data-id="${task._id}"
            title="${task.completed ? "Mark as pending" : "Mark as complete"}"
            aria-label="Toggle task"
          >
            ${task.completed ? "✓" : ""}
          </button>
          <span class="task-title">${escapeHtml(task.title)}</span>
        </div>

        <div class="card-actions">
          <button class="card-btn edit-btn" data-id="${task._id}" title="Edit task">✏️</button>
          <button class="card-btn delete-btn" data-id="${task._id}" title="Delete task">🗑️</button>
        </div>
      </div>

      <!-- Badges: subject + priority -->
      <div class="card-meta">
        <span class="badge badge-subject">${escapeHtml(task.subject)}</span>
        <span class="badge badge-priority-${task.priority}">${capitalize(task.priority)}</span>
      </div>

      <!-- Footer: due date + overdue tag -->
      <div class="card-footer">
        <span class="due-date ${dueDateClass}">📅 ${dueDateStr}</span>
        ${overdueTag}
      </div>

      ${notesHtml}
    </div>
  `;
}

/**
 * Attach click handlers to toggle, edit, and delete buttons on all cards.
 * Called once after renderTasks rebuilds the DOM.
 */
function attachCardListeners() {
  // Toggle buttons
  document.querySelectorAll(".task-toggle").forEach((btn) => {
    btn.addEventListener("click", () => toggleTask(btn.dataset.id));
  });

  // Edit buttons → open the edit modal
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });

  // Delete buttons → open confirmation modal
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => openDeleteModal(btn.dataset.id));
  });
}


// ══════════════════════════════════════════
// STATS
// ══════════════════════════════════════════

function updateStats(stats) {
  if (!stats) return;

  statTotal.textContent     = stats.total;
  statPending.textContent   = stats.pending;
  statCompleted.textContent = stats.completed;

  // Update progress bar
  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  progressFill.style.width = `${pct}%`;
  progressPct.textContent  = `${pct}%`;
}


// ══════════════════════════════════════════
// MODAL HELPERS
// ══════════════════════════════════════════

function openDeleteModal(id) {
  deleteTargetId = id;
  deleteModal.classList.add("open");
}

function closeDeleteModal() {
  deleteTargetId = null;
  deleteModal.classList.remove("open");
}

async function openEditModal(id) {
  // Find the task data from the DOM data attribute
  // (We fetch from the server for accuracy)
  try {
    const response = await fetch(`${API_URL}?`);
    const data = await response.json();
    const task = data.tasks.find((t) => t._id === id);

    if (!task) return showToast("Task not found", "error");

    // Pre-fill the edit form
    document.getElementById("editTaskId").value    = task._id;
    document.getElementById("editTitle").value     = task.title;
    document.getElementById("editSubject").value   = task.subject;
    document.getElementById("editPriority").value  = task.priority;
    document.getElementById("editDueDate").value   = task.dueDate.split("T")[0]; // format as YYYY-MM-DD
    document.getElementById("editNotes").value     = task.notes || "";

    editModal.classList.add("open");
  } catch (err) {
    showToast("Could not load task data", "error");
  }
}

function closeEditModal() {
  editModal.classList.remove("open");
  editForm.reset();
}


// ══════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════

// Add task form submission
addTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title    = document.getElementById("title").value.trim();
  const subject  = document.getElementById("subject").value.trim();
  const priority = document.getElementById("priority").value;
  const dueDate  = document.getElementById("dueDate").value;
  const notes    = document.getElementById("notes").value.trim();

  // Basic client-side validation
  if (!title)   return showToast("Please enter a task title", "error");
  if (!subject) return showToast("Please enter a subject", "error");
  if (!dueDate) return showToast("Please select a due date", "error");

  createTask({ title, subject, priority, dueDate, notes });
});

// Edit form submission
editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id       = document.getElementById("editTaskId").value;
  const title    = document.getElementById("editTitle").value.trim();
  const subject  = document.getElementById("editSubject").value.trim();
  const priority = document.getElementById("editPriority").value;
  const dueDate  = document.getElementById("editDueDate").value;
  const notes    = document.getElementById("editNotes").value.trim();

  if (!title)   return showToast("Title is required", "error");
  if (!subject) return showToast("Subject is required", "error");
  if (!dueDate) return showToast("Due date is required", "error");

  editTask(id, { title, subject, priority, dueDate, notes });
});

// Delete confirmation
confirmDeleteBtn.addEventListener("click", async () => {
  if (deleteTargetId) {
    await deleteTask(deleteTargetId);
    closeDeleteModal();
  }
});
cancelDeleteBtn.addEventListener("click", closeDeleteModal);
cancelEditBtn.addEventListener("click", closeEditModal);

// Close modals when clicking the dark overlay
deleteModal.addEventListener("click", (e) => { if (e.target === deleteModal) closeDeleteModal(); });
editModal.addEventListener("click",   (e) => { if (e.target === editModal)   closeEditModal(); });

// Filter buttons
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    fetchTasks();
  });
});

// Search — debounced so we don't hit the server on every keystroke
let searchDebounce;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    currentSearch = searchInput.value.trim();
    fetchTasks();
  }, 300);
});

// Toggle add-task form collapse
toggleFormBtn.addEventListener("click", () => {
  const isOpen = !taskForm.classList.contains("hidden");
  taskForm.classList.toggle("hidden", isOpen);
  toggleFormBtn.textContent = isOpen ? "+ Expand" : "− Collapse";
  toggleFormBtn.setAttribute("aria-expanded", String(!isOpen));
});


// ══════════════════════════════════════════
// UI STATE HELPERS
// ══════════════════════════════════════════

function showLoading(show) {
  loadingSpinner.classList.toggle("hidden", !show);
  if (show) {
    taskList.innerHTML = "";
    emptyState.classList.add("hidden");
  }
}

function showEmpty(show) {
  emptyState.classList.toggle("hidden", !show);
  taskList.style.display = show ? "none" : "";
}

/**
 * Show a toast notification.
 * @param {string} message - The text to display
 * @param {"success"|"error"} type
 */
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  // Auto-hide after 3 seconds
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}


// ══════════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════════

/** Format an ISO date string to "15 Jan 2025" */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** Check if two Date objects fall on the same calendar day */
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth()    === d2.getMonth()    &&
    d1.getDate()     === d2.getDate()
  );
}

/** Capitalise the first letter of a string */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Escape HTML to prevent XSS from user-entered content */
function escapeHtml(str) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(str).replace(/[&<>"']/g, (c) => map[c]);
}

/** Display today's date in the header */
function setDateDisplay() {
  const el = document.getElementById("dateDisplay");
  if (el) {
    el.textContent = new Date().toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  }
}


// ══════════════════════════════════════════
// INITIALISE
// ══════════════════════════════════════════
setDateDisplay();  // Show today's date in the header
fetchTasks();      // Load tasks from the backend on page load
