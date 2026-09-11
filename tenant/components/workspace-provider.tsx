"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getWorkspace,
  saveWorkspace,
  getMe,
  logout,
  workspaceKey,
  type WorkspaceData,
  type AuthUser,
} from "@/tenant/lib/api";
import { CheckCircle2, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

type Context = {
  data: WorkspaceData;
  user: AuthUser | null;
  save: (data: WorkspaceData, message?: string) => Promise<void>;
  notify: (message: string) => void;
  signOut: () => Promise<void>;
  pending: boolean;
  slug: string;
};

const WorkspaceContext = createContext<Context | null>(null);

const EMPTY: WorkspaceData = {
  customers: [],
  services: [],
  staff: [],
  appointments: [],
  rewards: [],
  settings: {
    name: "",
    email: "",
    phone: null,
    address: null,
    currency: "USD",
    timezone: "UTC",
    confirmation: true,
    reminders: true,
    loyalty: false,
    pointsPerDollar: 0,
    plan: null,
  },
};

function DataProvider({ children }: { children: React.ReactNode }) {
  const client = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const notify = useCallback((text: string) => setMessage(text), []);

  // Auth check — redirect to /login if not authenticated
  const {
    data: user,
    isError: authError,
    isLoading: authLoading,
  } = useQuery({
    queryKey: ["tenant-session"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (
      pathname !== "/login" &&
      !authLoading &&
      (authError || (user && user.role !== "TENANT_ADMIN"))
    ) {
      router.replace("/login");
    }
  }, [pathname, authLoading, authError, user, router]);

  const slug = user?.tenantSlug ?? "";
  const { data: workspace = EMPTY } = useQuery({
    queryKey: workspaceKey(slug),
    queryFn: () => getWorkspace(slug),
    enabled: !!slug && user?.role === "TENANT_ADMIN",
    staleTime: 30 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: WorkspaceData) => saveWorkspace(slug, data),
    onSuccess: (updated) => client.setQueryData(workspaceKey(slug), updated),
  });

  async function save(updated: WorkspaceData, text = "Changes saved.") {
    await mutation.mutateAsync(updated);
    notify(text);
  }

  async function signOut() {
    await logout();
    client.clear();
    router.replace("/login");
  }

  return (
    <WorkspaceContext.Provider
      value={{
        data: workspace,
        user: user ?? null,
        save,
        notify,
        signOut,
        pending: mutation.isPending,
        slug,
      }}
    >
      {children}
      {message && (
        <output className="feedback" aria-live="polite">
          <CheckCircle2 size={17} />
          <span>{message}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setMessage("")}
          >
            <X size={15} />
          </button>
        </output>
      )}
    </WorkspaceContext.Provider>
  );
}

export default function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <DataProvider>{children}</DataProvider>
    </QueryClientProvider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("WorkspaceProvider is required");
  return context;
}
