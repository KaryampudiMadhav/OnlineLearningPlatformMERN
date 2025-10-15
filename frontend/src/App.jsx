import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCourses from './components/FeaturedCourses';
import Categories from './components/Categories';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import MyCourses from './pages/MyCourses';
import InstructorCourses from './pages/InstructorCourses';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import AdminDashboard from './pages/AdminDashboard';
import useAuthStore from './store/useAuthStore';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Role-based Protected Route
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Home Page Component
const HomePage = ({ darkMode, setDarkMode }) => {
  return (
    <>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Hero />
      <FeaturedCourses />
      <Categories />
      <Testimonials />
      <Footer />
    </>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth from localStorage on app load
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/courses" 
              element={
                <>
                  <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                  <Courses />
                  <Footer />
                </>
              } 
            />
            <Route 
              path="/courses/:id" 
              element={
                <>
                  <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                  <CourseDetail />
                  <Footer />
                </>
              } 
            />

            {/* Protected Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                  <Dashboard />
                  <Footer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                  <Profile />
                  <Footer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                  <MyCourses />
                  <Footer />
                </ProtectedRoute>
              }
            />

            {/* Instructor Routes */}
            <Route
              path="/instructor/courses"
              element={
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                  <InstructorCourses />
                  <Footer />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/create"
              element={
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                  <CreateCourse />
                  <Footer />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/edit/:id"
              element={
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                  <EditCourse />
                  <Footer />
                </RoleProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                  <AdminDashboard />
                  <Footer />
                </RoleProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
