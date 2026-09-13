import type { WorkDay } from "./api/staff";
export const workingHours = (): WorkDay[] =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, dayOfWeek) => ({
    day,
    dayOfWeek,
    enabled: day !== "Sun",
    start: "09:00",
    end: "18:00",
    breaks: [],
  }));
export const money = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
export const duration = (mins: number) =>
  `${Math.floor(mins / 60) ? `${Math.floor(mins / 60)} hr` : ""}${mins % 60 ? ` ${mins % 60} min` : ""}`.trim();

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

