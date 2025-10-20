import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, BookOpen, Download, Eye, Star, Clock, 
  Users, CheckCircle, Loader2, Plus, Search, Filter
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../config/api';

const CourseTemplates = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/content-generation/templates');
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateId) => {
    try {
      setCreating(templateId);
      const { data } = await api.post('/content-generation/course-template', {
        templateId,
        instructorId: user._id
      });
      
      toast.success('Course created successfully!');
      navigate(`/instructor/edit-course/${data.course._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course from template');
    } finally {
      setCreating(null);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || template.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = [...new Set(templates.map(t => t.category))];
  const levels = [...new Set(templates.map(t => t.level))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/instructor/content-hub')}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Content Hub
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
              <BookOpen size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Course Templates</h1>
            <p className="text-gray-400">Choose from professionally designed course templates</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-all duration-300 group"
            >
              {/* Template Preview */}
              <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen size={64} className="text-gray-400" />
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                    {template.category}
                  </span>
                </div>

                {/* Level Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    template.level === 'beginner' ? 'bg-green-600 text-white' :
                    template.level === 'intermediate' ? 'bg-yellow-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {template.level.charAt(0).toUpperCase() + template.level.slice(1)}
                  </span>
                </div>

                {/* Popular Badge */}
                {template.isPopular && (
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-1 bg-yellow-600 text-white px-2 py-1 rounded-full text-xs">
                      <Star size={12} />
                      Popular
                    </div>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {template.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Template Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                      <BookOpen size={16} />
                    </div>
                    <div className="text-white font-medium">{template.moduleCount}</div>
                    <div className="text-gray-400 text-xs">Modules</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                      <CheckCircle size={16} />
                    </div>
                    <div className="text-white font-medium">{template.quizCount}</div>
                    <div className="text-gray-400 text-xs">Quizzes</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                      <Clock size={16} />
                    </div>
                    <div className="text-white font-medium">{template.estimatedHours}h</div>
                    <div className="text-gray-400 text-xs">Duration</div>
                  </div>
                </div>

                {/* Features List */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">What's Included:</h4>
                  <ul className="space-y-1">
                    {template.features?.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {template.features?.length > 3 && (
                      <li className="text-xs text-purple-400">
                        +{template.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCreateFromTemplate(template.id)}
                    disabled={creating === template.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    {creating === template.id ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Use Template
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {/* Handle preview */}}
                    className="p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
                    title="Preview Template"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Custom Template Option */}
        <div className="mt-8 bg-gray-800 rounded-lg p-8 border border-dashed border-gray-600 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">Create Custom Course</h3>
          <p className="text-gray-400 mb-6">
            Start from scratch with a blank course template
          </p>
          
          <button
            onClick={() => navigate('/instructor/create-course')}
            className="bg-gray-700 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Create Blank Course
          </button>
        </div>

        {/* Template Benefits */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-8 border border-blue-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">Why Use Templates?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mb-4">
                <Clock size={24} className="text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">Save Time</h4>
              <p className="text-gray-400 text-sm">
                Get your course up and running in minutes, not hours
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
                <CheckCircle size={24} className="text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">Best Practices</h4>
              <p className="text-gray-400 text-sm">
                Templates follow proven course design principles
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 rounded-lg mb-4">
                <Users size={24} className="text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">Professional Quality</h4>
              <p className="text-gray-400 text-sm">
                Created by education experts and top instructors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseTemplates;