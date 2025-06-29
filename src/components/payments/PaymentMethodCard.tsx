import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Trash2, Star, Check } from 'lucide-react';
import Button from '../ui/Button';
import { PaymentMethod } from '../../types/payments';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  isDefault: boolean;
  onSetDefault: () => void;
  onRemove: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  isDefault,
  onSetDefault,
  onRemove
}) => {
  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">VISA</span>
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">MC</span>
          </div>
        );
      case 'amex':
        return (
          <div className="w-8 h-5 bg-green-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">AMEX</span>
          </div>
        );
      default:
        return <CreditCard className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border-2 rounded-lg transition-all ${
        isDefault 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getCardIcon(paymentMethod.brand)}
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                •••• •••• •••• {paymentMethod.last4}
              </span>
              {isDefault && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Default</span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Expires {formatExpiryDate(paymentMethod.expMonth, paymentMethod.expYear)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSetDefault}
              className="text-blue-600 hover:text-blue-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Set Default
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentMethodCard;