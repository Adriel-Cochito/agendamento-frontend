import { create } from 'zustand';
import { ToastMessage, ToastType } from '@/components/ui/Toast';

interface ToastStore {
  messages: ToastMessage[];
  addToast: (type: ToastType, title: string, description?: string) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToast = create<ToastStore>((set) => ({
  messages: [],
  
  addToast: (type, title, description) => {
    const id = Date.now().toString();
    set((state) => ({
      messages: [...state.messages, { id, type, title, description }],
    }));
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== id),
      }));
    }, 5000);
  },
  
  removeToast: (id) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    }));
  },
  
  clearToasts: () => {
    set({ messages: [] });
  },
}));