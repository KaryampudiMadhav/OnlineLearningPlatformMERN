# 🎓 StudySphere - AI-Powered Online Learning Platform

<div align="center">

![StudySphere Logo](https://img.shields.io/badge/StudySphere-AI%20Powered%20Learning-blue?style=for-the-badge&logo=graduation-cap)

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat&logo=express)](https://expressjs.com/)
[![AI](https://img.shields.io/badge/AI-Gemini%20%2B%20OpenAI-FF6B6B?style=flat&logo=openai)](https://openai.com/)

**A comprehensive MERN stack e-learning platform with AI-powered course generation, gamification, and smart learning features.**

[🚀 Demo](#demo) • [📋 Features](#features) • [⚡ Quick Start](#quick-start) • [🛠️ Installation](#installation) • [📖 API Docs](#api-documentation)

</div>

---

## 🌟 Overview

StudySphere is a modern, full-stack online learning platform that revolutionizes education through AI-powered course generation, comprehensive gamification, and intelligent learning analytics. Built with the MERN stack and integrated with cutting-edge AI technologies.

### 🎯 Key Highlights

- 🤖 **AI Course Generation** - Generate complete courses from skills using Google Gemini AI
- 🏆 **Advanced Gamification** - XP system, badges, achievements, daily challenges
- 📜 **Digital Certificates** - Secure, verifiable certificates with QR codes
- 💬 **AI Support Chatbot** - OpenAI-powered intelligent assistance
- 📊 **Learning Analytics** - Comprehensive progress tracking and insights
- 🎯 **Smart Quizzes** - AI-generated quizzes with multiple difficulty levels
- 📱 **Responsive Design** - Mobile-first approach with modern UI

---

## 🔥 Features

### 🤖 AI-Powered Features
- **Smart Course Creation**: Generate complete courses from skill arrays using Google Gemini AI
- **Intelligent Chatbot**: OpenAI-powered support assistant for learners
- **Dynamic Quiz Generation**: AI creates comprehensive quizzes for each module
- **Adaptive Learning Paths**: Personalized course recommendations

### 🏆 Gamification System
- **XP & Leveling**: Earn experience points and level up through learning
- **Badge Collection**: 15+ unique badges across different categories
- **Achievement System**: Progressive goals with increasing rewards
- **Daily Challenges**: 7 different types of daily learning challenges
- **Leaderboards**: Compete with other learners across multiple metrics

### 📚 Learning Management
- **Course Management**: Create, edit, and manage comprehensive courses
- **Progress Tracking**: Detailed learning analytics and progress visualization
- **Quiz System**: Multi-type questions with automatic grading
- **Review System**: Student reviews and ratings for courses
- **Enrollment Management**: Easy course enrollment and management

### 📜 Certification
- **Digital Certificates**: Auto-generated certificates upon course completion
- **QR Code Verification**: Secure certificate verification system
- **Grade Calculation**: Performance-based grading (A+ to C)
- **Portfolio Management**: Centralized certificate collection

### 👥 User Management
- **Role-Based Access**: Student, Instructor, and Admin roles
- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Profile Management**: Comprehensive user profiles with analytics
- **Dashboard Analytics**: Role-specific dashboards with insights

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern React with hooks and latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Zustand** - Lightweight state management
- **React Router DOM v7** - Client-side routing
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime environment
- **Express 5.x** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing and security
- **Google Generative AI** - Gemini AI integration
- **OpenAI API** - GPT-powered chatbot
- **Multer** - File upload handling

### AI & Integrations
- **Google Gemini AI** - Course and content generation
- **OpenAI GPT** - Intelligent chatbot assistance
- **jsPDF** - PDF certificate generation
- **QR Code** - Certificate verification

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- Git installed

### 1. Clone the Repository
```bash
git clone https://github.com/KaryampudiMadhav/OnlineLearningPlatformMERN.git
cd OnlineLearningPlatformMERN
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Add your environment variables to .env
MONGODB_URI=mongodb://localhost:27017/studysphere
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Create frontend environment file
cp .env.example .env

# Add your frontend environment variables
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_AI_ENDPOINT=http://localhost:5000/api/ai-support/chat
```

### 4. Start the Application
```bash
# Start backend (from root directory)
npm run dev

# Start frontend (from frontend directory)
cd frontend
npm run dev
```

### 5. Seed Initial Data
```bash
# Create default users and sample courses
npm run seed
```

🎉 **You're ready!** Visit `http://localhost:5173` to access StudySphere.

---

## 🛠️ Installation

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/studysphere

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-token-secret-different-from-jwt

# AI API Keys
GEMINI_API_KEY=your-google-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS and certificates)
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_AI_ENDPOINT=http://localhost:5000/api/ai-support/chat
```

### Database Setup

1. **Install MongoDB**: Follow the [official MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB**:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

3. **Verify Connection**: Ensure MongoDB is running on `mongodb://localhost:27017`

### API Keys Setup

#### Google Gemini AI API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your `.env` file as `GEMINI_API_KEY`

#### OpenAI API
1. Visit [OpenAI API Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to your `.env` file as `OPENAI_API_KEY`

---

## 📖 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |

### Course Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses (with filters) |
| GET | `/api/courses/:id` | Get course by ID |
| POST | `/api/courses` | Create new course (Instructor/Admin) |
| PUT | `/api/courses/:id` | Update course (Instructor/Admin) |
| DELETE | `/api/courses/:id` | Delete course (Instructor/Admin) |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai-courses/generate-skills` | Generate course from skills |
| POST | `/api/ai-courses/analyze-skills` | Analyze skills requirements |
| POST | `/api/ai-support/chat` | AI chatbot conversation |

### Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gamification/progress` | Get user progress |
| GET | `/api/gamification/leaderboard` | Get leaderboards |
| GET | `/api/gamification/badges` | Get all badges |
| GET | `/api/gamification/achievements` | Get achievements |
| POST | `/api/gamification/award-xp` | Award XP to user |

### Quiz System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes/course/:courseId` | Get course quizzes |
| POST | `/api/quizzes/:id/start` | Start quiz attempt |
| POST | `/api/quizzes/:id/submit` | Submit quiz answers |
| GET | `/api/quizzes/attempt/:attemptId` | Get quiz results |

### Certificates
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/certificates/generate/:courseId` | Generate certificate |
| GET | `/api/certificates/my-certificates` | Get user certificates |
| GET | `/api/certificates/verify/:certificateId` | Verify certificate |

---

## 🗂️ Project Structure

```
StudySphere/
├── 📁 backend/                 # Backend API server
│   ├── 📁 controllers/         # Route controllers
│   ├── 📁 models/             # MongoDB models
│   ├── 📁 routes/             # API routes
│   ├── 📁 middlewares/        # Custom middlewares
│   ├── 📁 utils/              # Utility functions
│   ├── 📁 scripts/            # Database seeds
│   └── 📄 index.js            # Server entry point
├── 📁 frontend/               # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable components
│   │   ├── 📁 pages/          # Page components
│   │   ├── 📁 store/          # Zustand stores
│   │   ├── 📁 config/         # Configuration files
│   │   └── 📄 App.jsx         # Main App component
│   ├── 📁 public/             # Static assets
│   └── 📄 package.json        # Frontend dependencies
├── 📄 package.json            # Backend dependencies
├── 📄 README.md               # Project documentation
└── 📄 .env.example            # Environment template
```

---

## 👥 User Roles & Permissions

### 🎓 Student Role
- Browse and search courses
- Enroll in courses and track progress
- Take quizzes and earn certificates
- Write reviews and ratings
- Participate in gamification (XP, badges, challenges)
- Use AI chatbot for support

### 👨‍🏫 Instructor Role
- All student features
- Create and manage courses
- Generate AI-powered course content
- View course analytics and student progress
- Manage course pricing and settings

### 👨‍💼 Admin Role
- All instructor features
- Platform-wide analytics and reporting
- User management and role assignment
- Course approval and content moderation
- System configuration and maintenance

---

## 🎮 Gamification System

### Experience Points (XP)
- **Course Completion**: 100-500 XP
- **Quiz Success**: 25-200 XP
- **Daily Challenges**: 50-250 XP
- **Review Writing**: 30-100 XP
- **Badge Earning**: 50-1000 XP

### Badge Categories
- 🎓 **Course Badges**: First Steps, Knowledge Seeker, Learning Master
- 📝 **Quiz Badges**: Quiz Novice, Quiz Expert, Perfect Score
- ⭐ **Review Badges**: Reviewer, Critic
- 🔥 **Streak Badges**: Consistent Learner, Dedication, Unstoppable
- 🏆 **Achievement Badges**: Level milestones, XP milestones

### Daily Challenges
- **Quiz Master**: Complete quizzes with high scores
- **Knowledge Seeker**: Study for specified duration
- **Perfect Score**: Achieve 100% on any quiz
- **Consistency King**: Maintain learning streak
- **Review Guru**: Write helpful reviews
- **Course Completion**: Complete full courses
- **Community Helper**: Participate in discussions

---

## 🎯 Default Users (After Seeding)

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Student | `student@example.com` | `password123` | Regular student account |
| Instructor | `instructor@example.com` | `password123` | Course creator account |
| Admin | `admin@example.com` | `password123` | Platform administrator |

---

## 🚀 Deployment

### Development
```bash
# Backend
npm run dev

# Frontend
cd frontend && npm run dev
```

### Production Build
```bash
# Frontend build
cd frontend
npm run build

# Backend (production)
npm start
```

### Environment Setup for Production
- Set `NODE_ENV=production`
- Configure production MongoDB URI
- Set secure JWT secrets
- Configure CORS for production domain
- Set up SSL certificates

---

## 🧪 Testing

### Manual Testing Steps

1. **Authentication Flow**
   ```bash
   # Test user registration and login
   # Verify JWT token functionality
   # Test role-based access control
   ```

2. **Course Management**
   ```bash
   # Create courses as instructor
   # Enroll as student
   # Test progress tracking
   ```

3. **AI Features**
   ```bash
   # Test AI course generation
   # Verify chatbot functionality
   # Check quiz generation
   ```

4. **Gamification**
   ```bash
   # Complete courses and earn XP
   # Unlock badges and achievements
   # Test daily challenges
   ```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Update documentation for new features
- Test thoroughly before submitting PR

---

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```bash
# Ensure MongoDB is running
sudo systemctl start mongod  # Linux
net start MongoDB            # Windows
```

**2. AI API Errors**
```bash
# Verify API keys in .env file
# Check API key permissions and quotas
# Ensure internet connectivity
```

**3. Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**4. CORS Issues**
```bash
# Check backend CORS configuration
# Verify frontend API URL in .env
```

### Getting Help
- 📧 Check the issues section on GitHub
- 💬 Contact maintainers
- 📖 Review documentation thoroughly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT API integration
- **Google** for Gemini AI capabilities
- **MongoDB** for robust database solutions
- **React Team** for the amazing frontend framework
- **Tailwind CSS** for beautiful, responsive designs
- **Community** for feedback and contributions

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/KaryampudiMadhav/OnlineLearningPlatformMERN?style=social)
![GitHub forks](https://img.shields.io/github/forks/KaryampudiMadhav/OnlineLearningPlatformMERN?style=social)
![GitHub issues](https://img.shields.io/github/issues/KaryampudiMadhav/OnlineLearningPlatformMERN)
![GitHub license](https://img.shields.io/github/license/KaryampudiMadhav/OnlineLearningPlatformMERN)

---

<div align="center">

**Built with ❤️ by [Karyampudi Madhav](https://github.com/KaryampudiMadhav)**

*Making education accessible and engaging through AI-powered technology*

</div>