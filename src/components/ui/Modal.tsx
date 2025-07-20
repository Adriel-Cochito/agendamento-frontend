import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  maxHeight?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  maxHeight = true
}: ModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Responsive size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Mobile-first responsive classes
  const responsiveClasses = {
    sm: 'w-full max-w-sm mx-4',
    md: 'w-full max-w-md mx-4',
    lg: 'w-full max-w-md mx-4 sm:max-w-lg md:max-w-2xl',
    xl: 'w-full max-w-lg mx-4 sm:max-w-2xl md:max-w-4xl',
    full: 'w-full max-w-full mx-2 sm:mx-4',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                'bg-white rounded-xl shadow-2xl border border-gray-200',
                responsiveClasses[size],
                maxHeight && 'max-h-[90vh]',
                'my-4 relative flex flex-col'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - apenas se tiver título ou showCloseButton */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                  {title && (
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-4">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 -mr-2"
                      aria-label="Fechar modal"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              )}
              
              {/* Content */}
              <div className={cn(
                'flex-1',
                maxHeight && 'overflow-y-auto',
                // Se não tem header, adiciona padding superior
                !(title || showCloseButton) && 'pt-4 sm:pt-6'
              )}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Modal variants para casos específicos
export function BottomSheetModal({ 
  isOpen, 
  onClose, 
  children, 
  title 
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[85vh] md:hidden"
          >
            {/* Handle bar */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {title && (
              <div className="px-4 pb-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              </div>
            )}
            
            <div className="overflow-y-auto max-h-[calc(85vh-4rem)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Full screen modal para mobile
export function FullScreenModal({ 
  isOpen, 
  onClose, 
  children, 
  title 
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 bg-white z-50 flex flex-col sm:hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {title || 'Modal'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}