import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  icon?: LucideIcon;
  error?: string;
  mask?: (value: string) => string;
  unmask?: (value: string) => string;
  onChange?: (value: string, rawValue: string) => void;
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, type, icon: Icon, error, mask, unmask, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      let rawValue = value;
      
      if (mask) {
        value = mask(value);
        rawValue = unmask ? unmask(value) : value;
      }
      
      e.target.value = value;
      
      if (onChange) {
        onChange(value, rawValue);
      }
    };
    
    return (
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            Icon && 'pl-10',
            error
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-gray-300 hover:border-gray-400',
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500 animate-slide-in">{error}</p>
        )}
      </div>
    );
  }
);
MaskedInput.displayName = 'MaskedInput';

export { MaskedInput };