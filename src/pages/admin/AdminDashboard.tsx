import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Shield, Clock, LogOut, Settings, 
  Search, Filter, Download, RefreshCw, AlertTriangle,
  User, ChevronDown, ChevronUp, Edit, Trash2, Eye
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import AdminUserModal from './components/AdminUserModal';
import { AdminUser, AdminSession, AdminActivityLog } from '../../types/admin';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'sessions'>('users');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  
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
        }
        
        // Load data based on active tab
        loadData();
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('admin_session_token');
        navigate('/admin/login');
      }
    };
    
    checkAuth();
  }, [navigate, activeTab]);
  
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      if (activeTab === 'users') {
        await loadAdminUsers();
      } else if (activeTab === 'activity') {
        await loadActivityLogs();
      } else if (activeTab === 'sessions') {
        await loadSessions();
      }
    } catch (err) {
      console.error('Data loading error:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadAdminUsers = async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    setAdminUsers(data || []);
  };
  
  const loadActivityLogs = async () => {
    const { data, error } = await supabase
      .from('admin_activity_logs')
      .select(`
        *,
        admin:admin_id(username, role)
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    setActivityLogs(data || []);
  };
  
  const loadSessions = async () => {
    const { data, error } = await supabase
      .from('admin_sessions')
      .select(`
        *,
        admin:admin_id(username, role)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    setSessions(data || []);
  };
  
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
  
  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setShowUserModal(true);
  };
  
  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowUserModal(true);
  };
  
  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowUserModal(true);
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this admin user?')) {
      return;
    }
    
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Reload users
      loadAdminUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Failed to delete user. Please try again.');
    }
  };
  
  const handleUserSaved = () => {
    setShowUserModal(false);
    loadAdminUsers();
  };
  
  const filteredUsers = adminUsers.filter(user => {
    // Filter by search query
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by role
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });
  
  const filteredLogs = activityLogs.filter(log => {
    return log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.admin?.username || '').toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const filteredSessions = sessions.filter(session => {
    return (session.admin?.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.ip_address.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'senior_admin':
        return 'bg-blue-100 text-blue-800';
      case 'standard_admin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const canManageUser = (user: AdminUser) => {
    if (!currentUser) return false;
    
    // Super admins can manage everyone
    if (currentUser.role === 'super_admin') return true;
    
    // Senior admins can manage standard admins
    if (currentUser.role === 'senior_admin' && user.role === 'standard_admin') return true;
    
    // Users can manage themselves
    if (currentUser.id === user.id) return true;
    
    return false;
  };
  
  const exportData = () => {
    let data: any[] = [];
    let filename = '';
    
    if (activeTab === 'users') {
      data = filteredUsers;
      filename = 'admin-users.json';
    } else if (activeTab === 'activity') {
      data = filteredLogs;
      filename = 'activity-logs.json';
    } else if (activeTab === 'sessions') {
      data = filteredSessions;
      filename = 'active-sessions.json';
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminHeader 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />
      
      <div className="flex flex-1">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'users' && 'Admin Users'}
                {activeTab === 'activity' && 'Activity Logs'}
                {activeTab === 'sessions' && 'Active Sessions'}
              </h1>
              
              <div className="flex items-center space-x-3">
                {activeTab === 'users' && (
                  <Button
                    onClick={handleCreateUser}
                    disabled={!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'senior_admin')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Add Admin
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={exportData}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                <Button
                  variant="outline"
                  onClick={loadData}
                  loading={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="w-4 h-4 text-gray-400" />}
                  />
                </div>
                
                {activeTab === 'users' && (
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="senior_admin">Senior Admin</option>
                      <option value="standard_admin">Standard Admin</option>
                    </select>
                  </div>
                )}
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
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Admin Users Tab */}
                  {activeTab === 'users' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Username
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Login
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                No admin users found
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {user.username}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Created {new Date(user.created_at).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                    {formatRole(user.role)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.is_active 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {user.last_login ? formatDate(user.last_login) : 'Never'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewUser(user)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    
                                    {canManageUser(user) && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditUser(user)}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        
                                        {/* Don't allow deleting yourself */}
                                        {currentUser?.id !== user.id && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.id)}
                                          >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                          </Button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Activity Logs Tab */}
                  {activeTab === 'activity' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Admin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Entity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              IP Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Timestamp
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                No activity logs found
                              </td>
                            </tr>
                          ) : (
                            filteredLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">
                                        {log.admin?.username || 'Unknown'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {log.admin?.role ? formatRole(log.admin.role) : ''}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {log.action}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {log.entity_type ? (
                                    <div>
                                      <div>{log.entity_type}</div>
                                      <div className="text-xs text-gray-400">{log.entity_id}</div>
                                    </div>
                                  ) : (
                                    'N/A'
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {log.ip_address || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(log.created_at)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Sessions Tab */}
                  {activeTab === 'sessions' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Admin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              IP Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Activity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Expires At
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredSessions.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                No active sessions found
                              </td>
                            </tr>
                          ) : (
                            filteredSessions.map((session) => (
                              <tr key={session.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">
                                        {session.admin?.username || 'Unknown'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {session.admin?.role ? formatRole(session.admin.role) : ''}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {session.ip_address || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(session.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(session.last_activity)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-500">
                                      {formatDate(session.expires_at)}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Admin User Modal */}
      {showUserModal && (
        <AdminUserModal
          mode={modalMode}
          user={selectedUser}
          currentUserRole={currentUser?.role || 'standard_admin'}
          onSave={handleUserSaved}
          onCancel={() => setShowUserModal(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;