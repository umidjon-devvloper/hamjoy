'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FormErrorSummary } from '@/components/ui/FormErrorSummary';
import { useCreateJob } from '@/hooks/useCreateJob';
import { StepProgress } from './StepProgress';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2SalaryDescription } from './Step2SalaryDescription';
import { Step3ContactLocation } from './Step3ContactLocation';
import { Step4Preview } from './Step4Preview';

const stepVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

export function CreateJobWizard({ editJobId }: { editJobId?: string }) {
  const router = useRouter();
  const {
    form,
    errors,
    step,
    stepMeta,
    isSubmitting,
    isEditing,
    isLoading,
    updateField,
    updateFields,
    goNext,
    goBack,
    goToStep,
    submit,
  } = useCreateJob(editJobId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--color-muted)]">
        Yuklanmoqda…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black text-[var(--color-secondary)] sm:text-2xl">
                {isEditing ? 'Eʼlonni tahrirlash' : 'Ish eʼloni'}
              </h1>
              <p className="mt-1 text-sm font-medium text-[var(--color-muted)]">
                {stepMeta.current}-qadam / {stepMeta.total} · {stepMeta.label}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-[var(--color-muted)] transition-colors hover:bg-gray-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <StepProgress currentStep={step} onStepClick={goToStep} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 pb-44 sm:px-6 sm:py-7 sm:pb-48">
        <div className="mx-auto max-w-2xl">
          <div className="card rounded-[1.75rem] p-5 sm:p-7">
            <FormErrorSummary
              errors={errors}
              className="mb-5"
              title="Quyidagi maydonlarni tekshiring"
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                {step === 1 && (
                  <Step1BasicInfo form={form} errors={errors} onChange={updateField} />
                )}
                {step === 2 && (
                  <Step2SalaryDescription form={form} errors={errors} onChange={updateField} />
                )}
                {step === 3 && (
                  <Step3ContactLocation
                    form={form}
                    errors={errors}
                    onChange={updateField}
                    onChangeFields={updateFields}
                  />
                )}
                {step === 4 && <Step4Preview form={form} errors={errors} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--color-border)] bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-6">
        <div className="mx-auto flex max-w-2xl gap-3">
          {!stepMeta.isFirst ? (
            <Button variant="outline" className="flex-1" onClick={goBack} disabled={isSubmitting}>
              Orqaga
            </Button>
          ) : (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Bekor qilish
            </Button>
          )}

          {stepMeta.isLast ? (
            <Button
              variant="accent"
              className="flex-[2]"
              onClick={submit}
              isLoading={isSubmitting}
            >
              {isEditing ? 'Saqlash' : 'Eʼlonni joylash'}
            </Button>
          ) : (
            <Button variant="accent" className="flex-[2]" onClick={goNext}>
              Davom etish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
