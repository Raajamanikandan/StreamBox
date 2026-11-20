import React from 'react';
import { Check, Tv, Smartphone, Sparkles, ShieldCheck } from 'lucide-react';
import Button from './Button';

const PlanCard = ({ plan, isCurrentPlan, onSelect, isLoading = false }) => {
  const isRecommended = plan.recommended;

  return (
    <div
      className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-lg bg-bg-surface transition-all duration-200 border ${
        isRecommended
          ? 'border-blue-prime ring-1 ring-blue-prime shadow-xl scale-[1.02]'
          : isCurrentPlan
          ? 'border-blue-dodger ring-1 ring-blue-dodger'
          : 'border-text-muted/20 hover:border-text-muted/40'
      }`}
    >
      {/* Recommended "Best value" badge */}
      {isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-prime text-text-primary px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Best Value</span>
        </div>
      )}

      {/* Current plan indicator */}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4 bg-blue-dodger text-text-primary text-[11px] font-bold px-2.5 py-1 rounded">
          Active Plan
        </div>
      )}

      <div>
        {/* Plan Title & Description */}
        <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
        <p className="text-xs text-text-muted mt-1.5 min-h-[36px]">{plan.description}</p>

        {/* Pricing */}
        <div className="mt-6 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-text-primary tracking-tight">
            {plan.price}
          </span>
          <span className="text-sm font-medium text-text-muted">{plan.period}</span>
        </div>

        <div className="mt-2 text-xs font-semibold text-blue-prime">
          Duration: {plan.duration}
        </div>

        {/* Features divider */}
        <div className="my-6 border-t border-text-muted/20" />

        {/* Plan Specs */}
        <ul className="space-y-3.5 text-sm">
          <li className="flex items-center gap-3 text-text-primary">
            <div className="w-5 h-5 rounded-full bg-bg-base/70 flex items-center justify-center flex-shrink-0 text-blue-prime">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>
              <strong className="text-text-primary">Video Quality:</strong> {plan.quality}
            </span>
          </li>

          <li className="flex items-center gap-3 text-text-primary">
            <div className="w-5 h-5 rounded-full bg-bg-base/70 flex items-center justify-center flex-shrink-0 text-blue-prime">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>
              <strong className="text-text-primary">Screens:</strong> {plan.screens}
            </span>
          </li>

          <li className="flex items-center gap-3 text-text-primary">
            <div className="w-5 h-5 rounded-full bg-bg-base/70 flex items-center justify-center flex-shrink-0 text-blue-prime">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>
              <strong className="text-text-primary">Offline Downloads:</strong> {plan.downloads}
            </span>
          </li>

          <li className="flex items-center gap-3 text-text-muted">
            <div className="w-5 h-5 rounded-full bg-bg-base/70 flex items-center justify-center flex-shrink-0 text-blue-prime">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>Ad-free full catalog streaming</span>
          </li>
        </ul>
      </div>

      {/* Action CTA */}
      <div className="mt-8 pt-4">
        {isCurrentPlan ? (
          <Button
            variant="secondary"
            size="md"
            disabled
            className="w-full cursor-default"
          >
            Current Plan
          </Button>
        ) : (
          <Button
            variant={isRecommended ? 'primary' : 'secondary'}
            size="md"
            isLoading={isLoading}
            onClick={() => onSelect(plan)}
            className="w-full"
          >
            Choose Plan
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlanCard;
