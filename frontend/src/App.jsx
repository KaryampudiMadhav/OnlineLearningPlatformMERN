import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import DynamicCourseCreator from './pages/DynamicCourseCreator';
import EditCourse from './pages/EditCourse';
import ContentGenerationHub from './pages/ContentGenerationHub';
import BulkImport from './pages/BulkImport';
import CourseTemplates from './pages/CourseTemplates';
import AIQuizGenerator from './pages/AIQuizGenerator';
import ContentLibrary from './pages/ContentLibrary';
import ModuleQuiz from './pages/ModuleQuiz';
import ModuleQuizSelection from './pages/ModuleQuizSelection';
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

const DashboardRedirect = () => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }
  
  // Redirect based on user role
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'instructor') {
    return <Navigate to="/instructor/dashboard" replace />;
  } else {
    return <Dashboard />;
  }
};

const App = () => {
  const { user, getMe } = useAuthStore();

  useEffect(() => {
    // Fetch user data on app initialization if token exists
    const token = localStorage.getItem('token');
    if (token && !user) {
      getMe();
    }
  }, [user, getMe]);

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
            
            {/* Dashboard Redirect based on Role */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
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
            <Route 
              path="/quiz/module/:courseId/:moduleIndex" 
              element={
                <ProtectedRoute>
                  <ModuleQuiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:courseId/module/:moduleIndex/quizzes" 
              element={
                <ProtectedRoute>
                  <ModuleQuizSelection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:courseId/module/:moduleIndex/quiz/:quizId" 
              element={
                <ProtectedRoute>
                  <ModuleQuiz />
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
              path="/instructor/create-course-ai" 
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <DynamicCourseCreator />
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
            
            {/* Content Generation Routes */}
            <Route 
              path="/instructor/content-hub" 
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <ContentGenerationHub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/content-hub/bulk-import" 
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <BulkImport />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/content-hub/templates" 
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <CourseTemplates />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/content-hub/ai-quiz" 
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <AIQuizGenerator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/content-hub/library" 
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <ContentLibrary />
                </ProtectedRoute>
              } 
            />
            
            {/* Quiz Routes */}
            <Route 
              path="/quiz/module/:courseId/:moduleIndex" 
              element={
                <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                  <ModuleQuiz />
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '8px',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  );
};

export default App;