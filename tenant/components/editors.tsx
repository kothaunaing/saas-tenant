'use client';
import { useState } from 'react';
import { Plus, X, CalendarDays } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Choice } from './tenant-ui';
import { useWorkspace } from './workspace-provider';
import {
  workingHours,
  duration,
  money,
} from '@/tenant/lib/demo-data';
import type { Staff, Customer, Service, Appointment, Reward } from '@/tenant/lib/api';
import { bookingError, hoursError } from '@/tenant/lib/booking';
export type Editor =
  | { type: 'staff'; record?: Staff }
  | { type: 'customer'; record?: Customer }
  | { type: 'service'; record?: Service }
  | { type: 'appointment'; record?: Appointment }
  | { type: 'reward'; record?: Reward };
const uid = () => crypto.randomUUID();
export default function EditorSheet({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const { data, save, pending } = useWorkspace();
  const [error, setError] = useState('');
  const type = editor.type;
  const [person, setPerson] = useState<Staff>(() =>
    editor.type === 'staff' && editor.record
      ? structuredClone(editor.record)
      : {
          id: uid(),
          name: '',
          email: '',
          phone: '',
          role: 'Staff',
          active: true,
          services: [],
          hours: workingHours(),
        },
  );
  const [customer, setCustomer] = useState<Customer>(() =>
    editor.type === 'customer' && editor.record
      ? { ...editor.record }
      : {
          id: uid(),
          name: '',
          email: '',
          phone: '',
          visits: 0,
          noShow: 0,
          points: 0,
          spent: 0,
          last: 'Not visited yet',
          notes: '',
        },
  );
  const [service, setService] = useState<Service>(() =>
    editor.type === 'service' && editor.record
      ? { ...editor.record }
      : {
          id: uid(),
          name: '',
          category: 'Facial',
          duration: 60,
          price: 0,
          active: true,
          description: '',
        },
  );
  const [booking, setBooking] = useState<Appointment>(() =>
    editor.type === 'appointment' && editor.record
      ? { ...editor.record }
      : {
          id: uid(),
          customerId: data.customers[0]?.id ?? '',
          serviceId: data.services.find((s) => s.active)?.id ?? '',
          staffId: '',
          date: new Date().toISOString().slice(0, 10),
          time: '10:00',
          status: 'Confirmed',
          notes: '',
        },
  );
  const [reward, setReward] = useState<Reward>(() =>
    editor.type === 'reward' && editor.record
      ? { ...editor.record }
      : { id: uid(), name: '', points: 500, description: '', active: true },
  );
  const isEdit = !!editor.record;
  const title = `${isEdit ? 'Edit' : 'Add'} ${type === 'staff' ? 'staff member' : type === 'appointment' ? 'appointment' : type}`;
  const submit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const updated = { ...data };
    if (type === 'staff') {
      const err = hoursError(person.hours);
      if (err) return setError(err);
      if (!person.name.trim())
        return setError('Enter the staff member’s name.');
      if (person.active && !person.services.length)
        return setError(
          'Assign at least one service to an active team member.',
        );
      updated.staff = isEdit
        ? data.staff.map((s) =>
            s.id === person.id ? { ...person, name: person.name.trim() } : s,
          )
        : [...data.staff, { ...person, name: person.name.trim() }];
    }
    if (type === 'customer') {
      if (!customer.name.trim()) return setError('Enter a customer name.');
      if (
        data.customers.some(
          (c) =>
            c.id !== customer.id &&
            c.email.toLowerCase() === customer.email.toLowerCase(),
        )
      )
        return setError('A customer with this email already exists.');
      updated.customers = isEdit
        ? data.customers.map((c) =>
            c.id === customer.id
              ? { ...customer, name: customer.name.trim() }
              : c,
          )
        : [...data.customers, { ...customer, name: customer.name.trim() }];
    }
    if (type === 'service') {
      if (!service.name.trim() || service.duration < 15 || service.price < 0)
        return setError(
          'Enter a service name, a duration of at least 15 minutes, and a valid price.',
        );
      updated.services = isEdit
        ? data.services.map((s) => (s.id === service.id ? service : s))
        : [...data.services, service];
    }
    if (type === 'appointment') {
      const err = bookingError(
        booking,
        data.appointments,
        data.staff,
        data.services,
      );
      if (err) return setError(err);
      updated.appointments = isEdit
        ? data.appointments.map((a) => (a.id === booking.id ? booking : a))
        : [...data.appointments, booking];
    }
    if (type === 'reward') {
      if (!reward.name.trim() || reward.points < 1)
        return setError('Enter a reward name and at least one point.');
      updated.rewards = isEdit
        ? data.rewards.map((r) => (r.id === reward.id ? reward : r))
        : [...data.rewards, reward];
    }
    try {
      await save(
        updated,
        `${isEdit ? 'Changes saved' : type === 'appointment' ? 'Appointment created' : type === 'staff' ? 'Team member added' : `${type.charAt(0).toUpperCase() + type.slice(1)} added`}. Demo changes reset on refresh.`,
      );
      onClose();
    } catch {
      setError('Your changes could not be saved. Please try again.');
    }
  };
  const available = data.staff.filter(
    (s) => s.active && s.services.includes(booking.serviceId),
  );
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="editor-sheet">
        <SheetHeader className="editor-head">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {type === 'staff'
              ? 'Manage their services, availability, and working hours.'
              : type === 'appointment'
                ? 'Find a little time for your customer’s next visit.'
                : `Keep your ${type} details up to date.`}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="editor-form">
          <div className="editor-body">
            {type === 'staff' && (
              <>
                <div className="field-grid">
                  <Field label="Full name">
                    <input
                      required
                      value={person.name}
                      placeholder="May Zin"
                      onChange={(e) =>
                        setPerson({ ...person, name: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      value={person.email}
                      placeholder="may@serenity.com"
                      onChange={(e) =>
                        setPerson({ ...person, email: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="field-grid">
                  <Field label="Phone">
                    <input
                      type="tel"
                      value={person.phone}
                      placeholder="+95 9 …"
                      onChange={(e) =>
                        setPerson({ ...person, phone: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Role">
                    <input disabled value={person.role} />
                    <small className="muted font-normal">
                      Only an owner can change roles.
                    </small>
                  </Field>
                </div>
                <div className="toggle-row">
                  <div>
                    <h3>Active</h3>
                    <p>
                      Inactive members keep their history but can’t be booked.
                    </p>
                  </div>
                  <Switch
                    checked={person.active}
                    onCheckedChange={(active) =>
                      setPerson({ ...person, active })
                    }
                    aria-label="Staff member active"
                  />
                </div>
                <div className="section-label">
                  <h3>Services</h3>
                  <p>Which treatments this member is qualified to perform.</p>
                </div>
                <div className="card">
                  {data.services.map((s) => (
                    <label key={s.id} className="check-row">
                      <Checkbox
                        checked={person.services.includes(s.id)}
                        onCheckedChange={(checked) =>
                          setPerson({
                            ...person,
                            services: checked
                              ? [...person.services, s.id]
                              : person.services.filter((id) => id !== s.id),
                          })
                        }
                      />
                      <span>{s.name}</span>
                      <span className="badge">{duration(s.duration)}</span>
                    </label>
                  ))}
                </div>
                <div className="section-label">
                  <h3>Working hours</h3>
                  <p>Set a weekly schedule and add time for breaks.</p>
                </div>
                {person.hours.map((day, i) => (
                  <div className="hours-row" key={day.day}>
                    <div className="hours-line">
                      <Switch
                        aria-label={`${day.day} working day`}
                        checked={day.enabled}
                        onCheckedChange={(enabled) =>
                          setPerson({
                            ...person,
                            hours: person.hours.map((h, n) =>
                              n === i ? { ...h, enabled } : h,
                            ),
                          })
                        }
                      />
                      <strong>{day.day}</strong>
                      {day.enabled ? (
                        <>
                          <input
                            aria-label={`${day.day} start time`}
                            type="time"
                            required
                            value={day.start}
                            onChange={(e) =>
                              setPerson({
                                ...person,
                                hours: person.hours.map((h, n) =>
                                  n === i ? { ...h, start: e.target.value } : h,
                                ),
                              })
                            }
                          />
                          <span>–</span>
                          <input
                            aria-label={`${day.day} end time`}
                            type="time"
                            required
                            value={day.end}
                            onChange={(e) =>
                              setPerson({
                                ...person,
                                hours: person.hours.map((h, n) =>
                                  n === i ? { ...h, end: e.target.value } : h,
                                ),
                              })
                            }
                          />
                          <button
                            type="button"
                            className="btn ghost small"
                            onClick={() =>
                              setPerson({
                                ...person,
                                hours: person.hours.map((h, n) =>
                                  n === i
                                    ? {
                                        ...h,
                                        breaks: [
                                          ...h.breaks,
                                          { start: '12:00', end: '13:00' },
                                        ],
                                      }
                                    : h,
                                ),
                              })
                            }
                          >
                            <Plus size={12} />
                            Break
                          </button>
                        </>
                      ) : (
                        <span className="muted">Day off</span>
                      )}
                    </div>
                    {day.enabled &&
                      day.breaks.map((b, bi) => (
                        <div className="break-line" key={bi}>
                          <span>Break</span>
                          {(['start', 'end'] as const).map((key) => (
                            <input
                              key={key}
                              aria-label={`${day.day} break ${bi + 1} ${key}`}
                              type="time"
                              required
                              value={b[key]}
                              onChange={(e) =>
                                setPerson({
                                  ...person,
                                  hours: person.hours.map((h, n) =>
                                    n === i
                                      ? {
                                          ...h,
                                          breaks: h.breaks.map((br, bn) =>
                                            bn === bi
                                              ? { ...br, [key]: e.target.value }
                                              : br,
                                          ),
                                        }
                                      : h,
                                  ),
                                })
                              }
                            />
                          ))}
                          <button
                            type="button"
                            aria-label="Remove break"
                            onClick={() =>
                              setPerson({
                                ...person,
                                hours: person.hours.map((h, n) =>
                                  n === i
                                    ? {
                                        ...h,
                                        breaks: h.breaks.filter(
                                          (_, bn) => bn !== bi,
                                        ),
                                      }
                                    : h,
                                ),
                              })
                            }
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                  </div>
                ))}
              </>
            )}
            {type === 'customer' && (
              <>
                <Field label="Full name">
                  <input
                    required
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                    placeholder="Customer’s full name"
                  />
                </Field>
                <Field label="Email">
                  <input
                    required
                    type="email"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                    placeholder="customer@example.com"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                    placeholder="+95 9 …"
                  />
                </Field>
                <Field label="Notes · visible to staff only">
                  <textarea
                    value={customer.notes}
                    onChange={(e) =>
                      setCustomer({ ...customer, notes: e.target.value })
                    }
                    placeholder="Preferences, allergies, and anything worth remembering…"
                  />
                </Field>
              </>
            )}
            {type === 'service' && (
              <>
                <Field label="Service name">
                  <input
                    required
                    value={service.name}
                    onChange={(e) =>
                      setService({ ...service, name: e.target.value })
                    }
                    placeholder="e.g. Hydrating Facial"
                  />
                </Field>
                <Field label="Category">
                  <Choice
                    label="Service category"
                    value={service.category}
                    onChange={(category) =>
                      setService({ ...service, category })
                    }
                    options={['Facial', 'Hair', 'Body', 'Massage', 'Nails']}
                    className="w-full"
                  />
                </Field>
                <div className="field-grid">
                  <Field label="Duration (minutes)">
                    <input
                      required
                      type="number"
                      min="15"
                      step="5"
                      value={service.duration}
                      onChange={(e) =>
                        setService({
                          ...service,
                          duration: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Price (USD)">
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={service.price}
                      onChange={(e) =>
                        setService({
                          ...service,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    value={service.description}
                    onChange={(e) =>
                      setService({ ...service, description: e.target.value })
                    }
                  />
                </Field>
                <div className="toggle-row">
                  <div>
                    <h3>Available for booking</h3>
                    <p>Make this treatment available to your customers.</p>
                  </div>
                  <Switch
                    checked={service.active}
                    onCheckedChange={(active) =>
                      setService({ ...service, active })
                    }
                    aria-label="Service available"
                  />
                </div>
                <p className="subtitle">
                  Assign qualified team members on the Staff page before booking
                  this service.
                </p>
              </>
            )}
            {type === 'appointment' && (
              <>
                <Field label="Customer">
                  <Choice
                    value={booking.customerId}
                    onChange={(customerId) =>
                      setBooking({ ...booking, customerId })
                    }
                    options={data.customers.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    label="Customer"
                    className="w-full"
                  />
                </Field>
                <Field label="Service">
                  <Choice
                    value={booking.serviceId}
                    onChange={(serviceId) =>
                      setBooking({ ...booking, serviceId, staffId: '' })
                    }
                    options={data.services
                      .filter((s) => s.active || s.id === booking.serviceId)
                      .map((s) => ({
                        value: s.id,
                        label: `${s.name} · ${duration(s.duration)} · ${money(s.price)}`,
                      }))}
                    label="Service"
                    className="w-full"
                  />
                </Field>
                <Field label="Team member">
                  <Choice
                    value={booking.staffId}
                    onChange={(staffId) => setBooking({ ...booking, staffId })}
                    options={[
                      { value: '', label: 'Choose a qualified team member' },
                      ...available.map((s) => ({ value: s.id, label: s.name })),
                    ]}
                    label="Team member"
                    className="w-full"
                  />
                </Field>
                {available.length === 0 && (
                  <p className="form-error">
                    No active staff are assigned to this service.
                  </p>
                )}
                <div className="field-grid">
                  <Field label="Date">
                    <input
                      required
                      type="date"
                      value={booking.date}
                      onChange={(e) =>
                        setBooking({ ...booking, date: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Time">
                    <input
                      required
                      type="time"
                      value={booking.time}
                      onChange={(e) =>
                        setBooking({ ...booking, time: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <Field label="Status">
                  <Choice
                    value={booking.status}
                    onChange={(status) => setBooking({ ...booking, status })}
                    options={[
                      'Pending',
                      'Confirmed',
                      'In progress',
                      'Completed',
                      'Cancelled',
                      'No-show',
                    ]}
                    label="Appointment status"
                    className="w-full"
                  />
                </Field>
                <Field label="Appointment notes">
                  <textarea
                    value={booking.notes}
                    onChange={(e) =>
                      setBooking({ ...booking, notes: e.target.value })
                    }
                    placeholder="Anything the team should know?"
                  />
                </Field>
                <div className="health-note">
                  <CalendarDays size={17} className="pink" />
                  <div>
                    <h3>Time to take care</h3>
                    <p>
                      Working hours, breaks, and existing bookings are checked
                      when you save.
                    </p>
                  </div>
                </div>
              </>
            )}
            {type === 'reward' && (
              <>
                <Field label="Reward name">
                  <input
                    required
                    value={reward.name}
                    onChange={(e) =>
                      setReward({ ...reward, name: e.target.value })
                    }
                  />
                </Field>
                <Field label="Points required">
                  <input
                    required
                    type="number"
                    min="1"
                    value={reward.points}
                    onChange={(e) =>
                      setReward({ ...reward, points: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    value={reward.description}
                    onChange={(e) =>
                      setReward({ ...reward, description: e.target.value })
                    }
                  />
                </Field>
                <div className="toggle-row">
                  <h3>Available to redeem</h3>
                  <Switch
                    aria-label="Reward active"
                    checked={reward.active}
                    onCheckedChange={(active) =>
                      setReward({ ...reward, active })
                    }
                  />
                </div>
              </>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <footer className="editor-footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={pending}>
              {pending
                ? 'Saving…'
                : isEdit
                  ? 'Save changes'
                  : type === 'staff'
                    ? 'Add member'
                    : type === 'appointment'
                      ? 'Create appointment'
                      : `Add ${type}`}
            </button>
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}
