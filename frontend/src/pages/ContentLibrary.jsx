import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Download, Eye, Trash2, 
  Search, Filter, Clock, Users, Star, Plus,
  FileText, Video, Image, Headphones, Archive
} from 'lucide-react';
import api from '../config/api';

const ContentLibrary = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchContent();
    fetchCourses();
  }, []);

  const fetchContent = async () => {
    try {
      const { data } = await api.get('/courses/instructor/my-courses');
      
      // Mock content library data - in real app this would come from a content API
      const mockContent = [
        {
          id: 1,
          title: 'JavaScript Fundamentals Quiz',
          type: 'quiz',
          course: 'Web Development Basics',
          courseId: data.courses[0]?._id || 'course1',
          createdAt: '2024-01-15',
          usage: 45,
          rating: 4.5,
          size: '2.3 KB',
          description: 'Comprehensive quiz covering JavaScript basics'
        },
        {
          id: 2,
          title: 'React Components Video',
          type: 'video',
          course: 'Advanced React',
          courseId: data.courses[1]?._id || 'course2',
          createdAt: '2024-01-10',
          usage: 32,
          rating: 4.8,
          size: '156 MB',
          description: 'Deep dive into React component architecture'
        },
        {
          id: 3,
          title: 'CSS Grid Layout Guide',
          type: 'document',
          course: 'Web Development Basics',
          courseId: data.courses[0]?._id || 'course1',
          createdAt: '2024-01-08',
          usage: 28,
          rating: 4.3,
          size: '1.8 MB',
          description: 'Complete guide to CSS Grid with examples'
        },
        {
          id: 4,
          title: 'Database Design Presentation',
          type: 'presentation',
          course: 'Database Systems',
          courseId: data.courses[2]?._id || 'course3',
          createdAt: '2024-01-05',
          usage: 18,
          rating: 4.6,
          size: '8.5 MB',
          description: 'Slides covering database normalization and design'
        },
        {
          id: 5,
          title: 'Python Coding Exercise Audio',
          type: 'audio',
          course: 'Python Programming',
          courseId: data.courses[3]?._id || 'course4',
          createdAt: '2024-01-03',
          usage: 22,
          rating: 4.1,
          size: '45 MB',
          description: 'Audio walkthrough of Python coding exercises'
        }
      ];

      setContent(mockContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses/instructor/my-courses');
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    
    setContent(content.filter(item => item.id !== contentId));
    // In real app: await api.delete(`/content/${contentId}`);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'quiz': return <FileText className="text-blue-400" size={20} />;
      case 'video': return <Video className="text-red-400" size={20} />;
      case 'document': return <BookOpen className="text-green-400" size={20} />;
      case 'presentation': return <Image className="text-purple-400" size={20} />;
      case 'audio': return <Headphones className="text-yellow-400" size={20} />;
      default: return <Archive className="text-gray-400" size={20} />;
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      quiz: 'bg-blue-500/20 text-blue-400',
      video: 'bg-red-500/20 text-red-400',
      document: 'bg-green-500/20 text-green-400',
      presentation: 'bg-purple-500/20 text-purple-400',
      audio: 'bg-yellow-500/20 text-yellow-400'
    };
    
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesCourse = selectedCourse === 'all' || item.courseId === selectedCourse;
    
    return matchesSearch && matchesType && matchesCourse;
  });

  const contentTypes = [...new Set(content.map(item => item.type))];
  const totalSize = content.reduce((acc, item) => {
    const size = parseFloat(item.size);
    return acc + (item.size.includes('MB') ? size : size / 1000);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading content library...</div>
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4">
              <Archive size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Content Library</h1>
            <p className="text-gray-400">Manage and organize all your course content</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Archive className="text-blue-400" size={24} />
              <span className="text-gray-300">Total Items</span>
            </div>
            <div className="text-2xl font-bold text-white">{content.length}</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-green-400" size={24} />
              <span className="text-gray-300">Total Usage</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {content.reduce((acc, item) => acc + item.usage, 0)}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Star className="text-yellow-400" size={24} />
              <span className="text-gray-300">Avg Rating</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {content.length > 0 ? (content.reduce((acc, item) => acc + item.rating, 0) / content.length).toFixed(1) : '0.0'}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Download className="text-purple-400" size={24} />
              <span className="text-gray-300">Total Size</span>
            </div>
            <div className="text-2xl font-bold text-white">{totalSize.toFixed(1)} MB</div>
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
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {contentTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* Course Filter */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>

            {/* Add Content Button */}
            <button
              onClick={() => navigate('/instructor/create-course')}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} />
              Add Content
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-all duration-300 group"
            >
              {/* Content Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(item.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400" size={16} />
                    <span className="text-yellow-400 text-sm">{item.rating}</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Content Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                      <Users size={14} />
                    </div>
                    <div className="text-white font-medium">{item.usage}</div>
                    <div className="text-gray-400 text-xs">Usage</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                      <Clock size={14} />
                    </div>
                    <div className="text-white font-medium">{item.createdAt}</div>
                    <div className="text-gray-400 text-xs">Created</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                      <Download size={14} />
                    </div>
                    <div className="text-white font-medium">{item.size}</div>
                    <div className="text-gray-400 text-xs">Size</div>
                  </div>
                </div>

                <div className="text-xs text-purple-400 mb-4">
                  Course: {item.course}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {/* Handle view */}}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  
                  <button
                    onClick={() => {/* Handle download */}}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <Archive size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No content found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => navigate('/instructor/create-course')}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Create Your First Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentLibrary;