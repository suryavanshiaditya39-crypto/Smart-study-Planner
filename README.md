# 📚 Smart Study Planner

A full-stack task management app built with **HTML/CSS/Vanilla JS** frontend and a **Node.js + Express + MongoDB** backend.

---

## 📁 Project Structure

```
smart-study-planner/
├── backend/
│   ├── models/
│   │   └── Task.js          ← Mongoose schema
│   ├── routes/
│   │   └── tasks.js         ← REST API routes
│   ├── server.js            ← Express entry point
│   ├── .env                 ← Environment variables
│   └── package.json
│
└── frontend/
    ├── index.html           ← App HTML
    ├── style.css            ← All styles
    └── app.js               ← Fetch API + DOM logic
```

---

## ✅ Features

| Feature | Details |
|---|---|
| Add Task | Title, Subject, Priority, Due Date, Notes |
| Edit Task | Full edit with modal dialog |
| Delete Task | With confirmation dialog |
| Toggle Complete | Click checkbox to mark done/pending |
| Search | Searches title and subject (debounced) |
| Filter | All / Pending / Completed |
| Statistics | Total, Completed, Pending + progress bar |
| Overdue Highlight | Red border + "Overdue" tag on past-due tasks |
| MongoDB Storage | All data persisted in MongoDB (no localStorage) |

---

## 🚀 How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **OR** a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

---

### Step 1 — Start MongoDB (local)

```bash
# macOS / Linux
mongod

# Windows (run as Administrator)
"C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe"
```

> **Using Atlas?** Paste your connection string into `backend/.env` (see Step 2).

---

### Step 2 — Configure Environment

Open `backend/.env` and set your MongoDB URI:

```env
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/smart_study_planner

# MongoDB Atlas (replace with your actual URI)
# MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/smart_study_planner

PORT=5000
```

---

### Step 3 — Install Dependencies

```bash
cd backend
npm install
```

---

### Step 4 — Start the Server

```bash
# Normal start
npm start

# OR with auto-reload during development
npm run dev
```

You should see:
```
✅  Connected to MongoDB
🚀  Server running at http://localhost:5000
```

---

### Step 5 — Open the App

Open your browser and go to:

```
http://localhost:5000
```

The Express server automatically serves the frontend files from the `/frontend` folder.

---

## 🔌 REST API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/tasks` | Get all tasks (supports `?search=` and `?filter=`) |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Toggle complete OR edit a task |
| DELETE | `/tasks/:id` | Delete a task |

### Sample POST body
```json
{
  "title": "Revise Chapter 5",
  "subject": "Physics",
  "priority": "high",
  "dueDate": "2025-02-15",
  "notes": "Focus on electromagnetism"
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (custom properties, grid, flexbox), Vanilla JS (ES6+) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Fonts | Syne + DM Sans (Google Fonts) |

---

## 🎨 Design Highlights

- **Dark theme** with amber/orange accent system
- **Priority color coding** — green (low), amber (medium), red (high)
- **Overdue highlighting** — red border + badge on past-due tasks
- **Responsive layout** — sidebar collapses on mobile
- **Smooth animations** — card entrance, toast notifications, modal transitions
- **Custom scrollbar** styling
