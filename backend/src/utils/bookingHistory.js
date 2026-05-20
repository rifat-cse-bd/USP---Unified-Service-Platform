import { run } from '../config/database.js';

export async function recordBookingStatus(bookingId, status, changedBy = null, note = null) {
  await run(
    `INSERT INTO booking_status_history (booking_id, status, changed_by, note) VALUES (?, ?, ?, ?)`,
    [bookingId, status, changedBy, note]
  );
}
