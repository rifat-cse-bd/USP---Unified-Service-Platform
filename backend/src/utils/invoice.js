import { randomBytes } from 'crypto';

export function generateInvoiceNumber(prefix = 'WS') {
  const part = randomBytes(4).toString('hex').toUpperCase();
  const d = new Date();
  return `${prefix}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${part}`;
}
