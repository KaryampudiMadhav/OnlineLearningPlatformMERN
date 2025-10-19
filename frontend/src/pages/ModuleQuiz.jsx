import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, 
  ArrowLeft, ArrowRight, RotateCcw, Award,
  BookOpen, Target, TrendingUp
} from 'lucide-react';
import api from '../config/api';
// eslint-disable-next-line no-unused-vars
import {motion} from 'framer-motion';

import toast from 'react-hot-toast';

const ModuleQuiz = () => {
  const { courseId, moduleIndex, quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  const fetchCourseAndQuiz = useCallback(async () => {
    try {
      // Check if quiz data was passed in navigation state
      if (location.state?.quizData) {
        console.log('Using quiz data from navigation state');
        const quizData = location.state.quizData;
        
        // Format quiz data for frontend
        const formattedQuiz = {
          ...quizData,
          timeLimit: quizData.duration || 15,
          questions: quizData.questions.map((q, index) => ({
            ...q,
            id: q._id || `q_${index}`,
            correctAnswer: q.options.findIndex(opt => opt.isCorrect)
          }))
        };
        
        setQuiz(formattedQuiz);
        setTimeLeft(formattedQuiz.timeLimit * 60);
        setLoading(false);
        return;
      }

      // Fallback: First fetch the course
      const courseResponse = await api.get(`/courses/${courseId}`);
      const courseData = courseResponse.data.data || courseResponse.data;

      if (quizId) {
        // Try to fetch specific quiz by ID (for backward compatibility)
        console.log(`Fetching quiz with ID: ${quizId}`);
        try {
          const quizResponse = await api.get(`/quizzes/${quizId}`);
          
          if (quizResponse.data.success) {
            const quizData = quizResponse.data.quiz || quizResponse.data.data;
            
            // Format quiz data for frontend
            const formattedQuiz = {
              ...quizData,
              timeLimit: quizData.duration || 15,
              questions: quizData.questions.map((q, index) => ({
                ...q,
                id: q._id || index,
                correctAnswer: q.options.findIndex(opt => opt.isCorrect)
              }))
            };
            
            setQuiz(formattedQuiz);
            setTimeLeft(formattedQuiz.timeLimit * 60);
          } else {
            throw new Error('Failed to load quiz data');
          }
        } catch (error) {
          console.log('API quiz fetch failed, trying curriculum fallback:', error.message);
          // Fallback to curriculum data
          const moduleIdx = parseInt(moduleIndex);
          if (courseData.curriculum && courseData.curriculum[moduleIdx] && courseData.curriculum[moduleIdx].quiz) {
            const moduleQuiz = courseData.curriculum[moduleIdx].quiz;
            const formattedQuiz = {
              ...moduleQuiz,
              timeLimit: moduleQuiz.duration || 15,
              questions: moduleQuiz.questions.map((q, index) => ({
                ...q,
                id: q._id || `q_${index}`,
                correctAnswer: q.options.findIndex(opt => opt.isCorrect)
              }))
            };
            
            setQuiz(formattedQuiz);
            setTimeLeft(formattedQuiz.timeLimit * 60);
          } else {
            throw new Error('No quiz found for this module');
          }
        }
      } else {
        // Fallback to module quiz recommendations (legacy support)
        const moduleIdx = parseInt(moduleIndex);
        
        if (!courseData.curriculum || !Array.isArray(courseData.curriculum)) {
          console.error('Course curriculum not found or invalid:', courseData);
          return;
        }
        
        const module = courseData.curriculum[moduleIdx];
        
        if (!module) {
          console.error('Module not found at index:', moduleIdx, 'Available modules:', courseData.curriculum.length);
          return;
        }
        
        if (module?.quizRecommendation) {
          const quizData = {
            ...module.quizRecommendation,
            timeLimit: module.quizRecommendation.timeLimit || module.quizRecommendation.duration || 15,
            questions: module.quizRecommendation.questions || []
          };
          
          if (quizData.questions.length === 0) {
            quizData.questions = generateQuestionsFromRecommendation(module.quizRecommendation);
          }
          
          setQuiz(quizData);
          setTimeLeft(quizData.timeLimit * 60);
        } else {
          // Generate a sample quiz if none exists
          const sampleQuiz = generateSampleQuiz(module);
          setQuiz(sampleQuiz);
          setTimeLeft(sampleQuiz.timeLimit * 60);
        }
      }
    } catch (error) {
      console.error('Failed to fetch course and quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleIndex, quizId, location.state]);

  useEffect(() => {
    fetchCourseAndQuiz();
  }, [fetchCourseAndQuiz]);

  const calculateScore = useCallback(() => {
    let correct = 0;
    quiz?.questions?.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: quiz?.questions?.length || 0,
      percentage: quiz?.questions?.length ? Math.round((correct / quiz.questions.length) * 100) : 0
    };
  }, [quiz, answers]);

  const handleSubmitQuiz = useCallback(async () => {
    const score = calculateScore();
    setResults(score);
    setQuizSubmitted(true);

    try {
      // Submit quiz attempt to backend
      await api.post('/quiz-attempts', {
        courseId,
        moduleIndex: parseInt(moduleIndex),
        answers,
        score: score.percentage,
        timeSpent: (quiz?.timeLimit * 60) - timeLeft
      });
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  }, [courseId, moduleIndex, answers, quiz, timeLeft, calculateScore]);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && !quizSubmitted) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !quizSubmitted) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, quizSubmitted, handleSubmitQuiz]);

  const generateQuestionsFromRecommendation = (recommendation) => {
    const topics = recommendation.topics || ['Core concepts', 'Key principles', 'Best practices'];
    const questions = [];
    
    for (let i = 0; i < Math.min(recommendation.questionCount || 5, 10); i++) {
      const topic = topics[i % topics.length];
      questions.push({
        id: i + 1,
        question: `What is an important aspect of ${topic} in ${recommendation.title}?`,
        type: 'multiple-choice',
        options: [
          `Understanding ${topic} fundamentals`,
          `Ignoring ${topic} completely`,
          `Memorizing ${topic} definitions only`,
          `Avoiding ${topic} practice`
        ],
        correctAnswer: 0,
        explanation: `Understanding the fundamentals of ${topic} is crucial for mastering this module.`
      });
    }
    
    return questions;
  };

  const generateSampleQuiz = (module) => {
    return {
      title: `${module.title} Quiz`,
      description: `Test your understanding of ${module.title}`,
      timeLimit: 15,
      questionCount: 5,
      questions: [
        {
          id: 1,
          question: `What is the main concept covered in ${module.title}?`,
          type: 'multiple-choice',
          options: [
            'Basic fundamentals',
            'Advanced techniques',
            'Practical applications',
            'All of the above'
          ],
          correctAnswer: 3,
          explanation: 'This module covers comprehensive understanding including fundamentals, techniques, and applications.'
        },
        {
          id: 2,
          question: `Which best describes the learning objective of ${module.title}?`,
          type: 'multiple-choice',
          options: [
            'Understanding theory only',
            'Practical implementation',
            'Both theory and practice',
            'None of the above'
          ],
          correctAnswer: 2,
          explanation: 'Effective learning combines both theoretical understanding and practical implementation.'
        },
        {
          id: 3,
          question: `What is the recommended approach for mastering ${module.title}?`,
          type: 'multiple-choice',
          options: [
            'Memorization',
            'Practice and application',
            'Reading only',
            'Watching videos only'
          ],
          correctAnswer: 1,
          explanation: 'Active practice and real-world application lead to better retention and understanding.'
        },
        {
          id: 4,
          question: `How does ${module.title} relate to the overall course?`,
          type: 'multiple-choice',
          options: [
            'It\'s a standalone topic',
            'It builds on previous modules',
            'It\'s optional content',
            'It\'s review material'
          ],
          correctAnswer: 1,
          explanation: 'Each module builds upon previous knowledge to create a comprehensive learning experience.'
        },
        {
          id: 5,
          question: `What should you focus on after completing ${module.title}?`,
          type: 'multiple-choice',
          options: [
            'Moving to next topic immediately',
            'Practicing what you learned',
            'Forgetting the content',
            'Only taking notes'
          ],
          correctAnswer: 1,
          explanation: 'Reinforcement through practice helps solidify new knowledge and skills.'
        }
      ]
    };
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuizSubmitted(false);
    setResults(null);
    setQuizStarted(false);
    setTimeLeft(quiz.timeLimit * 60);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Quiz not found</div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(`/learn/${courseId}`)}
            className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Course
          </button>
          
          {quizStarted && !quizSubmitted && (
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className={`font-mono text-lg ${timeLeft <= 60 ? 'text-red-400' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quiz Content */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          {!quizStarted ? (
            // Quiz Introduction
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">{quiz.title}</h1>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">{quiz.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{quiz.questionCount} Questions</div>
                  <div className="text-gray-400 text-sm">Multiple Choice</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{quiz.timeLimit} Minutes</div>
                  <div className="text-gray-400 text-sm">Time Limit</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">Pass: 70%</div>
                  <div className="text-gray-400 text-sm">Minimum Score</div>
                </div>
              </div>
              
              <button
                onClick={handleStartQuiz}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Start Quiz
              </button>
            </div>
          ) : quizSubmitted ? (
            // Quiz Results
            <div className="p-8">
              <div className="text-center mb-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  results.percentage >= 70 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                }`}>
                  {results.percentage >= 70 ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <XCircle className="w-10 h-10 text-white" />
                  )}
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-4">
                  {results.percentage >= 70 ? 'Congratulations!' : 'Keep Practicing!'}
                </h2>
                
                <div className="text-6xl font-bold text-white mb-2">
                  {results.percentage}%
                </div>
                
                <p className="text-gray-300 mb-8">
                  You scored {results.correct} out of {results.total} questions correctly
                </p>
              </div>

              {/* Question Review */}
              <div className="space-y-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Review Answers</h3>
                {quiz.questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div key={question.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <XCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-3">
                            {index + 1}. {question.question}
                          </h4>
                          
                          <div className="space-y-2 mb-4">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border ${
                                  optionIndex === question.correctAnswer
                                    ? 'bg-green-500/20 border-green-500/50 text-green-300'
                                    : optionIndex === userAnswer
                                    ? 'bg-red-500/20 border-red-500/50 text-red-300'
                                    : 'bg-white/5 border-white/10 text-gray-400'
                                }`}
                              >
                                {typeof option === 'object' ? option.text : option}
                                {optionIndex === question.correctAnswer && (
                                  <span className="ml-2 text-green-400">✓</span>
                                )}
                                {optionIndex === userAnswer && optionIndex !== question.correctAnswer && (
                                  <span className="ml-2 text-red-400">✗</span>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                            <p className="text-blue-300 text-sm">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRetakeQuiz}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retake Quiz
                </button>
                
                <button
                  onClick={() => navigate(`/learn/${courseId}`)}
                  className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                >
                  Continue Course
                </button>
              </div>
            </div>
          ) : (
            // Quiz Questions
            <div>
              {/* Progress Bar */}
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </span>
                  <span className="text-gray-300">{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </div>

              {/* Question */}
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-white mb-8">
                  {currentQuestion.question}
                </h3>

                {/* Options */}
                <div className="space-y-4 mb-8">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      className={`w-full p-4 text-left rounded-xl border transition-all ${
                        answers[currentQuestion.id] === index
                          ? 'bg-purple-500/30 border-purple-500 text-white'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/40'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                          answers[currentQuestion.id] === index
                            ? 'border-purple-400 bg-purple-500 text-white'
                            : 'border-white/40 text-white/60'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        {typeof option === 'object' ? option.text : option}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                  </button>

                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(answers).length !== quiz.questions.length}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Submit Quiz
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleQuiz;