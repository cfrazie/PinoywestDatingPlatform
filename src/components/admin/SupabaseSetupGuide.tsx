import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, Copy, CheckCircle, AlertCircle, 
  Database, Key, Globe, ArrowRight 
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const SupabaseSetupGuide: React.FC = () => {
  const [step, setStep] = useState(1);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      title: 'Create Supabase Project',
      description: 'Set up your new Supabase project',
      icon: Globe,
    },
    {
      title: 'Get Project Credentials',
      description: 'Copy your project URL and API key',
      icon: Key,
    },
    {
      title: 'Configure Environment',
      description: 'Add credentials to your project',
      icon: Database,
    },
  ];

  const databaseSchema = `
-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public contact submissions" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public newsletter subscriptions" ON newsletter_subscriptions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public analytics events" ON analytics_events
  FOR INSERT TO anon WITH CHECK (true);
`;

  const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl || 'your_supabase_project_url_here'}
VITE_SUPABASE_ANON_KEY=${supabaseKey || 'your_supabase_anon_key_here'}

# Analytics (Optional)
VITE_GA_TRACKING_ID=your_google_analytics_id
VITE_HOTJAR_ID=your_hotjar_id

# Email Service (Optional)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key`;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Setup Guide</h1>
        <p className="text-gray-600">
          Follow these steps to connect your application to Supabase
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((stepItem, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step > index + 1 
                  ? 'bg-green-500 border-green-500 text-white'
                  : step === index + 1
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}>
                {step > index + 1 ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <stepItem.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((stepItem, index) => (
            <div key={index} className="text-center" style={{ width: '200px' }}>
              <h3 className="font-medium text-gray-900">{stepItem.title}</h3>
              <p className="text-sm text-gray-500">{stepItem.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-6 rounded-lg border border-gray-200"
      >
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 1: Create Supabase Project</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                  <li>Sign in to your account or create a new one</li>
                  <li>Click "New Project"</li>
                  <li>Choose your organization</li>
                  <li>Enter project name: "PinoyWest Dating Platform"</li>
                  <li>Create a strong database password and save it securely</li>
                  <li>Select a region closest to your users</li>
                  <li>Click "Create new project"</li>
                </ol>
              </div>
              
              <Button 
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Supabase Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setStep(2)}
                className="ml-4"
              >
                Next: Get Credentials
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 2: Get Project Credentials</h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Get your credentials:</h3>
                <ol className="list-decimal list-inside space-y-2 text-green-800">
                  <li>In your Supabase project dashboard, go to Settings → API</li>
                  <li>Copy the "Project URL"</li>
                  <li>Copy the "anon public" API key</li>
                  <li>Paste them in the fields below</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Supabase Project URL"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                />
                <Input
                  label="Supabase Anon Key"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </div>

              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!supabaseUrl || !supabaseKey}
                >
                  Next: Configure Environment
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 3: Configure Environment</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">1. Update your .env file:</h3>
                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    {envTemplate}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(envTemplate, 'env')}
                    className="absolute top-2 right-2 bg-gray-800 text-white border-gray-600"
                  >
                    {copied === 'env' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Set up database tables:</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor):
                </p>
                <div className="relative">
                  <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-x-auto text-sm max-h-64">
                    {databaseSchema}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(databaseSchema, 'sql')}
                    className="absolute top-2 right-2 bg-gray-800 text-white border-gray-600"
                  >
                    {copied === 'sql' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Important:</h4>
                    <p className="text-yellow-800 text-sm">
                      After updating the .env file, restart your development server for changes to take effect.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button 
                  onClick={() => {
                    alert('Setup complete! Restart your development server and check the system status dashboard.');
                    window.location.reload();
                  }}
                >
                  Complete Setup
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SupabaseSetupGuide;