import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { initSentry } from '@/lib/sentry';
import { AuthProvider, type AuthState } from '@/features/auth/auth';
import { createAppRouter } from '@/router';
import { LoadingState } from '@/components/state';
import '@/styles/globals.css';

initSentry();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Mutable auth holder shared into the router context; AuthProvider keeps it
// current and invalidates the router so guards re-run on session changes.
const authHolder: { state: AuthState } = {
  state: { session: null, status: 'loading', isAuthenticated: false },
};

const router = createAppRouter({ queryClient, auth: authHolder });

function App() {
  const [ready, setReady] = React.useState(false);

  const handleAuthChange = React.useCallback((state: AuthState) => {
    authHolder.state = state;
    if (state.status !== 'loading') setReady(true);
    void router.invalidate();
  }, []);

  return (
    <AuthProvider onChange={handleAuthChange}>
      {ready ? <RouterProvider router={router} /> : <LoadingState label="Starting…" />}
    </AuthProvider>
  );
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
