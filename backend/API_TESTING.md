# API Testing Guide for StudySphere

Use these examples with **Postman**, **Thunder Client**, or **curl** to test the API.

## Base URL
```
http://localhost:5000
```

---

## 1️⃣ Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "role": "student",
      "avatar": "..."
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

### Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 2️⃣ Course Endpoints

### Get All Courses (Public)
```http
GET /api/courses
```

**Query Parameters:**
- `category` - Filter by category
- `level` - Filter by level (Beginner, Intermediate, Advanced)
- `search` - Search in title, description, instructor
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sort` - Sort by (popular, rating, newest, price-low, price-high)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `featured` - Filter featured courses (true/false)

**Examples:**
```http
GET /api/courses?category=Web Development
GET /api/courses?sort=popular&limit=6
GET /api/courses?featured=true
GET /api/courses?search=react&minPrice=0&maxPrice=100
```

### Get Single Course (Public)
```http
GET /api/courses/:id
```

### Create Course (Instructor/Admin)
```http
POST /api/courses
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Advanced Node.js Course",
  "description": "Master Node.js and build scalable applications",
  "instructor": "John Doe",
  "category": "Web Development",
  "level": "Advanced",
  "price": 79.99,
  "duration": "30 hours",
  "image": "https://example.com/image.jpg",
  "whatYouWillLearn": [
    "Build REST APIs",
    "Work with databases",
    "Deploy to production"
  ],
  "requirements": [
    "JavaScript knowledge",
    "Basic Node.js understanding"
  ],
  "tags": ["Node.js", "Express", "MongoDB"]
}
```

### Update Course (Instructor/Admin)
```http
PUT /api/courses/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "price": 69.99,
  "description": "Updated description"
}
```

### Delete Course (Instructor/Admin)
```http
DELETE /api/courses/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 3️⃣ Enrollment Endpoints

### Enroll in Course (Protected)
```http
POST /api/enrollments/:courseId
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get My Enrollments (Protected)
```http
GET /api/enrollments/my-courses
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get Single Enrollment (Protected)
```http
GET /api/enrollments/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Update Progress (Protected)
```http
PUT /api/enrollments/:id/progress
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "progress": 45,
  "completedLessons": ["lesson1", "lesson2", "lesson3"]
}
```

### Add Review (Protected)
```http
PUT /api/enrollments/:id/review
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent course! Learned so much."
}
```

### Unenroll from Course (Protected)
```http
DELETE /api/enrollments/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 4️⃣ User Endpoints

### Get Profile (Protected)
```http
GET /api/users/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Update Profile (Protected)
```http
PUT /api/users/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "I love learning new skills!",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Change Password (Protected)
```http
PUT /api/users/change-password
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### Get All Users (Admin Only)
```http
GET /api/users
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

**Query Parameters:**
- `role` - Filter by role (student, instructor, admin)
- `search` - Search by name or email
- `page` - Page number
- `limit` - Results per page

### Get Single User (Admin Only)
```http
GET /api/users/:id
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### Update User (Admin Only)
```http
PUT /api/users/:id
Authorization: Bearer ADMIN_ACCESS_TOKEN
Content-Type: application/json

{
  "role": "instructor",
  "isActive": true
}
```

### Delete User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

---

## 🔐 Test Credentials

After running `npm run seed`:

**Student:**
- Email: `student@studysphere.com`
- Password: `student123`

**Instructor:**
- Email: `instructor@studysphere.com`
- Password: `instructor123`

**Admin:**
- Email: `admin@studysphere.com`
- Password: `admin123`

---

## 📝 Notes

1. **Authorization Header Format:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Access Token Expiry:** 15 minutes
3. **Refresh Token Expiry:** 7 days

4. **Error Response Format:**
   ```json
   {
     "success": false,
     "message": "Error message here"
   }
   ```

5. **Success Response Format:**
   ```json
   {
     "success": true,
     "message": "Success message",
     "data": { ... }
   }
   ```

---

## 🧪 Testing Workflow

1. **Register** a new user or **Login** with test credentials
2. Copy the `accessToken` from the response
3. Use the token in the `Authorization` header for protected routes
4. Test course browsing (no auth needed)
5. Test enrollment (auth required)
6. Test progress tracking and reviews
7. Test admin features with admin credentials

---

## 🚀 cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@studysphere.com","password":"student123"}'
```

### Get Courses
```bash
curl http://localhost:5000/api/courses?featured=true
```

### Enroll in Course
```bash
curl -X POST http://localhost:5000/api/enrollments/COURSE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
