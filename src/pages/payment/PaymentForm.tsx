import React, { useState } from 'react';
import { CreditCard, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent, CardHeader, CardFooter } from '../../components/ui/Card';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
}

interface PaymentFormProps {
  selectedPlan: PricingPlan;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ selectedPlan, onSuccess, onCancel }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 1200);
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="mb-6">
          Thank you for your payment. Your subscription has been updated to the {selectedPlan.name} plan.
        </p>
        <Button onClick={onSuccess}>Return</Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
        <p className="text-gray-600 text-sm mt-1">Plan: <span className="font-medium">{selectedPlan.name}</span> (${selectedPlan.price}/month, {selectedPlan.credits} credits)</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Card Number"
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
          />
          <Input
            label="Name on Card"
            id="cardName"
            placeholder="John Doe"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Expiry Date"
              id="expiryDate"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
            <Input
              label="CVC"
              id="cvc"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              required
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <p className="flex items-center">
              <CreditCard size={16} className="mr-1" />
              Your payment information is processed securely.
            </p>
          </div>
          <CardFooter className="px-0 pt-4 pb-0 flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              fullWidth
            >
              Pay ${selectedPlan.price.toFixed(2)} / month
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm; 