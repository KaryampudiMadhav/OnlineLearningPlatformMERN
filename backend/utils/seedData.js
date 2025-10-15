const Course = require('../models/Course');

const seedCourses = [
  {
    title: 'Complete Web Development Bootcamp 2024',
    description: 'Master web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, Express, MongoDB, and more. Build 20+ real-world projects and become a full-stack developer.',
    instructor: 'John Smith',
    category: 'Web Development',
    level: 'Beginner',
    price: 54.99,
    originalPrice: 199.99,
    duration: '45 hours',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    rating: 4.9,
    enrolledStudents: 18300,
    isFeatured: true,
    whatYouWillLearn: [
      'Build responsive websites with HTML5 and CSS3',
      'Master JavaScript ES6+ features',
      'Create dynamic web apps with React',
      'Build RESTful APIs with Node.js and Express',
      'Work with MongoDB and Mongoose',
      'Deploy applications to production',
    ],
    requirements: [
      'Basic computer skills',
      'No programming experience required',
      'A computer with internet connection',
    ],
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
    language: 'English',
    isPublished: true,
  },
  {
    title: 'Python for Data Science & Machine Learning',
    description: 'Learn Python programming and data science from scratch. Master NumPy, Pandas, Matplotlib, Scikit-learn, and build real machine learning projects.',
    instructor: 'Dr. Sarah Johnson',
    category: 'Data Science',
    level: 'Intermediate',
    price: 49.99,
    originalPrice: 189.99,
    duration: '40 hours',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    rating: 4.8,
    enrolledStudents: 15200,
    isFeatured: true,
    whatYouWillLearn: [
      'Master Python programming fundamentals',
      'Perform data analysis with Pandas',
      'Create visualizations with Matplotlib and Seaborn',
      'Build machine learning models',
      'Work with NumPy for numerical computing',
      'Deploy ML models to production',
    ],
    requirements: [
      'Basic mathematics knowledge',
      'No prior programming experience required',
    ],
    tags: ['Python', 'Data Science', 'Machine Learning', 'Pandas', 'NumPy'],
    language: 'English',
    isPublished: true,
  },
  {
    title: 'UI/UX Design Masterclass - Figma & Adobe XD',
    description: 'Become a professional UI/UX designer. Learn design principles, user research, wireframing, prototyping, and create stunning interfaces with Figma and Adobe XD.',
    instructor: 'Emily Chen',
    category: 'UI/UX Design',
    level: 'Beginner',
    price: 44.99,
    originalPrice: 179.99,
    duration: '35 hours',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
    rating: 4.9,
    enrolledStudents: 12400,
    isFeatured: true,
    whatYouWillLearn: [
      'Master UI/UX design principles',
      'Create wireframes and prototypes',
      'Design with Figma and Adobe XD',
      'Conduct user research and testing',
      'Build a professional portfolio',
      'Work with design systems',
    ],
    requirements: [
      'No prior design experience needed',
      'A computer with internet connection',
    ],
    tags: ['UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Prototyping'],
    language: 'English',
    isPublished: true,
  },
  {
    title: 'Complete React & Next.js - The Complete Guide',
    description: 'Master React 18 and Next.js 14. Learn hooks, context, routing, server components, API routes, and build modern web applications with best practices.',
    instructor: 'Mike Wilson',
    category: 'Web Development',
    level: 'Intermediate',
    price: 59.99,
    originalPrice: 199.99,
    duration: '50 hours',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
    rating: 4.9,
    enrolledStudents: 22100,
    isFeatured: true,
    whatYouWillLearn: [
      'Master React 18 with hooks and context',
      'Build full-stack apps with Next.js 14',
      'Implement server and client components',
      'Create API routes and handle data',
      'Optimize performance and SEO',
      'Deploy to Vercel and production',
    ],
    requirements: [
      'Basic JavaScript knowledge',
      'HTML and CSS fundamentals',
    ],
    tags: ['React', 'Next.js', 'JavaScript', 'TypeScript', 'Web Development'],
    language: 'English',
    isPublished: true,
  },
  {
    title: 'AI & Deep Learning with TensorFlow',
    description: 'Dive deep into artificial intelligence and neural networks. Learn TensorFlow, build deep learning models, and create AI-powered applications.',
    instructor: 'Dr. Emily Brown',
    category: 'Artificial Intelligence',
    level: 'Advanced',
    price: 64.99,
    originalPrice: 249.99,
    duration: '60 hours',
    image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b',
    rating: 4.8,
    enrolledStudents: 11400,
    isFeatured: true,
    whatYouWillLearn: [
      'Understand neural networks and deep learning',
      'Build models with TensorFlow and Keras',
      'Work with CNNs and RNNs',
      'Implement transfer learning',
      'Deploy AI models to production',
      'Work with computer vision and NLP',
    ],
    requirements: [
      'Python programming knowledge',
      'Basic understanding of machine learning',
      'Mathematics and statistics background',
    ],
    tags: ['AI', 'Deep Learning', 'TensorFlow', 'Neural Networks', 'Python'],
    language: 'English',
    isPublished: true,
  },
  {
    title: 'Digital Marketing Complete Course 2024',
    description: 'Master digital marketing strategies. Learn SEO, social media marketing, email marketing, content marketing, Google Ads, and grow your business online.',
    instructor: 'Alex Turner',
    category: 'Digital Marketing',
    level: 'Beginner',
    price: 39.99,
    originalPrice: 159.99,
    duration: '25 hours',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    rating: 4.6,
    enrolledStudents: 8700,
    isFeatured: true,
    whatYouWillLearn: [
      'Master SEO and rank on Google',
      'Run effective social media campaigns',
      'Create content marketing strategies',
      'Set up and manage Google Ads',
      'Build email marketing funnels',
      'Analyze marketing data and ROI',
    ],
    requirements: [
      'Basic computer and internet skills',
      'No prior marketing experience needed',
    ],
    tags: ['Digital Marketing', 'SEO', 'Social Media', 'Google Ads', 'Content Marketing'],
    language: 'English',
    isPublished: true,
  },
];

const seedDatabase = async () => {
  try {
    // Clear existing courses
    await Course.deleteMany({});
    console.log('🗑️  Existing courses cleared');

    // Insert seed courses
    const courses = await Course.insertMany(seedCourses);
    console.log(`✅ ${courses.length} courses seeded successfully`);

    return courses;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;
