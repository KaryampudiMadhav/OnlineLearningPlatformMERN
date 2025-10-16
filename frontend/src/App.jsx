import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseLearning from './pages/CourseLearning';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyCertificates from './pages/MyCertificates';
import VerifyCertificate from './pages/VerifyCertificate';
import QuizTaker from './pages/QuizTaker';
import QuizResults from './pages/QuizResults';
import CreateQuiz from './pages/CreateQuiz';
import CreateModuleQuiz from './pages/CreateModuleQuiz';
import CourseReviews from './pages/CourseReviews';
import Leaderboard from './pages/Leaderboard';
import GamificationDashboard from './pages/GamificationDashboard';
import DailyChallenges from './pages/DailyChallenges';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import useAuthStore from './store/authStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const App = () => {
  const { isAuthenticated, user, getMe } = useAuthStore();

  useEffect(() => {
    // Only fetch user data if authenticated but don't have user data yet
    if (isAuthenticated && !user) {
      getMe();
    }
  }, [isAuthenticated, user, getMe]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/:courseId/reviews" element={<CourseReviews />} />
            
            {/* Course Learning */}
            <Route 
              path="/learn/:id" 
              element={
                <ProtectedRoute>
                  <CourseLearning />
                </ProtectedRoute>
              } 
            />
            
            {/* Student Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Profile */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Certificates */}
            <Route 
              path="/my-certificates" 
              element={
                <ProtectedRoute>
                  <MyCertificates />
                </ProtectedRoute>
              } 
            />
            
            {/* Public Certificate Verification */}
            <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />
            
            {/* Gamification Routes - Public but enhanced for logged-in users */}
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/challenges" element={<DailyChallenges />} />
            <Route 
              path="/gamification" 
              element={
                <ProtectedRoute>
                  <GamificationDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Quiz Routes */}
            <Route 
              path="/quiz/:quizId" 
              element={
                <ProtectedRoute>
                  <QuizTaker />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz-results/:attemptId" 
              element={
                <ProtectedRoute>
                  <QuizResults />
                </ProtectedRoute>
              } 
            />
            
            {/* Instructor Routes */}
            <Route 
              path="/instructor/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/create-course" 
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <CreateCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/edit-course/:id" 
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <EditCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/create-quiz/:courseId" 
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <CreateQuiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/create-module-quiz/:courseId" 
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <CreateModuleQuiz />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCourses />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;