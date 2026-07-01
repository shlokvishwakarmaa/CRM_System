# 🚀 LeadCRM - Complete Setup Guide

This guide will help you set up the complete LeadCRM system (Frontend + Backend) from scratch.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** v18 or higher ([Download](https://nodejs.org/))
- [ ] **MongoDB** v6 or higher ([Download](https://www.mongodb.com/try/download/community))
- [ ] **Git** ([Download](https://git-scm.com/downloads))
- [ ] **Code Editor** (VS Code recommended)
- [ ] **Terminal/Command Prompt**

## 🎯 Quick Start (2 Options)

### Option A: Frontend Only (No Backend Setup Required)

Perfect for quick demo and testing. Uses localStorage mock backend.

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
http://localhost:5173

---

### Option B: Full Stack (Frontend + Backend + MongoDB)

Complete production setup with real database.

## 📦 Step 1: Install MongoDB

### Windows:
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run installer (choose "Complete" installation)
3. Check "Install MongoDB as a Service"
4. MongoDB will start automatically

### macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

### Linux (Ubuntu/Debian):
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Verify MongoDB Installation:
```bash
# Check if MongoDB is running
mongosh

# You should see MongoDB shell prompt
# Type 'exit' to quit
```

## 🛠️ Step 2: Setup Backend

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Environment is already configured (.env file exists)
# The default settings work with local MongoDB

# 4. Seed the database with Indian sample data
npm run seed

# You should see:
# ✅ Database seeded successfully!
# 📝 Sample Login Credentials displayed

# 5. Start the backend server
npm run dev

# You should see:
# 🚀 LeadCRM API Server
# 📍 Environment: development
# 🔗 Server running on port 5000
# ✅ MongoDB Connected: localhost
```

**Backend is now running at:** `http://localhost:5000`

**Test the API:**
```bash
# In a new terminal, test health check
curl http://localhost:5000/api/health

# Should return:
# {"success":true,"message":"LeadCRM API is running"}
```

## 🎨 Step 3: Setup Frontend

```bash
# 1. Open a new terminal in project root
cd ..  # (if you're in backend folder)

# 2. Install frontend dependencies
npm install

# 3. Start frontend development server
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
```

**Frontend is now running at:** `http://localhost:5173`

## ✅ Step 4: Verify Complete Setup

1. **Open Browser**: Navigate to `http://localhost:5173`


2. **Test Features**:
   - ✅ Dashboard loads with Indian data
   - ✅ Navigate to Leads page
   - ✅ Create a new lead
   - ✅ View Opportunities Kanban board
   - ✅ Check Support Tickets (as support user)

## 🔄 Daily Development Workflow

### Starting the Application:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Stopping the Application:

Press `Ctrl + C` in both terminals

## 🗃️ Database Management

### View Database:

```bash
# Open MongoDB shell
mongosh

# Switch to LeadCRM database
use leadcrm

# View all collections
show collections

# View users
db.users.find().pretty()

# View leads
db.leads.find().pretty()

# Exit
exit
```

### Reset Database:

```bash
cd backend
npm run seed
```

This will clear all data and reload fresh Indian sample data.

### Backup Database:

```bash
# Create backup
mongodump --db leadcrm --out ./backup

# Restore from backup
mongorestore --db leadcrm ./backup/leadcrm
```

## 🌐 Connecting Frontend to Backend

The frontend is already configured to work with mock data (localStorage). To switch to real backend:

### Edit `src/utils/api.ts`:

Replace mock API calls with Axios calls to backend:

```typescript
// Example: Replace mock login with real API call
export const authApi = {
  async login(email: string, password: string) {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },
  // ... other methods
};
```

## 🔍 Troubleshooting

### Backend won't start:

**Error**: `MongoDB connection error`
```bash
# Solution: Check if MongoDB is running
mongosh

# If not running, start it:
# Windows: Check Services
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Error**: `Port 5000 already in use`
```bash
# Solution: Change PORT in backend/.env
PORT=5001
```

### Frontend won't start:

**Error**: `Port 5173 already in use`
```bash
# Solution: Kill process using port 5173
# Windows: netstat -ano | findstr :5173
# macOS/Linux: lsof -ti:5173 | xargs kill -9
```

**Error**: `Cannot find module`
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
```

### Database issues:

**Clear all data:**
```bash
mongosh
use leadcrm
db.dropDatabase()
exit

# Then reseed
cd backend
npm run seed
```

## 📱 Testing on Mobile Devices

### 1. Find your local IP:

**Windows:**
```bash
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**macOS/Linux:**
```bash
ifconfig
# Look for inet address (e.g., 192.168.1.100)
```

### 2. Update backend CORS:

Edit `backend/.env`:
```env
CORS_ORIGIN=http://192.168.1.100:5173
```

### 3. Access from mobile:

```
http://192.168.1.100:5173
```

## 🚀 Production Deployment

### Backend (Railway/Render):

1. Create account on Railway.app or Render.com
2. Create new project from GitHub
3. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leadcrm
   JWT_SECRET=your_production_secret
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.com
   ```
4. Deploy

### Frontend (Vercel/Netlify):

```bash
# Build frontend
npm run build

# Deploy to Vercel
vercel

# Or deploy to Netlify
netlify deploy --prod
```

### MongoDB Atlas:

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (free tier available)
3. Get connection string
4. Update backend `.env` with Atlas URI

## 📚 Additional Resources

- **Frontend Framework**: [React Docs](https://react.dev/)
- **Backend Framework**: [Express Docs](https://expressjs.com/)
- **Database**: [MongoDB Docs](https://docs.mongodb.com/)
- **Styling**: [Tailwind CSS Docs](https://tailwindcss.com/)

## 🆘 Getting Help

If you encounter issues:

1. Check this SETUP.md guide
2. Read `backend/README.md` for API docs
3. Check browser console for frontend errors
4. Check terminal output for backend errors
5. Verify MongoDB is running: `mongosh`

## 🎓 Learning Path

1. **Day 1**: Setup & run the application
2. **Day 2**: Explore all features with different user roles
3. **Day 3**: Understand the code structure
4. **Day 4**: Make small modifications
5. **Day 5**: Add custom features

## ✨ Success Checklist

- [ ] MongoDB installed and running
- [ ] Backend dependencies installed
- [ ] Database seeded with sample data
- [ ] Backend API running on port 5000
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 5173
- [ ] Successfully logged in
- [ ] Created a test lead
- [ ] Viewed opportunities in Kanban board
- [ ] Tested different user roles

---

**Congratulations! 🎉** You now have a fully functional CRM system running locally!

Next steps:
- Explore all features
- Customize for your business
- Deploy to production
- Add custom integrations


