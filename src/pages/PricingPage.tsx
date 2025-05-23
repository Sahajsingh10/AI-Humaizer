import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import PaymentForm from './payment/PaymentForm';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  credits: number;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out our service',
    features: [
      { name: 'Up to 5,000 characters per text', included: true },
      { name: 'Basic humanization', included: true },
      { name: 'Save up to 5 projects', included: true },
      { name: 'Advanced humanization', included: false },
      { name: 'Priority processing', included: false },
      { name: 'API access', included: false },
    ],
    credits: 100,
  },
  {
    name: 'Basic',
    price: 9.99,
    description: 'Ideal for students and casual users',
    features: [
      { name: 'Up to 10,000 characters per text', included: true },
      { name: 'Advanced humanization', included: true },
      { name: 'Save up to 50 projects', included: true },
      { name: 'Priority processing', included: true },
      { name: 'API access', included: false },
      { name: 'Customization options', included: false },
    ],
    credits: 500,
    popular: true,
  },
  {
    name: 'Premium',
    price: 19.99,
    description: 'Best for professionals and content creators',
    features: [
      { name: 'Unlimited characters per text', included: true },
      { name: 'Advanced humanization', included: true },
      { name: 'Unlimited saved projects', included: true },
      { name: 'Priority processing', included: true },
      { name: 'API access', included: true },
      { name: 'Customization options', included: true },
    ],
    credits: 2000,
  },
];

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, set, get } = useAuthStore();

  const handleGetStarted = (plan: PricingPlan) => {
    if (plan.price === 0 && user) return;
    navigate(`/payment/${plan.name.toLowerCase()}`);
  };

  useEffect(() => {
    console.log('Dashboard user credits:', user?.credits);
  }, [user]);

  const login = async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // 1. Check if user exists
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !userProfile) {
        set({ error: 'Account not found. Please sign up.' });
        return;
      }

      // 2. Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ error: 'Incorrect password.' });
        return;
      }

      if (data.user) {
        await get().fetchUserProfile();
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      set({ error: 'An error occurred while signing in. Please try again.' });
    } finally {
      set({ loading: false });
    }
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-4 text-gray-900"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Choose the plan that works best for you. All plans include our core humanization technology.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card className={`h-full flex flex-col ${plan.popular ? 'border-2 border-indigo-500 relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
                    <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader>
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 ml-1">/month</span>
                  </div>
                  <p className="mt-2 text-gray-600">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="font-medium text-gray-900 mb-2">Includes:</p>
                  <p className="text-indigo-600 font-medium mb-4">{plan.credits} credits per month</p>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        {feature.included ? (
                          <Check size={20} className="text-green-500 flex-shrink-0 mr-2" />
                        ) : (
                          <X size={20} className="text-red-500 flex-shrink-0 mr-2" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-500'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="mt-auto">
                  <Button
                    fullWidth
                    variant={plan.popular ? 'primary' : 'outline'}
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                    onClick={() => handleGetStarted(plan)}
                    disabled={plan.price === 0 && !!user}
                  >
                    {plan.price === 0 ? 'Sign Up Free' : 'Get Started'}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What are credits?</h3>
              <p className="text-gray-600">
                Credits are used each time you humanize a text or store files/Projects. Five credit allows you to humanize up to 1,000 characters and each file storage takes up 25 credits. 
                Unused credits roll over to the next month, up to a maximum of 3x your monthly allowance.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. If you upgrade, you'll be charged the prorated difference 
                for the remainder of your billing cycle. If you downgrade, the new plan will take effect at the start 
                of your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a limit to how many texts I can humanize?</h3>
              <p className="text-gray-600">
                You can humanize as many texts as you have credits for. Once you've used all your credits, 
                you can purchase additional credits or wait until your next billing cycle when your credits reset.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the humanization?</h3>
              <p className="text-gray-600">
                Our humanization technology has been tested against all major AI detection tools and consistently 
                achieves a 95%+ success rate in making content appear human-written. However, results may vary 
                depending on the content and detection tools used.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;