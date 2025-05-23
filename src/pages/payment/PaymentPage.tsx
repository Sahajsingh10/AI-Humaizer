import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentForm from './PaymentForm';

const plans = [
  { id: 'free', name: 'Free', price: 0, credits: 100 },
  { id: 'basic', name: 'Basic', price: 9.99, credits: 500 },
  { id: 'premium', name: 'Premium', price: 19.99, credits: 2000 },
];

const PaymentPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const selectedPlan = plans.find((p) => p.id === planId);

  if (!selectedPlan) {
    return (
      <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Plan Not Found</h2>
          <p className="mb-4">The selected plan does not exist. Please go back and choose a valid plan.</p>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => navigate('/pricing')}
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto">
        <PaymentForm
          selectedPlan={selectedPlan}
          onSuccess={() => navigate('/dashboard')}
          onCancel={() => navigate('/pricing')}
        />
      </div>
    </div>
  );
};

export default PaymentPage;