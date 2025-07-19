import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, TrendingUp, Clock, Users, 
  RefreshCw, Download, Filter, Search,
  BarChart3, PieChart, Activity
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { errorLogger } from '../../lib/errorLogger';

interface ErrorStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byTimeRange: Array<{ time: string; count: number }>;
  topErrors: Array<{ message: string; count: number }>;
}

const ErrorDashboard: React.FC = () => {
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    byType: {},
    bySeverity: {},
    byTimeRange: [],
    topErrors: []
  });
  
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadErrorStats();
  }, [timeRange]);

  const loadErrorStats = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would fetch from your analytics API
      // For demo, we'll generate mock data
      const mockStats: ErrorStats = {
        total: 127,
        byType: {
          'NETWORK_ERROR': 45,
          'API_ERROR': 32,
          'VALIDATION_ERROR': 28,
          'TIMEOUT_ERROR': 15,
          'UNKNOWN_ERROR': 7
        },
        bySeverity: {
          'low': 58,
          'medium': 41,
          'high': 23,
          'critical': 5
        },
        byTimeRange: Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          count: Math.floor(Math.random() * 10)
        })),
        topErrors: [
          { message: 'Network connection failed', count: 23 },
          { message: 'API rate limit exceeded', count: 18 },
          { message: 'Invalid email format', count: 15 },
          { message: 'Request timeout', count: 12 },
          { message: 'Server error 500', count: 8 }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load error stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportErrorLogs = () => {
    // In a real app, this would export actual error logs
    const data = {
      exportTime: new Date().toISOString(),
      timeRange,
      stats,
      note: 'This is a demo export. In production, this would contain actual error logs.'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${timeRange}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Error Dashboard</h1>
          <p className="text-gray-600">Monitor and analyze application errors</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={loadErrorStats}
            loading={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            onClick={exportErrorLogs}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search errors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Errors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Critical Errors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.bySeverity.critical || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">245ms</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Affected Users</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Error Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Errors by Type</h3>
          </div>
          
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{type.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Error Severity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Errors by Severity</h3>
          </div>
          
          <div className="space-y-3">
            {Object.entries(stats.bySeverity).map(([severity, count]) => (
              <div key={severity} className="flex items-center justify-between">
                <span className={`text-sm px-2 py-1 rounded-full ${getSeverityColor(severity)}`}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        severity === 'critical' ? 'bg-red-500' :
                        severity === 'high' ? 'bg-orange-500' :
                        severity === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Errors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Most Common Errors</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.topErrors.map((error, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{error.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{error.count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {((error.count / stats.total) * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className={`w-4 h-4 mr-1 ${
                        index < 2 ? 'text-red-500' : 'text-green-500'
                      }`} />
                      <span className={`text-sm ${
                        index < 2 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {index < 2 ? 'Increasing' : 'Stable'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorDashboard;