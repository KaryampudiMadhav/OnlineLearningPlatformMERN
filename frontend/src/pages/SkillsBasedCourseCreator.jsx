import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../config/api';

const SkillsBasedCourseCreator = () => {
  const [formData, setFormData] = useState({
    skills: [],
    courseTitle: '',
    courseDescription: '',
    category: 'Web Development',
    level: 'Beginner',
    price: 0
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [skillAnalysis, setSkillAnalysis] = useState(null);
  const [generatedCourse, setGeneratedCourse] = useState(null);

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

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const popularSkills = [
    'React', 'JavaScript', 'Python', 'Node.js', 'CSS', 'HTML',
    'Machine Learning', 'Data Analysis', 'UI Design', 'MongoDB',
    'Express.js', 'Vue.js', 'Angular', 'TypeScript', 'PHP',
    'Java', 'C++', 'SQL', 'Git', 'Docker', 'AWS', 'Firebase'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const addPopularSkill = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const analyzeSkills = async () => {
    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await API.post('/ai-courses/analyze-skills', {
        skills: formData.skills
      });

      setSkillAnalysis(response.data.data.analysis);
      toast.success('Skills analyzed successfully!');
    } catch (error) {
      console.error('Skills analysis error:', error);
      toast.error('Failed to analyze skills');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateCourse = async () => {
    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/ai-courses/generate-skills', formData);
      
      setGeneratedCourse(response.data.data);
      toast.success('🎉 Course generated successfully with AI!');
      
      // Scroll to generated course section
      document.getElementById('generated-course')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
      
    } catch (error) {
      console.error('Course generation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate course';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🤖 AI-Powered Skills-Based Course Creator
        </h1>
        <p className="text-gray-600">
          Select technical skills and let our AI generate a complete course with modules, video links, and quizzes!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Selection Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a skill (e.g., React, Python)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Popular Skills */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Skills</h3>
            <div className="flex flex-wrap gap-2">
              {popularSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => addPopularSkill(skill)}
                  disabled={formData.skills.includes(skill)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    formData.skills.includes(skill)
                      ? 'bg-green-100 border-green-300 text-green-700 cursor-not-allowed'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-blue-100 hover:border-blue-300'
                  }`}
                >
                  {skill} {formData.skills.includes(skill) && '✓'}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Skills */}
          {formData.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Selected Skills ({formData.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Button */}
          {formData.skills.length > 0 && (
            <button
              onClick={analyzeSkills}
              disabled={analyzing}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {analyzing ? '🔍 Analyzing Skills...' : '🔍 Analyze Skills'}
            </button>
          )}
        </div>

        {/* Course Configuration Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title (Optional)
            </label>
            <input
              type="text"
              name="courseTitle"
              value={formData.courseTitle}
              onChange={handleInputChange}
              placeholder="Leave empty for AI-generated title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description (Optional)
            </label>
            <textarea
              name="courseDescription"
              value={formData.courseDescription}
              onChange={handleInputChange}
              placeholder="Leave empty for AI-generated description"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Generate Course Button */}
          <button
            onClick={generateCourse}
            disabled={loading || formData.skills.length === 0}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? '🤖 Generating Course with AI...' : '🚀 Generate Course with Gemini AI'}
          </button>
        </div>
      </div>

      {/* Skills Analysis Results */}
      {skillAnalysis && (
        <div className="mt-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">
            📊 Skills Analysis Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillAnalysis.map((analysis, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-purple-100">
                <h4 className="font-medium text-gray-800 mb-2">{analysis.skill}</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Difficulty:</span> 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      analysis.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      analysis.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysis.difficulty}
                    </span>
                  </p>
                  <p><span className="font-medium">Time:</span> {analysis.estimatedTime}</p>
                  <p><span className="font-medium">Value:</span> {analysis.careerValue}</p>
                  <p className="text-gray-600">{analysis.learningPath}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Course Preview */}
      {generatedCourse && (
        <div id="generated-course" className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold text-green-800 mb-4">
            🎉 Generated Course Preview
          </h3>
          
          <div className="bg-white p-6 rounded-lg border border-green-100">
            <h4 className="text-2xl font-bold text-gray-800 mb-2">
              {generatedCourse.course.title}
            </h4>
            <p className="text-gray-600 mb-4">{generatedCourse.course.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {generatedCourse.course.curriculum.length}
                </div>
                <div className="text-sm text-blue-800">Modules</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {generatedCourse.course.duration}
                </div>
                <div className="text-sm text-purple-800">Duration</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {generatedCourse.course.level}
                </div>
                <div className="text-sm text-green-800">Level</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  ${generatedCourse.course.price}
                </div>
                <div className="text-sm text-orange-800">Price</div>
              </div>
            </div>

            {/* Course Curriculum Preview */}
            <div className="mb-6">
              <h5 className="text-lg font-semibold text-gray-800 mb-3">Course Curriculum</h5>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedCourse.course.curriculum.slice(0, 5).map((module, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h6 className="font-medium text-gray-800 mb-2">{module.title}</h6>
                    <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {module.duration}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {module.lessons.length} lessons
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Quiz included
                      </span>
                    </div>
                  </div>
                ))}
                {generatedCourse.course.curriculum.length > 5 && (
                  <div className="text-center text-gray-500">
                    ... and {generatedCourse.course.curriculum.length - 5} more modules
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  toast.success('Course saved to drafts!');
                  // Implement save functionality
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                💾 Save Course
              </button>
              <button
                onClick={() => {
                  toast.success('Course published successfully!');
                  // Implement publish functionality
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                🚀 Publish Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Generating Your Course with AI 🤖
            </h3>
            <p className="text-gray-600">
              Our AI is creating modules, videos, and quizzes...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsBasedCourseCreator;