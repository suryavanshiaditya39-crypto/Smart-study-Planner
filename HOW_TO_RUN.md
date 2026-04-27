# 🚀 How to Run Smart Study Planner

Follow these steps to start the project anytime you want.

---

## ✅ Prerequisites (One-time Setup)

Make sure you have these installed on your computer:

1. **Node.js** - Download from https://nodejs.org/ (v16 or higher)
   - To verify: Open PowerShell and run `node --version`

2. **MongoDB** - Download from https://www.mongodb.com/try/download/community
   - To verify: Open PowerShell and run `mongod --version`

3. **Git** (optional) - For version control

---

## 🔧 Step 1: Start MongoDB

MongoDB must be running before the backend can connect to it.

### Option A: Windows (If MongoDB installed as service)
MongoDB automatically starts as a background service. To verify it's running:

```powershell
tasklist | findstr "mongod"
```

You should see `mongod.exe` in the list.

### Option B: Manual Start (If MongoDB not set as service)

Open **PowerShell as Administrator** and run:

```powershell
"C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe"
```
\
Replace `{version}` with your MongoDB version (e.g., `6.0`, `7.0`)

> **Note:** Keep this terminal open. MongoDB is running in the foreground.

---

## 📂 Step 2: Open Project in Terminal

Open **PowerShell** (or Command Prompt) and navigate to the backend folder:

```powershell
cd "c:\Users\AS\OneDrive\Attachments\Desktop\smart-study\smart-study-planner\smart-study-planner\backend"
```

---

## 📦 Step 3: Start the Backend Server

In the **same terminal** (backend folder), run:

```powershell
npm start
```

### Expected Output:
```
✅  Connected to MongoDB
🚀  Server running at http://localhost:5000
```

> **Note:** Keep this terminal open. The server runs in the foreground.

---

## 🌐 Step 4: Open the Frontend in Browser

Once you see the success message, open your web browser and go to:

```
http://localhost:5000
```

You should see the Smart Study Planner app with a form to add tasks.

---

## 📋 Complete Startup Commands (Copy & Paste)

### Terminal 1 - MongoDB (if manual start needed)
```powershell
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

### Terminal 2 - Backend Server
```powershell
cd "c:\Users\AS\OneDrive\Attachments\Desktop\smart-study\smart-study-planner\smart-study-planner\backend"
npm start
```

### Terminal 3 - Open Browser
```powershell
start http://localhost:5000
```

Or just manually open your browser and type: `http://localhost:5000`

---

## ⚠️ Troubleshooting

### "MongoDB connection failed"
- Make sure MongoDB is running (check Task Manager for `mongod.exe`)
- Start MongoDB manually if not running as a service

### "Address already in use (port 5000)"
- Another app is using port 5000
- Either close the other app or change the PORT in `backend/.env` to something like `5001`

### "Cannot find module"
- Run `npm install` in the backend folder to install missing packages

### Backend won't start
1. Check if MongoDB is running
2. Verify MongoDB connection string in `backend/.env`
3. Check that Node.js is installed: `node --version`

---

## 🛑 How to Stop the Project

To properly shut down:

1. **Stop the Backend:** Press `Ctrl + C` in the backend terminal
2. **Stop MongoDB:** Press `Ctrl + C` in the MongoDB terminal (if running manually)
3. **Close Browser:** Just close the tab/window

---

## 📝 Quick Reference Checklist

Every time you want to run the project:

- [ ] Verify MongoDB is running (`tasklist | findstr "mongod"`)
- [ ] Navigate to: `c:\Users\AS\OneDrive\Attachments\Desktop\smart-study\smart-study-planner\smart-study-planner\backend`
- [ ] Run: `npm start`
- [ ] Wait for success message (✅ Connected to MongoDB, 🚀 Server running)
- [ ] Open browser to: `http://localhost:5000`
- [ ] Start adding tasks!

---

## 🔧 Development Mode (Optional)

For automatic server restart on code changes, use:

```powershell
npm run dev
```

(Requires `nodemon` to be installed - it's already in `package.json`)

---

## 📊 Project URLs

| Component | URL |
|-----------|-----|
| Frontend | http://localhost:5000 |
| API Base | http://localhost:5000/tasks |
| API - Get all tasks | http://localhost:5000/tasks |
| API - Create task | POST http://localhost:5000/tasks |
| Database | MongoDB on localhost:27017 |
| Database Name | smart_study_planner |

---

**Questions?** Check the main README.md file or server console for error messages.
