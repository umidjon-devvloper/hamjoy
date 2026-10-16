import React from 'react';
import { cn } from '@/lib/utils';
import { fieldClassName, fieldErrorClassName, labelClassName, errorMessageClassName } from '@/lib/form-styles';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  wrapperClassName?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, wrapperClassName, id, error, hint, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={wrapperClassName}>
        {label && (
          <label htmlFor={textareaId} className={labelClassName}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          className={cn(fieldClassName, 'resize-none', error && fieldErrorClassName, className)}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className={errorMessageClassName} role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${textareaId}-hint`} className="mt-1.5 text-xs text-[var(--color-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
