import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, BookOpen, PlayCircle, Clock, Target, Save, ArrowLeft } from 'lucide-react';
import '../store/authStore';
import api from '../config/api';

const CreateModuleQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  
  const [course, setCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [quizType, setQuizType] = useState('course'); // 'course', 'module', 'lesson'
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    instructions: 'Read each question carefully and select the best answer.',
    duration: 30,
    passingScore: 70,
    maxAttempts: 3,
    shuffleQuestions: false,
    shuffleOptions: false,
    showCorrectAnswers: true,
    showExplanations: true,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multiple-choice',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    explanation: '',
    points: 1
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourse();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      setCourse(data.course);
      
      // Auto-generate quiz title based on course
      if (!quiz.title) {
        setQuiz(prev => ({
          ...prev,
          title: `${data.course.title} - Quiz`
        }));
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizTypeChange = (type, moduleIndex = null, lessonIndex = null) => {
    setQuizType(type);
    setSelectedModule(moduleIndex);
    setSelectedLesson(lessonIndex);
    
    // Update quiz title based on selection
    if (type === 'course') {
      setQuiz(prev => ({
        ...prev,
        title: `${course.title} - Course Quiz`
      }));
    } else if (type === 'module' && course?.curriculum[moduleIndex]) {
      setQuiz(prev => ({
        ...prev,
        title: `${course.curriculum[moduleIndex].title} - Module Quiz`
      }));
    } else if (type === 'lesson' && course?.curriculum[moduleIndex]?.lessons[lessonIndex]) {
      setQuiz(prev => ({
        ...prev,
        title: `${course.curriculum[moduleIndex].lessons[lessonIndex].title} - Lesson Quiz`
      }));
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) return;
    
    // Validate that at least one option is correct
    const hasCorrectAnswer = currentQuestion.options.some(opt => opt.isCorrect && opt.text.trim());
    if (!hasCorrectAnswer) {
      alert('Please mark at least one option as correct and ensure it has text.');
      return;
    }

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    // Reset current question
    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      explanation: '',
      points: 1
    });
  };

  const removeQuestion = (index) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (optIndex, field, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };
    
    // For multiple choice, ensure only one correct answer
    if (field === 'isCorrect' && value && currentQuestion.type === 'multiple-choice') {
      newOptions.forEach((opt, i) => {
        if (i !== optIndex) opt.isCorrect = false;
      });
    }
    
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (quiz.questions.length === 0) {
      alert('Please add at least one question to the quiz.');
      return;
    }

    try {
      setSaving(true);
      
      const quizData = {
        courseId,
        quizType,
        moduleIndex: selectedModule,
        lessonIndex: selectedLesson,
        ...quiz
      };

      await api.post('/quizzes', quizData);
      
      alert('Quiz created successfully!');
      navigate(`/instructor/courses/${courseId}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}`)}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Course
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Create Quiz</h1>
          <p className="text-gray-400">Create a quiz for {course.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quiz Type Selection */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Quiz Placement</h3>
            
            {/* Course Level */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  name="quizType"
                  value="course"
                  checked={quizType === 'course'}
                  onChange={() => handleQuizTypeChange('course')}
                  className="w-4 h-4 text-purple-600"
                />
                <BookOpen className="text-purple-400" size={20} />
                <div>
                  <div className="text-white font-medium">Course Level Quiz</div>
                  <div className="text-gray-400 text-sm">General quiz for the entire course</div>
                </div>
              </label>

              {/* Module Level */}
              {course.curriculum?.map((module, moduleIndex) => (
                <div key={moduleIndex} className="space-y-2">
                  <label className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="radio"
                      name="quizType"
                      value={`module-${moduleIndex}`}
                      checked={quizType === 'module' && selectedModule === moduleIndex}
                      onChange={() => handleQuizTypeChange('module', moduleIndex)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <Target className="text-green-400" size={20} />
                    <div>
                      <div className="text-white font-medium">Module: {module.title}</div>
                      <div className="text-gray-400 text-sm">Quiz for this module</div>
                    </div>
                  </label>

                  {/* Lesson Level */}
                  {module.lessons?.map((lesson, lessonIndex) => (
                    <label
                      key={lessonIndex}
                      className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors ml-8"
                    >
                      <input
                        type="radio"
                        name="quizType"
                        value={`lesson-${moduleIndex}-${lessonIndex}`}
                        checked={quizType === 'lesson' && selectedModule === moduleIndex && selectedLesson === lessonIndex}
                        onChange={() => handleQuizTypeChange('lesson', moduleIndex, lessonIndex)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <PlayCircle className="text-blue-400" size={20} />
                      <div>
                        <div className="text-white font-medium">Lesson: {lesson.title}</div>
                        <div className="text-gray-400 text-sm">Quiz for this specific lesson</div>
                      </div>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Quiz Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quiz.title}
                  onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={quiz.duration}
                  onChange={(e) => setQuiz(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  value={quiz.passingScore}
                  onChange={(e) => setQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Attempts
                </label>
                <input
                  type="number"
                  value={quiz.maxAttempts}
                  onChange={(e) => setQuiz(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={quiz.description}
                onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="3"
              />
            </div>
          </div>

          {/* Add Question Form */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Add Question</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question *
                </label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="2"
                  placeholder="Enter your question here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Question Type
                  </label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="multiple-select">Multiple Select</option>
                    <option value="true-false">True/False</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Answer Options
                </label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <input
                        type={currentQuestion.type === 'multiple-choice' ? 'radio' : 'checkbox'}
                        name="correctAnswer"
                        checked={option.isCorrect}
                        onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                        className="w-4 h-4 text-green-600"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Explanation (Optional)
                </label>
                <textarea
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="2"
                  placeholder="Explain why this answer is correct..."
                />
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
                Add Question
              </button>
            </div>
          </div>

          {/* Questions List */}
          {quiz.questions.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">
                Questions ({quiz.questions.length})
              </h3>
              
              <div className="space-y-4">
                {quiz.questions.map((question, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">
                        {index + 1}. {question.question}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="bg-blue-600 px-2 py-1 rounded mr-2">
                        {question.type}
                      </span>
                      <span className="bg-green-600 px-2 py-1 rounded">
                        {question.points} points
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || quiz.questions.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Quiz
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModuleQuiz;