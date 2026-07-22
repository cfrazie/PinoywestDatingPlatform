# Advanced Machine Learning Matching Algorithm

## Overview

This implementation adds state-of-the-art machine learning capabilities to the PinoywestDatingPlatform's matching algorithm, including behavioral intelligence, success prediction, and dynamic optimization.

## Features Implemented

### 1. ML Models Registry
- **Tables**: `ml_models`, `ml_predictions`, `ml_training_data`
- **Models**: NCF, Transformer, GNN, XGBoost, Ensemble
- **Metrics**: Accuracy, Precision, Recall, F1-Score, AUC-ROC

### 2. Behavioral Tracking System
- **Tables**: `user_interactions`, `user_engagement_patterns`, `learned_user_preferences`
- **Tracked Interactions**: Profile views, likes, messages, calls, dates, relationships
- **Engagement Metrics**: Session duration, activity frequency, response rates, swipe velocity

### 3. Success Prediction
- **Tables**: `relationship_outcomes`, `match_success_predictions`
- **Predictions**: Message success, date success, relationship success probabilities
- **Risk Analysis**: Ghosting risk, conflict likelihood
- **Confidence Scoring**: Data sufficiency and prediction confidence metrics

### 4. Dynamic Weight Adjustment
- **Tables**: `user_dynamic_weights`, `factor_weight_performance`
- **Personalization**: Per-user factor weight optimization based on outcomes
- **Performance Tracking**: Global and per-demographic segment analysis

### 5. Seasonal & Regional Patterns
- **Tables**: `seasonal_matching_patterns`, `regional_matching_preferences`
- **Patterns**: Holiday effects, seasonal trends, regional preferences
- **Cultural Insights**: Location-specific matching preferences and communication styles

### 6. Compatibility Evolution
- **Tables**: `compatibility_evolution`, `compatibility_milestones`
- **Tracking**: Long-term compatibility changes over relationship stages
- **Milestones**: First message, dates, commitment stages

### 7. Performance Optimization
- **Caching**: `match_recommendations_cache` with 24-hour expiry
- **Real-time Learning**: Automatic ML training data updates via triggers
- **Batch Processing**: Background recommendation updates

### 8. Analytics & A/B Testing
- **Tables**: `algorithm_performance_metrics`, `ab_test_assignments`, `ab_test_results`
- **Metrics**: Match quality, engagement, success rates
- **Experimentation**: Multi-variant testing framework

## API Functions

### Database Functions

#### `predict_match_success(p_user_id, p_target_user_id)`
Returns comprehensive success prediction JSON with message, date, and relationship success probabilities.

#### `get_ml_recommendations(p_user_id, p_limit, p_min_score, p_use_cache)`
Returns table of recommended matches with scores and rankings.

#### `refresh_recommendations_cache(p_user_id)`
Updates the recommendation cache for a user.

#### `update_engagement_patterns(p_user_id)`
Recalculates engagement metrics for a user.

#### `adjust_compatibility_weights(p_user_id)`
Adjusts factor weights based on user's relationship outcomes.

## Frontend Components

### 1. EnhancedCompatibilityDashboard
Complete dashboard with three tabs: Recommendations, Insights, Preferences

**Usage**:
```tsx
import { EnhancedCompatibilityDashboard } from '@/components/matching/EnhancedCompatibilityDashboard';

<EnhancedCompatibilityDashboard userId={currentUser.id} />
```

### 2. SuccessPredictionCard
Detailed success prediction visualization

**Usage**:
```tsx
import { SuccessPredictionCard } from '@/components/matching/SuccessPredictionCard';

const prediction = await getSuccessPrediction(targetUserId);
<SuccessPredictionCard 
  prediction={prediction} 
  targetUserName="John" 
/>
```

### 3. BehavioralInsights
User activity pattern visualization

**Usage**:
```tsx
import { BehavioralInsights } from '@/components/matching/BehavioralInsights';

const insights = await getBehavioralInsights();
<BehavioralInsights insights={insights} />
```

## React Hook

### useEnhancedMatching

**Usage**:
```tsx
import { useEnhancedMatching } from '@/hooks/useEnhancedMatching';

const {
  getMLRecommendations,
  getSuccessPrediction,
  trackInteraction,
  getBehavioralInsights,
  getLearnedPreferences,
  refreshRecommendations,
  updateEngagementPatterns,
  loading,
  error
} = useEnhancedMatching(userId);

// Get recommendations
const matches = await getMLRecommendations(20, 60, true);

// Track interaction
await trackInteraction(targetUserId, 'profile_like', { 
  context: 'discover_page' 
});

// Get success prediction
const prediction = await getSuccessPrediction(targetUserId);
```

## Interaction Types

Track user behaviors with these interaction types:
- **Discovery**: `profile_view`, `profile_like`, `profile_skip`, `profile_superlike`
- **Messaging**: `message_sent`, `message_received`, `message_replied`
- **Calls**: `video_call_initiated`, `video_call_accepted`, `video_call_declined`
- **Gifts**: `gift_sent`, `gift_received`
- **Dating**: `date_requested`, `date_accepted`, `date_declined`, `date_completed`
- **Relationships**: `relationship_started`, `relationship_ended`
- **Moderation**: `report`, `block`, `unmatch`

## Security (RLS Policies)

All tables have Row Level Security enabled with appropriate policies for user privacy and admin access.

## Migration Files

1. `20250726000001_ml_models_registry.sql` - ML infrastructure
2. `20250726000002_behavioral_tracking.sql` - User behavior tracking
3. `20250726000003_success_prediction.sql` - Success prediction system
4. `20250726000004_dynamic_weights_patterns.sql` - Weight adjustment & patterns
5. `20250726000005_evolution_learning.sql` - Compatibility evolution & real-time learning
6. `20250726000006_analytics_ab_testing.sql` - Analytics & A/B testing

## Future Enhancements (Phase 2)

- Multimodal learning (text + images + video analysis)
- Voice compatibility analysis
- Personality type detection from chat patterns
- Conflict prediction and intervention
- Optimal messaging time recommendations
- Relationship coaching suggestions

## License

Part of the PinoywestDatingPlatform project.
