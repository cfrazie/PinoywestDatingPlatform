import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, ArrowRight, Check, X, 
  HelpCircle, RefreshCw, Award
} from 'lucide-react';
import Button from '../ui/Button';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  weight: number;
}

interface QuizAnswer {
  questionId: string;
  answer: number; // Index of selected option
}

interface CompatibilityQuizProps {
  userId: string;
  onComplete: (answers: QuizAnswer[]) => void;
  onCancel?: () => void;
}

const CompatibilityQuiz: React.FC<CompatibilityQuizProps> = ({
  userId,
  onComplete,
  onCancel
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Mock quiz questions
  const questions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'How important is it that your partner shares your cultural background?',
      options: [
        'Not important at all',
        'Slightly important',
        'Moderately important',
        'Very important',
        'Extremely important'
      ],
      category: 'cultural_values',
      weight: 1.2
    },
    {
      id: 'q2',
      question: 'How do you prefer to resolve conflicts in a relationship?',
      options: [
        'Discuss immediately and directly',
        'Take time to cool off, then discuss',
        'Seek compromise and middle ground',
        'Adapt to my partner\'s preference',
        'Prefer to avoid confrontation'
      ],
      category: 'communication',
      weight: 1.0
    },
    {
      id: 'q3',
      question: 'How important is it to you that your partner speaks your native language?',
      options: [
        'Not important - we can use translation tools',
        'Slightly important - basic understanding is enough',
        'Moderately important - should be conversational',
        'Very important - should be fluent',
        'Extremely important - must be native-level'
      ],
      category: 'language',
      weight: 0.9
    },
    {
      id: 'q4',
      question: 'How often do you want to participate in cultural traditions and celebrations?',
      options: [
        'Rarely or never',
        'Only major holidays',
        'Monthly',
        'Weekly',
        'As often as possible'
      ],
      category: 'cultural_values',
      weight: 1.1
    },
    {
      id: 'q5',
      question: 'How important is it that your partner shares your religious or spiritual beliefs?',
      options: [
        'Not important at all',
        'Slightly important',
        'Moderately important',
        'Very important',
        'Extremely important'
      ],
      category: 'values',
      weight: 1.3
    },
    {
      id: 'q6',
      question: 'How do you feel about long-distance relationships?',
      options: [
        'Prefer to avoid them completely',
        'Willing for a short period (< 6 months)',
        'Comfortable for a moderate time (6-12 months)',
        'Open to extended periods (1-2 years)',
        'Distance isn\'t a major concern'
      ],
      category: 'relationship_preferences',
      weight: 1.0
    },
    {
      id: 'q7',
      question: 'How important is it that your partner gets along with your family?',
      options: [
        'Not important',
        'Slightly important',
        'Moderately important',
        'Very important',
        'Extremely important'
      ],
      category: 'family_values',
      weight: 1.2
    },
    {
      id: 'q8',
      question: 'How willing are you to learn about and participate in your partner\'s cultural traditions?',
      options: [
        'Not willing',
        'Slightly willing',
        'Moderately willing',
        'Very willing',
        'Extremely willing'
      ],
      category: 'cultural_openness',
      weight: 1.4
    },
    {
      id: 'q9',
      question: 'How important is it that you and your partner have similar life goals?',
      options: [
        'Not important',
        'Slightly important',
        'Moderately important',
        'Very important',
        'Extremely important'
      ],
      category: 'life_goals',
      weight: 1.3
    },
    {
      id: 'q10',
      question: 'How do you feel about relocating for a relationship?',
      options: [
        'Not willing to relocate',
        'Willing to relocate within my country',
        'Willing to relocate to specific countries',
        'Willing to relocate almost anywhere',
        'Very eager to relocate internationally'
      ],
      category: 'mobility',
      weight: 1.1
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (optionIndex: number) => {
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer: optionIndex
    };
    
    setAnswers(prev => [...prev, answer]);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cultural_values':
        return 'bg-blue-100 text-blue-800';
      case 'communication':
        return 'bg-green-100 text-green-800';
      case 'language':
        return 'bg-purple-100 text-purple-800';
      case 'values':
        return 'bg-red-100 text-red-800';
      case 'relationship_preferences':
        return 'bg-yellow-100 text-yellow-800';
      case 'family_values':
        return 'bg-pink-100 text-pink-800';
      case 'cultural_openness':
        return 'bg-indigo-100 text-indigo-800';
      case 'life_goals':
        return 'bg-orange-100 text-orange-800';
      case 'mobility':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-xl font-bold">Compatibility Quiz Completed</h2>
        </div>
        
        <div className="p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Thank You!
          </h3>
          
          <p className="text-gray-600 mb-6">
            Your preferences have been saved. We'll use this information to find your most compatible matches.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setAnswers([]);
                setCurrentQuestionIndex(0);
                setIsCompleted(false);
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Compatibility Quiz</h2>
          {onCancel && (
            <button 
              onClick={onCancel}
              className="text-white hover:text-blue-100"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-blue-100">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(currentQuestion.category)}`}>
            {currentQuestion.category.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-4">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.question}
          </h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3">
                    <span className="text-sm">{index + 1}</span>
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center text-sm text-gray-500">
            <HelpCircle className="w-4 h-4 mr-1" />
            <span>Select an option to continue</span>
          </div>
          
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Save for Later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityQuiz;