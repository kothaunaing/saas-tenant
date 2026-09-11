"use client";
import { Search, ArrowUpRight, Inbox, type LucideIcon } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { initials, money } from "@/tenant/lib/domain";
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
      <span className={`avatar ${tint ? "rose" : ""}`}>{initials(name)}</span>
      <div>
        <strong>{name}</strong>
        {email && <small>{email}</small>}
      </div>
    </div>
  );
}
export function Badge({ status }: { status: string }) {
  const color = ["Completed", "Confirmed", "Active", "Paid"].includes(status)
    ? "green"
    : ["Pending", "Manager"].includes(status)
      ? "orange"
      : ["In progress", "Owner"].includes(status)
        ? "blue"
        : ["Cancelled", "No-show", "Inactive"].includes(status)
          ? "red"
          : "";
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
  placeholder = "Search by name or email…",
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
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: (string | { value: string; label: string })[];
  label: string;
  className?: string;
}) {
  const opts = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
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
  title = "No results found",
  description = "Try a different search or filter.",
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
export function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number }[];
}) {
  const max = Math.max(1, ...data.map((row) => row.revenue));
  const points = data
    .map(
      (row, index) =>
        `${data.length === 1 ? 325 : (index * 650) / (data.length - 1)},${180 - (row.revenue / max) * 170}`,
    )
    .join(" ");
  const labels = data.filter(
    (_, index) =>
      index % Math.max(1, Math.floor(data.length / 6)) === 0 ||
      index === data.length - 1,
  );
  return (
    <div className="chart">
      <div className="chart-labels">
        <span>{money(max)}</span>
        <span>{money(max * 0.66)}</span>
        <span>{money(max * 0.33)}</span>
        <span>$0</span>
      </div>
      <div className="chart-main">
        <svg
          viewBox="0 0 650 190"
          preserveAspectRatio="none"
          aria-label="Revenue trend"
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
          <polyline
            points={`${points} 650,190 0,190`}
            fill="url(#revenue-fill)"
          />
          <polyline
            points={points}
            fill="none"
            stroke="#f44280"
            strokeWidth="2.5"
          />
        </svg>
        <div className="chart-dates">
          {labels.map((row) => (
            <span key={row.date}>
              {new Date(`${row.date}T12:00:00`).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
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
  const csv = [headers, ...rows].map((r) => r.map(safe).join(",")).join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
