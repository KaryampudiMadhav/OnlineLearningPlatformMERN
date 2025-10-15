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
    curriculum: [
      {
        title: 'Introduction to HTML',
        description: 'Learn the fundamentals of HTML and create your first web page',
        duration: '3 hours',
        lessons: [
          {
            title: 'What is HTML?',
            duration: '15 min',
            isPreview: true,
            videoUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
            content: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. In this lesson, we will cover the basics of HTML structure, tags, and elements.'
          },
          {
            title: 'HTML Tags and Elements',
            duration: '25 min',
            isPreview: true,
            videoUrl: 'https://www.youtube.com/watch?v=salY_Sm6mv4',
            content: 'Learn about common HTML tags like <div>, <p>, <h1>-<h6>, <a>, <img>, and how to use them to structure your content.'
          },
          {
            title: 'Building Your First Web Page',
            duration: '30 min',
            isPreview: false,
            videoUrl: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
            content: 'Put everything together and create your first complete HTML page with headings, paragraphs, images, and links.'
          }
        ]
      },
      {
        title: 'CSS Fundamentals',
        description: 'Master CSS to style and design beautiful websites',
        duration: '4 hours',
        lessons: [
          {
            title: 'Introduction to CSS',
            duration: '20 min',
            isPreview: true,
            videoUrl: 'https://www.youtube.com/watch?v=1PnVor36_40',
            content: 'CSS (Cascading Style Sheets) controls the presentation of HTML elements. Learn how to add styles, colors, fonts, and layouts to your web pages.'
          },
          {
            title: 'CSS Selectors and Properties',
            duration: '35 min',
            isPreview: false,
            content: 'Explore different types of CSS selectors (class, id, element) and common properties like color, font-size, margin, padding, and more.'
          },
          {
            title: 'Flexbox Layout',
            duration: '40 min',
            isPreview: false,
            content: 'Master CSS Flexbox to create responsive layouts easily. Learn flex containers, flex items, and common flexbox properties.'
          }
        ]
      },
      {
        title: 'JavaScript Essentials',
        description: 'Learn JavaScript programming from scratch',
        duration: '8 hours',
        lessons: [
          {
            title: 'JavaScript Basics',
            duration: '30 min',
            isPreview: true,
            content: 'Introduction to JavaScript: variables, data types, operators, and basic syntax. Learn how to write and run JavaScript code.'
          },
          {
            title: 'Functions and Scope',
            duration: '45 min',
            isPreview: false,
            content: 'Understanding functions, parameters, return values, and scope in JavaScript. Learn about function declarations and expressions.'
          },
          {
            title: 'DOM Manipulation',
            duration: '50 min',
            isPreview: false,
            content: 'Learn how to interact with HTML elements using JavaScript. Select elements, change styles, handle events, and create dynamic content.'
          }
        ]
      }
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
    curriculum: [
      {
        title: 'Python Fundamentals',
        description: 'Get started with Python programming basics',
        duration: '5 hours',
        lessons: [
          {
            title: 'Installing Python and Setting Up Environment',
            duration: '20 min',
            isPreview: true,
            content: 'Learn how to install Python, set up your development environment, and write your first Python program. We will use Anaconda distribution for data science.'
          },
          {
            title: 'Python Syntax and Variables',
            duration: '30 min',
            isPreview: true,
            content: 'Understanding Python syntax, variables, data types (int, float, string, boolean), and basic operations.'
          },
          {
            title: 'Lists, Tuples, and Dictionaries',
            duration: '40 min',
            isPreview: false,
            content: 'Master Python data structures: lists for ordered collections, tuples for immutable data, and dictionaries for key-value pairs.'
          }
        ]
      },
      {
        title: 'NumPy for Numerical Computing',
        description: 'Learn NumPy for efficient numerical operations',
        duration: '6 hours',
        lessons: [
          {
            title: 'Introduction to NumPy Arrays',
            duration: '35 min',
            isPreview: true,
            content: 'NumPy arrays are the foundation of data science in Python. Learn how to create, manipulate, and perform operations on NumPy arrays.'
          },
          {
            title: 'Array Operations and Broadcasting',
            duration: '45 min',
            isPreview: false,
            content: 'Master array indexing, slicing, reshaping, and broadcasting rules for efficient mathematical operations.'
          }
        ]
      },
      {
        title: 'Data Analysis with Pandas',
        description: 'Master Pandas for data manipulation and analysis',
        duration: '8 hours',
        lessons: [
          {
            title: 'Pandas DataFrames and Series',
            duration: '40 min',
            isPreview: true,
            content: 'Introduction to Pandas DataFrames (2D tables) and Series (1D arrays). Learn how to load, view, and explore datasets.'
          },
          {
            title: 'Data Cleaning and Preprocessing',
            duration: '50 min',
            isPreview: false,
            content: 'Handle missing data, remove duplicates, fix data types, and prepare your data for analysis.'
          },
          {
            title: 'Data Visualization with Matplotlib',
            duration: '45 min',
            isPreview: false,
            content: 'Create stunning visualizations: line plots, bar charts, scatter plots, histograms, and more using Matplotlib and Seaborn.'
          }
        ]
      }
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
    curriculum: [
      {
        title: 'Design Fundamentals',
        description: 'Learn the core principles of UI/UX design',
        duration: '4 hours',
        lessons: [
          {
            title: 'What is UI/UX Design?',
            duration: '25 min',
            isPreview: true,
            content: 'Understanding the difference between UI (User Interface) and UX (User Experience). Learn why good design matters and impacts business success.'
          },
          {
            title: 'Design Principles: Layout, Color, Typography',
            duration: '40 min',
            isPreview: true,
            content: 'Master fundamental design principles: visual hierarchy, whitespace, color theory, typography, and how to create balanced, beautiful interfaces.'
          },
          {
            title: 'User-Centered Design Process',
            duration: '35 min',
            isPreview: false,
            content: 'Learn the UX design process: research, ideation, wireframing, prototyping, testing, and iteration. Put users at the center of your design decisions.'
          }
        ]
      },
      {
        title: 'Figma Mastery',
        description: 'Master Figma for professional design work',
        duration: '8 hours',
        lessons: [
          {
            title: 'Figma Interface and Tools',
            duration: '30 min',
            isPreview: true,
            content: 'Get familiar with Figma interface, tools, panels, and shortcuts. Set up your workspace for efficient design workflow.'
          },
          {
            title: 'Creating Wireframes in Figma',
            duration: '45 min',
            isPreview: false,
            content: 'Learn how to create low-fidelity and high-fidelity wireframes. Use frames, grids, and components effectively.'
          },
          {
            title: 'Prototyping and Animations',
            duration: '50 min',
            isPreview: false,
            content: 'Bring your designs to life with interactive prototypes. Add transitions, animations, and create clickable flows.'
          }
        ]
      }
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
    curriculum: [
      {
        title: 'React Fundamentals',
        description: 'Master the core concepts of React',
        duration: '10 hours',
        lessons: [
          {
            title: 'Introduction to React',
            duration: '25 min',
            isPreview: true,
            content: 'What is React? Learn about components, JSX, and why React is the most popular JavaScript library for building user interfaces.'
          },
          {
            title: 'React Components and Props',
            duration: '40 min',
            isPreview: true,
            content: 'Create reusable components, pass data with props, and build component hierarchies. Learn functional and class components.'
          },
          {
            title: 'React Hooks: useState and useEffect',
            duration: '50 min',
            isPreview: false,
            content: 'Master React Hooks for state management and side effects. Learn when and how to use useState, useEffect, and custom hooks.'
          }
        ]
      },
      {
        title: 'Next.js Essentials',
        description: 'Build full-stack applications with Next.js',
        duration: '12 hours',
        lessons: [
          {
            title: 'Setting Up Next.js Project',
            duration: '30 min',
            isPreview: true,
            content: 'Initialize a Next.js project, understand the folder structure, and create your first pages using the App Router.'
          },
          {
            title: 'Server Components and Client Components',
            duration: '45 min',
            isPreview: false,
            content: 'Understand the difference between Server and Client Components. Learn when to use each and optimize your application.'
          }
        ]
      }
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
