# StudySphere Backend API

Complete backend API for StudySphere Online Learning Platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- ✅ User Authentication (Register, Login, Logout)
- ✅ JWT-based Authentication (Access + Refresh Tokens)
- ✅ Role-based Authorization (Student, Instructor, Admin)
- ✅ Course Management (CRUD operations)
- ✅ Course Enrollments
- ✅ Progress Tracking
- ✅ Course Reviews & Ratings
- ✅ User Profile Management
- ✅ Protected Routes
- ✅ Error Handling Middleware
- ✅ Request Validation
- ✅ MongoDB with Mongoose

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     ```env
     MONGODB_URI=mongodb://localhost:27017/studysphere
     JWT_ACCESS_SECRET=your_secret_key
     JWT_REFRESH_SECRET=your_refresh_secret_key
     PORT=5000
     FRONTEND_URL=http://localhost:5173
     ```

3. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── courseController.js  # Course management
│   ├── enrollmentController.js # Enrollment logic
│   └── userController.js    # User management
├── middlewares/
│   ├── auth.js             # JWT authentication
│   ├── errorHandler.js     # Error handling
│   └── validateRequest.js  # Request validation
├── models/
│   ├── User.js             # User schema
│   ├── Course.js           # Course schema
│   └── Enrollment.js       # Enrollment schema
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── courseRoutes.js     # Course endpoints
│   ├── enrollmentRoutes.js # Enrollment endpoints
│   └── userRoutes.js       # User endpoints
├── scripts/
│   └── seed.js             # Database seeder
├── utils/
│   └── seedData.js         # Seed data
├── .env                    # Environment variables
├── .env.example           # Environment template
└── index.js               # Entry point
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user (Protected)
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update profile (Protected)
- `PUT /api/users/change-password` - Change password (Protected)
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get single user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Courses
- `GET /api/courses` - Get all courses (Public)
- `GET /api/courses/:id` - Get single course (Public)
- `POST /api/courses` - Create course (Instructor/Admin)
- `PUT /api/courses/:id` - Update course (Instructor/Admin)
- `DELETE /api/courses/:id` - Delete course (Instructor/Admin)
- `GET /api/courses/admin/stats` - Get course stats (Admin)

### Enrollments
- `POST /api/enrollments/:courseId` - Enroll in course (Protected)
- `GET /api/enrollments/my-courses` - Get my enrollments (Protected)
- `GET /api/enrollments/:id` - Get enrollment details (Protected)
- `PUT /api/enrollments/:id/progress` - Update progress (Protected)
- `PUT /api/enrollments/:id/review` - Add review (Protected)
- `DELETE /api/enrollments/:id` - Unenroll from course (Protected)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** to receive:
   - `accessToken` (expires in 15 minutes)
   - `refreshToken` (expires in 7 days)

2. **Include the access token** in protected requests:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

3. **Refresh the token** when it expires using the refresh token.

## 👥 Test Users

After running `npm run seed`, you can use these test accounts:

**Admin:**
- Email: admin@studysphere.com
- Password: admin123

**Instructor:**
- Email: instructor@studysphere.com
- Password: instructor123

**Student:**
- Email: student@studysphere.com
- Password: student123

## 🎯 Example Requests

### Register User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Courses
```bash
GET http://localhost:5000/api/courses?category=Web Development&sort=popular
```

### Enroll in Course
```bash
POST http://localhost:5000/api/enrollments/COURSE_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 🛡️ Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- Input validation
- Error handling
- CORS protection
- Environment variables for secrets

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use a secure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
3. Use MongoDB Atlas or a production MongoDB server
4. Enable HTTPS
5. Set proper CORS origins
6. Use a process manager like PM2

## 📝 License

ISC

## 👨‍💻 Author

Your Name

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
