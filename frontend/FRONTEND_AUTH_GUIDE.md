# StudySphere Frontend - Authentication & Integration Guide 🎓

## Overview

The frontend is now **fully integrated** with the backend API featuring:
- ✅ **Zustand State Management** for authentication
- ✅ **JWT Token Management** with auto-refresh
- ✅ **Login/Signup Pages** with beautiful dark UI
- ✅ **Protected Routes** (Dashboard)
- ✅ **User Dashboard** showing enrolled courses
- ✅ **Real API Integration** with axios
- ✅ **Responsive Design** with Tailwind CSS

---

## 🚀 Quick Start

### 1. Install Dependencies (if needed)
```bash
cd frontend
npm install
```

### 2. Environment Setup
Create `.env` file (already created):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The app will run at: **http://localhost:5173**

---

## 📁 New File Structure

```
frontend/src/
├── config/
│   └── api.js                    # Axios configuration with interceptors
├── store/
│   └── useAuthStore.js           # Zustand authentication store
├── pages/
│   ├── Login.jsx                 # Login page with demo accounts
│   ├── Signup.jsx                # Registration page
│   └── Dashboard.jsx             # User dashboard (protected)
├── components/
│   ├── Navbar.jsx                # Updated with auth menu
│   ├── FeaturedCourses.jsx       # Updated with real enrollment
│   └── ... (other components)
└── App.jsx                       # Updated with React Router
```

---

## 🔐 Authentication Features

### **Zustand Store** (`src/store/useAuthStore.js`)
- `register(name, email, password)` - Register new user
- `login(email, password)` - Login user
- `logout()` - Logout and clear tokens
- `getMe()` - Fetch current user data
- `initializeAuth()` - Load user from localStorage on app start

### **Token Management**
- Access tokens stored in localStorage
- Automatic token refresh on 401 errors
- Axios interceptor adds token to all requests
- Secure logout clears all tokens

### **Protected Routes**
- `/dashboard` - Requires authentication
- Auto-redirect to `/login` if not authenticated
- Persists auth state across page refreshes

---

## 🎨 New Pages

### 1. **Login Page** (`/login`)
**Features:**
- Email & password authentication
- Password visibility toggle
- Form validation
- Demo login buttons (Student, Instructor, Admin)
- "Remember me" checkbox
- Link to signup page

**Demo Accounts:**
```
Student:
- Email: student@studysphere.com
- Password: student123

Instructor:
- Email: instructor@studysphere.com
- Password: instructor123

Admin:
- Email: admin@studysphere.com
- Password: admin123
```

### 2. **Signup Page** (`/signup`)
**Features:**
- Full name, email, password fields
- Password confirmation
- Real-time password strength indicator
- Form validation (email format, password length)
- Terms & conditions checkbox
- Link to login page

### 3. **Dashboard Page** (`/dashboard`)
**Features:**
- Welcome message with user name
- Statistics cards (Enrolled Courses, Hours, Completed, Progress)
- Profile information display
- List of enrolled courses with progress bars
- Continue learning buttons
- Empty state with "Browse Courses" CTA

---

## 🔄 Updated Components

### **Navbar** (`src/components/Navbar.jsx`)
**Changes:**
- Added user profile dropdown when authenticated
- Logout functionality
- Dashboard link for logged-in users
- Login/Signup button for guests
- Mobile menu includes auth state
- React Router navigation

### **FeaturedCourses** (`src/components/FeaturedCourses.jsx`)
**Changes:**
- Real API enrollment with `POST /enrollments/enroll/:courseId`
- Auth check before enrollment
- Redirect to login if not authenticated
- Loading state during enrollment
- Success/error messages

---

## 🌐 API Integration

### **Axios Config** (`src/config/api.js`)
```javascript
// Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Automatic token injection
Request Interceptor → Adds Bearer token

// Automatic token refresh
Response Interceptor → Refreshes on 401 error
```

### **API Endpoints Used**
```
POST   /auth/register         - Register new user
POST   /auth/login            - Login user
POST   /auth/logout           - Logout user
GET    /auth/me               - Get current user
POST   /auth/refresh          - Refresh access token
GET    /enrollments/my-enrollments - Get user's enrollments
POST   /enrollments/enroll/:id - Enroll in course
```

---

## 🎯 How to Test

### **1. Test Registration**
1. Navigate to http://localhost:5173/signup
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - Confirm Password: test123
3. Click "Create Account"
4. Should auto-login and redirect to home

### **2. Test Login (Demo Accounts)**
1. Navigate to http://localhost:5173/login
2. Click "Student" demo button
3. Click "Sign In"
4. Should redirect to home with user menu in navbar

### **3. Test Course Enrollment**
1. Login first (use demo account)
2. Scroll to Featured Courses section
3. Click "Enroll Now" on any course
4. Should show success message and redirect to dashboard
5. Course should appear in dashboard with 0% progress

### **4. Test Dashboard**
1. Login (if not already)
2. Click "Dashboard" in navbar
3. Should see:
   - Welcome message with your name
   - Statistics (enrolled courses, etc.)
   - Profile information
   - List of enrolled courses

### **5. Test Logout**
1. Click on your name in navbar (top-right)
2. Click "Logout" in dropdown
3. Should clear tokens and redirect to home
4. Navbar should show "Login / Signup" button

### **6. Test Protected Route**
1. Logout if logged in
2. Try to access http://localhost:5173/dashboard
3. Should auto-redirect to /login

---

## 🔧 Environment Variables

```env
# Required
VITE_API_URL=http://localhost:5000/api

# Optional (future)
VITE_STRIPE_KEY=your_stripe_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📦 Dependencies Added

```json
{
  "axios": "^1.12.2",              // HTTP client
  "react-router-dom": "^7.9.4",     // Routing
  "zustand": "^5.0.8",              // State management
  "framer-motion": "^12.23.24",     // Already installed
  "react-icons": "^5.5.0"           // Already installed
}
```

---

## 🐛 Common Issues & Solutions

### **1. Cannot Connect to Backend**
**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solutions:**
- ✅ Make sure backend is running: `cd backend && npm run dev`
- ✅ Check backend is on port 5000: http://localhost:5000
- ✅ Verify `.env` has correct API URL
- ✅ Check CORS is enabled in backend

### **2. MongoDB Not Connected**
**Error:** Backend shows "Could not connect to MongoDB"

**Solutions:**
- ✅ Setup MongoDB Atlas (see `backend/SETUP.md`)
- ✅ Or install MongoDB locally
- ✅ Update `backend/.env` with connection string
- ✅ Run seed script: `cd backend && npm run seed`

### **3. Demo Login Not Working**
**Error:** "Invalid credentials"

**Solutions:**
- ✅ Make sure backend database is seeded
- ✅ Run: `cd backend && npm run seed`
- ✅ Verify MongoDB connection is working
- ✅ Check backend console for errors

### **4. Enrollment Fails**
**Error:** "Failed to enroll"

**Solutions:**
- ✅ Make sure you're logged in
- ✅ Check course exists in database
- ✅ Verify backend enrollment endpoint is working
- ✅ Check browser console for detailed error

### **5. Token Expired**
**Error:** Automatic logout after some time

**Solutions:**
- ✅ This is normal - access tokens expire after 15 minutes
- ✅ Refresh token automatically renews it
- ✅ If refresh fails, you'll be logged out (refresh tokens expire after 7 days)

---

## 🎨 UI/UX Features

### **Design System**
- **Colors:** Blue-Purple gradient theme
- **Dark Mode:** Gray-900 backgrounds
- **Typography:** Bold headings, clear hierarchy
- **Spacing:** Consistent padding and margins
- **Animations:** Framer Motion hover effects

### **Responsive Design**
- ✅ Mobile-first approach
- ✅ Hamburger menu on mobile
- ✅ Grid layouts adapt to screen size
- ✅ Touch-friendly buttons

### **Accessibility**
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus states

---

## 🔐 Security Best Practices

1. **Token Storage:**
   - Tokens stored in localStorage
   - Cleared on logout
   - Auto-removed on refresh failure

2. **Password Handling:**
   - Never logged or stored in plain text
   - Sent over HTTPS in production
   - Bcrypt hashed on backend

3. **API Security:**
   - Bearer token authentication
   - CORS configured
   - Input validation on both ends

4. **XSS Protection:**
   - React escapes HTML by default
   - No `dangerouslySetInnerHTML` used

---

## 📈 Next Steps (Future Enhancements)

- [ ] Add course details page
- [ ] Implement course video player
- [ ] Add course progress tracking
- [ ] Create instructor dashboard
- [ ] Add admin panel
- [ ] Implement payment gateway (Stripe)
- [ ] Add course reviews/ratings
- [ ] Create course search & filters
- [ ] Add user profile editing
- [ ] Implement notifications
- [ ] Add social login (Google, GitHub)
- [ ] Create course creation wizard
- [ ] Add real-time chat support

---

## 🎓 Learning Resources

### **Zustand:**
- Docs: https://zustand-demo.pmnd.rs/

### **React Router:**
- Docs: https://reactrouter.com/

### **Axios:**
- Docs: https://axios-http.com/

### **Framer Motion:**
- Docs: https://www.framer.com/motion/

---

## 📝 Development Notes

### **State Management Choice**
We used **Zustand** instead of Context API because:
- ✅ Simpler API (less boilerplate)
- ✅ Better performance (no unnecessary re-renders)
- ✅ Built-in persistence middleware
- ✅ TypeScript support
- ✅ DevTools integration

### **Routing Strategy**
- Public routes: Home, Login, Signup
- Protected routes: Dashboard, Profile, Course Player
- Layout-based routing for consistent navbar/footer

### **Form Validation**
- Client-side validation for UX
- Backend validation for security
- Real-time feedback on errors

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit: `git commit -m "Add: your feature"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

---

## 📞 Support

For issues or questions:
- Check backend is running and connected to MongoDB
- Review console errors in browser DevTools
- Check network tab for API call failures
- Verify `.env` configuration

---

## ✅ Checklist Before Testing

- [ ] Backend running on port 5000
- [ ] MongoDB connected and seeded
- [ ] Frontend running on port 5173
- [ ] `.env` file created with API URL
- [ ] All dependencies installed
- [ ] Browser console open for debugging

---

**Happy Learning! 🎓✨**
