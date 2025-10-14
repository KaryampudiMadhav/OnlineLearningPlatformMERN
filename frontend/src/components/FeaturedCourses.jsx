import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiStar, FiClock, FiUsers } from 'react-icons/fi';
const coursesData = [
  {
    id: 1,
    title: 'Complete Web Development Bootcamp',
    instructor: 'John Doe',
    price: '$49.99',
    rating: 4.8,
    students: 12500,
    duration: '40 hours',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=300&fit=crop',
    category: 'Web Development',
  },
  {
    id: 2,
    title: 'Python for Data Science & Machine Learning',
    instructor: 'Jane Smith',
    price: '$59.99',
    rating: 4.9,
    students: 15800,
    duration: '50 hours',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&h=300&fit=crop',
    category: 'Data Science',
  },
  {
    id: 3,
    title: 'UI/UX Design Masterclass',
    instructor: 'Sarah Johnson',
    price: '$44.99',
    rating: 4.7,
    students: 9200,
    duration: '30 hours',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
    category: 'Design',
  },
  {
    id: 4,
    title: 'React & Next.js - The Complete Guide',
    instructor: 'Mike Wilson',
    price: '$54.99',
    rating: 4.9,
    students: 18300,
    duration: '45 hours',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop',
    category: 'Web Development',
  },
  {
    id: 5,
    title: 'AI & Deep Learning with TensorFlow',
    instructor: 'Dr. Emily Brown',
    price: '$64.99',
    rating: 4.8,
    students: 11400,
    duration: '60 hours',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop',
    category: 'Artificial Intelligence',
  },
  {
    id: 6,
    title: 'Digital Marketing Complete Course',
    instructor: 'Alex Turner',
    price: '$39.99',
    rating: 4.6,
    students: 8700,
    duration: '25 hours',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop',
    category: 'Marketing',
  },
];

const CourseCard = ({ course, index }) => {
  const handleEnroll = () => {
    alert(`Enrolling in "${course.title}" - Payment gateway integration coming soon! 🎓`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-gray-700"
    >
      {/* Course Image */}
      <div className="relative overflow-hidden h-56">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {course.category}
        </div>
      </div>

      {/* Course Content */}
      <div className="p-8">
        <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 min-h-[3.5rem]">
          {course.title}
        </h3>
        <p className="text-gray-400 mb-6 text-base">by {course.instructor}</p>

        {/* Rating & Students */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <FiStar className="text-yellow-400 fill-yellow-400 text-lg" />
            <span className="font-semibold text-white text-lg">{course.rating}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FiUsers className="text-lg" />
            <span className="text-sm">{course.students.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FiClock className="text-lg" />
            <span className="text-sm">{course.duration}</span>
          </div>
        </div>

        {/* Price & Enroll Button */}
        <div className="flex items-center justify-between">
          <span className="text-4xl font-bold text-blue-400">
            {course.price}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEnroll}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all cursor-pointer text-base"
          >
            Enroll Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturedCourses = () => {
  return (
    <section id="courses" className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Featured <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Courses</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Explore our most popular courses and start learning from the best instructors
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {coursesData.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>

        {/* View All Courses Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert('View all courses page coming soon! 📚')}
            className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all cursor-pointer"
          >
            View All Courses
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
