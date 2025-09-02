// src/components/dashboard/AlertCard.tsx
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AlertCardProps {
  title: string;
  count: number;
  color: 'yellow' | 'red' | 'blue';
  icon: LucideIcon;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const alertColorClasses = {
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  red: 'bg-red-50 border-red-200 text-red-800',
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function AlertCard({ title, count, color, icon: Icon, description, action }: AlertCardProps) {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-lg p-4 border ${alertColorClasses[color]}`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-lg font-bold mt-1">{count}</p>
          {description && (
            <p className="text-sm opacity-75 mt-1">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium hover:underline mt-2 block"
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}