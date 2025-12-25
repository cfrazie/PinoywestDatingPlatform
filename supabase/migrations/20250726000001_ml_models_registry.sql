/*
  # ML Models Registry and Prediction Tables
  
  1. New Tables
    - `ml_models` - Registry of ML models used for matching
    - `ml_predictions` - History of predictions made by models
    - `ml_training_data` - Training data collected from user interactions
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and admins
*/

-- Create ML models registry table
CREATE TABLE IF NOT EXISTS ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('ncf', 'transformer', 'gnn', 'xgboost', 'ensemble')),
  version TEXT NOT NULL,
  description TEXT,
  architecture JSONB,
  hyperparameters JSONB,
  training_data_size INTEGER,
  accuracy FLOAT,
  precision FLOAT,
  recall FLOAT,
  f1_score FLOAT,
  auc_roc FLOAT,
  is_active BOOLEAN DEFAULT false,
  trained_at TIMESTAMPTZ,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create model predictions history table
CREATE TABLE IF NOT EXISTS ml_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES ml_models(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  predicted_compatibility FLOAT,
  predicted_success_probability FLOAT,
  confidence_interval FLOAT,
  feature_importance JSONB,
  prediction_explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create training data table for ML
CREATE TABLE IF NOT EXISTS ml_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  features JSONB NOT NULL,
  label FLOAT, -- Actual outcome (0-1 for match success)
  label_type TEXT CHECK (label_type IN ('match', 'message', 'date', 'relationship', 'feedback')),
  weight FLOAT DEFAULT 1.0, -- Sample weight for training
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ml_models_active ON ml_models(is_active, type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ml_models_accuracy ON ml_models(accuracy DESC, auc_roc DESC);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_user ON ml_predictions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_model ON ml_predictions(model_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_high_confidence ON ml_predictions(predicted_success_probability DESC) 
  WHERE confidence_interval > 0.7;

CREATE INDEX IF NOT EXISTS idx_ml_training_data_user ON ml_training_data(user_id, label_type);
CREATE INDEX IF NOT EXISTS idx_ml_training_data_label ON ml_training_data(label, label_type);
CREATE INDEX IF NOT EXISTS idx_ml_training_data_created ON ml_training_data(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_training_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ml_models
CREATE POLICY "ML models are readable by authenticated users" 
  ON ml_models FOR SELECT 
  TO authenticated 
  USING (is_active = true);

CREATE POLICY "Only admins can manage ML models" 
  ON ml_models FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- RLS Policies for ml_predictions
CREATE POLICY "Users can read their own predictions" 
  ON ml_predictions FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert predictions" 
  ON ml_predictions FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Admins can read all predictions" 
  ON ml_predictions FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- RLS Policies for ml_training_data
CREATE POLICY "System can insert training data" 
  ON ml_training_data FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Admins can manage training data" 
  ON ml_training_data FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- Insert initial ML models
INSERT INTO ml_models (name, type, version, description, is_active, hyperparameters, accuracy, precision, recall, f1_score, auc_roc, deployed_at) VALUES
('CompatibilityGPT-NCF', 'ncf', '2.0', 'Neural Collaborative Filtering for user preference learning', true, 
 '{"embedding_size": 128, "layers": [256, 128, 64], "dropout": 0.2}', 
 0.87, 0.85, 0.88, 0.86, 0.89, NOW()),
('CompatibilityTransformer', 'transformer', '1.0', 'BERT-based semantic matching for profile text analysis', false, 
 '{"model": "bert-base-uncased", "max_length": 512, "hidden_size": 768}', 
 0.82, 0.80, 0.84, 0.82, 0.85, NULL),
('MatchingGNN', 'gnn', '1.0', 'Graph Neural Network for relationship pattern learning', false, 
 '{"layers": 3, "hidden_channels": 64, "heads": 4}', 
 0.79, 0.77, 0.81, 0.79, 0.82, NULL),
('CompatibilityXGBoost', 'xgboost', '1.5', 'Gradient boosting for tabular feature prediction', true, 
 '{"max_depth": 6, "learning_rate": 0.1, "n_estimators": 100}', 
 0.84, 0.83, 0.85, 0.84, 0.87, NOW()),
('EnsemblePredictor', 'ensemble', '1.0', 'Ensemble of all models for optimal predictions', true, 
 '{"models": ["ncf", "xgboost"], "weights": [0.6, 0.4]}', 
 0.91, 0.90, 0.92, 0.91, 0.94, NOW());
