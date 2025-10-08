import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Database, RefreshCw, Clock, HardDrive,
  AlertTriangle, CheckCircle, Download, Upload,
  Calendar, BarChart2, FileText, Settings, Play
} from 'lucide-react';
// import { motion } from 'framer-motion'; // unused → remove to avoid linter/build warnings
import Button from '../ui/Button';

import {
  getBackupHealthStatus,
  getBackupStorageUsage,
  getTablesNeedingBackup,
  getRecentBackupLogs,
  initiateManualBackup,
  formatBackupSize,
  formatBackupDuration, // keep if used elsewhere; not used here
  getBackupHealthStatusColor
} from '../../utils/backupUtils';

// ---------- Types ----------
type HealthStatus = {
  id: string;
  configuration_name: string;
  backup_type: 'full' | 'incremental' | string;
  last_backup_time?: string | null;
  last_backup_status?: 'completed' | 'failed' | 'in_progress' | 'pending';
  health_status: 'healthy' | 'warning' | 'error' | 'inactive' | string;
};

type StorageUsage = {
  backup_type: string;
  backup_count: number;
  total_size: number; // bytes
  oldest_backup_date: string;
  newest_backup_date: string;
  // Optional: quotaBytes if you have it
  quota_bytes?: number;
};

type BackupLog = {
  id: string;
  backup_type: string;
  status: 'completed' | 'failed' | 'in_progress' | 'pending';
  start_time: string;
  end_time?: string | null;
  file_size?: number | null;
  error_message?: string | null;
};

type TableNeed = {
  schema_name: string;
  table_name: string;
  priority: 1 | 2 | 3;
  last_backup_time?: string | null;
  backup_due: boolean;
};

// ---------- Helpers ----------
const safeDateTime = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const statusPillClass = (status: string) => {
  switch (status) {
    case 'completed': return 'text-green-700 bg-green-100';
    case 'failed': return 'text-red-700 bg-red-100';
    case 'in_progress': return 'text-blue-700 bg-blue-100';
    case 'pending': return 'text-yellow-700 bg-yellow-100';
    default: return 'text-gray-700 bg-gray-100';
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'failed': return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'in_progress': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
    default: return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

const fmt = (dt?: string | null) => {
  const d = safeDateTime(dt);
  return d ? d.toLocaleString() : 'Never';
};

// ---------- Component ----------
const BackupDashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([]);
  const [storageUsage, setStorageUsage] = useState<StorageUsage[]>([]);
  const [tablesNeedingBackup, setTablesNeedingBackup] = useState<TableNeed[]>([]);
  const [recentLogs, setRecentLogs] = useState<BackupLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUpdatedRef = useRef<Date | null>(null);

  const loadData = async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const [healthData, storageData, tablesData, logsData] = await Promise.all([
        getBackupHealthStatus(signal),
        getBackupStorageUsage(signal),
        getTablesNeedingBackup(signal),
        getRecentBackupLogs(5, signal),
      ]);

      if (signal?.aborted) return; // bail if the request was canceled

      setHealthStatus(Array.isArray(healthData) ? healthData : []);
      setStorageUsage(Array.isArray(storageData) ? storageData : []);
      setTablesNeedingBackup(Array.isArray(tablesData) ? tablesData : []);
      setRecentLogs(Array.isArray(logsData) ? logsData : []);

      // If any log is actively running, reflect that
      const running = Array.isArray(logsData) && logsData.some(l => l.status === 'in_progress');
      setIsBackupInProgress(prev => prev || running);

      lastUpdatedRef.current = new Date();
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Error loading backup data:', err);
      setError('Failed to load backup data. Please try again.');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualBackup = async (configId: string) => {
    try {
      setIsBackupInProgress(true);
      await initiateManualBackup(configId);
      const controller = new AbortController();
      await loadData(controller.signal);
    } catch (err) {
      console.error('Error initiating backup:', err);
      setError('Failed to initiate backup. Please try again.');
    } finally {
      setIsBackupInProgress(false);
    }
  };

  const lastUpdated = useMemo(
    () => (lastUpdatedRef.current ? lastUpdatedRef.current.toLocaleString() : new Date().toLocaleString()),
    [isLoading]
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Backup & Recovery Dashboard</h1>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              const controller = new AbortController();
              loadData(controller.signal);
            }}
            // If your Button supports a loading prop, adjust here:
            // loading={isLoading}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isLoading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center text-red-700">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Backup Health + Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Health */}
        <div className="bg-white rounded-lg shadow-md p-6 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Backup Health Status</h2>
            <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : healthStatus.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Configuration</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Backup</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {healthStatus.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{config.configuration_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 capitalize">{config.backup_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{fmt(config.last_backup_time)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusPillClass(config.last_backup_status || 'pending')}`}>
                          {config.last_backup_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`flex items-center ${getBackupHealthStatusColor(config.health_status)}`}>
                          {config.health_status === 'healthy' && <CheckCircle className="w-4 h-4 mr-1" />}
                          {(config.health_status === 'warning' || config.health_status === 'error') && <AlertTriangle className="w-4 h-4 mr-1" />}
                          {config.health_status === 'inactive' && <Clock className="w-4 h-4 mr-1" />}
                          <span className="capitalize">{config.health_status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManualBackup(config.id)}
                          disabled={isBackupInProgress || config.health_status === 'inactive'}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Run Now
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No backup configurations found</p>
            </div>
          )}
        </div>

        {/* Storage */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup Storage Usage</h2>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : storageUsage.length > 0 ? (
            <div className="space-y-4">
              {storageUsage.map((usage) => {
                const quota = usage.quota_bytes ?? (5 * 1073741824); // default 5 GiB if you don’t have a quota
                const pct = Math.max(0, Math.min(100, (usage.total_size / quota) * 100));
                return (
                  <div key={usage.backup_type} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 capitalize">{usage.backup_type} Backups</h3>
                      <span className="text-sm text-gray-500">{usage.backup_count} backups</span>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Storage Used</span>
                        <span className="font-medium">{formatBackupSize(usage.total_size)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>Oldest: {safeDateTime(usage.oldest_backup_date)?.toLocaleDateString() ?? '—'}</span>
                      <span>Newest: {safeDateTime(usage.newest_backup_date)?.toLocaleDateString() ?? '—'}</span>
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Storage Used</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatBackupSize(storageUsage.reduce((sum, u) => sum + (u?.total_size ?? 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <HardDrive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No storage usage data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Logs + Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Backup Activity</h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : recentLogs.length > 0 ? (
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mr-3">{statusIcon(log.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 capitalize">{log.backup_type} Backup</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusPillClass(log.status)}`}>{log.status}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Started: {fmt(log.start_time)}</div>
                    {log.end_time && <div className="text-sm text-gray-600 mb-1">Completed: {fmt(log.end_time)}</div>}
                    {log.file_size ? <div className="text-sm text-gray-600">Size: {formatBackupSize(log.file_size)}</div> : null}
                    {log.error_message ? <div className="mt-2 text-sm text-red-600">Error: {log.error_message}</div> : null}
                  </div>
                </div>
              ))}
              <div className="text-center mt-4">
                <Button variant="outline" size="sm">View All Logs</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No backup logs available</p>
            </div>
          )}
        </div>

        {/* Tables needing backup */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Critical Data Status</h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : tablesNeedingBackup.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Backup</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tablesNeedingBackup.map((t) => {
                      const key = `${t.schema_name}.${t.table_name}`;
                      return (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="flex items-center">
                              <Database className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{key}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {t.priority === 1 ? (
                              <span className="text-red-600 font-medium">High</span>
                            ) : t.priority === 2 ? (
                              <span className="text-yellow-600">Medium</span>
                            ) : (
                              <span className="text-blue-600">Low</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{fmt(t.last_backup_time)}</td>
                          <td className="px-4 py-3 text-sm">
                            {t.backup_due ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-red-700 bg-red-100">
                                Backup Due
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-green-700 bg-green-100">
                                Up to Date
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {tablesNeedingBackup.filter((t) => t.backup_due).length} tables need backup
                  </span>
                  <Button variant="outline" size="sm">
                    <Database className="w-4 h-4 mr-1" />
                    Backup Critical Data
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500">All critical data is backed up</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup & Recovery Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="flex items-center justify-center" disabled={isBackupInProgress}>
            <Download className="w-4 h-4 mr-2" />
            Full Backup Now
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <Upload className="w-4 h-4 mr-2" />
            Restore from Backup
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Backup
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <BarChart2 className="w-4 h-4 mr-2" />
            Backup Reports
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <Settings className="w-4 h-4 mr-2" />
            Backup Settings
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Disaster Recovery Test
          </Button>
        </div>
      </div>

      {/* Strategy */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Backup Strategy Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Daily Full Backups
            </h3>
            <p className="text-sm text-blue-100">
              Complete database backup every day at midnight, retained for 30 days with minimum 7 copies.
            </p>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Hourly Incremental Backups
            </h3>
            <p className="text-sm text-blue-100">
              Changes-only backups every hour, retained for 7 days to enable point-in-time recovery.
            </p>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center">
              <HardDrive className="w-5 h-5 mr-2" />
              Critical Data Protection
            </h3>
            <p className="text-sm text-blue-100">
              High-priority tables backed up every 4 hours with encryption and 14-day retention.
            </p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Button variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
            View Backup Documentation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BackupDashboard;
