import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, CheckCircle, AlertTriangle, Clock, 
  Search, Filter, RefreshCw, Download, Eye, 
  ChevronDown, ChevronUp, Calendar, User
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { 
  useProfileVerification,
  VerificationReport
} from '../../hooks/useProfileVerification';
import ProfileVerificationReport from './ProfileVerificationReport';

interface VerificationDashboardProps {
  userId: string;
}

const VerificationDashboard: React.FC<VerificationDashboardProps> = ({
  userId
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'others'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  
  const { 
    reports, 
    userStatus, 
    isLoading, 
    error,
    refreshReports
  } = useProfileVerification(userId);
  
  const filteredReports = reports.filter(report => {
    // Filter by tab
    if (activeTab === 'my' && report.targetUserId !== userId) return false;
    if (activeTab === 'others' && report.targetUserId === userId) return false;
    
    // Filter by status
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;
    
    // Filter by search query (would need additional user data in a real app)
    if (searchQuery && !report.id.includes(searchQuery)) return false;
    
    return true;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getResultColor = (result?: string) => {
    switch (result) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'suspicious':
        return 'text-yellow-600 bg-yellow-100';
      case 'unverifiable':
        return 'text-blue-600 bg-blue-100';
      case 'fake':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const getResultIcon = (result?: string) => {
    switch (result) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suspicious':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'unverifiable':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'fake':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setShowReport(true);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Dashboard</h1>
        <p className="text-gray-600">
          Manage profile verifications and view verification reports
        </p>
      </div>
      
      {/* User Verification Status */}
      {activeTab === 'my' && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Verification Status</h2>
          
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${
              userStatus?.status === 'verified' ? 'bg-green-100' :
              userStatus?.status === 'pending' ? 'bg-yellow-100' :
              userStatus?.status === 'rejected' ? 'bg-red-100' :
              'bg-gray-100'
            }`}>
              {userStatus?.status === 'verified' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : userStatus?.status === 'pending' ? (
                <Clock className="w-6 h-6 text-yellow-600" />
              ) : userStatus?.status === 'rejected' ? (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              ) : (
                <Shield className="w-6 h-6 text-gray-600" />
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">
                {userStatus?.status === 'verified' ? 'Verified Profile' :
                 userStatus?.status === 'pending' ? 'Verification Pending' :
                 userStatus?.status === 'rejected' ? 'Verification Failed' :
                 'Unverified Profile'}
              </h3>
              <p className="text-gray-600">
                {userStatus?.status === 'verified' 
                  ? `Verified on ${formatDate(userStatus.verifiedAt)} with ${userStatus.verificationScore.toFixed(0)}% score`
                  : userStatus?.status === 'pending'
                  ? 'Your verification is being processed'
                  : userStatus?.status === 'rejected'
                  ? 'Your profile verification was unsuccessful'
                  : 'Your profile has not been verified yet'}
              </p>
            </div>
            
            <div className="ml-auto">
              {!userStatus || userStatus.status === 'rejected' ? (
                <Button>
                  <Shield className="w-4 h-4 mr-2" />
                  Verify My Profile
                </Button>
              ) : userStatus.status === 'verified' ? (
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Verification
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  <Clock className="w-4 h-4 mr-2" />
                  Verification in Progress
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Verification
          </button>
          <button
            onClick={() => setActiveTab('others')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'others'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Verification Reports
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <Button
            variant="outline"
            onClick={refreshReports}
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'my' ? 'Requested By' : 'Target User'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Shield className="w-8 h-8 text-gray-300 mb-2" />
                      <p>No verification reports found</p>
                      {searchQuery || filterStatus !== 'all' ? (
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {activeTab === 'my' 
                              ? report.userId === userId ? 'You' : 'User ID: ' + report.userId.substring(0, 8)
                              : report.targetUserId === userId ? 'You' : 'User ID: ' + report.targetUserId.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(report.status)}`}>
                        <div className="flex items-center">
                          {getStatusIcon(report.status)}
                          <span className="ml-1 capitalize">{report.status}</span>
                        </div>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.verificationResult ? (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getResultColor(report.verificationResult)}`}>
                          <div className="flex items-center">
                            {getResultIcon(report.verificationResult)}
                            <span className="ml-1 capitalize">{report.verificationResult}</span>
                          </div>
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(report.createdAt).split(',')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReport(report.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Verification Report Modal */}
      {showReport && selectedReportId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ProfileVerificationReport
              reportId={selectedReportId}
              onClose={() => setShowReport(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationDashboard;