const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    instructor: {
      type: String,
      required: [true, 'Please provide instructor name'],
      trim: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: [
        'Web Development',
        'Data Science',
        'Artificial Intelligence',
        'UI/UX Design',
        'Digital Marketing',
        'Mobile Development',
        'Photography',
        'Music Production',
        'Business',
        'Other',
      ],
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
    },
    duration: {
      type: String,
      required: [true, 'Please provide course duration'],
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    },
    thumbnail: {
      type: String,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    // Reviews & Ratings (updated by Review model)
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    curriculum: [
      {
        title: String,
        description: String,
        duration: String,
        lessons: [
          {
            title: String,
            duration: String,
            isPreview: {
              type: Boolean,
              default: false,
            },
            videoUrl: String,
            content: String,
          },
        ],
      },
    ],
    requirements: [
      {
        type: String,
      },
    ],
    whatYouWillLearn: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    language: {
      type: String,
      default: 'English',
    },
    certificate: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, isPublished: 1 });

module.exports = mongoose.model('Course', courseSchema);
