/**
 * Premium Course Seeding Script
 * Creates 5 comprehensive courses with 5 modules each
 * Each module has real video links and detailed content
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');

// Premium Courses Data
const premiumCourses = [
  {
    title: "Complete Web Development Bootcamp 2025",
    description: "Master modern web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, MongoDB and deploy real-world projects. Perfect for beginners and intermediate developers.",
    category: "Web Development",
    level: "Beginner",
    price: 99.99,
    thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800",
    language: "English",
    duration: "40 hours",
    modules: [
      {
        title: "HTML & CSS Fundamentals",
        description: "Build beautiful, responsive websites from scratch using HTML5 and CSS3",
        order: 1,
        lessons: [
          {
            title: "Introduction to HTML - Structure of Web Pages",
            type: "video",
            content: "Learn the building blocks of the web. Understand HTML tags, elements, and document structure.",
            videoUrl: "https://www.youtube.com/watch?v=qz0aGYrrlhU",
            duration: "28:00",
            order: 1
          },
          {
            title: "CSS Basics - Styling Your First Website",
            type: "video",
            content: "Master CSS selectors, properties, and the box model. Create beautiful designs.",
            videoUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
            duration: "45:00",
            order: 2
          },
          {
            title: "Flexbox & Grid Layout",
            type: "video",
            content: "Modern CSS layouts with Flexbox and Grid. Build responsive designs effortlessly.",
            videoUrl: "https://www.youtube.com/watch?v=3YW65K6LcIA",
            duration: "35:00",
            order: 3
          },
          {
            title: "Responsive Web Design",
            type: "video",
            content: "Create websites that work perfectly on all devices using media queries.",
            videoUrl: "https://www.youtube.com/watch?v=srvUrASNj0s",
            duration: "42:00",
            order: 4
          },
          {
            title: "CSS Animations & Transitions",
            type: "video",
            content: "Bring your websites to life with smooth animations and transitions.",
            videoUrl: "https://www.youtube.com/watch?v=zHUpx90NerM",
            duration: "30:00",
            order: 5
          }
        ]
      },
      {
        title: "JavaScript Mastery - From Basics to Advanced",
        description: "Deep dive into JavaScript - the programming language of the web",
        order: 2,
        lessons: [
          {
            title: "JavaScript Fundamentals - Variables & Data Types",
            type: "video",
            content: "Learn JavaScript basics: variables, data types, operators, and control flow.",
            videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
            duration: "50:00",
            order: 1
          },
          {
            title: "Functions & Scope in JavaScript",
            type: "video",
            content: "Master functions, arrow functions, closures, and scope in JavaScript.",
            videoUrl: "https://www.youtube.com/watch?v=gigtS_5KOqo",
            duration: "38:00",
            order: 2
          },
          {
            title: "DOM Manipulation & Events",
            type: "video",
            content: "Learn to interact with HTML elements and handle user events dynamically.",
            videoUrl: "https://www.youtube.com/watch?v=0ik6X4DJKCc",
            duration: "55:00",
            order: 3
          },
          {
            title: "Asynchronous JavaScript - Promises & Async/Await",
            type: "video",
            content: "Handle asynchronous operations with callbacks, promises, and async/await.",
            videoUrl: "https://www.youtube.com/watch?v=V_Kr9OSfDeU",
            duration: "48:00",
            order: 4
          },
          {
            title: "ES6+ Modern JavaScript Features",
            type: "video",
            content: "Destructuring, spread operator, modules, and modern JavaScript features.",
            videoUrl: "https://www.youtube.com/watch?v=NCwa_xi0Uuc",
            duration: "40:00",
            order: 5
          }
        ]
      },
      {
        title: "React - Building Modern User Interfaces",
        description: "Learn React.js and build dynamic, interactive web applications",
        order: 3,
        lessons: [
          {
            title: "React Fundamentals - Components & JSX",
            type: "video",
            content: "Introduction to React: components, JSX, and the virtual DOM.",
            videoUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
            duration: "60:00",
            order: 1
          },
          {
            title: "React Hooks - useState & useEffect",
            type: "video",
            content: "Master React Hooks for state management and side effects.",
            videoUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0",
            duration: "45:00",
            order: 2
          },
          {
            title: "React Router - Navigation & Routing",
            type: "video",
            content: "Build multi-page applications with React Router.",
            videoUrl: "https://www.youtube.com/watch?v=Ul3y1LXxzdU",
            duration: "35:00",
            order: 3
          },
          {
            title: "State Management with Context API",
            type: "video",
            content: "Manage global state in React applications using Context API.",
            videoUrl: "https://www.youtube.com/watch?v=5LrDIWkK_Bc",
            duration: "42:00",
            order: 4
          },
          {
            title: "Building a Complete React Project",
            type: "video",
            content: "Put it all together: build a full-featured React application.",
            videoUrl: "https://www.youtube.com/watch?v=b9eMGE7QtTk",
            duration: "90:00",
            order: 5
          }
        ]
      },
      {
        title: "Backend Development with Node.js & Express",
        description: "Build powerful server-side applications with Node.js",
        order: 4,
        lessons: [
          {
            title: "Node.js Basics & NPM",
            type: "video",
            content: "Introduction to Node.js runtime and package management with NPM.",
            videoUrl: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
            duration: "55:00",
            order: 1
          },
          {
            title: "Express.js - Building REST APIs",
            type: "video",
            content: "Create RESTful APIs with Express.js framework.",
            videoUrl: "https://www.youtube.com/watch?v=L72fhGm1tfE",
            duration: "48:00",
            order: 2
          },
          {
            title: "MongoDB & Mongoose - Database Management",
            type: "video",
            content: "Work with MongoDB database and Mongoose ODM.",
            videoUrl: "https://www.youtube.com/watch?v=ofme2o29ngU",
            duration: "52:00",
            order: 3
          },
          {
            title: "Authentication & Authorization with JWT",
            type: "video",
            content: "Implement secure user authentication using JSON Web Tokens.",
            videoUrl: "https://www.youtube.com/watch?v=mbsmsi7l3r4",
            duration: "60:00",
            order: 4
          },
          {
            title: "File Upload & Error Handling",
            type: "video",
            content: "Handle file uploads and implement robust error handling.",
            videoUrl: "https://www.youtube.com/watch?v=srPXMt1Q0nY",
            duration: "40:00",
            order: 5
          }
        ]
      },
      {
        title: "Full-Stack Project & Deployment",
        description: "Build and deploy a complete full-stack application",
        order: 5,
        lessons: [
          {
            title: "Planning Your Full-Stack Project",
            type: "video",
            content: "Project planning, architecture design, and database schema.",
            videoUrl: "https://www.youtube.com/watch?v=7CqJlxBYj-M",
            duration: "35:00",
            order: 1
          },
          {
            title: "Connecting Frontend to Backend",
            type: "video",
            content: "Integrate React frontend with Node.js backend using Axios.",
            videoUrl: "https://www.youtube.com/watch?v=w3vs4a03y3I",
            duration: "45:00",
            order: 2
          },
          {
            title: "Git & GitHub for Version Control",
            type: "video",
            content: "Master Git commands and collaborate using GitHub.",
            videoUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk",
            duration: "50:00",
            order: 3
          },
          {
            title: "Deploying to Heroku & Netlify",
            type: "video",
            content: "Deploy your full-stack application to production.",
            videoUrl: "https://www.youtube.com/watch?v=l134cBAJCuc",
            duration: "40:00",
            order: 4
          },
          {
            title: "Best Practices & Next Steps",
            type: "video",
            content: "Code optimization, security best practices, and career guidance.",
            videoUrl: "https://www.youtube.com/watch?v=W5TuYTKcDu0",
            duration: "30:00",
            order: 5
          }
        ]
      }
    ]
  },
  {
    title: "Python Programming - Beginner to Advanced",
    description: "Complete Python course covering fundamentals, OOP, data structures, web scraping, automation, and data analysis. Build real-world projects and become a Python expert.",
    category: "Data Science",
    level: "Beginner",
    price: 89.99,
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
    language: "English",
    duration: "35 hours",
    modules: [
      {
        title: "Python Fundamentals",
        description: "Master Python basics - syntax, variables, data types, and control flow",
        order: 1,
        lessons: [
          {
            title: "Python Installation & Setup",
            type: "video",
            content: "Set up Python environment and write your first program.",
            videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
            duration: "30:00",
            order: 1
          },
          {
            title: "Variables, Data Types & Operators",
            type: "video",
            content: "Learn Python data types: strings, numbers, booleans, and operators.",
            videoUrl: "https://www.youtube.com/watch?v=Z1Yd7upQsXY",
            duration: "45:00",
            order: 2
          },
          {
            title: "Control Flow - If, Loops, and Logic",
            type: "video",
            content: "Master if-elif-else statements, for loops, and while loops.",
            videoUrl: "https://www.youtube.com/watch?v=x3vUv-nZYXE",
            duration: "40:00",
            order: 3
          },
          {
            title: "Functions & Modules",
            type: "video",
            content: "Create reusable code with functions and organize with modules.",
            videoUrl: "https://www.youtube.com/watch?v=89cGQjB5R4M",
            duration: "38:00",
            order: 4
          },
          {
            title: "Working with Files in Python",
            type: "video",
            content: "Read and write files, handle CSV and JSON data.",
            videoUrl: "https://www.youtube.com/watch?v=Uh2ebFW8OYM",
            duration: "35:00",
            order: 5
          }
        ]
      },
      {
        title: "Data Structures in Python",
        description: "Master lists, tuples, sets, dictionaries, and advanced data structures",
        order: 2,
        lessons: [
          {
            title: "Lists & List Comprehensions",
            type: "video",
            content: "Work with Python lists and write elegant list comprehensions.",
            videoUrl: "https://www.youtube.com/watch?v=W8KRzm-HUcc",
            duration: "42:00",
            order: 1
          },
          {
            title: "Tuples & Sets",
            type: "video",
            content: "Understand immutable tuples and unique collections with sets.",
            videoUrl: "https://www.youtube.com/watch?v=Mf7eFtbVxFM",
            duration: "35:00",
            order: 2
          },
          {
            title: "Dictionaries & Hash Maps",
            type: "video",
            content: "Master Python dictionaries for key-value data storage.",
            videoUrl: "https://www.youtube.com/watch?v=daefaLgNkw0",
            duration: "40:00",
            order: 3
          },
          {
            title: "Stacks, Queues & Linked Lists",
            type: "video",
            content: "Implement advanced data structures from scratch.",
            videoUrl: "https://www.youtube.com/watch?v=1UOPsfigShU",
            duration: "50:00",
            order: 4
          },
          {
            title: "Algorithms & Problem Solving",
            type: "video",
            content: "Learn sorting algorithms and solve coding challenges.",
            videoUrl: "https://www.youtube.com/watch?v=p65AHm9MX80",
            duration: "55:00",
            order: 5
          }
        ]
      },
      {
        title: "Object-Oriented Programming (OOP)",
        description: "Master OOP concepts - classes, objects, inheritance, and polymorphism",
        order: 3,
        lessons: [
          {
            title: "Classes & Objects Basics",
            type: "video",
            content: "Create classes and instantiate objects in Python.",
            videoUrl: "https://www.youtube.com/watch?v=JeznW_7DlB0",
            duration: "45:00",
            order: 1
          },
          {
            title: "Inheritance & Polymorphism",
            type: "video",
            content: "Build class hierarchies and implement polymorphism.",
            videoUrl: "https://www.youtube.com/watch?v=Ej_02ICOIgs",
            duration: "48:00",
            order: 2
          },
          {
            title: "Encapsulation & Abstraction",
            type: "video",
            content: "Implement data hiding and abstract classes.",
            videoUrl: "https://www.youtube.com/watch?v=1AgyBuVCTeE",
            duration: "40:00",
            order: 3
          },
          {
            title: "Magic Methods & Operator Overloading",
            type: "video",
            content: "Customize class behavior with magic methods.",
            videoUrl: "https://www.youtube.com/watch?v=3ohzBxoFHAY",
            duration: "38:00",
            order: 4
          },
          {
            title: "Design Patterns in Python",
            type: "video",
            content: "Learn common design patterns for better code organization.",
            videoUrl: "https://www.youtube.com/watch?v=tAuRQs_d9F8",
            duration: "52:00",
            order: 5
          }
        ]
      },
      {
        title: "Python for Automation & Web Scraping",
        description: "Automate tasks and extract data from websites",
        order: 4,
        lessons: [
          {
            title: "Automating Tasks with Python",
            type: "video",
            content: "Automate file operations, emails, and repetitive tasks.",
            videoUrl: "https://www.youtube.com/watch?v=s8XjEuplx_U",
            duration: "50:00",
            order: 1
          },
          {
            title: "Web Scraping with BeautifulSoup",
            type: "video",
            content: "Extract data from websites using BeautifulSoup.",
            videoUrl: "https://www.youtube.com/watch?v=XVv6mJpFOb0",
            duration: "60:00",
            order: 2
          },
          {
            title: "Advanced Scraping with Selenium",
            type: "video",
            content: "Scrape dynamic websites and automate browser actions.",
            videoUrl: "https://www.youtube.com/watch?v=Xjv1sY630Uc",
            duration: "55:00",
            order: 3
          },
          {
            title: "Working with APIs in Python",
            type: "video",
            content: "Make HTTP requests and work with REST APIs.",
            videoUrl: "https://www.youtube.com/watch?v=qbLc5a9jdXo",
            duration: "45:00",
            order: 4
          },
          {
            title: "Building a Web Scraper Project",
            type: "video",
            content: "Build a complete web scraping project from scratch.",
            videoUrl: "https://www.youtube.com/watch?v=ng2o98k983k",
            duration: "70:00",
            order: 5
          }
        ]
      },
      {
        title: "Data Analysis with Python",
        description: "Analyze data using Pandas, NumPy, and Matplotlib",
        order: 5,
        lessons: [
          {
            title: "NumPy for Numerical Computing",
            type: "video",
            content: "Work with arrays and perform numerical operations.",
            videoUrl: "https://www.youtube.com/watch?v=QUT1VHiLmmI",
            duration: "48:00",
            order: 1
          },
          {
            title: "Pandas for Data Manipulation",
            type: "video",
            content: "Master DataFrames and data manipulation with Pandas.",
            videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg",
            duration: "65:00",
            order: 2
          },
          {
            title: "Data Visualization with Matplotlib",
            type: "video",
            content: "Create beautiful charts and graphs with Matplotlib.",
            videoUrl: "https://www.youtube.com/watch?v=3Xc3CA655Y4",
            duration: "50:00",
            order: 3
          },
          {
            title: "Exploratory Data Analysis (EDA)",
            type: "video",
            content: "Analyze real datasets and discover insights.",
            videoUrl: "https://www.youtube.com/watch?v=xi0vhXFPegw",
            duration: "55:00",
            order: 4
          },
          {
            title: "Complete Data Analysis Project",
            type: "video",
            content: "Analyze a real-world dataset from start to finish.",
            videoUrl: "https://www.youtube.com/watch?v=r-uOLxNrNk8",
            duration: "80:00",
            order: 5
          }
        ]
      }
    ]
  },
  {
    title: "Digital Marketing Mastery 2025",
    description: "Complete digital marketing course covering SEO, social media marketing, email marketing, content marketing, and paid advertising. Launch successful marketing campaigns.",
    category: "Digital Marketing",
    level: "Beginner",
    price: 79.99,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    language: "English",
    duration: "30 hours",
    modules: [
      {
        title: "Digital Marketing Fundamentals",
        description: "Understanding the digital marketing landscape and strategy",
        order: 1,
        lessons: [
          {
            title: "Introduction to Digital Marketing",
            type: "video",
            content: "Overview of digital marketing channels and opportunities.",
            videoUrl: "https://www.youtube.com/watch?v=nU-IIXBWlS4",
            duration: "35:00",
            order: 1
          },
          {
            title: "Creating a Marketing Strategy",
            type: "video",
            content: "Define goals, target audience, and create a marketing plan.",
            videoUrl: "https://www.youtube.com/watch?v=AQRj_oUBb9M",
            duration: "42:00",
            order: 2
          },
          {
            title: "Understanding Your Target Audience",
            type: "video",
            content: "Create buyer personas and understand customer psychology.",
            videoUrl: "https://www.youtube.com/watch?v=iYPmrLpJY2k",
            duration: "38:00",
            order: 3
          },
          {
            title: "Marketing Funnel & Customer Journey",
            type: "video",
            content: "Map the customer journey from awareness to conversion.",
            videoUrl: "https://www.youtube.com/watch?v=Tw6mEbS3l0Q",
            duration: "40:00",
            order: 4
          },
          {
            title: "Analytics & KPIs",
            type: "video",
            content: "Track and measure marketing performance with analytics.",
            videoUrl: "https://www.youtube.com/watch?v=aNGkLVJLlvE",
            duration: "45:00",
            order: 5
          }
        ]
      },
      {
        title: "Search Engine Optimization (SEO)",
        description: "Master SEO to rank #1 on Google and drive organic traffic",
        order: 2,
        lessons: [
          {
            title: "SEO Basics & How Search Engines Work",
            type: "video",
            content: "Understand how Google ranks websites and SEO fundamentals.",
            videoUrl: "https://www.youtube.com/watch?v=DvwS7cV9GmQ",
            duration: "50:00",
            order: 1
          },
          {
            title: "Keyword Research & Strategy",
            type: "video",
            content: "Find profitable keywords and plan your content strategy.",
            videoUrl: "https://www.youtube.com/watch?v=hOnEQR5AZ3k",
            duration: "45:00",
            order: 2
          },
          {
            title: "On-Page SEO Optimization",
            type: "video",
            content: "Optimize titles, meta descriptions, headers, and content.",
            videoUrl: "https://www.youtube.com/watch?v=mRb4kx5S5AY",
            duration: "48:00",
            order: 3
          },
          {
            title: "Technical SEO & Site Speed",
            type: "video",
            content: "Improve site structure, speed, and mobile optimization.",
            videoUrl: "https://www.youtube.com/watch?v=I5NDOVq1Qf0",
            duration: "52:00",
            order: 4
          },
          {
            title: "Link Building & Off-Page SEO",
            type: "video",
            content: "Build high-quality backlinks to boost domain authority.",
            videoUrl: "https://www.youtube.com/watch?v=RM3FCVXbDas",
            duration: "55:00",
            order: 5
          }
        ]
      },
      {
        title: "Social Media Marketing",
        description: "Grow your brand on Facebook, Instagram, LinkedIn, and Twitter",
        order: 3,
        lessons: [
          {
            title: "Social Media Strategy & Planning",
            type: "video",
            content: "Create a winning social media strategy for your brand.",
            videoUrl: "https://www.youtube.com/watch?v=YmjxUTCZmL8",
            duration: "40:00",
            order: 1
          },
          {
            title: "Facebook & Instagram Marketing",
            type: "video",
            content: "Build engaged communities on Facebook and Instagram.",
            videoUrl: "https://www.youtube.com/watch?v=6pjCKcB7Waw",
            duration: "55:00",
            order: 2
          },
          {
            title: "LinkedIn for B2B Marketing",
            type: "video",
            content: "Generate leads and build authority on LinkedIn.",
            videoUrl: "https://www.youtube.com/watch?v=gYlWCWB6yJA",
            duration: "45:00",
            order: 3
          },
          {
            title: "Content Creation & Visual Design",
            type: "video",
            content: "Create engaging posts, stories, and visual content.",
            videoUrl: "https://www.youtube.com/watch?v=HWAldIaKtxQ",
            duration: "50:00",
            order: 4
          },
          {
            title: "Social Media Analytics & Growth Hacks",
            type: "video",
            content: "Analyze performance and grow your following organically.",
            videoUrl: "https://www.youtube.com/watch?v=L9eLwPpFUhk",
            duration: "48:00",
            order: 5
          }
        ]
      },
      {
        title: "Paid Advertising - Google Ads & Facebook Ads",
        description: "Run profitable ad campaigns on Google and Facebook",
        order: 4,
        lessons: [
          {
            title: "Google Ads Fundamentals",
            type: "video",
            content: "Create and optimize Google Search and Display campaigns.",
            videoUrl: "https://www.youtube.com/watch?v=uryS10EZxHM",
            duration: "60:00",
            order: 1
          },
          {
            title: "Facebook & Instagram Ads Mastery",
            type: "video",
            content: "Create high-converting Facebook and Instagram ad campaigns.",
            videoUrl: "https://www.youtube.com/watch?v=V5WlaSW_fp8",
            duration: "65:00",
            order: 2
          },
          {
            title: "Audience Targeting & Retargeting",
            type: "video",
            content: "Target the right audience and retarget website visitors.",
            videoUrl: "https://www.youtube.com/watch?v=iUC8oQ42KDE",
            duration: "50:00",
            order: 3
          },
          {
            title: "Ad Copywriting & Creative Design",
            type: "video",
            content: "Write compelling ad copy and create eye-catching visuals.",
            videoUrl: "https://www.youtube.com/watch?v=Y34DDAKlDkA",
            duration: "45:00",
            order: 4
          },
          {
            title: "Campaign Optimization & ROI",
            type: "video",
            content: "Optimize campaigns for maximum return on ad spend (ROAS).",
            videoUrl: "https://www.youtube.com/watch?v=TsPpcjR6lGg",
            duration: "55:00",
            order: 5
          }
        ]
      },
      {
        title: "Email Marketing & Content Marketing",
        description: "Build email lists and create content that converts",
        order: 5,
        lessons: [
          {
            title: "Email Marketing Strategy",
            type: "video",
            content: "Build email lists and create effective email campaigns.",
            videoUrl: "https://www.youtube.com/watch?v=Gl8q7IFbAik",
            duration: "48:00",
            order: 1
          },
          {
            title: "Email Automation & Sequences",
            type: "video",
            content: "Set up automated email funnels and welcome sequences.",
            videoUrl: "https://www.youtube.com/watch?v=FULcXL9h30Y",
            duration: "52:00",
            order: 2
          },
          {
            title: "Content Marketing Fundamentals",
            type: "video",
            content: "Create valuable content that attracts and engages customers.",
            videoUrl: "https://www.youtube.com/watch?v=TuxdFZJVgT8",
            duration: "45:00",
            order: 3
          },
          {
            title: "Blogging & SEO Content Writing",
            type: "video",
            content: "Write blog posts that rank on Google and drive traffic.",
            videoUrl: "https://www.youtube.com/watch?v=BQHRGd96qSQ",
            duration: "50:00",
            order: 4
          },
          {
            title: "Building a Complete Marketing Campaign",
            type: "video",
            content: "Integrate all channels into a cohesive marketing campaign.",
            videoUrl: "https://www.youtube.com/watch?v=GutdgYMOmhk",
            duration: "60:00",
            order: 5
          }
        ]
      }
    ]
  },
  {
    title: "UI/UX Design - Complete Figma Course",
    description: "Master UI/UX design principles and create beautiful, user-friendly interfaces using Figma. Learn user research, wireframing, prototyping, and design systems.",
    category: "UI/UX Design",
    level: "Beginner",
    price: 69.99,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    language: "English",
    duration: "28 hours",
    modules: [
      {
        title: "UX Design Fundamentals",
        description: "Learn user experience design principles and research methods",
        order: 1,
        lessons: [
          {
            title: "Introduction to UX Design",
            type: "video",
            content: "Understanding UX design, user-centered design process.",
            videoUrl: "https://www.youtube.com/watch?v=YPGEfHsRZ5w",
            duration: "35:00",
            order: 1
          },
          {
            title: "User Research & Personas",
            type: "video",
            content: "Conduct user research and create detailed user personas.",
            videoUrl: "https://www.youtube.com/watch?v=XaHk0VYeY0E",
            duration: "42:00",
            order: 2
          },
          {
            title: "Information Architecture",
            type: "video",
            content: "Organize content and create logical site structures.",
            videoUrl: "https://www.youtube.com/watch?v=Q_Ui79rjQvM",
            duration: "38:00",
            order: 3
          },
          {
            title: "User Flows & Journey Maps",
            type: "video",
            content: "Map user journeys and create effective user flows.",
            videoUrl: "https://www.youtube.com/watch?v=TIV1y11xz7k",
            duration: "40:00",
            order: 4
          },
          {
            title: "Wireframing Techniques",
            type: "video",
            content: "Create low and high-fidelity wireframes for your designs.",
            videoUrl: "https://www.youtube.com/watch?v=wz7YOr7NaJw",
            duration: "45:00",
            order: 5
          }
        ]
      },
      {
        title: "Figma Mastery - Tools & Techniques",
        description: "Master Figma from basics to advanced features",
        order: 2,
        lessons: [
          {
            title: "Figma Basics & Interface",
            type: "video",
            content: "Get started with Figma: interface, tools, and basic operations.",
            videoUrl: "https://www.youtube.com/watch?v=Cx2dkpBxst8",
            duration: "50:00",
            order: 1
          },
          {
            title: "Working with Shapes & Vectors",
            type: "video",
            content: "Master shape tools, vector editing, and boolean operations.",
            videoUrl: "https://www.youtube.com/watch?v=RuR74OV0Kuo",
            duration: "45:00",
            order: 2
          },
          {
            title: "Typography & Text Styles",
            type: "video",
            content: "Work with fonts, text styles, and typography best practices.",
            videoUrl: "https://www.youtube.com/watch?v=B242nuM3y2s",
            duration: "40:00",
            order: 3
          },
          {
            title: "Components & Auto Layout",
            type: "video",
            content: "Create reusable components and responsive layouts.",
            videoUrl: "https://www.youtube.com/watch?v=A-Qlx8qwdks",
            duration: "55:00",
            order: 4
          },
          {
            title: "Styles, Colors & Design Tokens",
            type: "video",
            content: "Manage colors, effects, and create consistent design systems.",
            videoUrl: "https://www.youtube.com/watch?v=ZzgJk79cUWE",
            duration: "48:00",
            order: 5
          }
        ]
      },
      {
        title: "UI Design Principles & Visual Design",
        description: "Create beautiful, modern user interfaces",
        order: 3,
        lessons: [
          {
            title: "Color Theory for UI Design",
            type: "video",
            content: "Master color palettes, contrast, and color psychology.",
            videoUrl: "https://www.youtube.com/watch?v=QkCVrNoqcBU",
            duration: "42:00",
            order: 1
          },
          {
            title: "Typography in UI Design",
            type: "video",
            content: "Choose fonts, create type hierarchies, and improve readability.",
            videoUrl: "https://www.youtube.com/watch?v=agbh1wbfJt8",
            duration: "45:00",
            order: 2
          },
          {
            title: "Layout & Grid Systems",
            type: "video",
            content: "Create balanced layouts using grids and spacing systems.",
            videoUrl: "https://www.youtube.com/watch?v=n_V_aLqYPI0",
            duration: "48:00",
            order: 3
          },
          {
            title: "Visual Hierarchy & Composition",
            type: "video",
            content: "Guide user attention with effective visual hierarchy.",
            videoUrl: "https://www.youtube.com/watch?v=CrpsrhJmVzE",
            duration: "40:00",
            order: 4
          },
          {
            title: "Icons, Images & Visual Assets",
            type: "video",
            content: "Work with icons, images, and create compelling visuals.",
            videoUrl: "https://www.youtube.com/watch?v=OXE54h-QVbM",
            duration: "38:00",
            order: 5
          }
        ]
      },
      {
        title: "Prototyping & Interaction Design",
        description: "Bring your designs to life with interactive prototypes",
        order: 4,
        lessons: [
          {
            title: "Figma Prototyping Basics",
            type: "video",
            content: "Create interactive prototypes with Figma's prototyping tools.",
            videoUrl: "https://www.youtube.com/watch?v=RaFI4OMcJcw",
            duration: "50:00",
            order: 1
          },
          {
            title: "Advanced Interactions & Animations",
            type: "video",
            content: "Create smooth transitions, micro-interactions, and animations.",
            videoUrl: "https://www.youtube.com/watch?v=9JbCh-3qDy8",
            duration: "55:00",
            order: 2
          },
          {
            title: "Mobile App Design & Gestures",
            type: "video",
            content: "Design mobile interfaces with touch gestures and interactions.",
            videoUrl: "https://www.youtube.com/watch?v=dSP36dQ-g2w",
            duration: "48:00",
            order: 3
          },
          {
            title: "Responsive Design Techniques",
            type: "video",
            content: "Create designs that work across all device sizes.",
            videoUrl: "https://www.youtube.com/watch?v=j5BM4Dbu8yA",
            duration: "52:00",
            order: 4
          },
          {
            title: "User Testing & Feedback",
            type: "video",
            content: "Test prototypes with users and iterate based on feedback.",
            videoUrl: "https://www.youtube.com/watch?v=0YL0xoSmyZI",
            duration: "45:00",
            order: 5
          }
        ]
      },
      {
        title: "Design Systems & Handoff",
        description: "Build scalable design systems and collaborate with developers",
        order: 5,
        lessons: [
          {
            title: "Introduction to Design Systems",
            type: "video",
            content: "Understand design systems and component libraries.",
            videoUrl: "https://www.youtube.com/watch?v=EK-pHkc5EL4",
            duration: "40:00",
            order: 1
          },
          {
            title: "Building a Component Library",
            type: "video",
            content: "Create reusable UI components and variants in Figma.",
            videoUrl: "https://www.youtube.com/watch?v=E_g0rVbT5Go",
            duration: "60:00",
            order: 2
          },
          {
            title: "Design Tokens & Documentation",
            type: "video",
            content: "Document design decisions and create style guides.",
            videoUrl: "https://www.youtube.com/watch?v=wtTstdiBuUk",
            duration: "45:00",
            order: 3
          },
          {
            title: "Developer Handoff & Collaboration",
            type: "video",
            content: "Prepare designs for development and collaborate with devs.",
            videoUrl: "https://www.youtube.com/watch?v=B8U6IgkmN1s",
            duration: "48:00",
            order: 4
          },
          {
            title: "Complete UI/UX Project Walkthrough",
            type: "video",
            content: "Design a complete app from research to final handoff.",
            videoUrl: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
            duration: "90:00",
            order: 5
          }
        ]
      }
    ]
  },
  {
    title: "Data Science & Machine Learning with Python",
    description: "Complete data science course: Python, statistics, machine learning, deep learning, and AI. Build and deploy ML models. Perfect for aspiring data scientists.",
    category: "Data Science",
    level: "Intermediate",
    price: 119.99,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    language: "English",
    duration: "45 hours",
    modules: [
      {
        title: "Python for Data Science",
        description: "Master Python libraries for data analysis and visualization",
        order: 1,
        lessons: [
          {
            title: "Python Basics for Data Science",
            type: "video",
            content: "Python fundamentals focused on data science applications.",
            videoUrl: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
            duration: "60:00",
            order: 1
          },
          {
            title: "NumPy for Numerical Computing",
            type: "video",
            content: "Master NumPy arrays and numerical operations.",
            videoUrl: "https://www.youtube.com/watch?v=QUT1VHiLmmI",
            duration: "50:00",
            order: 2
          },
          {
            title: "Pandas for Data Manipulation",
            type: "video",
            content: "Data cleaning, transformation, and analysis with Pandas.",
            videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg",
            duration: "70:00",
            order: 3
          },
          {
            title: "Data Visualization with Matplotlib & Seaborn",
            type: "video",
            content: "Create insightful visualizations and statistical plots.",
            videoUrl: "https://www.youtube.com/watch?v=0P7QnIQDBJY",
            duration: "55:00",
            order: 4
          },
          {
            title: "Exploratory Data Analysis (EDA)",
            type: "video",
            content: "Analyze real datasets and extract meaningful insights.",
            videoUrl: "https://www.youtube.com/watch?v=xi0vhXFPegw",
            duration: "65:00",
            order: 5
          }
        ]
      },
      {
        title: "Statistics & Probability for Data Science",
        description: "Master statistical concepts essential for data science",
        order: 2,
        lessons: [
          {
            title: "Descriptive Statistics",
            type: "video",
            content: "Mean, median, mode, variance, and standard deviation.",
            videoUrl: "https://www.youtube.com/watch?v=xxpc-HPKN28",
            duration: "45:00",
            order: 1
          },
          {
            title: "Probability Theory & Distributions",
            type: "video",
            content: "Probability concepts and common probability distributions.",
            videoUrl: "https://www.youtube.com/watch?v=uzkc-qNVoOk",
            duration: "50:00",
            order: 2
          },
          {
            title: "Hypothesis Testing",
            type: "video",
            content: "Statistical hypothesis testing and p-values.",
            videoUrl: "https://www.youtube.com/watch?v=5koKb5AZYW w",
            duration: "48:00",
            order: 3
          },
          {
            title: "Correlation & Regression Analysis",
            type: "video",
            content: "Understand relationships between variables.",
            videoUrl: "https://www.youtube.com/watch?v=zPG4NjIkCjc",
            duration: "52:00",
            order: 4
          },
          {
            title: "Statistical Inference",
            type: "video",
            content: "Confidence intervals and statistical inference techniques.",
            videoUrl: "https://www.youtube.com/watch?v=cmjEPMJ4ZOU",
            duration: "55:00",
            order: 5
          }
        ]
      },
      {
        title: "Machine Learning Fundamentals",
        description: "Learn core machine learning algorithms and techniques",
        order: 3,
        lessons: [
          {
            title: "Introduction to Machine Learning",
            type: "video",
            content: "ML concepts, types of learning, and workflow.",
            videoUrl: "https://www.youtube.com/watch?v=ukzFI9rgwfU",
            duration: "60:00",
            order: 1
          },
          {
            title: "Linear & Logistic Regression",
            type: "video",
            content: "Build regression models for prediction and classification.",
            videoUrl: "https://www.youtube.com/watch?v=VmbA0pi2cRQ",
            duration: "65:00",
            order: 2
          },
          {
            title: "Decision Trees & Random Forests",
            type: "video",
            content: "Implement tree-based models for classification.",
            videoUrl: "https://www.youtube.com/watch?v=PHxYNGo8NcI",
            duration: "55:00",
            order: 3
          },
          {
            title: "Support Vector Machines (SVM)",
            type: "video",
            content: "Classification with SVMs and kernel methods.",
            videoUrl: "https://www.youtube.com/watch?v=_YPScrckx28",
            duration: "50:00",
            order: 4
          },
          {
            title: "K-Means Clustering & Unsupervised Learning",
            type: "video",
            content: "Discover patterns with clustering algorithms.",
            videoUrl: "https://www.youtube.com/watch?v=4b5d3muPQmA",
            duration: "48:00",
            order: 5
          }
        ]
      },
      {
        title: "Deep Learning & Neural Networks",
        description: "Build neural networks with TensorFlow and Keras",
        order: 4,
        lessons: [
          {
            title: "Introduction to Neural Networks",
            type: "video",
            content: "Understand perceptrons, activation functions, and backpropagation.",
            videoUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
            duration: "60:00",
            order: 1
          },
          {
            title: "Building Neural Networks with TensorFlow",
            type: "video",
            content: "Create and train neural networks using TensorFlow/Keras.",
            videoUrl: "https://www.youtube.com/watch?v=tPYj3fFJGjk",
            duration: "75:00",
            order: 2
          },
          {
            title: "Convolutional Neural Networks (CNN)",
            type: "video",
            content: "Image classification with convolutional neural networks.",
            videoUrl: "https://www.youtube.com/watch?v=YRhxdVk_sIs",
            duration: "70:00",
            order: 3
          },
          {
            title: "Recurrent Neural Networks (RNN) & LSTM",
            type: "video",
            content: "Sequential data and time series analysis with RNNs.",
            videoUrl: "https://www.youtube.com/watch?v=AsNTP8Kwu80",
            duration: "65:00",
            order: 4
          },
          {
            title: "Transfer Learning & Pre-trained Models",
            type: "video",
            content: "Leverage pre-trained models for faster results.",
            videoUrl: "https://www.youtube.com/watch?v=5T-iXNNiwIs",
            duration: "55:00",
            order: 5
          }
        ]
      },
      {
        title: "MLOps & Model Deployment",
        description: "Deploy machine learning models to production",
        order: 5,
        lessons: [
          {
            title: "Model Evaluation & Validation",
            type: "video",
            content: "Cross-validation, metrics, and model selection.",
            videoUrl: "https://www.youtube.com/watch?v=TJveOYsK6MY",
            duration: "50:00",
            order: 1
          },
          {
            title: "Feature Engineering & Selection",
            type: "video",
            content: "Create and select features for better model performance.",
            videoUrl: "https://www.youtube.com/watch?v=6WDFfaYtN6s",
            duration: "55:00",
            order: 2
          },
          {
            title: "Model Deployment with Flask",
            type: "video",
            content: "Deploy ML models as web APIs using Flask.",
            videoUrl: "https://www.youtube.com/watch?v=UbCWoMf80PY",
            duration: "60:00",
            order: 3
          },
          {
            title: "Cloud Deployment (AWS, Azure, GCP)",
            type: "video",
            content: "Deploy models to cloud platforms for scalability.",
            videoUrl: "https://www.youtube.com/watch?v=6stDhEA0wFQ",
            duration: "65:00",
            order: 4
          },
          {
            title: "Complete ML Project - End to End",
            type: "video",
            content: "Build, train, evaluate, and deploy a complete ML project.",
            videoUrl: "https://www.youtube.com/watch?v=fiz1ORTBGpY",
            duration: "120:00",
            order: 5
          }
        ]
      }
    ]
  }
];

async function seedPremiumCourses() {
  try {
    console.log('\n🚀 Starting Premium Course Seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...\n');
    await Course.deleteMany({});
    await User.deleteMany({});
    await Quiz.deleteMany({});
    console.log('   ✅ Data cleared\n');

    // Create users
    console.log('👥 Creating users...\n');
    
    // Note: Password will be hashed automatically by User model's pre-save hook
    const plainPassword = 'demo123';

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@elearning.com',
      password: plainPassword,
      role: 'admin',
      bio: 'Platform Administrator'
    });

    const instructor1 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@elearning.com',
      password: plainPassword,
      role: 'instructor',
      bio: 'Full-stack developer with 10+ years experience'
    });

    const instructor2 = await User.create({
      name: 'Prof. Michael Chen',
      email: 'michael.chen@elearning.com',
      password: plainPassword,
      role: 'instructor',
      bio: 'Data science expert and AI researcher'
    });

    console.log('   ✅ Admin created: admin@elearning.com');
    console.log('   ✅ Instructor created: sarah.johnson@elearning.com');
    console.log('   ✅ Instructor created: michael.chen@elearning.com\n');

    // Create students
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const student = await User.create({
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        password: plainPassword,
        role: 'student',
        bio: `Passionate learner ${i}`
      });
      students.push(student);
      console.log(`   ✅ Student created: student${i}@example.com`);
    }

    console.log('\n📚 Creating premium courses...\n');

    // Assign instructors to courses
    const instructors = [instructor1, instructor2, instructor1, instructor2, instructor1];

    // Create all courses
    for (let i = 0; i < premiumCourses.length; i++) {
      const courseData = premiumCourses[i];
      const instructor = instructors[i];

      console.log(`   📖 Creating: "${courseData.title}"...`);

      const course = await Course.create({
        title: courseData.title,
        description: courseData.description,
        instructor: instructor.name,
        instructorId: instructor._id,
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        thumbnail: courseData.thumbnail,
        image: courseData.thumbnail,
        language: courseData.language,
        duration: courseData.duration,
        curriculum: courseData.modules, // Using curriculum instead of modules
        isPublished: true,
        enrolledStudents: Math.floor(Math.random() * 500) + 100,
        averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 200) + 50
      });

      console.log(`      ✅ Created with ${courseData.modules.length} modules\n`);
    }

    console.log('\n✅ All premium courses created successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - 5 comprehensive courses`);
    console.log(`   - 25 modules total (5 per course)`);
    console.log(`   - 125 lessons total (5 per module)`);
    console.log(`   - All with real YouTube video links\n`);
    
    console.log('🔐 Login Credentials:');
    console.log('   Admin: admin@elearning.com / demo123');
    console.log('   Instructor 1: sarah.johnson@elearning.com / demo123');
    console.log('   Instructor 2: michael.chen@elearning.com / demo123');
    console.log('   Students: student1@example.com to student5@example.com / demo123\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedPremiumCourses();
