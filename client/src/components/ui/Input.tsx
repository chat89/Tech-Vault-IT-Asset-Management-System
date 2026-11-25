import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:  string;
  error?:  string;
  icon?:   React.ReactNode;
  wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, wrapperClassName, className, id, ...rest }) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_');
  return (
    <div className={clsx('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full rounded-xl border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500',
            error ? 'border-red-500/70' : 'border-slate-700 hover:border-slate-600',
            icon && 'pl-10',
            className
          )}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className, id, ...rest }) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_');
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>}
      <textarea
        id={inputId}
        rows={3}
        className={clsx(
          'w-full rounded-xl border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none',
          'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500',
          error ? 'border-red-500/70' : 'border-slate-700 hover:border-slate-600',
          className
        )}
        {...rest}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, placeholder, className, id, ...rest }) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_');
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>}
      <select
        id={inputId}
        className={clsx(
          'w-full rounded-xl border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100',
          'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500',
          error ? 'border-red-500/70' : 'border-slate-700 hover:border-slate-600',
          className
        )}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

