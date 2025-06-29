import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Eye, RefreshCw, AlertCircle, CheckCircle, 
  Clock, Calendar, DollarSign, Filter
} from 'lucide-react';
import Button from '../ui/Button';
import { Invoice } from '../../types/payments';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  onDownload: (invoiceId: string) => void;
  onRetryPayment: (invoiceId: string) => void;
}

const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({
  invoices,
  onDownload,
  onRetryPayment
}) => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-700 bg-green-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'failed':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const filteredInvoices = invoices
    .filter(invoice => filter === 'all' || invoice.status === filter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Invoice History</h2>
        
        <div className="flex items-center space-x-4">
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Your invoice history will appear here'
              : `No ${filter} invoices found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <div className="font-medium text-gray-900">
                        Invoice #{invoice.number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.description}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatAmount(invoice.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(invoice.date)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {invoice.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRetryPayment(invoice.id)}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(invoice.url, '_blank')}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(invoice.id)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {invoice.status === 'failed' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">
                      Payment failed: {invoice.failureReason || 'Card was declined'}
                    </span>
                  </div>
                </div>
              )}

              {invoice.status === 'pending' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-700">
                      Payment is being processed. This may take a few minutes.
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredInvoices.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredInvoices.filter(i => i.status === 'paid').length}
              </div>
              <div className="text-sm text-gray-600">Paid Invoices</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatAmount(
                  filteredInvoices
                    .filter(i => i.status === 'paid')
                    .reduce((sum, i) => sum + i.amount, 0)
                )}
              </div>
              <div className="text-sm text-gray-600">Total Paid</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {filteredInvoices.filter(i => i.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Payments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceHistory;