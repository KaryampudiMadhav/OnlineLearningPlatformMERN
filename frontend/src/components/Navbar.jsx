/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BookOpen, LogOut, User, LayoutDashboard, Award } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  // Dynamic nav links based on authentication status
  const navLinks = isAuthenticated 
    ? [
        { name: 'Courses', path: '/courses' },
        { name: 'Leaderboard', path: '/leaderboard' },
        { name: 'Challenges', path: '/challenges' },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
        { name: 'Leaderboard', path: '/leaderboard' },
        { name: 'Challenges', path: '/challenges' },
      ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">{/* Added gap-4 for better spacing */}
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EduPlatform</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">{/* Responsive gap spacing */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors relative px-2 py-1 ${
                  isActive(link.path) ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">{/* Responsive gap spacing */}
            {isAuthenticated ? (
              <>
                <Link to={
                  user?.role === 'admin' ? '/admin/dashboard' :
                  user?.role === 'instructor' ? '/instructor/dashboard' :
                  '/dashboard'
                }>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 text-white hover:text-purple-400 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </motion.button>
                </Link>
                {(user?.role === 'instructor' || user?.role === 'admin') && (
                  <Link to="/instructor/content-hub">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 text-white hover:text-purple-400 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      Content Hub
                    </motion.button>
                  </Link>
                )}
                {user?.role === 'student' && (
                  <>
                    <Link to="/my-certificates">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 text-white hover:text-purple-400 transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        Certificates
                      </motion.button>
                    </Link>
                    <Link to="/gamification">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 text-white hover:text-purple-400 transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        Achievements
                      </motion.button>
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">{/* Better padding and size */}
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white truncate max-w-24">{user?.name}</span>{/* Prevent overflow with truncate */}
                  {user?.role && (
                    <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full whitespace-nowrap">
                      {user.role}
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>{/* Hide text on medium screens */}
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-white hover:text-purple-400 transition-colors"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium shadow-lg shadow-purple-500/30"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'student' && (
                    <>
                      <Link
                        to="/my-certificates"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        My Certificates
                      </Link>
                      <Link
                        to="/gamification"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        Achievements
                      </Link>
                    </>
                  )}
                  <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 text-white">
                      <User className="w-4 h-4 text-purple-400" />
                      {user?.name}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
