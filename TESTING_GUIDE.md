# Quick Start & Testing Guide

## 🚀 Start the Application

### 1. Start Backend
```bash
cd backend
npm start
```
Backend should run on: http://localhost:5000

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend should run on: http://localhost:5173

---

## ✅ Testing Checklist

### Test 1: Admin Registration & Dashboard
1. ✅ Go to http://localhost:5173/signup
2. ✅ Click "Manage" role button
3. ✅ Fill in:
   - Name: Admin User
   - Email: admin@test.com
   - Password: password123
4. ✅ Click "Create Account"
5. ✅ Should automatically navigate to `/admin/dashboard`
6. ✅ Verify you see:
   - Platform stats (users, courses, enrollments, revenue)
   - User management table
   - Recent courses grid

**Admin Actions to Test:**
- Search for users in the table
- Change a user's role using the dropdown
- Delete a user (test user)

---

### Test 2: Instructor Course Creation
1. ✅ Go to http://localhost:5173/signup
2. ✅ Click "Teach" role button
3. ✅ Fill in:
   - Name: John Instructor
   - Email: instructor@test.com
   - Password: password123
4. ✅ Click "Create Account"
5. ✅ Should navigate to `/instructor/dashboard`
6. ✅ Click "Create New Course" button
7. ✅ Fill in course details:

**Basic Information:**
- Title: "Complete Web Development Bootcamp"
- Description: "Learn HTML, CSS, JavaScript, React, and more"
- Instructor Name: John Instructor
- Duration: "40 hours"
- Category: Web Development
- Level: Beginner
- Price: 49.99
- Image URL: https://images.unsplash.com/photo-1498050108023-c5249f4df085

**Requirements:**
- Basic computer skills
- Willingness to learn

**Learning Outcomes:**
- Build responsive websites
- Master JavaScript fundamentals
- Create React applications

**Curriculum:**
*Section 1:*
- Title: "Introduction to HTML"
- Description: "Learn HTML basics"
- Lesson 1:
  - Title: "HTML Elements"
  - Duration: "15 min"
  - Video URL: https://example.com/video1.mp4
  - Content: "HTML elements are the building blocks..."
  - Check "Free preview lesson"

8. ✅ Click "Create Course"
9. ✅ Should navigate back to instructor dashboard
10. ✅ Verify course appears in "My Courses" section
11. ✅ Click "Edit" button on the course
12. ✅ Verify course data loads correctly
13. ✅ Make a change (e.g., update price)
14. ✅ Click "Save Changes"
15. ✅ Verify changes are saved

---

### Test 3: Student Enrollment & Progress
1. ✅ Go to http://localhost:5173/signup
2. ✅ Click "Learn" role button (default)
3. ✅ Fill in:
   - Name: Jane Student
   - Email: student@test.com
   - Password: password123
4. ✅ Click "Create Account"
5. ✅ Should navigate to `/dashboard`
6. ✅ Verify empty state shows "No courses yet"
7. ✅ Click "Browse More" or "Explore Courses"
8. ✅ Should navigate to `/courses`
9. ✅ Find the "Complete Web Development Bootcamp" course
10. ✅ Click on the course card
11. ✅ On course detail page, click "Enroll Now"
12. ✅ Should see success message
13. ✅ Navigate to `/dashboard`
14. ✅ Verify:
    - Enrolled Courses count increased to 1
    - Course appears in "My Courses" section
    - Progress bar shows 0%
    - Course thumbnail displays
    - Course title and details visible

---

### Test 4: Login & Navigation
1. ✅ Logout from current account
2. ✅ Go to http://localhost:5173/login
3. ✅ Login as admin@test.com
4. ✅ Verify redirects to `/admin/dashboard`
5. ✅ Logout and login as instructor@test.com
6. ✅ Verify redirects to `/instructor/dashboard`
7. ✅ Logout and login as student@test.com
8. ✅ Verify redirects to `/dashboard`

---

### Test 5: Role-Based Access Control
1. ✅ While logged in as **Student**:
   - Try visiting `/instructor/create-course` → Should redirect to `/dashboard`
   - Try visiting `/admin/dashboard` → Should redirect to `/dashboard`
   
2. ✅ While logged in as **Instructor**:
   - Can access `/instructor/dashboard` ✓
   - Can access `/instructor/create-course` ✓
   - Try visiting `/admin/dashboard` → Should redirect to `/dashboard`
   
3. ✅ While logged in as **Admin**:
   - Can access `/admin/dashboard` ✓
   - Can access `/instructor/dashboard` ✓
   - Can access `/instructor/create-course` ✓

---

### Test 6: Navbar & UI
1. ✅ Login as any role
2. ✅ Verify navbar shows:
   - Role badge next to username
   - Correct dashboard link for the role
   - Logout button works
3. ✅ Test responsive design:
   - Resize browser window
   - Mobile menu should appear on small screens
   - All elements should be readable

---

### Test 7: Landing Page
1. ✅ Logout (or open incognito window)
2. ✅ Go to http://localhost:5173
3. ✅ Verify landing page shows:
   - Education quotes rotating every 5 seconds
   - Animated background blobs
   - Stats section (50K+ students, etc.)
   - Features section (6 cards)
   - CTA buttons work
4. ✅ Click "Explore Courses" → Should go to `/courses`
5. ✅ Click "Get Started Free" → Should go to `/signup`

---

## 🐛 Common Issues & Solutions

### Issue 1: Login not redirecting
**Problem:** After login, staying on login page  
**Solution:** ✅ Already fixed! The authStore now returns user data correctly

### Issue 2: 401 Unauthorized errors
**Problem:** `/api/auth/me` returning 401  
**Solution:** ✅ Already fixed! App.jsx only calls getMe when user data is missing

### Issue 3: Course creation fails
**Problem:** Course not saving  
**Solution:** Check backend is running and MongoDB is connected

### Issue 4: Enrollments not showing
**Problem:** Student dashboard shows no courses after enrollment  
**Solution:** ✅ Already fixed! Backend returns `enrollments` array correctly

---

## 📊 Expected Console Logs

### On Login:
```
Login response: { token: "eyJhbGciOiJIUzI1NiIsIn...", user: {id: "...", name: "...", email: "...", role: "student"} }
Login result: { success: true, user: {...} }
Navigating to dashboard for role: student
```

### On Course Creation:
```
Course created successfully
Navigating to /instructor/dashboard
```

### On Enrollment:
```
Enrolled successfully
Fetching enrollments...
Enrollments: [{course: {...}, progress: 0}]
```

---

## 🎯 Success Criteria

✅ Admin can register and access admin dashboard  
✅ Admin can manage users (view, update roles, delete)  
✅ Instructor can create courses with full curriculum  
✅ Instructor can edit existing courses  
✅ Instructor can delete courses  
✅ Student can browse and enroll in courses  
✅ Student can see progress tracking on dashboard  
✅ All roles navigate to correct dashboards after login  
✅ Protected routes block unauthorized access  
✅ Landing page displays with rotating quotes  
✅ Navbar shows role badges and correct links  

---

## 📝 Sample Test Data

### Test Accounts to Create:
```javascript
// Admin
{ name: "Admin User", email: "admin@test.com", password: "password123", role: "admin" }

// Instructor
{ name: "John Instructor", email: "instructor@test.com", password: "password123", role: "instructor" }

// Student
{ name: "Jane Student", email: "student@test.com", password: "password123", role: "student" }
```

### Test Course Data:
```javascript
{
  title: "Complete Web Development Bootcamp",
  description: "Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB",
  instructor: "John Instructor",
  category: "Web Development",
  level: "Beginner",
  price: 49.99,
  originalPrice: 99.99,
  duration: "40 hours",
  requirements: ["Basic computer skills", "Willingness to learn"],
  whatYouWillLearn: ["Build websites", "Master JavaScript", "Create React apps"],
  curriculum: [
    {
      title: "Introduction to HTML",
      description: "HTML basics",
      lessons: [
        { title: "HTML Elements", duration: "15 min", content: "Learn HTML tags" }
      ]
    }
  ]
}
```

---

## 🎉 You're All Set!

Your E-Learning Platform is now fully functional with:
- ✅ 3 role-based dashboards
- ✅ Complete course management system
- ✅ Student progress tracking
- ✅ Beautiful UI with animations
- ✅ Role-based access control
- ✅ Full CRUD operations

**Happy Testing! 🚀**
