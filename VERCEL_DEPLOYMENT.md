# Deployment Guide - Smart Study Planner (Vercel)

## Deploy to Vercel

This guide explains how to deploy the Smart Study Planner to Vercel with serverless backend functions.

### Prerequisites
- A Vercel account (https://vercel.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas) for the database
- Your GitHub repository with this project
- Vercel CLI (optional, but recommended)

### Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with a strong password
4. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)
5. Copy this connection string - you'll need it in Step 3
6. **IMPORTANT:** In MongoDB Atlas, go to Network Access and add `0.0.0.0/0` to allow all IPs to connect

### Step 2: Push Latest Code to GitHub

Make sure all changes are committed and pushed:
```bash
git add .
git commit -m "Configure Vercel deployment with serverless API"
git push origin main
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `smart-study-planner` repository from GitHub
5. Click **"Import"**
6. In the project settings:
   - **Framework Preset:** Other
   - **Build Command:** Keep default (or use `npm run build`)
   - **Output Directory:** Leave empty
7. Click **"Environment Variables"** and add:
   - **Key:** `MONGO_URI`
   - **Value:** Your MongoDB Atlas connection string
8. Click **"Deploy"**

#### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. In your project directory, run:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Confirm project name
   - Select scope
   - Confirm settings
   - Select "No" to modify settings

4. Add environment variable:
   ```bash
   vercel env add MONGO_URI
   ```
   - Enter your MongoDB connection string

5. Deploy:
   ```bash
   vercel --prod
   ```

### Step 4: Verify Deployment

Once deployment is complete:
1. You'll get a URL like `https://smart-study-planner.vercel.app`
2. Visit the URL in your browser
3. Test the functionality (add, edit, delete tasks)
4. Check the Vercel logs for any errors

### Testing the Deployment

**Backend API:**
- GET `/api/tasks` - Fetch all tasks
- POST `/api/tasks` - Create new task
- PUT `/api/tasks/[id]` - Update task
- DELETE `/api/tasks/[id]` - Delete task

**Test with curl:**
```bash
# Get all tasks
curl https://your-app.vercel.app/api/tasks

# Create a task
curl -X POST https://your-app.vercel.app/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","subject":"Study","priority":"high","dueDate":"2026-05-01"}'
```

### Environment Variables

| Variable | Value | Required |
|----------|-------|----------|
| MONGO_URI | Your MongoDB connection string | Yes |

### Troubleshooting

**"MongoDB connection failed"**
- Verify your MongoDB connection string is correct
- Ensure your IP is whitelisted in MongoDB Atlas (use 0.0.0.0/0 for development)
- Check that the database exists

**"Frontend not loading"**
- Clear browser cache (Cmd/Ctrl + Shift + R)
- Check Vercel logs for build errors

**"Cannot POST /api/tasks"**
- Check that your MongoDB is properly connected
- Verify the MONGO_URI environment variable is set
- Check Vercel function logs

**"CORS errors"**
- The API already has CORS enabled for all origins
- Check browser console for specific CORS errors

### View Logs

To view deployment logs:
1. Go to Vercel Dashboard
2. Select your project
3. Click **"Deployments"** tab
4. Click on a deployment
5. View logs in the **"Functions"** and **"Logs"** sections

### Updating Your Deployment

After making changes:
1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```
2. Vercel will automatically redeploy on every push to `main`

### Important Notes

- **Cold Starts:** First request may be slower due to serverless cold start (usually 1-2 seconds)
- **Free Tier:** Vercel free tier has fair usage limits but is suitable for development
- **Auto-Deploy:** Every push to `main` triggers an automatic redeploy
- **Rollback:** You can rollback to any previous deployment from the Vercel dashboard

---

Your Smart Study Planner is now live on Vercel! 🚀

Need help? Check [https://vercel.com/docs](https://vercel.com/docs)
