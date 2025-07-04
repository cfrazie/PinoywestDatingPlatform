import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, Shield, Clock, Settings, 
  Save, RefreshCw, AlertTriangle, CheckCircle,
  Download, Upload, Calendar, HardDrive, FileText,
  Plus, Trash2, Edit, Eye, Play
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import BackupDashboard from '../../components/admin/BackupDashboard';
import { AdminUser } from '../../types/admin';

const AdminBackupSettings: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'configurations' | 'logs' | 'settings'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  // Check authentication and load data
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setError('Database connection not available');
        setIsLoading(false);
        return;
      }
      
      try {
        const token = localStorage.getItem('admin_session_token');
        if (!token) {
          navigate('/admin/login');
          return;
        }
        
        // Validate session
        const { data, error } = await supabase.rpc('validate_admin_session', {
          session_token: token
        });
        
        if (error) throw error;
        
        if (!data || data.length === 0 || !data[0].is_valid) {
          localStorage.removeItem('admin_session_token');
          navigate('/admin/login');
          return;
        }
        
        // Get current user details
        const { data: userData, error: userError } = await supabase.rpc('get_admin_user_details', {
          admin_id: data[0].admin_id
        });
        
        if (userError) throw userError;
        
        if (userData && userData.length > 0) {
          setCurrentUser(userData[0]);
          
          // Check if user has permission to access backup settings
          if (userData[0].role !== 'super_admin' && userData[0].role !== 'senior_admin') {
            navigate('/admin/dashboard');
            return;
          }
        }
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('admin_session_token');
        navigate('/admin/login');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      const token = localStorage.getItem('admin_session_token');
      if (token) {
        await supabase.rpc('end_admin_session', {
          session_token: token
        });
      }
      
      localStorage.removeItem('admin_session_token');
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if there's an error
      localStorage.removeItem('admin_session_token');
      navigate('/admin/login');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminHeader 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />
      
      <div className="flex flex-1">
        <AdminSidebar 
          activeTab="backup" 
          onTabChange={() => {}} 
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Backup & Recovery
              </h1>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('dashboard')}
                  className={activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('configurations')}
                  className={activeTab === 'configurations' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurations
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('logs')}
                  className={activeTab === 'logs' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Logs
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('settings')}
                  className={activeTab === 'settings' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </Button>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {/* Content */}
            {activeTab === 'dashboard' && <BackupDashboard />}
            
            {activeTab === 'configurations' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup Configurations</h2>
                <p className="text-gray-600 mb-6">
                  Manage your backup configurations, schedules, and retention policies.
                </p>
                
                <div className="flex justify-end mb-4">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Configuration
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retention</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">Daily Full Backup</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Full</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Every day at 00:00</td>
                        <td className="px-4 py-3 text-sm text-gray-500">30 days (min: 7)</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-green-700 bg-green-100">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">Hourly Incremental Backup</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Incremental</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Every hour</td>
                        <td className="px-4 py-3 text-sm text-gray-500">7 days (min: 24)</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-green-700 bg-green-100">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">Critical Data Backup</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Table</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Every 4 hours</td>
                        <td className="px-4 py-3 text-sm text-gray-500">14 days (min: 12)</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-green-700 bg-green-100">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'logs' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup Logs</h2>
                <p className="text-gray-600 mb-6">
                  View detailed logs of all backup operations.
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search logs..."
                      className="w-64"
                    />
                    <Button variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">All Types</option>
                      <option value="full">Full</option>
                      <option value="incremental">Incremental</option>
                      <option value="table">Table</option>
                      <option value="manual">Manual</option>
                    </select>
                    
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="pending">Pending</option>
                    </select>
                    
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Sample log entries */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">b1a2c3d4</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Full</td>
                        <td className="px-4 py-3 text-sm text-gray-500">2025-07-04 00:00:00</td>
                        <td className="px-4 py-3 text-sm text-gray-500">15m 32s</td>
                        <td className="px-4 py-3 text-sm text-gray-500">1.2 GB</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-green-700 bg-green-100">
                            Completed
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">e5f6g7h8</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Incremental</td>
                        <td className="px-4 py-3 text-sm text-gray-500">2025-07-04 12:00:00</td>
                        <td className="px-4 py-3 text-sm text-gray-500">3m 45s</td>
                        <td className="px-4 py-3 text-sm text-gray-500">250 MB</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-green-700 bg-green-100">
                            Completed
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">i9j0k1l2</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Table</td>
                        <td className="px-4 py-3 text-sm text-gray-500">2025-07-04 16:00:00</td>
                        <td className="px-4 py-3 text-sm text-gray-500">2m 12s</td>
                        <td className="px-4 py-3 text-sm text-gray-500">120 MB</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-green-700 bg-green-100">
                            Completed
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">m3n4o5p6</td>
                        <td className="px-4 py-3 text-sm text-gray-500">Manual</td>
                        <td className="px-4 py-3 text-sm text-gray-500">2025-07-04 18:30:00</td>
                        <td className="px-4 py-3 text-sm text-gray-500">N/A</td>
                        <td className="px-4 py-3 text-sm text-gray-500">N/A</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-blue-700 bg-blue-100">
                            In Progress
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing 4 of 120 logs
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup Security Settings</h2>
                <p className="text-gray-600 mb-6">
                  Configure security settings for your backup system.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                      <Shield className="w-5 h-5 text-blue-600 mr-2" />
                      Encryption Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Encryption Algorithm
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="aes-256-cbc">AES-256-CBC</option>
                          <option value="aes-256-gcm">AES-256-GCM</option>
                          <option value="chacha20-poly1305">ChaCha20-Poly1305</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Key Rotation Period
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="30">30 days</option>
                          <option value="60">60 days</option>
                          <option value="90">90 days</option>
                          <option value="180">180 days</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center">
                      <input
                        type="checkbox"
                        id="encrypt-all-backups"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="encrypt-all-backups" className="ml-2 block text-sm text-gray-700">
                        Encrypt all backups (recommended)
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                      <HardDrive className="w-5 h-5 text-blue-600 mr-2" />
                      Storage Security
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Backup Storage Location
                        </label>
                        <Input
                          type="text"
                          defaultValue="/backups/"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Access Control
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="restricted">Restricted (Super Admin Only)</option>
                          <option value="limited">Limited (Super & Senior Admins)</option>
                          <option value="standard">Standard (All Admins)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center">
                      <input
                        type="checkbox"
                        id="secure-delete"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="secure-delete" className="ml-2 block text-sm text-gray-700">
                        Use secure deletion for expired backups
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 text-blue-600 mr-2" />
                      Retention & Compliance
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Retention Period
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="7">7 days</option>
                          <option value="14">14 days</option>
                          <option value="30" selected>30 days</option>
                          <option value="60">60 days</option>
                          <option value="90">90 days</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Compliance Mode
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="standard">Standard</option>
                          <option value="gdpr">GDPR Compliant</option>
                          <option value="hipaa">HIPAA Compliant</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center">
                      <input
                        type="checkbox"
                        id="immutable-backups"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="immutable-backups" className="ml-2 block text-sm text-gray-700">
                        Enable immutable backups (cannot be modified or deleted until retention period expires)
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
                      Disaster Recovery
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recovery Time Objective (RTO)
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="1">1 hour</option>
                          <option value="4" selected>4 hours</option>
                          <option value="8">8 hours</option>
                          <option value="24">24 hours</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recovery Point Objective (RPO)
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="0.5">30 minutes</option>
                          <option value="1" selected>1 hour</option>
                          <option value="4">4 hours</option>
                          <option value="24">24 hours</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center">
                      <input
                        type="checkbox"
                        id="auto-recovery-test"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                      <label htmlFor="auto-recovery-test" className="ml-2 block text-sm text-gray-700">
                        Schedule automated recovery tests monthly
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                  <Button
                    variant="outline"
                    className="mr-3"
                  >
                    Reset to Defaults
                  </Button>
                  
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminBackupSettings;