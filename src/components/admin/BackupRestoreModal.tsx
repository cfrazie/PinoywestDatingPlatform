import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, AlertTriangle, CheckCircle, X, 
  Calendar, Database, HardDrive, Clock, 
  FileText, Shield, Info
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface BackupRestoreModalProps {
  onClose: () => void;
  onRestore: (backupId: string, options: any) => Promise<void>;
}

const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  onClose,
  onRestore
}) => {
  const [step, setStep] = useState<'select' | 'confirm' | 'progress' | 'complete'>('select');
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [restoreOptions, setRestoreOptions] = useState({
    pointInTime: false,
    timestamp: '',
    overwriteExisting: false,
    validateAfterRestore: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Sample backup data
  const backups = [
    { id: 'backup1', name: 'Daily Full Backup', type: 'full', date: '2025-07-04 00:00:00', size: '1.2 GB' },
    { id: 'backup2', name: 'Hourly Incremental Backup', type: 'incremental', date: '2025-07-04 12:00:00', size: '250 MB' },
    { id: 'backup3', name: 'Critical Data Backup', type: 'table', date: '2025-07-04 16:00:00', size: '120 MB' },
    { id: 'backup4', name: 'Manual Backup', type: 'full', date: '2025-07-03 18:30:00', size: '1.1 GB' }
  ];

  // Sample tables
  const tables = [
    { name: 'users', schema: 'auth', critical: true },
    { name: 'profiles', schema: 'public', critical: true },
    { name: 'messages', schema: 'public', critical: true },
    { name: 'chats', schema: 'public', critical: true },
    { name: 'subscriptions', schema: 'public', critical: true },
    { name: 'payment_methods', schema: 'public', critical: true },
    { name: 'invoices', schema: 'public', critical: true },
    { name: 'verification_reports', schema: 'public', critical: false },
    { name: 'call_records', schema: 'public', critical: false },
    { name: 'cultural_profiles', schema: 'public', critical: false }
  ];

  const handleSelectBackup = (backupId: string) => {
    setSelectedBackup(backupId);
  };

  const handleToggleTable = (tableName: string) => {
    if (selectedTables.includes(tableName)) {
      setSelectedTables(selectedTables.filter(t => t !== tableName));
    } else {
      setSelectedTables([...selectedTables, tableName]);
    }
  };

  const handleSelectAllTables = () => {
    setSelectedTables(tables.map(t => t.name));
  };

  const handleSelectCriticalTables = () => {
    setSelectedTables(tables.filter(t => t.critical).map(t => t.name));
  };

  const handleClearTableSelection = () => {
    setSelectedTables([]);
  };

  const handleOptionChange = (option: string, value: any) => {
    setRestoreOptions({
      ...restoreOptions,
      [option]: value
    });
  };

  const handleProceedToConfirm = () => {
    if (!selectedBackup) {
      setError('Please select a backup to restore from');
      return;
    }
    
    if (selectedTables.length === 0 && !restoreOptions.pointInTime) {
      setError('Please select at least one table to restore');
      return;
    }
    
    setError(null);
    setStep('confirm');
  };

  const handleStartRestore = async () => {
    setIsLoading(true);
    setError(null);
    setStep('progress');
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 500);
      
      // Simulate restore operation
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Simulate restore completion
      await onRestore(selectedBackup!, {
        tables: selectedTables,
        pointInTime: restoreOptions.pointInTime ? restoreOptions.timestamp : null,
        overwriteExisting: restoreOptions.overwriteExisting,
        validateAfterRestore: restoreOptions.validateAfterRestore
      });
      
      setStep('complete');
    } catch (err) {
      console.error('Error during restore:', err);
      setError('Failed to restore from backup. Please try again.');
      setStep('confirm');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Upload className="w-6 h-6 mr-3" />
              <h2 className="text-xl font-bold">Restore from Backup</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Steps */}
          <div className="flex items-center justify-between mt-6 text-sm">
            <div className={`flex flex-col items-center ${step === 'select' ? 'text-white' : 'text-blue-200'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'select' ? 'bg-white bg-opacity-20' : 'bg-blue-500 bg-opacity-20'
              }`}>
                1
              </div>
              <span className="mt-1">Select Backup</span>
            </div>
            
            <div className={`flex-1 h-0.5 mx-2 ${
              step === 'select' ? 'bg-blue-300 bg-opacity-30' : 'bg-white bg-opacity-20'
            }`}></div>
            
            <div className={`flex flex-col items-center ${
              step === 'confirm' ? 'text-white' : step === 'select' ? 'text-blue-200' : 'text-white'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'confirm' ? 'bg-white bg-opacity-20' : 
                step === 'select' ? 'bg-blue-500 bg-opacity-20' : 'bg-white bg-opacity-20'
              }`}>
                2
              </div>
              <span className="mt-1">Confirm</span>
            </div>
            
            <div className={`flex-1 h-0.5 mx-2 ${
              step === 'progress' || step === 'complete' ? 'bg-white bg-opacity-20' : 'bg-blue-300 bg-opacity-30'
            }`}></div>
            
            <div className={`flex flex-col items-center ${
              step === 'progress' || step === 'complete' ? 'text-white' : 'text-blue-200'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'progress' || step === 'complete' ? 'bg-white bg-opacity-20' : 'bg-blue-500 bg-opacity-20'
              }`}>
                3
              </div>
              <span className="mt-1">Restore</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Step 1: Select Backup */}
          {step === 'select' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Backup to Restore From</h3>
              
              <div className="space-y-4 mb-6">
                {backups.map(backup => (
                  <div 
                    key={backup.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedBackup === backup.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectBackup(backup.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{backup.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        backup.type === 'full' ? 'bg-green-100 text-green-800' :
                        backup.type === 'incremental' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {backup.type}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{backup.date}</span>
                      <span className="mx-2">•</span>
                      <HardDrive className="w-4 h-4 mr-1" />
                      <span>{backup.size}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Restore Options</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="point-in-time"
                        checked={restoreOptions.pointInTime}
                        onChange={(e) => handleOptionChange('pointInTime', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="point-in-time" className="ml-2 block text-sm text-gray-700">
                        Point-in-time recovery
                      </label>
                    </div>
                    
                    {restoreOptions.pointInTime && (
                      <div className="ml-6 mt-2">
                        <Input
                          type="datetime-local"
                          value={restoreOptions.timestamp}
                          onChange={(e) => handleOptionChange('timestamp', e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Select a specific point in time to restore to
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="overwrite-existing"
                      checked={restoreOptions.overwriteExisting}
                      onChange={(e) => handleOptionChange('overwriteExisting', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="overwrite-existing" className="ml-2 block text-sm text-gray-700">
                      Overwrite existing data
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="validate-after-restore"
                      checked={restoreOptions.validateAfterRestore}
                      onChange={(e) => handleOptionChange('validateAfterRestore', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="validate-after-restore" className="ml-2 block text-sm text-gray-700">
                      Validate data after restore
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Tables to Restore</h3>
                
                <div className="flex items-center space-x-3 mb-4">
                  <Button variant="outline" size="sm" onClick={handleSelectAllTables}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSelectCriticalTables}>
                    Critical Only
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearTableSelection}>
                    Clear
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {tables.map(table => (
                    <div key={table.name} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`table-${table.name}`}
                        checked={selectedTables.includes(table.name)}
                        onChange={() => handleToggleTable(table.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`table-${table.name}`} className="ml-2 block text-sm text-gray-700">
                        <span className="font-medium">{table.schema}.{table.name}</span>
                        {table.critical && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-red-100 text-red-800">
                            Critical
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Confirm */}
          {step === 'confirm' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Restore Operation</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Warning: Data Restoration</h4>
                    <p className="text-sm text-yellow-700">
                      This operation will restore data from a backup, potentially overwriting existing data.
                      Make sure you understand the implications before proceeding.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Backup Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Backup Name:</span>
                      <span className="ml-2 text-gray-900">
                        {backups.find(b => b.id === selectedBackup)?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Backup Type:</span>
                      <span className="ml-2 text-gray-900 capitalize">
                        {backups.find(b => b.id === selectedBackup)?.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Backup Date:</span>
                      <span className="ml-2 text-gray-900">
                        {backups.find(b => b.id === selectedBackup)?.date}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Backup Size:</span>
                      <span className="ml-2 text-gray-900">
                        {backups.find(b => b.id === selectedBackup)?.size}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Restore Options</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Point-in-time Recovery:</span>
                      <span className="ml-2 text-gray-900">
                        {restoreOptions.pointInTime ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {restoreOptions.pointInTime && (
                      <div>
                        <span className="text-gray-500">Timestamp:</span>
                        <span className="ml-2 text-gray-900">
                          {restoreOptions.timestamp}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Overwrite Existing:</span>
                      <span className="ml-2 text-gray-900">
                        {restoreOptions.overwriteExisting ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Validate After Restore:</span>
                      <span className="ml-2 text-gray-900">
                        {restoreOptions.validateAfterRestore ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Tables to Restore</h4>
                  {selectedTables.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {selectedTables.map(table => (
                          <div key={table} className="text-sm text-gray-900 flex items-center">
                            <Database className="w-3 h-3 text-gray-500 mr-1" />
                            {table}
                            {tables.find(t => t.name === table)?.critical && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-red-100 text-red-800">
                                Critical
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {restoreOptions.pointInTime ? 'All tables will be restored to the selected point in time' : 'No tables selected'}
                    </p>
                  )}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Restore Process</h4>
                      <p className="text-sm text-blue-700">
                        The application will be temporarily unavailable during the restore process.
                        Estimated downtime: {selectedTables.length > 5 ? '15-30 minutes' : '5-15 minutes'}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Progress */}
          {step === 'progress' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Restoring from Backup</h3>
              
              <div className="text-center py-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-12 h-12 text-blue-600" />
                </div>
                
                <h4 className="text-xl font-medium text-gray-900 mb-2">
                  Restore in Progress
                </h4>
                
                <p className="text-gray-600 mb-6">
                  Please do not close this window. The application may be temporarily unavailable.
                </p>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-500 mb-6">
                  {progress < 25 ? 'Preparing restore operation...' :
                   progress < 50 ? 'Restoring database structure...' :
                   progress < 75 ? 'Restoring table data...' :
                   progress < 100 ? 'Validating restored data...' :
                   'Restore complete!'}
                </p>
                
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Elapsed: 2m 15s</span>
                  </div>
                  <div className="flex items-center">
                    <Database className="w-4 h-4 mr-1" />
                    <span>Tables: {selectedTables.length}</span>
                  </div>
                  <div className="flex items-center">
                    <HardDrive className="w-4 h-4 mr-1" />
                    <span>Size: {backups.find(b => b.id === selectedBackup)?.size}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div>
              <div className="text-center py-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Restore Completed Successfully
                </h3>
                
                <p className="text-gray-600 mb-6">
                  The database has been successfully restored from the selected backup.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                  <h4 className="font-medium text-gray-900 mb-2">Restore Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Backup:</span>
                      <span className="text-gray-900">{backups.find(b => b.id === selectedBackup)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tables Restored:</span>
                      <span className="text-gray-900">{selectedTables.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Data Size:</span>
                      <span className="text-gray-900">{backups.find(b => b.id === selectedBackup)?.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="text-gray-900">3m 42s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Validation:</span>
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Passed
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">Next Steps</h4>
                      <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                        <li>Verify application functionality</li>
                        <li>Check for any missing data or inconsistencies</li>
                        <li>Review logs for any warnings or errors</li>
                        <li>Update documentation with restore details</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            {step === 'select' && (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProceedToConfirm}
                  disabled={!selectedBackup}
                >
                  Next: Confirm Details
                </Button>
              </>
            )}
            
            {step === 'confirm' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep('select')}
                >
                  Back
                </Button>
                <Button
                  onClick={handleStartRestore}
                  disabled={isLoading}
                >
                  Start Restore
                </Button>
              </>
            )}
            
            {step === 'progress' && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={progress < 100}
              >
                {progress < 100 ? 'Please wait...' : 'View Results'}
              </Button>
            )}
            
            {step === 'complete' && (
              <Button
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BackupRestoreModal;