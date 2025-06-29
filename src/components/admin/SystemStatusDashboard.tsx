import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, Database, Wifi, AlertCircle, CheckCircle, 
  Clock, RefreshCw, Settings, Activity, Zap 
} from 'lucide-react';
import Button from '../ui/Button';
import { checkSystemStatus, testDatabaseConnection, testApiEndpoints, SystemStatus } from '../../utils/systemCheck';

const SystemStatusDashboard: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runSystemCheck = async () => {
    setIsLoading(true);
    try {
      const systemStatus = await checkSystemStatus();
      setStatus(systemStatus);
      setLastChecked(new Date());
    } catch (error) {
      console.error('System check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSystemCheck();
  }, []);

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isOnline: boolean) => {
    return isOnline ? CheckCircle : AlertCircle;
  };

  const getStatusBg = (isOnline: boolean) => {
    return isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  if (!status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Status Dashboard</h1>
              <p className="text-gray-600">
                Monitor backend services, database connectivity, and API endpoints
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {lastChecked && (
                <div className="text-sm text-gray-500">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </div>
              )}
              <Button
                onClick={runSystemCheck}
                loading={isLoading}
                className="flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg border-2 mb-8 ${
            status.database.connected && status.services.supabase
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {status.database.connected && status.services.supabase ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {status.database.connected && status.services.supabase
                  ? 'All Systems Operational'
                  : 'Some Issues Detected'
                }
              </h2>
              <p className="text-gray-600">
                {status.database.connected && status.services.supabase
                  ? 'All core services are running normally'
                  : 'Some services may need attention'
                }
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Database Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-lg border-2 ${getStatusBg(status.database.connected)}`}
          >
            <div className="flex items-center mb-4">
              <Database className={`w-6 h-6 mr-3 ${getStatusColor(status.database.connected)}`} />
              <h3 className="text-lg font-semibold text-gray-900">Database Connection</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center">
                  {React.createElement(getStatusIcon(status.database.connected), {
                    className: `w-4 h-4 mr-2 ${getStatusColor(status.database.connected)}`
                  })}
                  <span className={`font-medium ${getStatusColor(status.database.connected)}`}>
                    {status.database.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              
              {status.database.latency && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Latency:</span>
                  <span className="font-medium">{status.database.latency}ms</span>
                </div>
              )}
              
              {status.database.error && (
                <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{status.database.error}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Services Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white rounded-lg border-2 border-gray-200"
          >
            <div className="flex items-center mb-4">
              <Server className="w-6 h-6 mr-3 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Services</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Supabase:</span>
                <div className="flex items-center">
                  {React.createElement(getStatusIcon(status.services.supabase), {
                    className: `w-4 h-4 mr-2 ${getStatusColor(status.services.supabase)}`
                  })}
                  <span className={`font-medium ${getStatusColor(status.services.supabase)}`}>
                    {status.services.supabase ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Analytics:</span>
                <div className="flex items-center">
                  {React.createElement(getStatusIcon(status.services.analytics), {
                    className: `w-4 h-4 mr-2 ${getStatusColor(status.services.analytics)}`
                  })}
                  <span className={`font-medium ${getStatusColor(status.services.analytics)}`}>
                    {status.services.analytics ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Live Chat:</span>
                <div className="flex items-center">
                  {React.createElement(getStatusIcon(status.services.chat), {
                    className: `w-4 h-4 mr-2 ${getStatusColor(status.services.chat)}`
                  })}
                  <span className={`font-medium ${getStatusColor(status.services.chat)}`}>
                    {status.services.chat ? 'Active' : 'Not Active'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* API Endpoints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white rounded-lg border-2 border-gray-200"
          >
            <div className="flex items-center mb-4">
              <Wifi className="w-6 h-6 mr-3 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">API Endpoints</h3>
            </div>
            
            <div className="space-y-3">
              {status.api.endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600">{endpoint.name}:</span>
                  <div className="flex items-center">
                    {React.createElement(getStatusIcon(endpoint.status === 'online'), {
                      className: `w-4 h-4 mr-2 ${getStatusColor(endpoint.status === 'online')}`
                    })}
                    <span className={`font-medium ${getStatusColor(endpoint.status === 'online')}`}>
                      {endpoint.status}
                    </span>
                    {endpoint.responseTime && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({endpoint.responseTime}ms)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Environment Variables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white rounded-lg border-2 border-gray-200"
          >
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 mr-3 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Environment Variables</h3>
            </div>
            
            <div className="space-y-3">
              {status.environment.variables.map((envVar, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">{envVar.name}:</span>
                  <div className="flex items-center">
                    {React.createElement(getStatusIcon(envVar.configured), {
                      className: `w-4 h-4 mr-2 ${getStatusColor(envVar.configured)}`
                    })}
                    <span className={`font-medium text-sm ${getStatusColor(envVar.configured)}`}>
                      {envVar.configured ? 'Set' : 'Missing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-white rounded-lg border-2 border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={async () => {
                const result = await testDatabaseConnection();
                alert(result.success 
                  ? `Database connection successful! Found ${result.tables?.length || 0} tables.`
                  : `Database connection failed: ${result.error}`
                );
              }}
              className="flex items-center justify-center"
            >
              <Database className="w-4 h-4 mr-2" />
              Test Database
            </Button>
            
            <Button
              variant="outline"
              onClick={async () => {
                const results = await testApiEndpoints();
                const successful = results.filter(r => r.success).length;
                const total = results.length;
                alert(`API Test Results: ${successful}/${total} endpoints working`);
              }}
              className="flex items-center justify-center"
            >
              <Activity className="w-4 h-4 mr-2" />
              Test APIs
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                window.open('/admin/logs', '_blank');
              }}
              className="flex items-center justify-center"
            >
              <Zap className="w-4 h-4 mr-2" />
              View Logs
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SystemStatusDashboard;