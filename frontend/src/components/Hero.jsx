/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiPlay } from 'react-icons/fi';

const Hero = () => {
  const handleGetStarted = () => {
    const coursesSection = document.querySelector('#courses');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWatchDemo = () => {
    alert('Demo video coming soon! 🎥');
  };

  return (
    <section
      id="home"
      className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen flex items-center relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTYzZWIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtOC44MzctNy4xNjMtMTYtMTYtMTZTNCAxNi4xNjMgNCAyNXM3LjE2MyAxNiAxNiAxNiAxNi03LjE2MyAxNi0xNnptMCA0NGMwLTguODM3LTcuMTYzLTE2LTE2LTE2cy0xNiA3LjE2My0xNiAxNiA3LjE2MyAxNiAxNiAxNiAxNi03LjE2MyAxNi0xNnptMCAwYzAtOC44MzctNy4xNjMtMTYtMTYtMTZzLTE2IDcuMTYzLTE2IDE2IDcuMTYzIDE2IDE2IDE2IDE2LTcuMTYzIDE2LTE2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight"
          >
            Learn Anything,{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Anytime
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-2xl"
          >
            Unlock your potential with world-class courses from industry experts.
            Start learning today and transform your career.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              Get Started
              <FiArrowRight className="text-2xl" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWatchDemo}
              className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <FiPlay className="text-2xl" />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-12 max-w-2xl pt-8 border-t border-white/20"
          >
            <div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-2">10K+</h3>
              <p className="text-sm md:text-base text-gray-300">Students</p>
            </div>
            <div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-2">500+</h3>
              <p className="text-sm md:text-base text-gray-300">Courses</p>
            </div>
            <div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-2">50+</h3>
              <p className="text-sm md:text-base text-gray-300">Instructors</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Content - Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:block"
        >
          <div className="relative">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl shadow-2xl p-8"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-4">
                <div className="h-4 bg-white/30 rounded-full mb-3 w-3/4"></div>
                <div className="h-4 bg-white/30 rounded-full mb-3 w-1/2"></div>
                <div className="h-4 bg-white/30 rounded-full w-2/3"></div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <div className="h-4 bg-white/30 rounded-full mb-3 w-full"></div>
                <div className="h-4 bg-white/30 rounded-full mb-3 w-5/6"></div>
                <div className="h-4 bg-white/30 rounded-full w-3/4"></div>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-400 rounded-2xl shadow-lg"
            ></motion.div>
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-8 -left-8 w-20 h-20 bg-pink-400 rounded-full shadow-lg"
            ></motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
