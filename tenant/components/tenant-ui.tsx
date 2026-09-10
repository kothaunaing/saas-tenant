'use client';
import { Search, ArrowUpRight, Inbox, type LucideIcon } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { initials } from '@/tenant/lib/demo-data';
export { Table, TableHeader, TableHead, TableRow, TableBody, TableCell };
export function Person({
  name,
  email,
  tint = false,
}: {
  name: string;
  email?: string;
  tint?: boolean;
}) {
  return (
    <div className="person">
      <span className={`avatar ${tint ? 'rose' : ''}`}>{initials(name)}</span>
      <div>
        <strong>{name}</strong>
        {email && <small>{email}</small>}
      </div>
    </div>
  );
}
export function Badge({ status }: { status: string }) {
  const color = ['Completed', 'Confirmed', 'Active', 'Paid'].includes(status)
    ? 'green'
    : ['Pending', 'Manager'].includes(status)
      ? 'orange'
      : ['In progress', 'Owner'].includes(status)
        ? 'blue'
        : ['Cancelled', 'No-show', 'Inactive'].includes(status)
          ? 'red'
          : '';
  return (
    <span className={`badge ${color}`}>
      <i className="dot" />
      {status}
    </span>
  );
}
export function PageHead({
  title,
  subtitle,
  eyebrow,
  children,
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
export function Stat({
  label,
  value,
  foot,
  change,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  foot?: string;
  change?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="card stat">
      <div className="stat-top">
        {label}
        {Icon && (
          <span className="stat-icon">
            <Icon size={15} />
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {foot && (
        <div className="stat-foot">
          {change && (
            <span className="positive inline" style={{ gap: 2 }}>
              <ArrowUpRight size={11} />
              {change}
            </span>
          )}
          {foot}
        </div>
      )}
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = 'Search by name or email…',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search">
      <Search size={14} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
export function Choice({
  value,
  onChange,
  options,
  label,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  options: (string | { value: string; label: string })[];
  label: string;
  className?: string;
}) {
  const opts = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  );
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v !== null) onChange(v);
      }}
      items={opts}
    >
      <SelectTrigger
        aria-label={label}
        className={`bg-white text-xs min-h-9 ${className}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opts.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function Empty({
  title = 'No results found',
  description = 'Try a different search or filter.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty">
      <Inbox size={27} className="mx-auto opacity-50" />
      <h3>{title}</h3>
      <p className="text-xs">{description}</p>
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function RevenueChart({ period = 7 }: { period?: number }) {
  const paths: Record<number, string> = {
    7: 'M0 140 C45 110 70 70 115 90 S195 140 230 105 S305 27 350 50 S430 90 470 45 S540 5 585 28 S625 38 650 30',
    30: 'M0 160 C45 130 70 105 115 115 S195 155 230 120 S305 55 350 65 S430 105 470 55 S540 25 585 35 S625 48 650 55',
    90: 'M0 165 C60 160 65 110 115 130 S190 100 230 118 S300 90 350 100 S410 40 470 70 S535 30 585 45 S625 15 650 10',
  };
  const path = paths[period] ?? paths[7];
  return (
    <div className="chart">
      <div className="chart-labels">
        <span>{period === 7 ? '$600' : period === 30 ? '$2k' : '$6k'}</span>
        <span>{period === 7 ? '$400' : period === 30 ? '$1k' : '$4k'}</span>
        <span>{period === 7 ? '$200' : period === 30 ? '$500' : '$2k'}</span>
        <span>$0</span>
      </div>
      <div className="chart-main">
        <svg
          viewBox="0 0 650 190"
          preserveAspectRatio="none"
          aria-label={`Illustrative revenue trend for the last ${period} days`}
        >
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f63078" stopOpacity=".16" />
              <stop offset="100%" stopColor="#f63078" stopOpacity=".02" />
            </linearGradient>
          </defs>
          {[0, 60, 120, 180].map((y) => (
            <line
              key={y}
              x1="0"
              x2="650"
              y1={y}
              y2={y}
              stroke="#eeeef2"
              strokeDasharray="3 4"
            />
          ))}
          <path d={path + ' L650 190 L0 190Z'} fill="url(#revenue-fill)" />
          <path d={path} fill="none" stroke="#f44280" strokeWidth="2.5" />
        </svg>
        <div className="chart-dates">
          {(period === 7
            ? ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7']
            : period === 30
              ? [
                  'Jul 9',
                  'Jul 14',
                  'Jul 19',
                  'Jul 24',
                  'Jul 29',
                  'Aug 3',
                  'Aug 7',
                ]
              : [
                  'May 10',
                  'May 25',
                  'Jun 9',
                  'Jun 24',
                  'Jul 9',
                  'Jul 24',
                  'Aug 7',
                ]
          ).map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
export function exportCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const safe = (v: string | number) => {
    let s = String(v);
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const csv = [headers, ...rows].map((r) => r.map(safe).join(',')).join('\r\n');
  const url = URL.createObjectURL(
    new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
