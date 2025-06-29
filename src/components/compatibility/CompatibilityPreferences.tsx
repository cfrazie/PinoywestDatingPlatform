import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Settings, Save, RefreshCw, 
  ChevronDown, ChevronUp, Info, AlertTriangle
} from 'lucide-react';
import Button from '../ui/Button';
import { 
  useCompatibilityScoring,
  CompatibilityFactor,
  CompatibilityPreference
} from '../../hooks/useCompatibilityScoring';

interface CompatibilityPreferencesProps {
  userId: string;
  onSave?: () => void;
  onClose?: () => void;
}

const CompatibilityPreferences: React.FC<CompatibilityPreferencesProps> = ({
  userId,
  onSave,
  onClose
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [preferences, setPreferences] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { 
    compatibilityFactors,
    userPreferences,
    isLoading,
    error,
    saveUserPreference,
    updateAllCompatibilityScores
  } = useCompatibilityScoring(userId);

  // Initialize expanded categories
  useEffect(() => {
    if (compatibilityFactors.length > 0) {
      const categories = [...new Set(compatibilityFactors.map(f => f.category))];
      const initialExpanded: Record<string, boolean> = {};
      
      // Expand first category by default
      categories.forEach((category, index) => {
        initialExpanded[category] = index === 0;
      });
      
      setExpandedCategories(initialExpanded);
    }
  }, [compatibilityFactors]);

  // Initialize preferences from user preferences
  useEffect(() => {
    const initialPreferences: Record<string, number> = {};
    
    userPreferences.forEach(pref => {
      initialPreferences[pref.factorId] = pref.importance;
    });
    
    setPreferences(initialPreferences);
  }, [userPreferences]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handlePreferenceChange = (factorId: string, value: number) => {
    setPreferences(prev => ({
      ...prev,
      [factorId]: value
    }));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Save each preference
      const savePromises = Object.entries(preferences).map(([factorId, importance]) => 
        saveUserPreference(factorId, importance)
      );
      
      await Promise.all(savePromises);
      
      // Update compatibility scores
      await updateAllCompatibilityScores();
      
      setSaveSuccess(true);
      if (onSave) onSave();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Group factors by category
  const factorsByCategory: Record<string, CompatibilityFactor[]> = {};
  compatibilityFactors.forEach(factor => {
    if (!factorsByCategory[factor.category]) {
      factorsByCategory[factor.category] = [];
    }
    factorsByCategory[factor.category].push(factor);
  });

  // Format category name
  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading compatibility preferences...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Compatibility Preferences</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-100"
            >
              ×
            </button>
          )}
        </div>
        
        <p className="text-blue-100">
          Customize what matters most to you in a relationship to improve your matches
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Info className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-900">How It Works</h3>
          </div>
          <p className="text-sm text-blue-700">
            Rate how important each factor is to you on a scale from 1 (not important) to 5 (very important).
            Our AI will use your preferences to find your most compatible matches.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-4 mb-6">
          {Object.entries(factorsByCategory).map(([category, factors]) => (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{formatCategoryName(category)}</h3>
                {expandedCategories[category] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {expandedCategories[category] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 space-y-4"
                >
                  {factors.map(factor => (
                    <div key={factor.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          {factor.name}
                        </label>
                        <span className="text-xs text-gray-500">
                          {preferences[factor.id] ? 
                            preferences[factor.id] === 1 ? 'Not Important' :
                            preferences[factor.id] === 2 ? 'Slightly Important' :
                            preferences[factor.id] === 3 ? 'Moderately Important' :
                            preferences[factor.id] === 4 ? 'Important' :
                            'Very Important'
                          : 'Not Set'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">1</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={preferences[factor.id] || 3}
                          onChange={(e) => handlePreferenceChange(factor.id, parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-gray-500">5</span>
                      </div>
                      
                      <p className="text-xs text-gray-500">{factor.description}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-green-600 flex items-center"
              >
                <Heart className="w-4 h-4 mr-1" />
                Preferences saved successfully!
              </motion.div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreferences}
              loading={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityPreferences;