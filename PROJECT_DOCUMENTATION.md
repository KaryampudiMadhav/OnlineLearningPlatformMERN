# 🎓 StudySphere - Complete E-Learning Platform

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation & Setup](#installation--setup)
5. [Project Structure](#project-structure)
6. [Key Features Documentation](#key-features-documentation)
7. [API Documentation](#api-documentation)
8. [AI Integration](#ai-integration)
9. [User Roles & Permissions](#user-roles--permissions)
10. [Database Schema](#database-schema)
11. [Environment Variables](#environment-variables)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## 🌟 Project Overview

**StudySphere** is a modern, full-featured e-learning platform built with the MERN stack (MongoDB, Express, React, Node.js). It leverages AI (Google Gemini) to automatically generate comprehensive courses, quizzes, and learning materials.

### Key Highlights:
- 🤖 **AI-Powered Course Generation** - Automatically create complete courses with modules, lessons, and quizzes
- 🎮 **Gamification System** - XP points, levels, badges, achievements, daily challenges
- 📊 **Analytics Dashboard** - Track progress, performance, and learning patterns
- 🎥 **Video Integration** - YouTube video embedding for lessons
- 📝 **Interactive Quizzes** - Multiple quiz types with instant feedback
- 🏆 **Certification System** - Generate certificates upon course completion
- 💬 **AI Chatbot Support** - Intelligent assistant for student queries
- ⭐ **Review & Rating System** - Course reviews with instructor responses
- 📱 **Responsive Design** - Mobile-first, fully responsive UI

---

## ✨ Features

### For Students:
- ✅ Browse and enroll in courses
- ✅ Watch video lessons with progress tracking
- ✅ Take quizzes and assessments
- ✅ Earn XP, badges, and achievements
- ✅ Download certificates
- ✅ Track learning progress
- ✅ Write course reviews
- ✅ Compete on leaderboard
- ✅ Daily challenges
- ✅ AI chatbot assistance

### For Instructors:
- ✅ Create and manage courses
- ✅ AI-powered course generation
- ✅ Create quizzes and assessments
- ✅ View student enrollment and progress
- ✅ Respond to reviews
- ✅ Analytics dashboard
- ✅ Bulk content import
- ✅ Course templates

### For Admins:
- ✅ User management (students, instructors, admins)
- ✅ Course moderation
- ✅ Platform analytics
- ✅ Content management
- ✅ System configuration
- ✅ Achievement management

---

## 🛠 Technology Stack

### Frontend:
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **React YouTube** - Video player

### Backend:
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Google Gemini AI** - Course generation
- **Multer** - File uploads
- **Cors** - Cross-origin requests

### Development Tools:
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **VS Code** - IDE

---

## 🚀 Installation & Setup

### Prerequisites:
```bash
- Node.js (v16+)
- MongoDB (local or Atlas)
- Git
- Gemini API key
```

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/studysphere.git
cd studysphere
```

### Step 2: Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Required: MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your API URL
# VITE_API_URL=http://localhost:5000
```

### Step 4: Database Setup (Optional)
```bash
cd ../backend
npm run seed
# This creates sample courses and test users
```

### Step 5: Start Development Servers

**Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## 📁 Project Structure

```
studysphere/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── inngest.js           # Inngest configuration (if used)
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── courseController.js  # Course CRUD operations
│   │   ├── userController.js    # User management
│   │   ├── quizController.js    # Quiz management
│   │   ├── enrollmentController.js
│   │   ├── gamificationController.js
│   │   ├── certificateController.js
│   │   ├── reviewController.js
│   │   ├── aiCourseController.js # AI course generation
│   │   ├── supportAiController.js # AI chatbot
│   │   └── contentGenerationController.js
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Course.js            # Course schema
│   │   ├── Enrollment.js        # Enrollment schema
│   │   ├── Quiz.js              # Quiz schema
│   │   ├── QuizAttempt.js       # Quiz attempt records
│   │   ├── Certificate.js       # Certificate schema
│   │   ├── Review.js            # Review schema
│   │   ├── Achievement.js       # Achievement schema
│   │   ├── Badge.js             # Badge schema
│   │   ├── UserProgress.js      # Progress tracking
│   │   └── DailyChallenge.js    # Daily challenges
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── courseRoutes.js      # Course endpoints
│   │   ├── userRoutes.js        # User endpoints
│   │   ├── quizRoutes.js        # Quiz endpoints
│   │   ├── enrollmentRoutes.js
│   │   ├── gamificationRoutes.js
│   │   ├── certificateRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── aiCourseRoutes.js    # AI course generation
│   │   ├── aiSupportRoutes.js   # AI chatbot
│   │   └── contentGenerationRoutes.js
│   ├── middlewares/
│   │   ├── auth.js              # JWT verification
│   │   ├── errorHandler.js      # Error handling
│   │   └── validateRequest.js   # Input validation
│   ├── utils/
│   │   ├── intelligentAIService.js # Main AI service
│   │   ├── aiService.js         # Legacy AI helper
│   │   ├── dynamicQuizService.js # Quiz generation
│   │   └── seedData.js          # Sample data
│   ├── scripts/
│   │   ├── seed.js              # Database seeding
│   │   ├── setup-demo-environment.js # Demo setup
│   │   └── addQuizzesToCourses.js
│   ├── .env.example
│   ├── index.js                 # Express app entry
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Images, icons
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navigation bar
│   │   │   ├── Certificate.jsx  # Certificate component
│   │   │   ├── ReviewList.jsx   # Course reviews
│   │   │   ├── ReviewForm.jsx   # Review submission
│   │   │   ├── SupportChatbot.jsx # AI chatbot
│   │   │   ├── AIModuleGenerator.jsx
│   │   │   └── CourseQuizzes.jsx
│   │   ├── config/
│   │   │   └── api.js           # Axios configuration
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing page
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Signup.jsx       # Signup page (students only)
│   │   │   ├── SecretRegister.jsx # Staff registration
│   │   │   ├── Courses.jsx      # Course listing
│   │   │   ├── CourseDetail.jsx # Course details
│   │   │   ├── CourseLearning.jsx # Course player
│   │   │   ├── Dashboard.jsx    # Student dashboard
│   │   │   ├── InstructorDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CreateCourse.jsx
│   │   │   ├── CreateCourseAI.jsx # AI course creation
│   │   │   ├── EditCourse.jsx
│   │   │   ├── CreateQuiz.jsx
│   │   │   ├── CreateModuleQuiz.jsx
│   │   │   ├── AIQuizGenerator.jsx
│   │   │   ├── QuizPage.jsx     # Quiz taking
│   │   │   ├── QuizResults.jsx  # Quiz results
│   │   │   ├── GamificationDashboard.jsx
│   │   │   ├── DailyChallenges.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── CourseReviews.jsx
│   │   │   ├── ContentGenerationHub.jsx
│   │   │   ├── BulkImport.jsx
│   │   │   └── CourseTemplates.jsx
│   │   ├── store/
│   │   │   ├── authStore.js     # Zustand auth store
│   │   │   └── courseStore.js   # Course state
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
├── README.md
└── PROJECT_DOCUMENTATION.md     # This file
```

---

## 🎯 Key Features Documentation

### 1. Authentication System

**Public Registration** (`/signup`):
- Students can create accounts
- No role selection visible
- Automatic student role assignment

**Staff Registration** (`/secret-register`):
- Instructors and admins only
- Secret code required:
  - Admin: `admin2024secret`
  - Instructor: `instructor2024secret`
- Separate from public signup

**Login** (`/login`):
- Email/password authentication
- JWT token-based sessions
- Role-based redirects

**API Endpoints:**
```
POST /api/auth/register           # Student signup
POST /api/auth/register-privileged # Staff signup
POST /api/auth/login              # Login
GET  /api/auth/me                 # Get current user
PUT  /api/auth/update-profile     # Update profile
```

### 2. AI Course Generation

**Features:**
- Generate complete courses with Gemini AI
- Automatic module and lesson creation
- Real YouTube video URLs
- Educational content (600-900 words per lesson)
- Study resources (MDN, W3Schools, GitHub)
- Quiz generation

**How It Works:**
1. Instructor provides course title and description
2. AI generates course outline (modules)
3. AI creates detailed lessons with videos
4. AI generates quizzes for each module
5. Course is published automatically

**API Endpoints:**
```
POST /api/ai-courses/generate     # Generate full course
POST /api/ai-courses/generate-module # Generate single module
POST /api/ai-courses/generate-outline # Generate course outline
POST /api/ai-courses/generate-quiz # Generate quiz
```

**AI Service Configuration:**
- Model: `gemini-2.0-flash-exp`
- JSON response mode enabled
- Temperature: 0.7
- Max tokens: 8000
- Multi-layer JSON sanitization

### 3. Gamification System

**XP System:**
- Watch lesson: +50 XP
- Complete quiz: +100 XP
- Pass quiz (70%+): +50 bonus
- Complete course: +500 XP
- Daily challenge: +100 XP
- Review course: +25 XP

**Levels:**
- XP thresholds: 0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500...
- Formula: `baseXP * level * (level + 1) / 2`
- Max level: 100

**Achievements:**
- Learning milestones
- Social engagement
- Mastery achievements
- Dedication rewards
- Exploration bonuses

**Badges:**
- Earned from achievements
- Display on profile
- Rarity levels: Common, Rare, Epic, Legendary

**Daily Challenges:**
- New challenge every day
- Various types: watch lessons, complete quizzes, earn XP
- Streak tracking
- Bonus rewards

**API Endpoints:**
```
GET  /api/gamification/progress        # User progress
GET  /api/gamification/achievements    # Achievements
GET  /api/gamification/badges          # User badges
GET  /api/gamification/leaderboard     # Top users
POST /api/gamification/daily-challenge # Complete challenge
```

### 4. Quiz System

**Quiz Types:**
- Course-level quizzes
- Module quizzes
- Lesson quizzes

**Question Types:**
- Multiple choice (single answer)
- Multiple select (multiple answers)
- True/False

**Features:**
- Time limits
- Passing score requirements
- Maximum attempts
- Shuffle questions/options
- Show correct answers (optional)
- Explanations
- Instant feedback

**API Endpoints:**
```
GET  /api/quizzes/course/:courseId   # Get course quizzes
GET  /api/quizzes/:quizId            # Get quiz details
POST /api/quiz-attempts              # Submit quiz attempt
GET  /api/quiz-attempts/my-attempts  # Get user attempts
GET  /api/quiz-attempts/:attemptId   # Get attempt details
```

### 5. Certificate System

**Features:**
- Auto-generated upon course completion
- Unique certificate ID
- Downloadable as PDF (frontend component)
- Includes: student name, course title, completion date, certificate ID

**API Endpoints:**
```
GET /api/certificates/my-certificates    # User certificates
GET /api/certificates/:certificateId     # Get certificate
POST /api/certificates/verify/:certId    # Verify certificate
```

### 6. Review & Rating System

**Features:**
- 1-5 star ratings
- Written reviews
- Instructor responses
- Helpful votes
- Review moderation

**API Endpoints:**
```
POST /api/reviews                    # Create review
GET  /api/reviews/course/:courseId   # Get course reviews
PUT  /api/reviews/:reviewId          # Update review
DELETE /api/reviews/:reviewId        # Delete review
POST /api/reviews/:reviewId/helpful  # Mark helpful
```

### 7. AI Support Chatbot

**Features:**
- Context-aware responses
- Course-specific help
- Learning assistance
- Technical support
- Natural language processing

**API Endpoints:**
```
POST /api/ai-support/chat            # Send message
GET  /api/ai-support/history         # Chat history
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication
Most endpoints require authentication. Include JWT token in headers:
```
Authorization: Bearer <your_jwt_token>
```

### Common Response Format
**Success:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (dev mode only)"
}
```

### Key Endpoints Summary

**Auth:**
- `POST /api/auth/register` - Register student
- `POST /api/auth/register-privileged` - Register staff
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

**Courses:**
- `GET /api/courses` - List courses (with filters)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (instructor/admin)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

**Enrollments:**
- `GET /api/enrollments/my-courses` - User enrollments
- `POST /api/enrollments` - Enroll in course
- `PUT /api/enrollments/:id/progress` - Update progress
- `GET /api/enrollments/:id` - Get enrollment details

**Quizzes:**
- `GET /api/quizzes/course/:courseId` - Course quizzes
- `POST /api/quizzes` - Create quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

**Quiz Attempts:**
- `POST /api/quiz-attempts` - Submit attempt
- `GET /api/quiz-attempts/my-attempts` - User attempts
- `GET /api/quiz-attempts/:id` - Attempt details

**Gamification:**
- `GET /api/gamification/progress` - User progress
- `GET /api/gamification/leaderboard` - Leaderboard
- `GET /api/gamification/achievements` - Achievements
- `POST /api/gamification/daily-challenge` - Complete challenge

**AI Generation:**
- `POST /api/ai-courses/generate` - Generate course
- `POST /api/ai-courses/generate-module` - Generate module
- `POST /api/ai-courses/generate-quiz` - Generate quiz

**Reviews:**
- `GET /api/reviews/course/:courseId` - Course reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

---

## 🤖 AI Integration

### Google Gemini Configuration

**Model:** `gemini-2.0-flash-exp`

**Key Features:**
- JSON response mode
- Temperature control (0.7 for creativity)
- Multi-layer sanitization
- Error recovery
- Rate limit handling

### JSON Sanitization Layers

**Layer 1: Basic Cleanup**
- Remove markdown code blocks
- Extract pure JSON

**Layer 2: Character Sanitization**
- Remove backticks
- Handle template literals `${var}`
- Fix consecutive quotes
- Escape special characters

**Layer 3: Aggressive Sanitization (Fallback)**
- Remove all backslashes
- Replace problematic patterns
- Fix quote examples
- Safe text replacements

### Prompt Engineering Best Practices

**Do:**
- Clear, specific instructions
- Provide context
- Request plain text (no code in JSON strings)
- Specify exact format
- Give examples

**Don't:**
- Include code examples in prompts
- Use special characters in instructions
- Request complex nested structures
- Assume AI knowledge

### Rate Limits
- Free tier: 50 requests/day
- Production: Use paid plan
- Implement caching
- Queue requests

---

## 👥 User Roles & Permissions

### Student
**Access:**
- Browse courses
- Enroll in courses
- Watch lessons
- Take quizzes
- Earn XP/badges
- View certificates
- Write reviews
- Use chatbot

**Restrictions:**
- Cannot create courses
- Cannot create quizzes
- Cannot access instructor/admin dashboards

### Instructor
**Access:**
- All student permissions
- Create/edit/delete own courses
- Create quizzes
- View enrollment analytics
- Respond to reviews
- Access instructor dashboard
- AI course generation

**Restrictions:**
- Cannot manage other instructors
- Cannot access admin features
- Cannot moderate platform content

### Admin
**Access:**
- All instructor permissions
- Manage all users
- Manage all courses
- Platform analytics
- Content moderation
- System configuration
- Achievement management

---

## 🗄 Database Schema

### User
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: student, instructor, admin),
  avatar: String,
  bio: String,
  secretCode: String (select: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Course
```javascript
{
  title: String (required),
  description: String (required),
  instructor: String (required),
  instructorId: ObjectId (ref: User),
  category: String (enum),
  level: String (enum: Beginner, Intermediate, Advanced),
  price: Number,
  originalPrice: Number,
  duration: String,
  image: String,
  rating: Number,
  enrolledStudents: Number,
  isFeatured: Boolean,
  isPublished: Boolean,
  whatYouWillLearn: [String],
  requirements: [String],
  curriculum: [{
    title: String,
    description: String,
    duration: String,
    lessons: [{
      title: String,
      duration: String,
      isPreview: Boolean,
      videoUrl: String,
      content: String,
      resources: [String]
    }]
  }],
  tags: [String],
  language: String,
  metadata: {
    aiGenerated: Boolean,
    generationStatus: String,
    generatedAt: Date,
    quizzesGenerated: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Enrollment
```javascript
{
  user: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  progress: Number (0-100),
  completedLessons: [String],
  startedAt: Date,
  completedAt: Date,
  status: String (enum: active, completed, dropped),
  rating: Number,
  review: String
}
```

### Quiz
```javascript
{
  course: ObjectId (ref: Course),
  moduleIndex: Number,
  moduleTitle: String,
  lessonIndex: Number,
  lessonTitle: String,
  quizType: String (enum: course, module, lesson),
  title: String,
  description: String,
  instructions: String,
  questions: [{
    question: String,
    type: String (enum),
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    explanation: String,
    points: Number
  }],
  duration: Number (minutes),
  passingScore: Number (percentage),
  maxAttempts: Number,
  shuffleQuestions: Boolean,
  shuffleOptions: Boolean,
  showCorrectAnswers: Boolean,
  showExplanations: Boolean,
  isActive: Boolean
}
```

### QuizAttempt
```javascript
{
  user: ObjectId (ref: User),
  quiz: ObjectId (ref: Quiz),
  course: ObjectId (ref: Course),
  answers: [{
    questionId: ObjectId,
    selectedOptions: [Number],
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: Number,
  percentage: Number,
  passed: Boolean,
  timeSpent: Number (seconds),
  startedAt: Date,
  completedAt: Date
}
```

### Achievement
```javascript
{
  name: String,
  description: String,
  icon: String,
  color: String,
  category: String (enum),
  type: String (enum: milestone, challenge, hidden, special),
  requirements: {
    type: String,
    threshold: Number,
    specific: Mixed
  },
  rewards: {
    xp: Number,
    badge: ObjectId (ref: Badge),
    title: String
  },
  rarity: String (enum: common, rare, epic, legendary),
  isActive: Boolean
}
```

### UserProgress
```javascript
{
  user: ObjectId (ref: User),
  xp: Number,
  level: Number,
  streak: Number,
  lastActivityDate: Date,
  achievements: [ObjectId] (ref: Achievement),
  badges: [ObjectId] (ref: Badge),
  completedCourses: [ObjectId] (ref: Course),
  stats: {
    lessonsCompleted: Number,
    quizzesPassed: Number,
    hoursLearned: Number,
    reviewsGiven: Number
  }
}
```

### Certificate
```javascript
{
  user: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  certificateId: String (unique),
  issuedAt: Date,
  verificationHash: String
}
```

### Review
```javascript
{
  user: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  rating: Number (1-5),
  comment: String,
  helpfulVotes: [ObjectId] (ref: User),
  helpfulCount: Number,
  instructorResponse: {
    comment: String,
    respondedAt: Date,
    respondedBy: ObjectId (ref: User)
  },
  status: String (enum: pending, approved, rejected, flagged),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/studysphere
# or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studysphere

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Secret Codes for Staff Registration
ADMIN_SECRET_CODE=admin2024secret
INSTRUCTOR_SECRET_CODE=instructor2024secret

# File Upload (optional)
MAX_FILE_SIZE=5242880
```

### Frontend (.env)
```env
# API URL
VITE_API_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=StudySphere
VITE_APP_VERSION=1.0.0
```

---

## 🚀 Deployment

### Backend Deployment (Heroku Example)

**1. Prepare Backend:**
```bash
# In backend folder, create Procfile
web: node index.js
```

**2. Deploy to Heroku:**
```bash
heroku create your-app-name-backend
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set GEMINI_API_KEY=your_key
heroku config:set ADMIN_SECRET_CODE=your_admin_code
heroku config:set INSTRUCTOR_SECRET_CODE=your_instructor_code
git push heroku main
```

### Frontend Deployment (Vercel Example)

**1. Build Frontend:**
```bash
cd frontend
npm run build
```

**2. Deploy to Vercel:**
```bash
vercel --prod
# Set environment variable:
# VITE_API_URL=https://your-backend.herokuapp.com
```

### Alternative Deployment Options:
- **Backend:** Railway, Render, AWS, DigitalOcean
- **Frontend:** Netlify, AWS S3, GitHub Pages
- **Database:** MongoDB Atlas (recommended)

---

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: MongooseServerSelectionError
```
**Solution:**
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Check network/firewall settings
- For Atlas: whitelist IP address

**2. Gemini AI Rate Limit**
```
Error: 429 Too Many Requests
```
**Solution:**
- Free tier: 50 requests/day
- Wait 24 hours or upgrade plan
- Implement request caching
- Use demo courses temporarily

**3. JWT Token Invalid**
```
Error: 401 Unauthorized
```
**Solution:**
- Clear localStorage
- Re-login
- Check JWT_SECRET matches on backend
- Verify token expiration (7 days default)

**4. CORS Error**
```
Error: Access-Control-Allow-Origin
```
**Solution:**
- Check FRONTEND_URL in backend .env
- Verify backend is running
- Check port numbers match

**5. Gemini JSON Parse Error**
```
Error: Invalid JSON from Gemini
```
**Solution:**
- Already fixed with multi-layer sanitization
- Check prompt engineering
- Verify Gemini API key is valid
- Try reducing content length

**6. Video Not Playing**
```
YouTube iframe blocked
```
**Solution:**
- Ensure valid YouTube URL format
- Check video is not restricted/private
- Verify video ID is 11 characters
- Use https:// protocol

**7. Quiz Not Submitting**
```
Error: Quiz attempt validation failed
```
**Solution:**
- Check all questions answered
- Verify quiz is active
- Check time limit not exceeded
- Check max attempts not reached

**8. Certificate Not Generating**
```
No certificate found
```
**Solution:**
- Complete all lessons (100% progress)
- Pass required quizzes
- Check enrollment status is "completed"
- Verify course completion date

---

## 📊 Performance Optimization

### Backend Optimization:
- ✅ Database indexing on frequently queried fields
- ✅ Populate only required fields
- ✅ Implement pagination (limit: 20)
- ✅ Use lean() for read-only queries
- ✅ Cache frequent queries
- ✅ Compress responses with gzip

### Frontend Optimization:
- ✅ Code splitting with React.lazy()
- ✅ Image optimization (use webp)
- ✅ Minimize bundle size
- ✅ Implement virtual scrolling for long lists
- ✅ Debounce search inputs
- ✅ Cache API responses
- ✅ Lazy load images

---

## 🧪 Testing

### Run Tests (if implemented):
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Manual Testing Checklist:
- [ ] User registration (student, instructor, admin)
- [ ] Login/logout
- [ ] Course browsing and search
- [ ] Course enrollment
- [ ] Video playback
- [ ] Quiz taking and submission
- [ ] Progress tracking
- [ ] XP and achievements
- [ ] Certificate generation
- [ ] AI course generation
- [ ] Review system
- [ ] Chatbot functionality
- [ ] Admin dashboard
- [ ] Instructor dashboard
- [ ] Responsive design (mobile/tablet)

---

## 📝 Development Notes

### Code Quality:
- ESLint configured for code consistency
- Prettier for code formatting
- Git hooks for pre-commit checks (if configured)

### Git Workflow:
```bash
# Feature branch workflow
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request
```

### Environment-Specific Behavior:
- **Development:** Detailed error messages, logging enabled
- **Production:** Generic error messages, logging to file

---

## 🤝 Contributing

### How to Contribute:
1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

### Code Standards:
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation
- Test before submitting

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Credits

**Developed by:** Madhav Karyampudi  
**Repository:** [GitHub - OnlineLearningPlatformMERN](https://github.com/KaryampudiMadhav/OnlineLearningPlatformMERN)

**Technologies:**
- React Team - React library
- Express Team - Express framework
- MongoDB Team - Database
- Google - Gemini AI
- Vercel - Vite build tool
- Tailwind Labs - Tailwind CSS

---

## 📞 Support

For issues, questions, or feature requests:
- 🐛 **Issues:** GitHub Issues
- 📧 **Email:** support@studysphere.com (if configured)
- 💬 **Discussions:** GitHub Discussions

---

**Last Updated:** October 19, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

*This documentation is comprehensive and covers all aspects of the StudySphere e-learning platform. Refer to specific sections as needed for development, deployment, or troubleshooting.*
