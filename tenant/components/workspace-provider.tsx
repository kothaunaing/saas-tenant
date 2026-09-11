'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkspace,
  saveWorkspace,
  getMe,
  logout,
  workspaceKey,
  type WorkspaceData,
  type AuthUser,
} from '@/tenant/lib/api';
import { CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Slug is the tenant the TENANT_ADMIN owns — resolved from their JWT tenantId.
// For now we derive it from the URL; the server enforces ownership.
const TENANT_SLUG = 'serenity';

type Context = {
  data: WorkspaceData;
  user: AuthUser | null;
  save: (data: WorkspaceData, message?: string) => Promise<void>;
  notify: (message: string) => void;
  signOut: () => Promise<void>;
  pending: boolean;
};

const WorkspaceContext = createContext<Context | null>(null);

const EMPTY: WorkspaceData = {
  customers: [], services: [], staff: [], appointments: [], rewards: [],
  settings: { name: '', email: '', phone: null, address: null, currency: 'USD', timezone: 'UTC', confirmation: true, reminders: true, loyalty: false, pointsPerDollar: 0, plan: null },
};

function DataProvider({ children }: { children: React.ReactNode }) {
  const client = useQueryClient();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const notify = useCallback((text: string) => setMessage(text), []);

  // Auth check — redirect to /login if not authenticated
  const { data: user, isError: authError, isLoading: authLoading } = useQuery({
    queryKey: ['tenant-session'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!authLoading && (authError || (user && user.role !== 'TENANT_ADMIN'))) {
      router.replace('/login');
    }
  }, [authLoading, authError, user, router]);

  const { data: workspace = EMPTY } = useQuery({
    queryKey: workspaceKey(TENANT_SLUG),
    queryFn: () => getWorkspace(TENANT_SLUG),
    enabled: !!user && user.role === 'TENANT_ADMIN',
    staleTime: 30 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: WorkspaceData) => saveWorkspace(TENANT_SLUG, data),
    onSuccess: (updated) => client.setQueryData(workspaceKey(TENANT_SLUG), updated),
  });

  async function save(updated: WorkspaceData, text = 'Changes saved.') {
    await mutation.mutateAsync(updated);
    notify(text);
  }

  async function signOut() {
    await logout();
    client.clear();
    router.replace('/login');
  }

  return (
    <WorkspaceContext.Provider
      value={{ data: workspace, user: user ?? null, save, notify, signOut, pending: mutation.isPending }}
    >
      {children}
      {message && (
        <output className="feedback" aria-live="polite">
          <CheckCircle2 size={17} />
          <span>{message}</span>
          <button aria-label="Dismiss notification" onClick={() => setMessage('')}>
            <X size={15} />
          </button>
        </output>
      )}
    </WorkspaceContext.Provider>
  );
}

export default function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <DataProvider>{children}</DataProvider>
    </QueryClientProvider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('WorkspaceProvider is required');
  return context;
}
