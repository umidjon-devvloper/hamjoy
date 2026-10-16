'use client';

import type { CreateJobStep } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const STEPS: { id: CreateJobStep; label: string }[] = [
  { id: 1, label: 'Asosiy' },
  { id: 2, label: 'Tafsilot' },
  { id: 3, label: 'Joylashuv' },
  { id: 4, label: 'E\'lon' },
];

interface StepProgressProps {
  currentStep: CreateJobStep;
  onStepClick?: (step: CreateJobStep) => void;
}

export function StepProgress({ currentStep, onStepClick }: StepProgressProps) {
  return (
    <nav aria-label="Create job progress" className="w-full">
      <ol className="flex items-start justify-between gap-1 sm:gap-2">
        {STEPS.map((step, index) => {
          const isComplete = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = Boolean(onStepClick) && step.id <= currentStep;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step.id)}
                className={cn(
                  'group flex w-full min-w-0 flex-col items-center gap-1.5',
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
                    isComplete &&
                      'border-[var(--color-success)] bg-[var(--color-success)] text-white',
                    isCurrent &&
                      'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md shadow-blue-500/20',
                    !isComplete &&
                      !isCurrent &&
                      'border-[var(--color-border)] bg-white text-[var(--color-muted)]'
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <span
                  className={cn(
                    'w-full truncate text-center text-[10px] font-semibold sm:text-xs',
                    isCurrent ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'
                  )}
                >
                  {step.label}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mt-4 h-0.5 min-w-[10px] flex-1 rounded-full',
                    step.id < currentStep ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
