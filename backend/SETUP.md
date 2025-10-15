# 🚀 StudySphere Backend Setup Guide

## Option 1: Using MongoDB Atlas (Recommended - Free Cloud Database)

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new project (e.g., "StudySphere")

### Step 2: Create a Cluster

1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region close to you
4. Click "Create Cluster" (takes 3-5 minutes)

### Step 3: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `studysphere_admin`
5. Password: Create a strong password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### Step 4: Whitelist IP Address

1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for development
4. Or add your current IP address
5. Click "Confirm"

### Step 5: Get Connection String

1. Go to **Database** (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://studysphere_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name at the end: `/studysphere`

Final connection string example:
```
mongodb+srv://studysphere_admin:YourPassword123@cluster0.xxxxx.mongodb.net/studysphere?retryWrites=true&w=majority
```

### Step 6: Update .env File

Open `backend/.env` and update:
```env
MONGODB_URI=mongodb+srv://studysphere_admin:YourPassword123@cluster0.xxxxx.mongodb.net/studysphere?retryWrites=true&w=majority
```

---

## Option 2: Using Local MongoDB

### Step 1: Install MongoDB

**Windows:**
1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" setup
4. Install MongoDB as a service
5. Add MongoDB to PATH:
   - Add `C:\Program Files\MongoDB\Server\7.0\bin` to System PATH

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Step 2: Verify Installation

```bash
mongod --version
```

### Step 3: Start MongoDB

**Windows:**
- MongoDB should start automatically as a service
- Or run: `net start MongoDB`

**macOS/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Step 4: Update .env File

Your `.env` should already have:
```env
MONGODB_URI=mongodb://localhost:27017/studysphere
```

---

## 🎯 Quick Start (After MongoDB Setup)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Seed Database
```bash
npm run seed
```

This creates:
- 6 sample courses
- 3 test users (admin, instructor, student)

### 3. Start Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server will run at: `http://localhost:5000`

---

## 🧪 Test the API

### Check Server Status
Open browser: `http://localhost:5000`

You should see:
```json
{
  "success": true,
  "message": "StudySphere API is running! 🚀",
  "version": "1.0.0"
}
```

### Test Login
Use any REST client (Postman, Thunder Client, or curl):

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@studysphere.com","password":"student123"}'
```

### Test Get Courses
```bash
curl http://localhost:5000/api/courses
```

---

## 🔐 Test Credentials

After seeding, you can login with:

**Student Account:**
- Email: `student@studysphere.com`
- Password: `student123`

**Instructor Account:**
- Email: `instructor@studysphere.com`
- Password: `instructor123`

**Admin Account:**
- Email: `admin@studysphere.com`
- Password: `admin123`

---

## 📁 Project Structure Check

Your backend folder should look like:
```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── courseController.js
│   ├── enrollmentController.js
│   └── userController.js
├── middlewares/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validateRequest.js
├── models/
│   ├── User.js
│   ├── Course.js
│   └── Enrollment.js
├── routes/
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── enrollmentRoutes.js
│   └── userRoutes.js
├── scripts/
│   └── seed.js
├── utils/
│   └── seedData.js
├── .env
├── .env.example
├── .gitignore
├── index.js
├── package.json
└── README.md
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `Could not connect to any servers`

**Solution:**
- Check if MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- For Atlas: Check IP whitelist in Network Access
- For local: Start MongoDB service

### Port Already in Use

**Error:** `Port 5000 already in use`

**Solution:**
- Change PORT in `.env` to 5001 or another port
- Or kill the process using port 5000

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### JWT Token Errors

**Error:** `Invalid token`

**Solution:**
- Check if JWT secrets are set in `.env`
- Make sure you're sending: `Authorization: Bearer YOUR_TOKEN`
- Token might be expired (15 min expiry)

### CORS Errors

**Error:** `CORS policy blocked`

**Solution:**
- Update `FRONTEND_URL` in `.env`
- Make sure frontend is running on the specified URL

---

## 🚀 Next Steps

1. ✅ Setup MongoDB (Atlas or Local)
2. ✅ Install dependencies: `npm install`
3. ✅ Update `.env` with MongoDB URI
4. ✅ Seed database: `npm run seed`
5. ✅ Start server: `npm run dev`
6. ✅ Test API endpoints
7. ✅ Connect frontend to backend

---

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Authentication](https://jwt.io/introduction)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)

---

## 💡 Tips

- **Development:** Use `npm run dev` for auto-reload with nodemon
- **Production:** Use `npm start` and a process manager like PM2
- **Testing:** Use Postman or Thunder Client VS Code extension
- **Debugging:** Check terminal logs for detailed error messages
- **Security:** Change JWT secrets before deploying to production

---

## 🎉 You're Ready!

Once MongoDB is connected and seeded, you can:
1. Start the backend server
2. Test all API endpoints
3. Connect your React frontend
4. Build amazing features!

Need help? Check the detailed API documentation in `API_TESTING.md`
