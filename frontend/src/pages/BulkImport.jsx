import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Upload, Download, FileText, CheckCircle, AlertCircle, 
  ArrowLeft, Info, Loader2, X, Eye
} from 'lucide-react';
import api from '../config/api';

const BulkImport = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [csvPreview, setCsvPreview] = useState([]);

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      const { data } = await api.get('/courses/instructor/my-courses');
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadResult(null);
      
      // Preview CSV content
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        const lines = csv.split('\n').slice(0, 6); // Show first 5 data rows + header
        setCsvPreview(lines.map(line => line.split(',')));
      };
      reader.readAsText(file);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCourse) {
      toast.error('Please select both a course and CSV file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('csvFile', selectedFile);
      formData.append('courseId', selectedCourse);

      const { data } = await api.post('/content-generation/bulk-import-quizzes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadResult(data);
    } catch (error) {
      setUploadResult({
        success: false,
        message: error.response?.data?.message || 'Upload failed',
        data: { errors: [error.message] }
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['quizTitle', 'quizType', 'moduleIndex', 'lessonIndex', 'duration', 'passingScore', 'questionText', 'questionType', 'option1', 'option2', 'option3', 'option4', 'correctAnswer', 'explanation', 'points'],
      ['JavaScript Basics Quiz', 'module', '0', '', '20', '70', 'Which keyword declares a variable?', 'multiple-choice', 'var', 'let', 'const', 'variable', 'let', 'let is the modern way to declare variables', '1'],
      ['Functions Quiz', 'lesson', '0', '1', '15', '75', 'How do you define a function?', 'multiple-choice', 'function name()', 'def name()', 'func name()', 'define name()', 'function name()', 'Functions are defined with the function keyword', '1'],
      ['Arrays Quiz', 'lesson', '0', '2', '10', '80', 'Arrays are zero-indexed in JavaScript', 'true-false', 'True', 'False', '', '', 'True', 'Arrays in JavaScript start counting from 0', '1']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-import-sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
              <Upload size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Bulk Quiz Import</h1>
            <p className="text-gray-400">Upload CSV files to create multiple quizzes at once</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="text-blue-400 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">How to use Bulk Import</h3>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Download the sample CSV template to see the required format</li>
                <li>• Fill in your quiz data following the column structure</li>
                <li>• Each row represents one question for a quiz</li>
                <li>• Multiple rows with the same quizTitle will be grouped into one quiz</li>
                <li>• Upload the completed CSV file</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Upload Quiz Data</h2>
          
          {/* Course Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Course *
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Choose a course...</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CSV File *
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
                />
              </div>
              <button
                onClick={downloadSampleCSV}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={20} />
                Sample CSV
              </button>
            </div>
            {selectedFile && (
              <p className="text-green-400 text-sm mt-2">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* CSV Preview */}
          {selectedFile && csvPreview.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">CSV Preview</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                >
                  <Eye size={16} />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>
              
              {showPreview && (
                <div className="bg-gray-700 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        {csvPreview[0]?.map((header, index) => (
                          <th key={index} className="text-left py-2 px-3 text-gray-300 font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(1, 4).map((row, index) => (
                        <tr key={index} className="border-b border-gray-600/50">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="py-2 px-3 text-gray-400">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvPreview.length > 4 && (
                    <p className="text-gray-500 text-xs mt-2">
                      ... and {csvPreview.length - 4} more rows
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedCourse || uploading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                <Upload size={20} />
                Import Quizzes
              </>
            )}
          </button>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className={`bg-gray-800 rounded-lg p-6 border ${
            uploadResult.success ? 'border-green-500' : 'border-red-500'
          }`}>
            <div className="flex items-start gap-3 mb-4">
              {uploadResult.success ? (
                <CheckCircle className="text-green-400 mt-0.5" size={24} />
              ) : (
                <AlertCircle className="text-red-400 mt-0.5" size={24} />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${
                  uploadResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {uploadResult.success ? 'Import Successful!' : 'Import Failed'}
                </h3>
                <p className="text-gray-300">{uploadResult.message}</p>
              </div>
            </div>

            {/* Success Details */}
            {uploadResult.success && uploadResult.data && (
              <div className="space-y-4">
                <div className="bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-400 mb-2">Import Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Quizzes Created:</span>
                      <span className="text-white ml-2 font-medium">{uploadResult.data.imported}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Errors:</span>
                      <span className="text-white ml-2 font-medium">{uploadResult.data.errors}</span>
                    </div>
                  </div>
                </div>

                {uploadResult.data.quizzes && uploadResult.data.quizzes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-3">Created Quizzes</h4>
                    <div className="space-y-2">
                      {uploadResult.data.quizzes.map((quiz) => (
                        <div key={quiz.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                          <div>
                            <span className="text-white font-medium">{quiz.title}</span>
                            <span className="text-gray-400 ml-2">({quiz.questionCount} questions)</span>
                          </div>
                          <button
                            onClick={() => navigate(`/quiz/${quiz.id}`)}
                            className="text-purple-400 hover:text-purple-300 text-sm"
                          >
                            View Quiz
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Details */}
            {uploadResult.data?.errorDetails && uploadResult.data.errorDetails.length > 0 && (
              <div className="bg-red-900/20 rounded-lg p-4">
                <h4 className="font-medium text-red-400 mb-2">Errors Found</h4>
                <ul className="space-y-1 text-sm text-red-200">
                  {uploadResult.data.errorDetails.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* CSV Format Guide */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="font-semibold text-white mb-4">CSV Format Guide</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 text-gray-300">Column</th>
                  <th className="text-left py-2 text-gray-300">Description</th>
                  <th className="text-left py-2 text-gray-300">Example</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr className="border-b border-gray-600/50">
                  <td className="py-2 font-medium">quizTitle</td>
                  <td className="py-2">Name of the quiz</td>
                  <td className="py-2">JavaScript Basics Quiz</td>
                </tr>
                <tr className="border-b border-gray-600/50">
                  <td className="py-2 font-medium">quizType</td>
                  <td className="py-2">course, module, or lesson</td>
                  <td className="py-2">module</td>
                </tr>
                <tr className="border-b border-gray-600/50">
                  <td className="py-2 font-medium">moduleIndex</td>
                  <td className="py-2">Module number (0-based)</td>
                  <td className="py-2">0</td>
                </tr>
                <tr className="border-b border-gray-600/50">
                  <td className="py-2 font-medium">lessonIndex</td>
                  <td className="py-2">Lesson number (0-based, for lesson quizzes)</td>
                  <td className="py-2">1</td>
                </tr>
                <tr className="border-b border-gray-600/50">
                  <td className="py-2 font-medium">questionText</td>
                  <td className="py-2">The question to ask</td>
                  <td className="py-2">Which keyword declares a variable?</td>
                </tr>
                <tr className="border-b border-gray-600/50">
                  <td className="py-2 font-medium">correctAnswer</td>
                  <td className="py-2">Answer text or option number (1-4)</td>
                  <td className="py-2">let</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImport;