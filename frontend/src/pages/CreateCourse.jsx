import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, DollarSign, Upload, Plus, X, Save } from 'lucide-react';
import api from '../config/api';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: 'Web Development',
    level: 'Beginner',
    price: 0,
    originalPrice: 0,
    duration: '',
    image: '',
    language: 'English',
    requirements: [''],
    whatYouWillLearn: [''],
    tags: [''],
    curriculum: [{
      title: '',
      description: '',
      duration: '',
      lessons: [{
        title: '',
        duration: '',
        isPreview: false,
        videoUrl: '',
        content: ''
      }]
    }]
  });

  const categories = [
    'Web Development',
    'Data Science',
    'Artificial Intelligence',
    'UI/UX Design',
    'Digital Marketing',
    'Mobile Development',
    'Photography',
    'Music Production',
    'Business',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleCurriculumChange = (sectionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((section, i) => 
        i === sectionIndex ? { ...section, [field]: value } : section
      )
    }));
  };

  const handleLessonChange = (sectionIndex, lessonIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((section, i) => {
        if (i === sectionIndex) {
          return {
            ...section,
            lessons: section.lessons.map((lesson, j) => 
              j === lessonIndex ? { ...lesson, [field]: value } : lesson
            )
          };
        }
        return section;
      })
    }));
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, {
        title: '',
        description: '',
        duration: '',
        lessons: [{ title: '', duration: '', isPreview: false, videoUrl: '', content: '' }]
      }]
    }));
  };

  const removeSection = (index) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, i) => i !== index)
    }));
  };

  const addLesson = (sectionIndex) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((section, i) => {
        if (i === sectionIndex) {
          return {
            ...section,
            lessons: [...section.lessons, { title: '', duration: '', isPreview: false, videoUrl: '', content: '' }]
          };
        }
        return section;
      })
    }));
  };

  const removeLesson = (sectionIndex, lessonIndex) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((section, i) => {
        if (i === sectionIndex) {
          return {
            ...section,
            lessons: section.lessons.filter((_, j) => j !== lessonIndex)
          };
        }
        return section;
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Filter out empty items from arrays
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        whatYouWillLearn: formData.whatYouWillLearn.filter(w => w.trim() !== ''),
        tags: formData.tags.filter(t => t.trim() !== ''),
        curriculum: formData.curriculum.filter(section => section.title.trim() !== '')
      };

      const response = await api.post('/courses', cleanedData);
      
      if (response.data.success) {
        navigate('/instructor/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Create New Course</h1>
              <p className="text-gray-400">Fill in the details to create your course</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-2">
                Basic Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Complete Web Development Bootcamp"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe what students will learn in this course..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Instructor Name *
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    required
                    value={formData.instructor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    required
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 10 hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Level *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="49.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    min="0"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="99.99"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Course Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-2">
                Requirements
              </h2>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Basic understanding of HTML"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('requirements', index)}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Requirement
              </button>
            </div>

            {/* What You Will Learn */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-2">
                What Students Will Learn
              </h2>
              {formData.whatYouWillLearn.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('whatYouWillLearn', index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Build responsive websites"
                  />
                  {formData.whatYouWillLearn.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('whatYouWillLearn', index)}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('whatYouWillLearn')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Learning Outcome
              </button>
            </div>

            {/* Curriculum */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-2">
                Curriculum
              </h2>
              {formData.curriculum.map((section, sectionIndex) => (
                <div key={sectionIndex} className="bg-slate-700/50 p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleCurriculumChange(sectionIndex, 'title', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Section title (e.g., Introduction to React)"
                      />
                      <textarea
                        value={section.description}
                        onChange={(e) => handleCurriculumChange(sectionIndex, 'description', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Section description"
                        rows={2}
                      />
                    </div>
                    {formData.curriculum.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Lessons */}
                  <div className="pl-6 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-300">Lessons</h3>
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="bg-slate-800 p-4 rounded-lg space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, 'title', e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Lesson title"
                          />
                          <input
                            type="text"
                            value={lesson.duration}
                            onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, 'duration', e.target.value)}
                            className="w-28 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="10 min"
                          />
                          {section.lessons.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLesson(sectionIndex, lessonIndex)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <input
                          type="url"
                          value={lesson.videoUrl}
                          onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, 'videoUrl', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Video URL (optional)"
                        />
                        <textarea
                          value={lesson.content}
                          onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, 'content', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Lesson content/notes"
                          rows={3}
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={lesson.isPreview}
                            onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, 'isPreview', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                          />
                          Free preview lesson
                        </label>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLesson(sectionIndex)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> Add Lesson
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addSection}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Creating Course...' : 'Create Course'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/instructor/dashboard')}
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
