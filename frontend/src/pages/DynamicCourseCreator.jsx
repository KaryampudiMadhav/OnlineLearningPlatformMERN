import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Loader2,
  BookOpen,
  Clock,
  BarChart3,
  CheckCircle2,
  Zap,
  FileText,
  Settings,
  RefreshCw,
  PlusCircle,
  Trash2,
  Eye,
  ArrowRight,
  Layers,
  Award,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import api from '../config/api';

const DynamicCourseCreator = () => {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [generatedCourseId, setGeneratedCourseId] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    level: 'intermediate',
    price: 0,
    moduleCount: 5,
    lessonsPerModule: 4,
    includeQuizzes: true,
    skills: []
  });

  // Skills management
  const [skillInput, setSkillInput] = useState('');

  // Course data
  const [courseData, setCourseData] = useState(null);

  const categories = [
    'Web Development',
    'Data Science',
    'Artificial Intelligence',
    'UI/UX Design',
    'Digital Marketing',
    'Mobile Development',
    'DevOps',
    'Cybersecurity',
    'Cloud Computing',
    'Blockchain',
    'Game Development',
    'Photography',
    'Music Production',
    'Business',
    'Other'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner', icon: '🌱', color: 'green' },
    { value: 'intermediate', label: 'Intermediate', icon: '🚀', color: 'blue' },
    { value: 'advanced', label: 'Advanced', icon: '⚡', color: 'purple' }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Skills management
  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      if (formData.skills.length >= 5) {
        toast.error('Maximum 5 skills allowed');
        return;
      }
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill]
      }));
      setSkillInput('');
      toast.success(`Added: ${trimmedSkill}`);
    } else if (formData.skills.includes(trimmedSkill)) {
      toast.error('Skill already added');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
    toast.info(`Removed: ${skillToRemove}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Generate course
  const handleGenerateCourse = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a course title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a course description');
      return;
    }
    if (formData.moduleCount < 3 || formData.moduleCount > 10) {
      toast.error('Module count must be between 3 and 10');
      return;
    }

    setGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Initializing...');

    try {
      const response = await api.post('/courses/dynamic/generate', formData);

      if (response.data.success) {
        const courseId = response.data.course._id;
        setGeneratedCourseId(courseId);
        setGenerationStatus('Generation started!');
        
        toast.success('🚀 Course generation started! This will take 2-5 minutes.', {
          duration: 5000
        });

        // Start polling for status
        pollGenerationStatus(courseId);
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to start generation');
      setGenerating(false);
      setGenerationStatus('');
    }
  };

  // Poll generation status
  const pollGenerationStatus = (courseId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/courses/dynamic/status/${courseId}`);
        const { status, progress, currentModules, totalModules } = response.data;

        setGenerationProgress(progress);
        setGenerationStatus(`Generating modules: ${currentModules}/${totalModules}`);

        if (status === 'completed') {
          clearInterval(pollInterval);
          setGenerating(false);
          setGenerationProgress(100);
          setGenerationStatus('Generation complete!');
          
          // Fetch full course data
          const courseResponse = await api.get(`/courses/${courseId}`);
          setCourseData(courseResponse.data.course);
          
          toast.success('🎉 Course generated successfully!', { duration: 4000 });
        } else if (status === 'failed') {
          clearInterval(pollInterval);
          setGenerating(false);
          setGenerationStatus('Generation failed');
          toast.error('Course generation failed. Please try again.');
        }
      } catch (error) {
        console.error('Status poll error:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Clear interval after 10 minutes max
    setTimeout(() => {
      clearInterval(pollInterval);
      if (generating) {
        setGenerating(false);
        toast.error('Generation timeout. Please check your course manually.');
      }
    }, 600000);
  };

  // View course
  const handleViewCourse = () => {
    if (courseData?._id) {
      navigate(`/course/${courseData._id}`);
    } else if (generatedCourseId) {
      navigate(`/course/${generatedCourseId}`);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Web Development',
      level: 'intermediate',
      price: 0,
      moduleCount: 5,
      lessonsPerModule: 4,
      includeQuizzes: true,
      skills: []
    });
    setCourseData(null);
    setGeneratedCourseId(null);
    setGenerationProgress(0);
    setGenerationStatus('');
    toast.info('Form reset');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles className="text-white" size={48} />
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">
                Dynamic AI Course Creator
              </h1>
              <p className="text-purple-100 text-xl">
                Create complete courses with progressive AI generation - modules, lessons & quizzes
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="text-white" size={20} />
                <span className="text-white font-semibold">Progressive Generation</span>
              </div>
              <p className="text-purple-100 text-sm">Modules generated one by one</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-yellow-300" size={20} />
                <span className="text-white font-semibold">Real-time Updates</span>
              </div>
              <p className="text-purple-100 text-sm">Live progress tracking</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-green-300" size={20} />
                <span className="text-white font-semibold">Auto Quizzes</span>
              </div>
              <p className="text-purple-100 text-sm">AI-generated assessments</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="text-blue-300" size={20} />
                <span className="text-white font-semibold">Regenerate Anytime</span>
              </div>
              <p className="text-purple-100 text-sm">Improve any module</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="text-purple-400" size={28} />
                Course Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Complete Web Development Bootcamp"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    disabled={generating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Course Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what students will learn..."
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    disabled={generating}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 transition"
                      disabled={generating}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Level
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 transition"
                      disabled={generating}
                    >
                      {levels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.icon} {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0 for free"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 transition"
                      disabled={generating}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generation Settings */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-blue-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="text-blue-400" size={28} />
                Generation Settings
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Modules
                  </label>
                  <input
                    type="number"
                    name="moduleCount"
                    value={formData.moduleCount}
                    onChange={handleInputChange}
                    min="3"
                    max="10"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 transition"
                    disabled={generating}
                  />
                  <p className="text-gray-400 text-xs mt-1">3-10 modules</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lessons per Module
                  </label>
                  <input
                    type="number"
                    name="lessonsPerModule"
                    value={formData.lessonsPerModule}
                    onChange={handleInputChange}
                    min="2"
                    max="8"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 transition"
                    disabled={generating}
                  />
                  <p className="text-gray-400 text-xs mt-1">2-8 lessons</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg">
                <input
                  type="checkbox"
                  name="includeQuizzes"
                  checked={formData.includeQuizzes}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  disabled={generating}
                />
                <label className="text-white font-medium">
                  Generate quizzes for each module (recommended)
                </label>
              </div>

              <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Estimated time:</strong> {Math.ceil((formData.moduleCount * formData.lessonsPerModule) / 2)} minutes for complete generation
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-green-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="text-green-400" size={28} />
                Skills to Cover (Optional)
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a skill..."
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 transition"
                  disabled={generating || formData.skills.length >= 5}
                />
                <button
                  onClick={handleAddSkill}
                  disabled={generating || formData.skills.length >= 5 || !skillInput.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  <PlusCircle size={20} />
                  Add
                </button>
              </div>

              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 text-white rounded-lg text-sm font-medium"
                    >
                      <Zap size={14} className="text-green-400" />
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        disabled={generating}
                        className="text-gray-400 hover:text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleGenerateCourse}
                disabled={generating || !formData.title.trim() || !formData.description.trim()}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:via-pink-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-3"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Generating Course...
                  </>
                ) : (
                  <>
                    <Sparkles size={24} />
                    Generate Complete Course
                    <ArrowRight size={24} />
                  </>
                )}
              </button>

              {!generating && (
                <button
                  onClick={handleReset}
                  className="px-6 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition font-medium"
                >
                  <RefreshCw size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            {/* Generation Status */}
            {(generating || courseData) && (
              <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-purple-500/30 sticky top-4">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="text-purple-400" size={24} />
                  Generation Status
                </h3>

                {generating && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin text-purple-400" size={20} />
                      <span className="text-white font-medium">{generationStatus}</span>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-500 flex items-center justify-center text-xs font-bold text-white"
                        style={{ width: `${generationProgress}%` }}
                      >
                        {generationProgress > 10 && `${generationProgress}%`}
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-300 text-sm flex items-center gap-2">
                        <Clock size={16} />
                        This may take 2-5 minutes...
                      </p>
                    </div>
                  </div>
                )}

                {courseData && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-green-400">
                      <CheckCircle2 size={24} />
                      <span className="font-bold">Generation Complete!</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Modules Generated:</span>
                        <span className="text-white font-bold">{courseData.curriculum?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Lessons:</span>
                        <span className="text-white font-bold">
                          {courseData.curriculum?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white font-bold">{courseData.duration}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleViewCourse}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition font-bold flex items-center justify-center gap-2"
                    >
                      <Eye size={20} />
                      View Course
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-yellow-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="text-yellow-400" size={24} />
                How it Works
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-white font-medium">Configure Your Course</p>
                    <p className="text-gray-400">Set title, description, and generation settings</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-white font-medium">AI Generates Modules</p>
                    <p className="text-gray-400">Each module is created progressively with lessons</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-white font-medium">Quizzes Auto-Generated</p>
                    <p className="text-gray-400">Assessment questions created for each module</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center text-pink-400 font-bold">
                    4
                  </div>
                  <div>
                    <p className="text-white font-medium">Review & Publish</p>
                    <p className="text-gray-400">Check content and make it available to students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicCourseCreator;
