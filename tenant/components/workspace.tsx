'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  Users,
  Scissors,
  UserRoundCog,
  Gift,
  ChartNoAxesCombined,
  Settings,
  CreditCard,
  ArrowUpRight,
  Bell,
  ChevronDown,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { useWorkspace } from './workspace-provider';
import EditorSheet, { type Editor } from './editors';
import {
  Overview,
  Customers,
  StaffPage,
  ServicesPage,
  AppointmentsPage,
  CalendarPage,
  AnalyticsPage,
  LoyaltyPage,
  BillingPage,
  SettingsPage,
} from './tenant-pages';
const navigation = [
  {
    label: 'Operations',
    items: [
      ['Overview', LayoutDashboard],
      ['Calendar', CalendarDays],
      ['Appointments', CalendarCheck],
      ['Customers', Users],
    ],
  },
  {
    label: 'Configuration',
    items: [
      ['Services', Scissors],
      ['Staff', UserRoundCog],
      ['Loyalty', Gift],
    ],
  },
  {
    label: 'Business',
    items: [
      ['Analytics', ChartNoAxesCombined],
      ['Billing', CreditCard],
      ['Settings', Settings],
    ],
  },
] as const;
const pagePath = (name: string) =>
  name === 'Overview' ? '/' : `/${name.toLowerCase()}`;
function Navigation({ page }: { page: string }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarContent className="px-3">
      {navigation.map((group) => (
        <div key={group.label} className="mb-5">
          <div className="nav-label">{group.label}</div>
          {group.items.map(([name, Icon]) => (
            <Link
              href={pagePath(name)}
              aria-current={page === name ? 'page' : undefined}
              key={name}
              onClick={() => setOpenMobile(false)}
              className={`nav-link ${page === name ? 'active' : ''}`}
            >
              <Icon size={16} />
              {name}
            </Link>
          ))}
        </div>
      ))}
    </SidebarContent>
  );
}
export default function Workspace({
  initialPage = 'Overview',
}: {
  initialPage?: string;
}) {
  const { data, user, signOut } = useWorkspace();
  const router = useRouter();
  const [editor, setEditor] = useState<Editor | null>(null);
  const go = (page: string) => router.push(pagePath(page));
  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  useEffect(() => {
    type ModelContext = {
      registerTool: (
        tool: {
          name: string;
          description: string;
          inputSchema: object;
          annotations: object;
          execute: (input: unknown) => unknown;
        },
        options: { signal: AbortSignal },
      ) => void | Promise<void>;
    };
    const context = (document as Document & { modelContext?: ModelContext })
      .modelContext;
    if (!context) return;
    const controller = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'start_appointment_creation',
            description:
              'Open the appointment form in this demo workspace. This does not create an appointment.',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false },
            execute(input) {
              if (
                typeof input !== 'object' ||
                input === null ||
                Object.keys(input).length
              )
                throw new Error('Expected an empty object.');
              setEditor({ type: 'appointment' });
              return { form: 'appointment', status: 'opened' };
            },
          },
          { signal: controller.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => controller.abort();
  }, []);
  const props = { edit: setEditor, go };
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '220px' } as React.CSSProperties}
    >
      <Sidebar>
        <Link href="/" className="brand">
          <div className="brand-mark">
            <Sparkles size={19} />
          </div>
          <div>
            <strong>{data.settings.name}</strong>
            <small>Admin workspace</small>
          </div>
        </Link>
        <Navigation page={initialPage} />
        <SidebarFooter>
          <div className="plan-mini">
            <div className="inline">
              <Sparkles size={14} className="pink" />
              <strong className="text-xs">
                {data.settings.plan ?? 'Free plan'}
              </strong>
            </div>
            <p>More possibilities for your salon.</p>
            <button className="btn full small" onClick={() => go('Billing')}>
              Explore plans
              <ArrowUpRight size={13} />
            </button>
          </div>
          <button
            className="person p-3 text-left"
            onClick={() => go('Settings')}
          >
            <span className="avatar rose">
              {user ? initials(user.name) : '?'}
            </span>
            <div>
              <strong>{user?.name ?? '—'}</strong>
              <small>{user?.role === 'TENANT_ADMIN' ? 'Salon admin' : user?.role ?? ''}</small>
            </div>
            <ChevronDown size={12} className="ml-auto muted" />
          </button>
          <button
            className="btn full small"
            style={{ marginTop: 4 }}
            onClick={signOut}
          >
            Sign out
          </button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="topbar">
          <div className="topbar-left">
            <SidebarTrigger />
            <div className="topbar-title">
              {initialPage}
              <small>{data.settings.name}</small>
            </div>
          </div>
          <div className="topbar-right">
            <Popover>
              <PopoverTrigger
                aria-label="Notifications"
                className="icon-btn border-0"
              >
                <Bell size={16} className="muted" />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <h3>All caught up</h3>
                <p className="subtitle">
                  Booking updates and reminders will appear here when
                  notifications are connected.
                </p>
              </PopoverContent>
            </Popover>
            <span className="avatar">
              {user ? initials(user.name) : '?'}
            </span>
            <span>{user?.name ?? '—'}</span>
          </div>
        </header>
        <main className="page">
          {initialPage === 'Overview' && <Overview {...props} />}{' '}
          {initialPage === 'Customers' && <Customers {...props} />}{' '}
          {initialPage === 'Staff' && <StaffPage {...props} />}{' '}
          {initialPage === 'Services' && <ServicesPage {...props} />}{' '}
          {initialPage === 'Appointments' && <AppointmentsPage {...props} />}{' '}
          {initialPage === 'Calendar' && <CalendarPage {...props} />}{' '}
          {initialPage === 'Analytics' && <AnalyticsPage />}{' '}
          {initialPage === 'Loyalty' && <LoyaltyPage {...props} />}{' '}
          {initialPage === 'Billing' && <BillingPage />}{' '}
          {initialPage === 'Settings' && <SettingsPage />}
        </main>
      </SidebarInset>
      {editor && (
        <EditorSheet editor={editor} onClose={() => setEditor(null)} />
      )}
    </SidebarProvider>
  );
}
