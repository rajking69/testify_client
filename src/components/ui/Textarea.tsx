import React, { TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      className = "",
      id,
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
          >
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          required={required}
          className={`w-full rounded-xl border bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white px-3.5 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            errorMessage
              ? "border-rose-300 dark:border-rose-800 focus:ring-rose-500"
              : "border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-blue-500/20"
          } ${className}`}
          {...props}
        />

        {errorMessage ? (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
            {errorMessage}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
