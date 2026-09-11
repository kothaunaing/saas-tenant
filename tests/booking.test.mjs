import test from "node:test";
import assert from "node:assert/strict";
import {
  availableSlots,
  bookingError,
  canCustomerManage,
  hoursError,
} from "../tenant/lib/booking.ts";
import { workingHours } from "../tenant/lib/domain.ts";
const services = [
  { id: "s1", name: "Service", duration: 60, active: true },
  { id: "s2", name: "Long service", duration: 75, active: true },
];
const staff = [
  { id: "t1", active: true, services: [], hours: workingHours() },
  { id: "t5", active: true, services: ["s1", "s2"], hours: workingHours() },
  { id: "t6", active: false, services: ["s1"], hours: workingHours() },
];
const appointments = [
  {
    id: "a4",
    customerId: "c2",
    serviceId: "s2",
    staffId: "t5",
    date: "2026-08-07",
    time: "11:00",
    status: "Confirmed",
    notes: "",
  },
];
const booking = {
  id: "test",
  customerId: "c1",
  serviceId: "s1",
  staffId: "t5",
  date: "2026-08-07",
  time: "13:00",
  status: "Confirmed",
  notes: "",
};
test("accepts a qualified staff member in a free slot", () =>
  assert.equal(bookingError(booking, appointments, staff, services), null));
test("blocks double booking", () =>
  assert.match(
    bookingError({ ...booking, time: "11:30" }, appointments, staff, services),
    /already has an appointment/,
  ));
test("allows booking exactly after an appointment ends", () =>
  assert.equal(
    bookingError({ ...booking, time: "12:15" }, appointments, staff, services),
    null,
  ));
test("rejects staff without the required service", () =>
  assert.match(
    bookingError({ ...booking, staffId: "t1" }, appointments, staff, services),
    /qualified/,
  ));
test("rejects inactive staff", () =>
  assert.match(
    bookingError({ ...booking, staffId: "t6" }, appointments, staff, services),
    /inactive/,
  ));
test("rejects a day off", () =>
  assert.match(
    bookingError(
      { ...booking, date: "2026-08-09" },
      appointments,
      staff,
      services,
    ),
    /not available/,
  ));
test("rejects an appointment ending after closing", () =>
  assert.match(
    bookingError({ ...booking, time: "17:30" }, appointments, staff, services),
    /not available/,
  ));
test("respects staff breaks", () => {
  const team = structuredClone(staff);
  team[1].hours[5].breaks = [{ start: "13:00", end: "14:00" }];
  assert.match(
    bookingError(booking, appointments, team, services),
    /staff break/,
  );
});
test("editing an appointment does not conflict with itself", () =>
  assert.equal(
    bookingError({ ...appointments[0] }, appointments, staff, services),
    null,
  ));
test("cancelled appointments free their slot", () =>
  assert.equal(
    bookingError(
      { ...booking, time: "11:00" },
      appointments.map((a) =>
        a.id === "a4" ? { ...a, status: "Cancelled" } : a,
      ),
      staff,
      services,
    ),
    null,
  ));
test("validates workday and break ranges", () => {
  const h = workingHours();
  h[1].end = "08:00";
  assert.match(hoursError(h), /closing time/);
  h[1].end = "18:00";
  h[1].breaks = [{ start: "08:30", end: "09:30" }];
  assert.match(hoursError(h), /inside working hours/);
});
test("rejects overlapping staff breaks", () => {
  const h = workingHours();
  h[1].breaks = [
    { start: "12:00", end: "13:00" },
    { start: "12:45", end: "13:30" },
  ];
  assert.match(hoursError(h), /cannot overlap/);
});

test("customer availability returns only free qualified slots", () => {
  const slots = availableSlots(
    "2026-08-07",
    "s1",
    "t5",
    appointments,
    staff,
    services,
    "2026-08-07T08:00:00+06:30",
  );
  assert.equal(
    slots.some((slot) => slot.time === "11:00"),
    false,
  );
  assert.equal(
    slots.some((slot) => slot.time === "13:00"),
    true,
  );
  assert.deepEqual(slots.find((slot) => slot.time === "13:00")?.staffIds, [
    "t5",
  ]);
});

test("customer availability excludes past times", () => {
  const slots = availableSlots(
    "2026-08-07",
    "s1",
    "t5",
    appointments,
    staff,
    services,
    "2026-08-07T12:30:00+06:30",
  );
  assert.equal(
    slots.some((slot) => slot.time <= "12:30"),
    false,
  );
});

test("customer cancellation and reschedule close 24 hours before a booking", () => {
  assert.equal(
    canCustomerManage(
      { ...booking, date: "2026-08-09", time: "13:00" },
      "2026-08-07T08:00:00+06:30",
    ),
    true,
  );
  assert.equal(
    canCustomerManage(
      { ...booking, date: "2026-08-08", time: "07:00" },
      "2026-08-07T08:00:00+06:30",
    ),
    false,
  );
});
