import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../config/api';
import { Plus, Trash2, Save, X } from 'lucide-react';

const CreateQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    instructions: '',
    duration: 30,
    passingScore: 70,
    maxAttempts: 3,
    shuffleQuestions: false,
    shuffleOptions: false,
    showCorrectAnswers: true,
    showExplanations: true,
    questions: []
  });

  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
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
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index, field, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, qi) => {
        if (qi !== qIndex) return q;
        return {
          ...q,
          options: q.options.map((opt, oi) => {
            if (oi !== oIndex) return field === 'isCorrect' ? { ...opt, isCorrect: false } : opt;
            return { ...opt, [field]: value };
          })
        };
      })
    }));
  };

  const addOption = (qIndex) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex
          ? { ...q, options: [...q.options, { text: '', isCorrect: false }] }
          : q
      )
    }));
  };

  const removeOption = (qIndex, oIndex) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.filter((_, oi) => oi !== oIndex) }
          : q
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!quiz.title.trim()) {
      alert('Please enter quiz title');
      return;
    }
    
    if (quiz.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    // Validate each question
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.question.trim()) {
        alert(`Question ${i + 1}: Please enter the question text`);
        return;
      }
      if (q.options.length < 2) {
        alert(`Question ${i + 1}: Please add at least 2 options`);
        return;
      }
      if (!q.options.some(opt => opt.isCorrect)) {
        alert(`Question ${i + 1}: Please mark at least one correct answer`);
        return;
      }
      if (q.options.some(opt => !opt.text.trim())) {
        alert(`Question ${i + 1}: Please fill in all option texts`);
        return;
      }
    }

    setSaving(true);
    try {
      await api.post('/quizzes', {
        ...quiz,
        courseId
      });
      alert('Quiz created successfully!');
      navigate(`/instructor/dashboard`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Create Quiz</h1>
          <p className="text-gray-300">Add quiz to test students' knowledge</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Quiz Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Title *</label>
                <input
                  type="text"
                  value={quiz.title}
                  onChange={(e) => setQuiz({...quiz, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  placeholder="e.g., Module 1 Assessment"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={quiz.description}
                  onChange={(e) => setQuiz({...quiz, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  rows="3"
                  placeholder="Brief description of the quiz"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Instructions</label>
                <textarea
                  value={quiz.instructions}
                  onChange={(e) => setQuiz({...quiz, instructions: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  rows="3"
                  placeholder="Instructions for students"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={quiz.duration}
                    onChange={(e) => setQuiz({...quiz, duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    value={quiz.passingScore}
                    onChange={(e) => setQuiz({...quiz, passingScore: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400"
                    min="0"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Max Attempts</label>
                  <input
                    type="number"
                    value={quiz.maxAttempts}
                    onChange={(e) => setQuiz({...quiz, maxAttempts: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quiz.showCorrectAnswers}
                    onChange={(e) => setQuiz({...quiz, showCorrectAnswers: e.target.checked})}
                    className="w-5 h-5 rounded"
                  />
                  Show correct answers after submission
                </label>

                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quiz.showExplanations}
                    onChange={(e) => setQuiz({...quiz, showExplanations: e.target.checked})}
                    className="w-5 h-5 rounded"
                  />
                  Show explanations
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {quiz.questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">Question {qIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Question Text *</label>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                        rows="2"
                        placeholder="Enter your question"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2">Type</label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400"
                        >
                          <option value="multiple-choice">Multiple Choice (Single)</option>
                          <option value="multiple-select">Multiple Select</option>
                          <option value="true-false">True/False</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-white mb-2">Points</label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-white">Options *</label>
                        {question.type !== 'true-false' && (
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="text-sm text-purple-400 hover:text-purple-300"
                          >
                            + Add Option
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex gap-2">
                            <input
                              type={question.type === 'multiple-select' ? 'checkbox' : 'radio'}
                              name={`question-${qIndex}-correct`}
                              checked={option.isCorrect}
                              onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                              className="mt-3"
                              title="Mark as correct"
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                              placeholder={`Option ${oIndex + 1}`}
                              required
                            />
                            {question.options.length > 2 && question.type !== 'true-false' && (
                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-white mb-2">Explanation (Optional)</label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                        rows="2"
                        placeholder="Explain the correct answer"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {quiz.questions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No questions added yet. Click "Add Question" to get started.
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;
