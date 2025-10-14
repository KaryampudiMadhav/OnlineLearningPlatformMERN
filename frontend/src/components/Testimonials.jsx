import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const testimonialsData = [
  {
    id: 1,
    name: 'Emma Thompson',
    role: 'Software Engineer',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    rating: 5,
    text: 'StudySphere transformed my career! The courses are well-structured and the instructors are incredibly knowledgeable. I landed my dream job within 3 months of completing the web development bootcamp.',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Data Scientist',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    rating: 5,
    text: 'The Python for Data Science course exceeded my expectations. The practical projects and real-world examples helped me transition into data science seamlessly. Highly recommended!',
  },
  {
    id: 3,
    name: 'Sarah Williams',
    role: 'UX Designer',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    rating: 5,
    text: 'As a complete beginner, I was nervous about learning design. But the UI/UX course made everything so easy to understand. The community support is amazing too!',
  },
  {
    id: 4,
    name: 'David Martinez',
    role: 'Full Stack Developer',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    rating: 5,
    text: 'Best investment I\'ve made in my education. The React course was comprehensive and up-to-date with industry standards. I now work as a senior developer thanks to StudySphere.',
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    role: 'Digital Marketer',
    image: 'https://randomuser.me/api/portraits/women/5.jpg',
    rating: 5,
    text: 'The digital marketing course gave me the skills I needed to start my own agency. The instructors are industry experts and the content is always current.',
  },
  {
    id: 6,
    name: 'James Wilson',
    role: 'AI Researcher',
    image: 'https://randomuser.me/api/portraits/men/6.jpg',
    rating: 5,
    text: 'The AI and Machine Learning courses are top-notch. Complex concepts are broken down brilliantly. I\'m now working on cutting-edge AI projects!',
  },
];

const TestimonialCard = ({ testimonial, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-800 rounded-3xl p-10 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border-2 border-gray-700"
    >
      {/* Rating Stars */}
      <div className="flex gap-2 mb-8">
        {[...Array(testimonial.rating)].map((_, i) => (
          <FiStar key={i} className="text-yellow-400 fill-yellow-400 text-2xl" />
        ))}
      </div>

      {/* Testimonial Text */}
      <p className="text-gray-300 mb-10 leading-relaxed text-lg">
        "{testimonial.text}"
      </p>

      {/* User Info */}
      <div className="flex items-center gap-5 pt-8 border-t-2 border-gray-700">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-500/40"
        />
        <div>
          <h4 className="font-bold text-white text-xl mb-1">{testimonial.name}</h4>
          <p className="text-gray-400 text-base">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            What Our <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Students Say</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Join thousands of satisfied learners who have transformed their careers
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
