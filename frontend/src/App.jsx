import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import useAuthStore from './store/authStore';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const { isAuthenticated, getMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      getMe();
    }
  }, [isAuthenticated, getMe]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes - We'll add these next */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center text-white">
                    <h1 className="text-4xl">Dashboard - Coming Soon</h1>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <div className="min-h-screen flex items-center justify-center text-white">
                  <h1 className="text-4xl">Courses - Coming Soon</h1>
                </div>
              } 
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;