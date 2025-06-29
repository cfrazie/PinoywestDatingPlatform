import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: LessonContent[];
  thumbnail: string;
  lessonsCount: number;
  duration: string;
  completed?: boolean;
  progress?: number;
}

interface LessonContent {
  title: string;
  content: string;
  videoUrl?: string;
  quizQuestions?: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface CulturalTip {
  id: string;
  title: string;
  content: string;
  category: string;
  culture?: string;
  helpfulCount: number;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  progress: number;
  completed: boolean;
  lastAccessed: string;
}

interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  maxScore: number;
  completedAt: string;
}

export const useCulturalLearning = (userId?: string) => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [tips, setTips] = useState<CulturalTip[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load learning modules
  const loadLearningModules = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (supabase) {
        // Load modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('cultural_learning_modules')
          .select('*')
          .order('created_at');

        if (modulesError) throw modulesError;

        // Load user progress if logged in
        let progressData: any[] = [];
        if (userId) {
          const { data: progress, error: progressError } = await supabase
            .from('user_cultural_progress')
            .select('*')
            .eq('user_id', userId);

          if (progressError) throw progressError;
          progressData = progress || [];
        }

        // Combine modules with progress
        if (modulesData) {
          const formattedModules: LearningModule[] = modulesData.map(module => {
            const userModuleProgress = progressData.find(p => p.module_id === module.id);
            
            return {
              id: module.id,
              title: module.title,
              description: module.description,
              category: module.category,
              difficulty: module.difficulty,
              content: module.content || [],
              thumbnail: module.thumbnail || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
              lessonsCount: module.lessons_count || 0,
              duration: module.duration || '30 min',
              completed: userModuleProgress?.completed || false,
              progress: userModuleProgress?.progress || 0
            };
          });

          setModules(formattedModules);
        }

        // Load cultural tips
        const { data: tipsData, error: tipsError } = await supabase
          .from('cultural_tips')
          .select(`
            *,
            author:author_id (
              id,
              raw_user_meta_data
            )
          `)
          .order('created_at', { ascending: false });

        if (tipsError) throw tipsError;

        if (tipsData) {
          const formattedTips: CulturalTip[] = tipsData.map(tip => ({
            id: tip.id,
            title: tip.title,
            content: tip.content,
            category: tip.category,
            culture: tip.culture,
            helpfulCount: tip.helpful_count || 0,
            author: {
              id: tip.author?.id || '',
              name: tip.author?.raw_user_meta_data?.full_name || 'Anonymous',
              avatar: tip.author?.raw_user_meta_data?.avatar_url || 'https://via.placeholder.com/150'
            }
          }));

          setTips(formattedTips);
        }

        // Load quiz results if logged in
        if (userId) {
          const { data: quizData, error: quizError } = await supabase
            .from('user_quiz_results')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });

          if (quizError) throw quizError;

          if (quizData) {
            setQuizResults(quizData.map(result => ({
              id: result.id,
              userId: result.user_id,
              quizId: result.quiz_id,
              score: result.score,
              maxScore: result.max_score,
              completedAt: result.completed_at
            })));
          }
        }
      } else {
        // Use mock data if Supabase is not available
        console.log('Using mock learning module data');
      }
    } catch (err) {
      console.error('Error loading learning modules:', err);
      setError('Failed to load learning content');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update user progress
  const updateProgress = useCallback(async (moduleId: string, progress: number, completed: boolean = false) => {
    if (!userId || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('user_cultural_progress')
        .upsert({
          user_id: userId,
          module_id: moduleId,
          progress,
          completed,
          last_accessed: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, module_id'
        })
        .select();

      if (error) throw error;

      // Update local state
      setUserProgress(prev => {
        const filtered = prev.filter(p => p.moduleId !== moduleId);
        return [...filtered, {
          id: data?.[0]?.id || '',
          userId,
          moduleId,
          progress,
          completed,
          lastAccessed: new Date().toISOString()
        }];
      });

      // Also update modules state
      setModules(prev => prev.map(module => 
        module.id === moduleId 
          ? { ...module, progress, completed }
          : module
      ));

      return data?.[0];
    } catch (err) {
      console.error('Error updating progress:', err);
      throw err;
    }
  }, [userId]);

  // Save quiz result
  const saveQuizResult = useCallback(async (quizId: string, score: number, maxScore: number) => {
    if (!userId || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('user_quiz_results')
        .insert({
          user_id: userId,
          quiz_id: quizId,
          score,
          max_score: maxScore,
          completed_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      // Update local state
      if (data?.[0]) {
        setQuizResults(prev => [...prev, {
          id: data[0].id,
          userId,
          quizId,
          score,
          maxScore,
          completedAt: data[0].completed_at
        }]);
      }

      return data?.[0];
    } catch (err) {
      console.error('Error saving quiz result:', err);
      throw err;
    }
  }, [userId]);

  // Mark tip as helpful
  const markTipAsHelpful = useCallback(async (tipId: string) => {
    if (!supabase) return;

    try {
      // Increment helpful count
      const { error } = await supabase.rpc('increment_tip_helpful_count', {
        tip_id: tipId
      });

      if (error) throw error;

      // Update local state
      setTips(prev => prev.map(tip => 
        tip.id === tipId 
          ? { ...tip, helpfulCount: tip.helpfulCount + 1 }
          : tip
      ));
    } catch (err) {
      console.error('Error marking tip as helpful:', err);
    }
  }, []);

  // Get modules by category
  const getModulesByCategory = useCallback((category: string) => {
    return modules.filter(module => module.category === category);
  }, [modules]);

  // Get modules by difficulty
  const getModulesByDifficulty = useCallback((difficulty: string) => {
    return modules.filter(module => module.difficulty === difficulty);
  }, [modules]);

  // Get tips by category
  const getTipsByCategory = useCallback((category: string) => {
    return tips.filter(tip => tip.category === category);
  }, [tips]);

  // Get tips by culture
  const getTipsByCulture = useCallback((culture: string) => {
    return tips.filter(tip => tip.culture === culture);
  }, [tips]);

  // Get user progress statistics
  const getUserProgressStats = useCallback(() => {
    const completedModules = modules.filter(module => module.completed).length;
    const inProgressModules = modules.filter(module => !module.completed && (module.progress || 0) > 0).length;
    const totalModules = modules.length;
    
    const averageProgress = modules.length > 0
      ? modules.reduce((sum, module) => sum + (module.progress || 0), 0) / modules.length
      : 0;
    
    const averageQuizScore = quizResults.length > 0
      ? quizResults.reduce((sum, result) => sum + (result.score / result.maxScore * 100), 0) / quizResults.length
      : 0;
    
    return {
      completedModules,
      inProgressModules,
      totalModules,
      averageProgress,
      averageQuizScore,
      totalQuizzesTaken: quizResults.length
    };
  }, [modules, quizResults]);

  // Load data on mount
  useEffect(() => {
    loadLearningModules();
  }, [loadLearningModules]);

  return {
    modules,
    tips,
    userProgress,
    quizResults,
    isLoading,
    error,
    updateProgress,
    saveQuizResult,
    markTipAsHelpful,
    getModulesByCategory,
    getModulesByDifficulty,
    getTipsByCategory,
    getTipsByCulture,
    getUserProgressStats,
    refreshData: loadLearningModules
  };
};