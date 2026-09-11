// Pure utility functions and fixtures shared across the tenant UI and tests.
import type { WorkDay, Staff, Service, Appointment } from './api';

export const workingHours = (): WorkDay[] =>
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayOfWeek) => ({
    dayOfWeek,
    day,
    enabled: day !== 'Sun',
    start: '09:00',
    end: '18:00',
    breaks: [],
  }));

export const money = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

export const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

export const duration = (mins: number) =>
  `${Math.floor(mins / 60) ? `${Math.floor(mins / 60)} hr` : ''}${mins % 60 ? ` ${mins % 60} min` : ''}`.trim();

export const demoDate = '2026-08-07';

export const services: Service[] = [
  {
    id: 's1',
    name: 'Hydrating Facial',
    category: 'Facial',
    duration: 60,
    price: 55,
    active: true,
    description: 'A nourishing treatment for refreshed, radiant skin.',
  },
  {
    id: 's2',
    name: 'Anti-Ageing Facial',
    category: 'Facial',
    duration: 75,
    price: 85,
    active: true,
    description: 'Targeted care to smooth, firm, and restore your glow.',
  },
  {
    id: 's3',
    name: 'Body Scrub & Wrap',
    category: 'Body',
    duration: 90,
    price: 70,
    active: true,
    description: 'Full-body exfoliation followed by a replenishing wrap.',
  },
  {
    id: 's4',
    name: 'Signature Cut & Style',
    category: 'Hair',
    duration: 60,
    price: 45,
    active: true,
    description: 'A personalized cut, wash, and signature finish.',
  },
  {
    id: 's5',
    name: 'Aromatherapy Massage',
    category: 'Massage',
    duration: 60,
    price: 65,
    active: true,
    description: 'Restore balance with essential oils and gentle massage.',
  },
  {
    id: 's6',
    name: 'Gel Manicure',
    category: 'Nails',
    duration: 45,
    price: 32,
    active: true,
    description: 'Detailed nail care with a long-lasting gel finish.',
  },
  {
    id: 's7',
    name: 'Hair Color & Treatment',
    category: 'Hair',
    duration: 120,
    price: 110,
    active: true,
    description: 'Rich, dimensional color and deep conditioning.',
  },
];

export const staff: Staff[] = [
  'Nandar Aye',
  'Thiri Ko',
  'May Zin',
  'Su Latt',
  'Hnin Wai',
  'Aye Chan',
].map((name, i) => ({
  id: `t${i + 1}`,
  name,
  email:
    ['owner', 'manager', 'staff', 'su.latt', 'hnin.wai', 'aye.chan'][i] +
    '@serenity.com',
  phone: `+95 9 450 222 ${110 + i}`,
  role: i === 0 ? 'Owner' : i === 1 ? 'Manager' : 'Staff',
  active: i !== 5,
  services: [
    ['s4', 's7', 's6'],
    ['s1', 's2', 's3', 's5'],
    ['s4', 's6', 's7'],
    ['s3', 's5', 's6'],
    ['s1', 's2', 's3'],
    ['s6'],
  ][i],
  hours: workingHours(),
}));

export const appointments: Appointment[] = [
  ['a1', 'c1', 's1', 't5', '09:00', 'Completed'],
  ['a2', 'c5', 's4', 't1', '09:30', 'Completed'],
  ['a3', 'c4', 's5', 't4', '10:00', 'In progress'],
  ['a4', 'c2', 's2', 't5', '11:00', 'Confirmed'],
  ['a5', 'c8', 's6', 't3', '11:30', 'Confirmed'],
  ['a6', 'c6', 's4', 't1', '13:00', 'Confirmed'],
  ['a7', 'c7', 's3', 't4', '14:00', 'Pending'],
  ['a8', 'c3', 's1', 't5', '15:30', 'Confirmed'],
].map(([id, customerId, serviceId, staffId, time, status]) => ({
  id,
  customerId,
  serviceId,
  staffId,
  time,
  status,
  date: demoDate,
  notes: '',
}));
