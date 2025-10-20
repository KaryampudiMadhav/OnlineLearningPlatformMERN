import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp,
  Plus,
  X,
  Save,
  AlertCircle,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import api from '../config/api';

const CreateSkillsCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatingCurriculum, setGeneratingCurriculum] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    level: 'Beginner',
    price: 0,
    duration: '',
  });

  // Skills input
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);

  // Generated curriculum preview
  const [generatedCurriculum, setGeneratedCurriculum] = useState(null);

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
    'Other',
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      if (skills.length >= 5) {
        toast.error('Maximum 5 skills allowed for optimal course generation');
        return;
      }
      setSkills([...skills, trimmedSkill]);
      setSkillInput('');
      toast.success(`Added: ${trimmedSkill}`, { duration: 2000 });
    } else if (skills.includes(trimmedSkill)) {
      toast.error('This skill is already added');
    } else if (!trimmedSkill) {
      toast.error('Please enter a skill name');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
    toast.info(`Removed: ${skillToRemove}`, { duration: 2000 });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Generate curriculum using Gemini AI
  const handleGenerateCurriculum = async () => {
    if (skills.length === 0) {
      toast.error('Please add at least one skill to generate curriculum');
      return;
    }

    if (!courseData.title.trim() || !courseData.description.trim()) {
      toast.error('Please fill in course title and description first');
      return;
    }

    setGeneratingCurriculum(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/ai-course/generate-skills', { 
        skills,
        courseTitle: courseData.title,
        courseDescription: courseData.description,
        category: courseData.category,
        level: courseData.level,
        price: parseFloat(courseData.price) || 0
      });

      if (response.data.success) {
        setGeneratedCurriculum(response.data.course);
        setSuccess('✅ AI-powered curriculum generated successfully!');
        toast.success(`Generated ${response.data.course.skills.length} skills with learning paths!`, {
          duration: 3000
        });
      }
    } catch (err) {
      console.error('Error generating curriculum:', err);
      const errorMsg = err.response?.data?.message || 'Failed to generate curriculum. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setGeneratingCurriculum(false);
    }
  };

  // Create course with AI-generated curriculum
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!courseData.title || !courseData.description) {
      toast.error('Please fill in all required fields');
      setError('Please fill in all required fields');
      return;
    }

    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      setError('Please add at least one skill');
      return;
    }

    if (!generatedCurriculum) {
      toast.error('Please generate curriculum before creating the course');
      setError('Please generate curriculum before creating the course');
      return;
    }

    setLoading(true);

    try {
      // Course is already created in the backend when generate-skills is called
      // The generatedCurriculum contains the saved course with _id
      setSuccess('✅ Course created successfully with AI-generated content!');
      toast.success('Course saved! Redirecting to your dashboard...');
      
      setTimeout(() => {
        navigate(`/courses/${generatedCurriculum._id}`);
      }, 2000);
    } catch (err) {
      console.error('Error creating course:', err);
      const errorMsg = err.response?.data?.message || 'Failed to create course. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Create AI-Powered Course 🤖
            </h1>
            <p className="text-gray-600">
              Add skills and let Gemini AI generate a complete curriculum with modules, resources, and quizzes
            </p>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                📚 Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={courseData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Complete Full-Stack Development Bootcamp"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what students will learn in this course..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    name="level"
                    value={courseData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={courseData.price}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0 for free"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={courseData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 8 weeks"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Skills Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <Target className="text-blue-600" size={24} />
                  Skills to Learn
                </h2>
                <span className="text-sm text-gray-600 font-medium">
                  {skills.length}/5 skills added
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Add 1-5 skills. AI will generate 5+ structured learning steps per skill with quizzes and resources.
                </p>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a skill (e.g., React, Machine Learning, Python)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={skills.length >= 5}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={skills.length >= 5 || !skillInput.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add
                </button>
              </div>

              {/* Skills List */}
              {skills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Added Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 border border-indigo-300 text-indigo-900 rounded-lg text-sm font-medium hover:border-indigo-400 transition group"
                      >
                        <Zap size={14} className="text-indigo-600" />
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-indigo-600 hover:text-red-600 transition ml-1"
                          title="Remove skill"
                        >
                          <X size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Curriculum Button */}
            <div className="pt-4 space-y-3">
              <button
                type="button"
                onClick={handleGenerateCurriculum}
                disabled={generatingCurriculum || skills.length === 0 || !courseData.title.trim() || !courseData.description.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-3"
              >
                {generatingCurriculum ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Generating AI Curriculum...
                  </>
                ) : (
                  <>
                    <Brain size={24} />
                    Generate Curriculum with Gemini AI
                    <Sparkles size={24} />
                  </>
                )}
              </button>

              {(skills.length === 0 || !courseData.title.trim() || !courseData.description.trim()) && (
                <p className="text-sm text-gray-500 text-center">
                  {skills.length === 0 
                    ? 'Add at least one skill to generate curriculum'
                    : 'Fill in course title and description first'
                  }
                </p>
              )}
            </div>

            {/* Generated Curriculum Preview */}
            {generatedCurriculum && (
              <div className="space-y-4 bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={28} />
                    Generated Course Structure
                  </h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {generatedCurriculum.skills?.length || 0} Skills
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {generatedCurriculum.skills?.reduce((sum, skill) => sum + skill.steps.length, 0) || 0} Steps
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {(generatedCurriculum.skills || []).map((skillData, skillIndex) => (
                    <div key={skillIndex} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="text-indigo-600" size={20} />
                            <h3 className="text-xl font-bold text-gray-900">
                              {skillData.skill}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium capitalize">
                              {skillData.difficulty}
                            </span>
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <BookOpen size={14} />
                              {skillData.steps.length} learning modules
                            </span>
                          </div>
                        </div>
                        <TrendingUp className="text-green-500" size={24} />
                      </div>

                      {/* Steps Preview */}
                      <div className="mt-4 space-y-2">
                        {skillData.steps.slice(0, 3).map((step, stepIndex) => (
                          <div key={stepIndex} className="border-l-4 border-indigo-400 bg-indigo-50 pl-4 py-3 rounded-r-lg">
                            <p className="font-medium text-gray-800 mb-2">{step.step}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock size={14} className="text-blue-500" />
                                {step.estimatedTime}
                              </span>
                              <span className="flex items-center gap-1">
                                📚 {step.resources.length} resources
                              </span>
                              <span className="flex items-center gap-1">
                                ❓ {step.quiz.length} quiz questions
                              </span>
                              {step.tags && step.tags.length > 0 && (
                                <span className="flex items-center gap-1">
                                  🏷️ {step.tags.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {skillData.steps.length > 3 && (
                          <p className="text-sm text-gray-500 pl-4 py-2 italic">
                            + {skillData.steps.length - 3} more learning modules with resources and quizzes...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Course Metadata */}
                {generatedCurriculum.metadata && (
                  <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Sparkles className="text-purple-500" size={16} />
                      <strong>AI Generated:</strong> {generatedCurriculum.metadata.skillCount} skills, {generatedCurriculum.metadata.totalSteps} total learning steps
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/instructor-dashboard')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !generatedCurriculum}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Course...' : '🚀 Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSkillsCourse;
