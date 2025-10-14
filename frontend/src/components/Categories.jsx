import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiCode, FiDatabase, FiCpu, FiLayers, FiTrendingUp, FiPenTool, FiCamera, FiMusic } from 'react-icons/fi';
const categoriesData = [
  {
    id: 1,
    name: 'Web Development',
    icon: FiCode,
    courses: 150,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    name: 'Data Science',
    icon: FiDatabase,
    courses: 85,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    name: 'Artificial Intelligence',
    icon: FiCpu,
    courses: 95,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 4,
    name: 'UI/UX Design',
    icon: FiPenTool,
    courses: 120,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 5,
    name: 'Digital Marketing',
    icon: FiTrendingUp,
    courses: 75,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 6,
    name: 'Mobile Development',
    icon: FiLayers,
    courses: 110,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 7,
    name: 'Photography',
    icon: FiCamera,
    courses: 60,
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 8,
    name: 'Music Production',
    icon: FiMusic,
    courses: 45,
    color: 'from-teal-500 to-cyan-500',
  },
];

const CategoryCard = ({ category, index }) => {
  const IconComponent = category.icon;

  const handleCategoryClick = () => {
    alert(`Explore ${category.courses} courses in ${category.name} - Coming soon! 🚀`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={handleCategoryClick}
      className="relative group cursor-pointer"
    >
      <div className="bg-gray-800 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-700 hover:border-gray-600">
        {/* Icon with Gradient Background */}
        <div className={`w-24 h-24 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent className="text-5xl text-white" />
        </div>

        {/* Category Name */}
        <h3 className="text-2xl font-bold text-white mb-3">
          {category.name}
        </h3>

        {/* Course Count */}
        <p className="text-gray-400 text-lg font-medium">
          {category.courses} Courses
        </p>

        {/* Hover Effect Border */}
        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>
      </div>
    </motion.div>
  );
};

const Categories = () => {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Explore <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Categories</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Choose from a wide range of categories and start your learning journey today
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {categoriesData.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
