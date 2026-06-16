/**
 * Convert ISO8601, Date, or datetime-local string to MySQL DATETIME (YYYY-MM-DD HH:MM:SS).
 */
export function toMysqlDatetime(value) {
  if (value == null || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid datetime value');
  }
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Default scheduled time: 24 hours from now in MySQL format.
 */
export function defaultScheduledAt() {
  return toMysqlDatetime(new Date(Date.now() + 86400000));
}
