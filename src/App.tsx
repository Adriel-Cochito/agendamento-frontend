import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
// import { LGPDProvider } from '@/contexts/LGPDContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

function App() {
  const { messages } = useToast();
  
  return (
    <QueryClientProvider client={queryClient}>
      {/* <LGPDProvider> */}
        <RouterProvider router={router} />
        <ToastContainer messages={messages} />
      {/* </LGPDProvider> */}
    </QueryClientProvider>
  );
}

export default App;