import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PlanCard from '../components/PlanCard';
import Button from '../components/Button';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const PlansPage = () => {
  const navigate = useNavigate();
  const { subscription, subscribe, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      const data = await plansApi.getPlans();
      setPlans(data);
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/plans' } } });
      return;
    }

    setLoadingPlanId(plan.id);
    setSuccessMessage('');
    try {
      await subscribe(plan.id);
      setSuccessMessage(`Congratulations! Your ${plan.name} subscription is now active.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setLoadingPlanId(null);
    }
  };

  const activePlanId = subscription?.planId;
  const expiryFormatted = subscription?.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-surface border border-blue-prime/40 text-blue-prime text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Flexible Membership Plans
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Choose the plan that's right for you
          </h1>
          <p className="text-sm sm:text-base text-text-muted">
            Enjoy unlimited movies, series, and live streaming in Ultra HD with crystal-clear audio. Cancel anytime.
          </p>
        </div>

        {/* Success Alert Banner (semantic success: #3DDC97) */}
        {successMessage && (
          <div className="max-w-2xl mx-auto bg-bg-surface border border-success/40 rounded-lg p-4 flex items-center gap-3 text-success animate-fade-in shadow-lg">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{successMessage}</p>
              <p className="text-xs text-text-muted mt-0.5">
                All premium titles unlocked. You can start streaming right away.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/')}
            >
              Browse
            </Button>
          </div>
        )}

        {/* Active Subscription Banner if user already has a plan */}
        {subscription && subscription.status === 'active' && !successMessage && (
          <div className="max-w-3xl mx-auto bg-bg-surface border border-blue-prime/40 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-prime/20 text-blue-prime flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-medium">Currently Subscribed</span>
                <h3 className="text-lg font-bold text-text-primary">{subscription.planName} Plan</h3>
                {expiryFormatted && (
                  <p className="text-xs text-text-muted">
                    Renews on <span className="text-text-primary font-medium">{expiryFormatted}</span>
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              Manage in Account
            </Button>
          </div>
        )}

        {/* 3 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={activePlanId === plan.id}
              isLoading={loadingPlanId === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        {/* Guarantee Info */}
        <div className="text-center pt-8 border-t border-text-muted/20 text-xs text-text-muted max-w-xl mx-auto space-y-1">
          <p>
            HD and Ultra HD availability subject to your internet service and device capabilities.
          </p>
          <p>
            Terms apply. You can upgrade, downgrade, or cancel your membership online at any time from your account page.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PlansPage;
