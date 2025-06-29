import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Book, Play, Users, Award, Globe, Heart,
  Calendar, Utensils, Music, MapPin, Star,
  CheckCircle, Clock, ArrowRight
} from 'lucide-react';
import Button from '../ui/Button';
import OptimizedImage from '../ui/OptimizedImage';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  progress: number;
  thumbnail: string;
  lessons: number;
}

interface CulturalTip {
  id: string;
  title: string;
  content: string;
  category: string;
  helpful: number;
  author: string;
  authorAvatar: string;
}

const CulturalLearningCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'modules' | 'tips' | 'quiz' | 'community'>('modules');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const learningModules: LearningModule[] = [
    {
      id: '1',
      title: 'Filipino Family Values & Traditions',
      description: 'Understanding the importance of family in Filipino culture, respect for elders, and traditional celebrations',
      category: 'Family & Relationships',
      duration: '45 min',
      difficulty: 'Beginner',
      completed: true,
      progress: 100,
      thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      lessons: 6
    },
    {
      id: '2',
      title: 'American Dating Culture & Expectations',
      description: 'Navigate American dating norms, communication styles, and relationship expectations',
      category: 'Dating & Romance',
      duration: '35 min',
      difficulty: 'Beginner',
      completed: false,
      progress: 60,
      thumbnail: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
      lessons: 5
    },
    {
      id: '3',
      title: 'Filipino Cuisine & Food Culture',
      description: 'Explore traditional Filipino dishes, dining etiquette, and the role of food in social gatherings',
      category: 'Food & Dining',
      duration: '50 min',
      difficulty: 'Intermediate',
      completed: false,
      progress: 20,
      thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
      lessons: 8
    },
    {
      id: '4',
      title: 'Cross-Cultural Communication',
      description: 'Master direct vs. indirect communication styles and avoid common misunderstandings',
      category: 'Communication',
      duration: '40 min',
      difficulty: 'Intermediate',
      completed: false,
      progress: 0,
      thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      lessons: 7
    },
    {
      id: '5',
      title: 'American Holiday Traditions',
      description: 'Learn about major American holidays, their significance, and how they\'re celebrated',
      category: 'Holidays & Celebrations',
      duration: '30 min',
      difficulty: 'Beginner',
      completed: false,
      progress: 0,
      thumbnail: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
      lessons: 4
    },
    {
      id: '6',
      title: 'Filipino Language Basics',
      description: 'Essential Filipino phrases, terms of endearment, and cultural expressions',
      category: 'Language',
      duration: '60 min',
      difficulty: 'Advanced',
      completed: false,
      progress: 0,
      thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
      lessons: 10
    }
  ];

  const culturalTips: CulturalTip[] = [
    {
      id: '1',
      title: 'Understanding "Po" and "Opo" in Filipino Culture',
      content: 'These respectful terms are used when speaking to elders or authority figures. "Po" is added to statements, while "Opo" means "yes" respectfully. Using these shows cultural awareness and respect.',
      category: 'Language & Respect',
      helpful: 127,
      author: 'Maria Santos',
      authorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    {
      id: '2',
      title: 'American Small Talk: Weather, Sports, and Work',
      content: 'Americans often start conversations with light topics like weather, local sports teams, or general work discussions. This isn\'t superficial - it\'s a way to build rapport before deeper conversations.',
      category: 'Communication',
      helpful: 89,
      author: 'John Martinez',
      authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    },
    {
      id: '3',
      title: 'The Importance of "Mano" Gesture',
      content: 'The "mano" is a traditional Filipino gesture of respect where you take an elder\'s hand and gently press it to your forehead while saying "Mano po." This shows deep respect and is appreciated by Filipino families.',
      category: 'Traditions',
      helpful: 156,
      author: 'Carmen Reyes',
      authorAvatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg'
    },
    {
      id: '4',
      title: 'American Independence and Personal Space',
      content: 'Americans value personal independence and may need more alone time than expected. This isn\'t rejection - it\'s cultural. Respecting this need actually strengthens relationships.',
      category: 'Relationships',
      helpful: 203,
      author: 'David Chen',
      authorAvatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg'
    }
  ];

  const categories = [
    'all',
    'Family & Relationships',
    'Dating & Romance',
    'Food & Dining',
    'Communication',
    'Holidays & Celebrations',
    'Language'
  ];

  const filteredModules = selectedCategory === 'all' 
    ? learningModules 
    : learningModules.filter(module => module.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderModules = () => (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All Categories' : category}
          </button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="relative">
              <OptimizedImage
                src={module.thumbnail}
                alt={module.title}
                className="w-full h-48"
                width={400}
                height={200}
              />
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                  {module.difficulty}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                {module.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <div className="w-6 h-6 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{module.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{module.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {module.duration}
                </div>
                <div className="flex items-center">
                  <Book className="w-4 h-4 mr-1" />
                  {module.lessons} lessons
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-900 font-medium">{module.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${module.progress}%` }}
                  ></div>
                </div>
              </div>

              <Button 
                variant={module.completed ? 'outline' : 'primary'} 
                size="sm" 
                className="w-full"
              >
                {module.completed ? 'Review' : module.progress > 0 ? 'Continue' : 'Start Learning'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTips = () => (
    <div className="space-y-6">
      {culturalTips.map((tip) => (
        <motion.div
          key={tip.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-start space-x-4">
            <OptimizedImage
              src={tip.authorAvatar}
              alt={tip.author}
              className="w-12 h-12 rounded-full"
              width={48}
              height={48}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{tip.title}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {tip.category}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{tip.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">By {tip.author}</span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Heart className="w-4 h-4 mr-1 text-red-500" />
                    {tip.helpful} found this helpful
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4 mr-1" />
                  Helpful
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderQuiz = () => (
    <div className="text-center py-12">
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex p-4 bg-purple-100 rounded-full mb-6">
          <Award className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Cultural Knowledge Quiz
        </h3>
        <p className="text-gray-600 mb-8">
          Test your understanding of Filipino and American cultures. 
          Complete quizzes to earn badges and track your learning progress.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="font-bold text-gray-900 mb-2">Filipino Culture Quiz</h4>
            <p className="text-gray-600 text-sm mb-4">15 questions about traditions, values, and customs</p>
            <Button variant="primary" className="w-full">
              Start Quiz
            </Button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="font-bold text-gray-900 mb-2">American Culture Quiz</h4>
            <p className="text-gray-600 text-sm mb-4">15 questions about lifestyle, values, and social norms</p>
            <Button variant="primary" className="w-full">
              Start Quiz
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-2">Your Progress</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">7</div>
              <div className="text-sm text-gray-600">Quizzes Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunity = () => (
    <div className="text-center py-12">
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
          <Users className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Cultural Exchange Community
        </h3>
        <p className="text-gray-600 mb-8">
          Connect with other cross-cultural couples, share experiences, 
          and learn from each other's journeys.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-left">
            <h4 className="font-bold text-gray-900 mb-2">Discussion Forums</h4>
            <p className="text-gray-600 text-sm mb-4">Join conversations about cultural differences, relationship advice, and success stories</p>
            <Button variant="outline" className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Browse Forums
            </Button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-left">
            <h4 className="font-bold text-gray-900 mb-2">Cultural Mentors</h4>
            <p className="text-gray-600 text-sm mb-4">Get guidance from experienced cross-cultural couples and relationship experts</p>
            <Button variant="outline" className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Find a Mentor
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-4">Upcoming Events</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white p-3 rounded-lg">
              <div className="text-left">
                <div className="font-medium text-gray-900">Virtual Cultural Exchange Night</div>
                <div className="text-sm text-gray-600">Share traditions and learn from others</div>
              </div>
              <div className="text-sm text-gray-500">Tomorrow 8PM</div>
            </div>
            <div className="flex items-center justify-between bg-white p-3 rounded-lg">
              <div className="text-left">
                <div className="font-medium text-gray-900">Cross-Cultural Cooking Class</div>
                <div className="text-sm text-gray-600">Learn to cook each other's favorite dishes</div>
              </div>
              <div className="text-sm text-gray-500">This Weekend</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex p-3 bg-blue-100 rounded-full mb-6">
          <Book className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Cultural Learning Center
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Deepen your understanding of each other's cultures through interactive lessons, 
          community wisdom, and hands-on learning experiences.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-12">
        <div className="bg-white p-2 rounded-lg shadow-lg">
          {[
            { key: 'modules', label: 'Learning Modules', icon: Book },
            { key: 'tips', label: 'Cultural Tips', icon: Star },
            { key: 'quiz', label: 'Knowledge Quiz', icon: Award },
            { key: 'community', label: 'Community', icon: Users }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'modules' && renderModules()}
        {activeTab === 'tips' && renderTips()}
        {activeTab === 'quiz' && renderQuiz()}
        {activeTab === 'community' && renderCommunity()}
      </div>
    </div>
  );
};

export default CulturalLearningCenter;