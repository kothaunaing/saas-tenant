'use client';
import { useState } from 'react';
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ArrowDownUp,
  Mail,
  Phone,
  Gift,
  DollarSign,
  CalendarCheck,
  Clock3,
  Users,
  Download,
  Scissors,
  Leaf,
  Check,
  Sparkles,
  Wallet,
  Pencil,
  CheckCircle2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useWorkspace } from './workspace-provider';
import {
  Person,
  Badge,
  PageHead,
  Stat,
  SearchBox,
  Choice,
  Empty,
  Field,
  RevenueChart,
  exportCsv,
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from './tenant-ui';
import {
  money,
  initials,
  duration,
} from '@/tenant/lib/demo-data';
import type { Appointment, Customer } from '@/tenant/lib/api';
import { minutes } from '@/tenant/lib/booking';
import type { Editor } from './editors';
type Props = { edit: (editor: Editor) => void; go: (page: string) => void };
const shortDate = (date: string) =>
  new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
export function AppointmentTable({
  rows,
  edit,
}: {
  rows: Appointment[];
  edit: Props['edit'];
}) {
  const { data } = useWorkspace();
  return rows.length ? (
    <Table className="data-table">
      <TableHeader>
        <TableRow>
          {['Customer', 'Service', 'Staff', 'When', 'Status', ''].map(
            (v, i) => (
              <TableHead key={i}>{v}</TableHead>
            ),
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((a) => {
          const c = data.customers.find((c) => c.id === a.customerId),
            s = data.services.find((s) => s.id === a.serviceId);
          return (
            <TableRow key={a.id}>
              <TableCell>
                <Person name={c?.name ?? 'Unknown customer'} email={c?.email} />
              </TableCell>
              <TableCell>
                <strong className="font-medium text-[#484850]">
                  {s?.name}
                </strong>
                <div className="text-[10px] muted mt-1">
                  {duration(s?.duration ?? 0)}
                </div>
              </TableCell>
              <TableCell>
                {data.staff.find((s) => s.id === a.staffId)?.name}
              </TableCell>
              <TableCell>
                <span className="text-[#46464e]">{a.time}</span>
                <div className="text-[10px] muted mt-1">
                  {shortDate(a.date)}
                </div>
              </TableCell>
              <TableCell>
                <Badge status={a.status} />
              </TableCell>
              <TableCell>
                <button
                  className="icon-btn border-0"
                  aria-label={`Edit appointment for ${c?.name}`}
                  onClick={() => edit({ type: 'appointment', record: a })}
                >
                  <ChevronRight size={15} />
                </button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  ) : (
    <Empty
      title="No appointments here"
      description="Choose another date or create a new appointment."
    />
  );
}
export function Overview({ edit, go }: Props) {
  const { data } = useWorkspace();
  const today = data.appointments.filter((a) => a.date === new Date().toISOString().slice(0, 10));
  const completed = today.filter((a) => a.status === 'Completed');
  const revenue = completed.reduce(
    (sum, a) =>
      sum + (data.services.find((s) => s.id === a.serviceId)?.price ?? 0),
    0,
  );
  return (
    <>
      <PageHead
        title="Good morning, May ✧"
        eyebrow="Your salon, at a glance"
        subtitle="A little care. A lovely day. Here’s what’s happening at Serenity."
      >
        <button
          className="btn primary"
          onClick={() => edit({ type: 'appointment' })}
        >
          <Plus size={15} />
          New appointment
        </button>
      </PageHead>
      <div className="stats">
        <Stat
          label="Today’s revenue"
          value={money(revenue)}
          foot="from completed visits"
          icon={DollarSign}
        />
        <Stat
          label="Appointments"
          value={today.length}
          change={`${completed.length} completed`}
          foot={`${today.length - completed.length} remaining`}
          icon={CalendarCheck}
        />
        <Stat
          label="Customers"
          value={data.customers.length}
          foot="people who chose your care"
          icon={Users}
        />
        <Stat
          label="Team on duty"
          value={
            data.staff.filter((s) => s.active && s.hours[5].enabled).length
          }
          foot="available team members"
          icon={Clock3}
        />
      </div>
      <div className="two-col">
        <div className="card card-pad">
          <div className="card-head">
            <div>
              <h2>Revenue performance</h2>
              <p className="subtitle">A little more growth, every week.</p>
            </div>
            <span className="badge">Last 7 days · sample</span>
          </div>
          <RevenueChart />
        </div>
        <div className="card card-pad">
          <div className="card-head">
            <h2>Today at Serenity</h2>
            <Leaf size={17} className="pink" />
          </div>
          <p className="subtitle">Friday, August 7, 2026</p>
          {['Confirmed', 'In progress', 'Completed'].map((name) => (
            <div className="list-row" key={name}>
              <span className="text-xs">{name}</span>
              <Badge
                status={`${today.filter((a) => a.status === name).length} appointments`}
              />
            </div>
          ))}
          <div className="health-note">
            <Sparkles size={17} className="pink" />
            <div>
              <h3>You’re in good hands</h3>
              <p>Your team is here to make today a great one.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-head px-5 pt-5">
          <div>
            <h2>Today’s appointments</h2>
            <p className="subtitle">Your next moments of care.</p>
          </div>
          <button className="text-link" onClick={() => go('Appointments')}>
            View all
            <ArrowRight size={13} />
          </button>
        </div>
        <AppointmentTable
          rows={[...today]
            .sort((a, b) => a.time.localeCompare(b.time))
            .slice(0, 5)}
          edit={edit}
        />
        <div className="table-footer">
          <span>{today.length} appointments today</span>
          <span>All times in Asia/Yangon</span>
        </div>
      </div>
      <p className="bottom-note">Made for moments of care.</p>
    </>
  );
}
export function Customers({ edit }: Props) {
  const { data } = useWorkspace();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [sort, setSort] = useState<keyof Customer>('name');
  const [ascending, setAscending] = useState(true);
  const customer = data.customers.find((c) => c.id === selected);
  const rows = data.customers
    .filter((c) =>
      (c.name + c.email + c.phone).toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const x = a[sort],
        y = b[sort];
      return (
        (typeof x === 'number' && typeof y === 'number'
          ? x - y
          : String(x).localeCompare(String(y))) * (ascending ? 1 : -1)
      );
    });
  function order(key: keyof Customer) {
    if (sort === key) setAscending(!ascending);
    else {
      setSort(key);
      setAscending(true);
    }
  }
  if (customer)
    return (
      <>
        <button className="btn ghost pl-0" onClick={() => setSelected(null)}>
          <ArrowLeft size={15} />
          All customers
        </button>
        <div className="detail-profile">
          <span className="avatar">{initials(customer.name)}</span>
          <div className="flex-1">
            <h2>{customer.name}</h2>
            <p>
              <span className="inline">
                <Mail size={13} />
                {customer.email}
              </span>
              <span className="inline">
                <Phone size={13} />
                {customer.phone || 'No phone added'}
              </span>
            </p>
            <small className="muted block mt-2 text-[11px]">
              {customer.visits ? 'Customer since June 2025' : 'New customer'}
            </small>
          </div>
          <button
            className="btn"
            onClick={() => edit({ type: 'customer', record: customer })}
          >
            <Pencil size={13} />
            Edit
          </button>
        </div>
        <div className="stats">
          <Stat label="Total visits" value={customer.visits} />
          <Stat
            label="No-show rate"
            value={<Badge status={`${customer.noShow}%`} />}
          />
          <Stat
            label="Loyalty points"
            value={
              <span className="inline">
                <Gift size={18} className="pink" />
                {customer.points.toLocaleString()}
              </span>
            }
          />
          <Stat label="Lifetime spend" value={money(customer.spent)} />
        </div>
        <div className="card card-pad notes">
          <div className="card-head">
            <div>
              <h2>Notes</h2>
              <p className="subtitle">Visible to staff only.</p>
            </div>
            <button
              className="text-link"
              onClick={() => edit({ type: 'customer', record: customer })}
            >
              Edit notes
            </button>
          </div>
          <p>
            {customer.notes ||
              'No notes yet. Add a preference or something helpful for your team.'}
          </p>
        </div>
        <div className="two-col">
          <div className="card">
            <div className="card-head px-5 pt-5">
              <h2>Booking history</h2>
              <span className="badge">{customer.visits} past visits</span>
            </div>
            {customer.id === 'c1' ? (
              <Table className="data-table">
                <TableHeader>
                  <TableRow>
                    {['Service', 'With', 'When', 'Price', 'Status'].map((v) => (
                      <TableHead key={v}>{v}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ['Hydrating Facial', 'Hnin Wai', 'Jul 29, 2026', '55'],
                    ['Anti-Ageing Facial', 'Hnin Wai', 'Jun 27, 2026', '85'],
                    ['Body Scrub & Wrap', 'Hnin Wai', 'May 21, 2026', '70'],
                    ['Hydrating Facial', 'Hnin Wai', 'Apr 9, 2026', '55'],
                    [
                      'Signature Cut & Style',
                      'Nandar Aye',
                      'Feb 28, 2026',
                      '45',
                    ],
                  ].map(([name, staff, date, price], i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <span className="text-[#33333b] font-medium">
                          {name}
                        </span>
                        <div className="muted text-[10px] mt-1">1 hr</div>
                      </TableCell>
                      <TableCell>{staff}</TableCell>
                      <TableCell>{date}</TableCell>
                      <TableCell>{money(Number(price))}</TableCell>
                      <TableCell>
                        <Badge status="Completed" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <AppointmentTable
                rows={data.appointments.filter(
                  (a) => a.customerId === customer.id,
                )}
                edit={edit}
              />
            )}
          </div>
          <div className="card card-pad">
            <div className="card-head">
              <h2>Reviews</h2>
              {customer.id === 'c1' && (
                <span className="inline">
                  <span className="stars">★★★★★</span>
                  <small className="muted">5.0</small>
                </span>
              )}
            </div>
            {customer.id === 'c1' ? (
              <>
                {[
                  [
                    'Hydrating Facial',
                    'Jul 30, 2026',
                    'Hnin Wai is wonderful — my skin has never looked better.',
                  ],
                  ['Anti-Ageing Facial', 'Jun 28, 2026', ''],
                ].map(([name, date, text]) => (
                  <div className="review" key={name}>
                    <div className="flex justify-between">
                      <span className="stars">★★★★★</span>
                      <small>{date}</small>
                    </div>
                    <small>{name}</small>
                    {text && <p>{text}</p>}
                  </div>
                ))}
              </>
            ) : (
              <Empty
                title="No reviews yet"
                description="Customer feedback will appear here."
              />
            )}
          </div>
        </div>
        <p className="export-note">Last visit: {customer.last}</p>
      </>
    );
  return (
    <>
      <PageHead
        title="Customers"
        subtitle="Everyone who’s booked with you. Open a customer for their full history."
      >
        <button
          className="btn primary"
          onClick={() => edit({ type: 'customer' })}
        >
          <Plus size={15} />
          Add customer
        </button>
      </PageHead>
      <div className="toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email or phone…"
        />
        <span className="muted text-xs">
          {rows.length} of {data.customers.length} customers
        </span>
      </div>
      <div className="card">
        {rows.length ? (
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                {(
                  [
                    ['Customer', 'name'],
                    ['Visits', 'visits'],
                    ['No-show', 'noShow'],
                    ['Points', 'points'],
                    ['Lifetime', 'spent'],
                    ['Last visit', 'last'],
                  ] as const
                ).map(([label, key]) => (
                  <TableHead
                    key={key}
                    aria-sort={
                      sort === key
                        ? ascending
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <button className="sort-button" onClick={() => order(key)}>
                      {label}
                      <ArrowDownUp size={12} />
                    </button>
                  </TableHead>
                ))}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <button
                      className="text-left"
                      onClick={() => setSelected(c.id)}
                    >
                      <Person name={c.name} email={c.email} />
                    </button>
                  </TableCell>
                  <TableCell>{c.visits}</TableCell>
                  <TableCell>
                    <span className={`badge ${c.noShow ? 'orange' : ''}`}>
                      {c.noShow}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline">
                      <Gift size={13} />
                      {c.points.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-[#414149]">
                    {money(c.spent)}
                  </TableCell>
                  <TableCell>{c.last}</TableCell>
                  <TableCell>
                    <button
                      aria-label={`View ${c.name}`}
                      className="icon-btn border-0"
                      onClick={() => setSelected(c.id)}
                    >
                      <ChevronRight size={15} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty />
        )}
        <div className="table-footer">
          <span>Your relationships, all in one place.</span>
          <button
            className="text-link"
            onClick={() =>
              exportCsv(
                'serenity-customers.csv',
                [
                  'Name',
                  'Email',
                  'Phone',
                  'Visits',
                  'Points',
                  'Lifetime spend',
                ],
                rows.map((c) => [
                  c.name,
                  c.email,
                  c.phone,
                  c.visits,
                  c.points,
                  c.spent,
                ]),
              )
            }
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>
    </>
  );
}
export function StaffPage({ edit }: Props) {
  const { data } = useWorkspace();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All members');
  const rows = data.staff.filter(
    (s) =>
      (s.name + s.email).toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'All members' || s.active === (filter === 'Active')),
  );
  return (
    <>
      <PageHead
        title="Staff"
        subtitle="Manage your team, what they can do, and when they work."
      >
        <button className="btn primary" onClick={() => edit({ type: 'staff' })}>
          <Plus size={15} />
          Add member
        </button>
      </PageHead>
      <div className="toolbar">
        <SearchBox value={search} onChange={setSearch} />
        <div className="inline">
          <span className="muted text-xs">{rows.length} members</span>
          <Choice
            value={filter}
            onChange={setFilter}
            options={['All members', 'Active', 'Inactive']}
            label="Staff status"
          />
        </div>
      </div>
      <div className="card">
        {rows.length ? (
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                {[
                  'Name',
                  'Role',
                  'Services',
                  'Working hours',
                  'Status',
                  '',
                ].map((v, i) => (
                  <TableHead key={i}>{v}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <button
                      className="text-left"
                      onClick={() => edit({ type: 'staff', record: s })}
                    >
                      <Person name={s.name} email={s.email} />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge status={s.role} />
                  </TableCell>
                  <TableCell>{s.services.length} services</TableCell>
                  <TableCell>
                    {s.hours.filter((h) => h.enabled).length} days per week
                  </TableCell>
                  <TableCell>
                    <Badge status={s.active ? 'Active' : 'Inactive'} />
                  </TableCell>
                  <TableCell>
                    <button
                      className="icon-btn border-0"
                      aria-label={`Edit ${s.name}`}
                      onClick={() => edit({ type: 'staff', record: s })}
                    >
                      <ChevronRight size={15} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty />
        )}
        <div className="table-footer">
          <span>
            {data.staff.filter((s) => s.active).length} active members
          </span>
          <span>Great care starts with a great team.</span>
        </div>
      </div>
      <div className="health-note max-w-2xl mt-6">
        <Clock3 size={18} className="pink" />
        <div>
          <h3>A schedule that works for everyone</h3>
          <p>
            Open a team member to assign services, set working hours, and add
            breaks. Their availability is reflected in appointment scheduling.
          </p>
        </div>
      </div>
    </>
  );
}
export function ServicesPage({ edit }: Props) {
  const { data } = useWorkspace();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All services');
  const rows = data.services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'All services' || s.category === category),
  );
  return (
    <>
      <PageHead
        title="Services"
        subtitle="Thoughtful treatments. Clear pricing. Your menu of care."
      >
        <button
          className="btn primary"
          onClick={() => edit({ type: 'service' })}
        >
          <Plus size={15} />
          Add service
        </button>
      </PageHead>
      <div className="toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search services…"
        />
        <Choice
          label="Service category"
          value={category}
          onChange={setCategory}
          options={[
            'All services',
            'Facial',
            'Hair',
            'Body',
            'Massage',
            'Nails',
          ]}
        />
      </div>
      <div className="service-grid">
        {rows.map((s) => (
          <div className="card service-card" key={s.id}>
            <div className="flex justify-between items-center">
              <span className="service-icon">
                {s.category === 'Hair' ? (
                  <Scissors size={19} />
                ) : (
                  <Leaf size={19} />
                )}
              </span>
              <span className={`badge ${s.active ? '' : 'red'}`}>
                {s.active ? s.category : 'Inactive'}
              </span>
            </div>
            <h2>{s.name}</h2>
            <p>{s.description}</p>
            <div className="inline muted text-xs mt-4">
              <Clock3 size={13} />
              {duration(s.duration)}
              <span>·</span>
              <Users size={13} />
              {
                data.staff.filter((t) => t.services.includes(s.id) && t.active)
                  .length
              }{' '}
              staff
            </div>
            <div className="service-bottom">
              <strong>{money(s.price)}</strong>
              <button
                className="btn small"
                onClick={() => edit({ type: 'service', record: s })}
              >
                Edit service
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {!rows.length && <Empty />}
    </>
  );
}
export function AppointmentsPage({ edit }: Props) {
  const { data } = useWorkspace();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [date, setDate] = useState('');
  const rows = data.appointments
    .filter((a) => {
      const c = data.customers.find((c) => c.id === a.customerId);
      const s = data.services.find((s) => s.id === a.serviceId);
      return (
        ((c?.name ?? '') + (s?.name ?? ''))
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (status === 'All statuses' || a.status === status) &&
        (!date || a.date === date)
      );
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <>
      <PageHead
        title="Appointments"
        subtitle="Every visit, from the first hello to the next appointment."
      >
        <button
          className="btn primary"
          onClick={() => edit({ type: 'appointment' })}
        >
          <Plus size={15} />
          New appointment
        </button>
      </PageHead>
      <div className="toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search customers or services…"
        />
        <div className="inline flex-wrap">
          <input
            type="date"
            aria-label="Filter appointments by date"
            className="native-select w-auto!"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {date && (
            <button className="text-link" onClick={() => setDate('')}>
              Clear
            </button>
          )}
          <Choice
            value={status}
            onChange={setStatus}
            options={[
              'All statuses',
              'Pending',
              'Confirmed',
              'In progress',
              'Completed',
              'Cancelled',
              'No-show',
            ]}
            label="Filter status"
          />
        </div>
      </div>
      <div className="card">
        <AppointmentTable rows={rows} edit={edit} />
        <div className="table-footer">
          <span>{rows.length} appointments</span>
          <button
            className="text-link"
            onClick={() =>
              exportCsv(
                'serenity-appointments.csv',
                ['Customer', 'Service', 'Staff', 'Date', 'Time', 'Status'],
                rows.map((a) => [
                  data.customers.find((c) => c.id === a.customerId)?.name ?? '',
                  data.services.find((s) => s.id === a.serviceId)?.name ?? '',
                  data.staff.find((s) => s.id === a.staffId)?.name ?? '',
                  a.date,
                  a.time,
                  a.status,
                ]),
              )
            }
          >
            <Download size={12} />
            Export appointments
          </button>
        </div>
      </div>
    </>
  );
}
export function CalendarPage({ edit }: Props) {
  const { data } = useWorkspace();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [member, setMember] = useState('all');
  const team = data.staff.filter(
    (s) => s.active && (member === 'all' || s.id === member),
  );
  const shift = (days: number) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    );
  };
  return (
    <>
      <PageHead
        title="Calendar"
        subtitle="A little space for every appointment. Plan your team’s day."
      >
        <button
          className="btn primary"
          onClick={() => edit({ type: 'appointment' })}
        >
          <Plus size={15} />
          New appointment
        </button>
      </PageHead>
      <div className="toolbar">
        <div className="inline">
          <button className="btn" onClick={() => setDate(new Date().toISOString().slice(0, 10))}>
            Demo today
          </button>
          <button
            className="icon-btn"
            aria-label="Previous day"
            onClick={() => shift(-1)}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            className="icon-btn"
            aria-label="Next day"
            onClick={() => shift(1)}
          >
            <ChevronRight size={15} />
          </button>
          <input
            className="native-select"
            type="date"
            aria-label="Calendar date"
            value={date}
            onChange={(e) => {
              if (e.target.value) setDate(e.target.value);
            }}
          />
        </div>
        <Choice
          value={member}
          onChange={setMember}
          options={[
            { value: 'all', label: 'All team members' },
            ...data.staff
              .filter((s) => s.active)
              .map((s) => ({ value: s.id, label: s.name })),
          ]}
          label="Calendar team member"
        />
      </div>
      <div className="card calendar">
        <div
          className="calendar-grid"
          style={{
            gridTemplateColumns: `65px repeat(${team.length},minmax(150px,1fr))`,
            minWidth: team.length > 2 ? 820 : 400,
          }}
        >
          <div className="cal-header text-[10px]! muted">GMT+6:30</div>
          {team.map((s) => (
            <div className="cal-header" key={s.id}>
              <span className="avatar">{initials(s.name)}</span>
              <strong className="font-medium">{s.name}</strong>
            </div>
          ))}
          <div>
            {Array.from({ length: 9 }, (_, i) => (
              <div className="cal-time" key={i}>
                {i + 9}:00
              </div>
            ))}
          </div>
          {team.map((s, i) => (
            <div className="cal-column" key={s.id}>
              {!s.hours[new Date(date + 'T12:00:00').getDay()].enabled && (
                <div className="absolute inset-0 bg-gray-50/80 flex justify-center pt-6 muted">
                  Day off
                </div>
              )}
              {data.appointments
                .filter(
                  (a) =>
                    a.staffId === s.id &&
                    a.date === date &&
                    a.status !== 'Cancelled',
                )
                .map((a) => {
                  const service = data.services.find(
                    (s) => s.id === a.serviceId,
                  );
                  const customer = data.customers.find(
                    (c) => c.id === a.customerId,
                  );
                  return (
                    <button
                      className={`cal-event ${['', 'blue', 'green'][i % 3]}`}
                      key={a.id}
                      style={{
                        top: ((minutes(a.time) - 540) / 60) * 100,
                        height: ((service?.duration ?? 60) / 60) * 100 - 5,
                      }}
                      onClick={() => edit({ type: 'appointment', record: a })}
                    >
                      <span>
                        {a.time} · {duration(service?.duration ?? 60)}
                      </span>
                      <strong>{customer?.name}</strong>
                      <span>{service?.name}</span>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
      <div className="table-footer border-0">
        <span>
          {data.appointments.filter((a) => a.date === date).length} appointments
          · {shortDate(date)}
        </span>
        <span>Click an appointment to edit its details.</span>
      </div>
    </>
  );
}
export function AnalyticsPage() {
  const [period, setPeriod] = useState('30');
  const summaries: Record<
    string,
    {
      revenue: number;
      appointments: number;
      ticket: number;
      utilization: number;
      completed: number;
      cancelled: number;
      noShow: number;
      trend: string;
    }
  > = {
    '7': {
      revenue: 2415,
      appointments: 42,
      ticket: 63.55,
      utilization: 76,
      completed: 38,
      cancelled: 3,
      noShow: 1,
      trend: '8%',
    },
    '30': {
      revenue: 10040,
      appointments: 184,
      ticket: 61.6,
      utilization: 73,
      completed: 163,
      cancelled: 14,
      noShow: 7,
      trend: '13%',
    },
    '90': {
      revenue: 28450,
      appointments: 526,
      ticket: 61.31,
      utilization: 71,
      completed: 464,
      cancelled: 42,
      noShow: 20,
      trend: '17%',
    },
  };
  const summary = summaries[period];
  return (
    <>
      <PageHead
        title="Analytics"
        eyebrow="Business intelligence"
        subtitle="Monitor revenue, booking quality, and team performance in one place."
      >
        <Tabs value={period} onValueChange={(v) => setPeriod(String(v))}>
          <TabsList className="bg-white border p-1 h-9!">
            {['7', '30', '90'].map((v) => (
              <TabsTrigger className="text-xs px-3" value={v} key={v}>
                {v} days
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </PageHead>
      <div className="stats">
        <Stat
          label="Net revenue"
          value={money(summary.revenue)}
          change={summary.trend}
          foot="vs. previous period"
          icon={DollarSign}
        />
        <Stat
          label="Appointments"
          value={summary.appointments}
          change="9%"
          foot={`${summary.completed} completed`}
          icon={CalendarCheck}
        />
        <Stat
          label="Average ticket"
          value={money(summary.ticket)}
          change="3%"
          foot="per completed visit"
          icon={Wallet}
        />
        <Stat
          label="Staff utilization"
          value={`${summary.utilization}%`}
          change="4%"
          foot="of bookable hours"
          icon={Clock3}
        />
      </div>
      <div className="two-col">
        <div className="card card-pad">
          <div className="card-head">
            <div>
              <h2>Revenue performance</h2>
              <p className="subtitle">
                Daily net revenue after discounts and refunds
              </p>
            </div>
            <span className="badge">Last {period} days</span>
          </div>
          <RevenueChart period={Number(period)} />
        </div>
        <div className="card card-pad">
          <h2>Appointment health</h2>
          <p className="subtitle">How booked visits resolved this period</p>
          {[
            ['Completed', summary.completed, '#399775'],
            ['Cancelled', summary.cancelled, '#c59636'],
            ['No-show', summary.noShow, '#df737d'],
          ].map(([label, count, color]) => (
            <div className="health-item" key={String(label)}>
              <div className="health-label">
                <strong>{label}</strong>
                <span>
                  {count}{' '}
                  <span className="muted">
                    · {Math.round((Number(count) / summary.appointments) * 100)}
                    %
                  </span>
                </span>
              </div>
              <Progress
                aria-label={String(label)}
                value={(Number(count) / summary.appointments) * 100}
                style={{ '--primary': color } as React.CSSProperties}
              />
            </div>
          ))}
          <div className="health-note">
            <Sparkles size={18} className="pink" />
            <div>
              <h3>Healthy completion rate</h3>
              <p>Most bookings turned into a moment of care.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="two-col">
        <div className="card card-pad">
          <div className="card-head">
            <div>
              <h2>Most-loved services</h2>
              <p className="subtitle">
                The treatments your customers come back for
              </p>
            </div>
            <Scissors size={17} className="muted" />
          </div>
          {[
            ['Hydrating Facial', 34],
            ['Signature Cut & Style', 28],
            ['Aromatherapy Massage', 22],
            ['Gel Manicure', 16],
          ].map(([name, percent], i) => (
            <div className="list-row" key={name}>
              <span className="avatar text-[11px]">0{i + 1}</span>
              <div className="flex-1">
                <h3 className="text-xs!">{name}</h3>
                <Progress
                  className="mt-3"
                  aria-label={`${name} share of visits`}
                  value={Number(percent) * 2}
                />
              </div>
              <span className="muted text-xs">{percent}%</span>
            </div>
          ))}
        </div>
        <div className="card card-pad">
          <div className="card-head">
            <h2>Team utilization</h2>
            <Users size={17} className="muted" />
          </div>
          {[
            ['Hnin Wai', 86],
            ['Nandar Aye', 78],
            ['May Zin', 71],
            ['Su Latt', 64],
          ].map(([name, value]) => (
            <div className="list-row" key={name}>
              <Person name={String(name)} />
              <span className="badge green">
                {Number(value) + (Number(period) === 7 ? 2 : 0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="toolbar">
        <span className="export-note">
          Illustrative demo report · separate from appointments edited in this
          session.
        </span>
        <button
          className="btn"
          onClick={() =>
            exportCsv(
              `serenity-analytics-${period}-days.csv`,
              [
                'Period',
                'Net revenue',
                'Appointments',
                'Average ticket',
                'Utilization',
              ],
              [
                [
                  `${period} days`,
                  summary.revenue,
                  summary.appointments,
                  summary.ticket,
                  `${summary.utilization}%`,
                ],
              ],
            )
          }
        >
          <Download size={13} />
          Export report
        </button>
      </div>
    </>
  );
}
export function LoyaltyPage({ edit }: Props) {
  const { data, save } = useWorkspace();
  const [rate, setRate] = useState(data.settings.pointsPerDollar);
  return (
    <>
      <PageHead
        title="Loyalty & rewards"
        eyebrow="A little thank you"
        subtitle="Turn lovely visits into lasting relationships."
      >
        <button
          className="btn primary"
          onClick={() => edit({ type: 'reward' })}
        >
          <Plus size={15} />
          Create reward
        </button>
      </PageHead>
      <div className="stats">
        <Stat label="Members" value={data.customers.length} icon={Users} />
        <Stat
          label="Points in circulation"
          value={data.customers
            .reduce((s, c) => s + c.points, 0)
            .toLocaleString()}
          icon={Gift}
        />
        <Stat
          label="Active rewards"
          value={data.rewards.filter((r) => r.active).length}
          icon={Sparkles}
        />
        <Stat
          label="Points per $1"
          value={data.settings.pointsPerDollar}
          icon={DollarSign}
        />
      </div>
      <div className="card card-pad mb-6">
        <div className="card-head">
          <div>
            <h2>Your loyalty program</h2>
            <p className="subtitle">
              Reward your customers with every completed visit.
            </p>
          </div>
          <Switch
            aria-label="Enable loyalty program"
            checked={data.settings.loyalty}
            onCheckedChange={(loyalty) =>
              void save({ ...data, settings: { ...data.settings, loyalty } })
            }
          />
        </div>
        <form
          className="inline flex-wrap"
          onSubmit={(e) => {
            e.preventDefault();
            void save({
              ...data,
              settings: { ...data.settings, pointsPerDollar: rate },
            });
          }}
        >
          <span className="text-xs muted">Customers earn</span>
          <input
            required
            aria-label="Points earned per dollar"
            type="number"
            min="1"
            max="100"
            className="native-select w-20!"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
          <span className="text-xs muted">points for every $1 spent.</span>
          <button className="btn small" type="submit">
            Save rule
          </button>
        </form>
      </div>
      <div className="card-head">
        <h2>Something to look forward to</h2>
        <span className="muted text-xs">{data.rewards.length} rewards</span>
      </div>
      <div className="reward-grid">
        {data.rewards.map((r) => (
          <div className="card reward" key={r.id}>
            <div className="flex items-center justify-between">
              <span className="service-icon">
                <Gift size={19} />
              </span>
              <span className={`badge ${r.active ? 'rose' : ''}`}>
                {r.points.toLocaleString()} points
              </span>
            </div>
            <h2>{r.name}</h2>
            <p>{r.description}</p>
            <div className="flex items-end justify-between">
              <button
                className="btn small"
                onClick={() => edit({ type: 'reward', record: r })}
              >
                Edit reward
                <ChevronRight size={12} />
              </button>
              {!r.active && <Badge status="Inactive" />}
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-head px-5 pt-5">
          <h2>Your loyal regulars</h2>
          <Gift size={17} className="pink" />
        </div>
        <Table className="data-table">
          <TableHeader>
            <TableRow>
              {[
                'Customer',
                'Visits',
                'Points balance',
                'Available rewards',
              ].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...data.customers]
              .sort((a, b) => b.points - a.points)
              .slice(0, 5)
              .map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Person name={c.name} email={c.email} />
                  </TableCell>
                  <TableCell>{c.visits}</TableCell>
                  <TableCell>
                    <span className="inline">
                      <Gift size={13} className="pink" />
                      {c.points.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {
                      data.rewards.filter(
                        (r) => r.active && r.points <= c.points,
                      ).length
                    }{' '}
                    available
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
export function BillingPage() {
  const { data, save, notify } = useWorkspace();
  const [current, setCurrent] = useState<string | null>(null);
  return (
    <>
      <PageHead
        title="Subscription & billing"
        subtitle="A plan that grows with your salon. Everything you need, nothing you don’t."
      />
      <div className="subtle-banner">
        <div>
          <strong>You’re on the {data.settings.plan} plan.</strong>
          <span className="ml-2">
            Your next billing date is September 1, 2026.
          </span>
        </div>
        <span className="badge green">Active · demo</span>
      </div>
      <div className="plan-grid">
        {[
          {
            name: 'Starter',
            price: 19,
            description: 'For a small, growing salon.',
            features: [
              'Up to 3 team members',
              'Appointment scheduling',
              'Customer management',
              'Basic reports',
            ],
          },
          {
            name: 'Pro',
            price: 49,
            description: 'More care. More possibilities.',
            features: [
              'Up to 10 team members',
              'Everything in Starter',
              'Loyalty & rewards',
              'Advanced analytics',
            ],
          },
          {
            name: 'Business',
            price: 99,
            description: 'For your next chapter.',
            features: [
              'Unlimited team members',
              'Everything in Pro',
              'Priority support',
              'Multiple locations',
            ],
          },
        ].map((plan) => (
          <div
            className={`card plan ${data.settings.plan === plan.name ? 'selected' : ''}`}
            key={plan.name}
          >
            <div className="flex justify-between items-center">
              <h2>{plan.name}</h2>
              {data.settings.plan === plan.name && (
                <span className="badge rose">Current plan</span>
              )}
            </div>
            <p className="subtitle">{plan.description}</p>
            <div className="plan-price">
              ${plan.price}
              <small> / month</small>
            </div>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>
                  <Check size={14} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled={data.settings.plan === plan.name}
              className={`btn full ${plan.name === 'Pro' ? 'primary' : ''}`}
              onClick={() => setCurrent(plan.name)}
            >
              {data.settings.plan === plan.name
                ? 'Your current plan'
                : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
      {current && (
        <div className="card card-pad mb-6">
          <h2>Switch to {current}?</h2>
          <p className="subtitle">
            This changes the demo plan only. No payment will be taken.
          </p>
          <div className="inline mt-4">
            <button
              className="btn primary"
              onClick={() => {
                void save(
                  { ...data, settings: { ...data.settings, plan: current } },
                  `Demo plan changed to ${current}. No charge was made.`,
                );
                setCurrent(null);
              }}
            >
              Confirm demo plan
            </button>
            <button className="btn" onClick={() => setCurrent(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="two-col">
        <div className="card card-pad">
          <div className="card-head">
            <h2>Payment method</h2>
            <Wallet size={17} className="muted" />
          </div>
          <div className="person">
            <span className="badge blue">VISA</span>
            <div>
              <strong>Visa ending in 4242</strong>
              <small>Expires 08/2028 · Sample payment method</small>
            </div>
          </div>
          <p className="subtitle mt-5!">
            Secure payment-method updates will be available when billing is
            connected.
          </p>
        </div>
        <div className="card card-pad">
          <h2>Billing contact</h2>
          <p className="subtitle">{data.settings.email}</p>
          <p className="subtitle">
            {data.settings.name}
            <br />
            {data.settings.address}
          </p>
        </div>
      </div>
      <div className="card">
        <div className="card-head px-5 pt-5">
          <h2>Invoice history</h2>
          <span className="badge">Sample invoices</span>
        </div>
        <Table className="data-table">
          <TableHeader>
            <TableRow>
              {['Invoice', 'Date', 'Plan', 'Amount', 'Status', ''].map(
                (h, i) => (
                  <TableHead key={i}>{h}</TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {['August', 'July', 'June'].map((month, i) => (
              <TableRow key={month}>
                <TableCell>INV-2026-{String(8 - i).padStart(3, '0')}</TableCell>
                <TableCell>{month} 1, 2026</TableCell>
                <TableCell>Pro · Monthly</TableCell>
                <TableCell>$49.00</TableCell>
                <TableCell>
                  <Badge status="Paid" />
                </TableCell>
                <TableCell>
                  <button
                    className="text-link"
                    onClick={() => {
                      exportCsv(
                        `sample-invoice-${month}.csv`,
                        ['Invoice', 'Date', 'Description', 'Amount', 'Status'],
                        [
                          [
                            `INV-2026-${String(8 - i).padStart(3, '0')}`,
                            `${month} 1, 2026`,
                            'Sample Pro subscription',
                            49,
                            'Paid (demo)',
                          ],
                        ],
                      );
                      notify('Sample invoice downloaded.');
                    }}
                  >
                    <Download size={13} />
                    Download
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
export function SettingsPage() {
  const { data, save, pending } = useWorkspace();
  const [section, setSection] = useState('Business profile');
  const [settings, setSettings] = useState({ ...data.settings });
  const change = (key: string, value: string | boolean) =>
    setSettings({ ...settings, [key]: value });
  return (
    <>
      <PageHead
        title="Settings"
        subtitle="Make this workspace feel like your salon."
      />
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {['Business profile', 'Notifications', 'Booking preferences'].map(
            (item) => (
              <button
                key={item}
                className={section === item ? 'active' : ''}
                onClick={() => setSection(item)}
              >
                {item}
              </button>
            ),
          )}
        </nav>
        <form
          className="settings-panel"
          onSubmit={(e) => {
            e.preventDefault();
            void save({
              ...data,
              settings: {
                ...data.settings,
                name: settings.name,
                email: settings.email,
                phone: settings.phone,
                address: settings.address,
                currency: settings.currency,
                timezone: settings.timezone,
                confirmation: settings.confirmation,
                reminders: settings.reminders,
              },
            });
          }}
        >
          {section === 'Business profile' && (
            <div className="card card-pad">
              <div className="card-head">
                <div>
                  <h2>Business profile</h2>
                  <p className="subtitle">
                    The details that make your business yours.
                  </p>
                </div>
                <span className="brand-mark">
                  <Sparkles size={18} />
                </span>
              </div>
              <Field label="Business name">
                <input
                  required
                  value={settings.name}
                  onChange={(e) => change('name', e.target.value)}
                />
              </Field>
              <div className="field-grid">
                <Field label="Contact email">
                  <input
                    required
                    type="email"
                    value={settings.email}
                    onChange={(e) => change('email', e.target.value)}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    type="tel"
                    value={settings.phone ?? ''}
                    onChange={(e) => change('phone', e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Address">
                <textarea
                  value={settings.address ?? ''}
                  onChange={(e) => change('address', e.target.value)}
                />
              </Field>
              <div className="field-grid">
                <Field label="Currency">
                  <input disabled value="USD · US Dollar" />
                </Field>
                <Field label="Timezone">
                  <input disabled value="Asia/Yangon (GMT+6:30)" />
                </Field>
              </div>
              <p className="export-note">
                The demo uses USD and Asia/Yangon consistently across bookings
                and reports.
              </p>
            </div>
          )}
          {section === 'Notifications' && (
            <div className="card card-pad">
              <h2>Customer notifications</h2>
              <p className="subtitle mb-6">
                Choose how you’d like to stay in touch.
              </p>
              {[
                {
                  key: 'confirmation',
                  name: 'Booking confirmations',
                  description:
                    'Send a confirmation when an appointment is booked.',
                },
                {
                  key: 'reminders',
                  name: 'Appointment reminders',
                  description: 'Send a reminder 24 hours before each visit.',
                },
              ].map((item) => (
                <div className="toggle-row" key={item.key}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <Switch
                    aria-label={item.name}
                    checked={settings[item.key as 'confirmation' | 'reminders']}
                    onCheckedChange={(v) => change(item.key, v)}
                  />
                </div>
              ))}
              <p className="export-note">
                Preferences are saved for this demo session. No email or SMS is
                sent.
              </p>
            </div>
          )}
          {section === 'Booking preferences' && (
            <div className="card card-pad">
              <h2>Scheduling rules</h2>
              <p className="subtitle mb-6">
                Good schedules leave space for good care.
              </p>
              {[
                [
                  'Service qualifications',
                  'Appointments can only be assigned to qualified, active staff.',
                ],
                [
                  'Working hours & breaks',
                  'Bookings must fit inside a staff member’s available hours.',
                ],
                [
                  'Double-booking prevention',
                  'Overlapping appointments for the same staff member are blocked.',
                ],
              ].map(([name, text]) => (
                <div className="list-row" key={name}>
                  <div>
                    <h3>{name}</h3>
                    <p>{text}</p>
                  </div>
                  <CheckCircle2 size={18} className="positive" />
                </div>
              ))}
              <p className="subtitle mt-5!">
                Edit individual availability on the Staff page.
              </p>
            </div>
          )}
          {section !== 'Booking preferences' && (
            <div className="flex justify-end">
              <button className="btn primary" type="submit" disabled={pending}>
                {pending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
