import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Sparkles, BookTemplate, Download, 
  FileText, Zap, Clock, CheckCircle, AlertCircle,
  Loader2, Plus, ArrowRight, Info
} from 'lucide-react';
import api from '../config/api';

const ContentGenerationHub = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/content-generation/templates');
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
            <Sparkles size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Content Generation Hub</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Accelerate course creation with AI-powered tools, templates, and bulk import features
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <QuickActionCard
            icon={BookTemplate}
            title="Course Templates"
            description="Start with pre-built course structures"
            color="bg-blue-500"
            onClick={() => navigate('/instructor/content-hub/templates')}
          />
          <QuickActionCard
            icon={Zap}
            title="AI Content Generator"
            description="Generate quizzes & modules with AI"
            color="bg-green-500"
            onClick={() => navigate('/instructor/content-hub/ai-quiz')}
          />
          <QuickActionCard
            icon={Upload}
            title="Bulk Import"
            description="Upload CSV files to create content"
            color="bg-orange-500"
            onClick={() => navigate('/instructor/content-hub/bulk-import')}
          />
          <QuickActionCard
            icon={FileText}
            title="Content Library"
            description="Browse reusable content"
            color="bg-purple-500"
            onClick={() => navigate('/instructor/content-hub/library')}
          />
        </div>

        {/* Popular Templates */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Popular Course Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.slice(0, 6).map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>

        {/* AI Integration Notice */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI-Powered Content Generation</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-300 mb-2">🚀 Standalone Generator</h4>
              <p className="text-gray-300 text-sm mb-2">Use our dedicated AI Content Generator to create quizzes and course modules for any topic.</p>
              <button
                onClick={() => navigate('/instructor/content-hub/ai-quiz')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                → Try AI Generator
              </button>
            </div>
            <div>
              <h4 className="font-medium text-purple-300 mb-2">⚡ Integrated in Course Creation</h4>
              <p className="text-gray-300 text-sm mb-2">Generate course modules directly while creating new courses with AI assistance.</p>
              <button
                onClick={() => navigate('/instructor/create-course')}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                → Create Course with AI
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bulk Import */}
          <FeatureSection
            icon={Upload}
            title="Bulk Import System"
            description="Save hours of manual work"
            features={[
              'CSV quiz import with validation',
              'Batch course content upload',
              'Module structure import',
              'Automatic error detection'
            ]}
          />

          {/* AI Generation */}
          <FeatureSection
            icon={Sparkles}
            title="AI-Powered Generation"
            description="Let AI create content for you"
            features={[
              'Auto-generate quiz questions',
              'Create course outlines',
              'Generate lesson descriptions',
              'Smart content suggestions'
            ]}
          />
        </div>

        {/* Quick Start Guide */}
        <div className="mt-12 bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Quick Start Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Choose Method</h4>
              <p className="text-gray-400 text-sm">Select template, AI generation, or bulk import</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Customize</h4>
              <p className="text-gray-400 text-sm">Adjust content to match your needs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Publish</h4>
              <p className="text-gray-400 text-sm">Review and publish your course</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const QuickActionCard = ({ icon: Icon, title, description, color, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-gray-800 rounded-lg p-6 border border-gray-700 cursor-pointer hover:border-purple-500 transition-all group"
  >
    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={24} className="text-white" />
    </div>
    <h3 className="font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);

const TemplateCard = ({ template }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white mb-2">{template.title}</h3>
          <span className="inline-block px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs font-medium">
            {template.category}
          </span>
        </div>
        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
          {template.level}
        </span>
      </div>
      
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{template.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <Clock size={16} />
          <span>{template.duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <BookTemplate size={16} />
          <span>{template.moduleCount} modules</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => navigate('/instructor/content-hub/templates')}
          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Use Template
        </button>
        <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
          <Info size={16} />
        </button>
      </div>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const FeatureSection = ({ icon: Icon, title, description, features }) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
        <Icon size={20} className="text-purple-400" />
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
    
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
          <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ContentGenerationHub;