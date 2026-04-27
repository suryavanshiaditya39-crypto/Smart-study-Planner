# Deployment Guide - Smart Study Planner

## Deploy to Render

This guide explains how to deploy the Smart Study Planner to Render.

### Prerequisites
- A Render account (https://render.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas) for the database
- Your GitHub repository with this project

### Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with a strong password
4. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)
5. Copy this connection string - you'll need it in Step 3

### Step 2: Push Latest Code to GitHub

Make sure all changes are committed and pushed:
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### Step 3: Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account if not already connected
4. Select your `smart-study-planner` repository
5. Render will automatically detect the `render.yaml` file
6. Add the environment variable:
   - **Key:** `MONGO_URI`
   - **Value:** Your MongoDB connection string from Step 1
7. Click **"Create Blueprint"**
8. Wait for deployment to complete

#### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select the repository
4. Configure the service:
   - **Name:** smart-study-planner
   - **Runtime:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
5. Add environment variables:
   - **MONGO_URI:** Your MongoDB connection string
   - **NODE_ENV:** `production`
6. Click **"Create Web Service"**
7. Render will automatically deploy your app

### Step 4: Verify Deployment

Once deployment is complete:
1. You'll get a URL like `https://smart-study-planner.onrender.com`
2. Visit the URL in your browser
3. Test the functionality (add, edit, delete tasks)
4. Check that the backend and frontend are communicating

### Troubleshooting

**"MongoDB connection failed"**
- Verify your MongoDB connection string is correct
- Ensure your IP address is whitelisted in MongoDB Atlas (or allow all IPs: 0.0.0.0/0)

**"Frontend not loading"**
- Check that the backend server is running properly
- Clear browser cache and reload

**"Tasks API not working"**
- Check Render logs for errors
- Verify MongoDB is properly connected
- Check that API routes are working

### View Logs

To view deployment and server logs:
1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab

### Important Notes

- The free tier on Render may have limitations. For production, consider upgrading.
- MongoDB Atlas has a free tier that includes 512MB storage
- Your app will go to sleep after 15 minutes of inactivity on free tier (deploy will resume on next request)

### Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| MONGO_URI | Your MongoDB connection string | Yes |
| NODE_ENV | `production` | No |
| PORT | `10000` | Auto-set by Render |

---

Your Smart Study Planner is now live on Render! 🚀
