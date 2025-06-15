import {Transaction} from '../interfaces/interfaces.ts';

export type transactionInterval = 'daily' | 'weekly' | 'monthly';

export interface GroupedTransactionData {
  date: string;
  cost: number;
  gross: number;
  net: number;
  margin: number;
  marginPercent: number;
  grossMarginPercent: number;
  count: number;
  products?: Record<string, number>; // Map of product names to counts
}

export function groupTransactions(
  transactions: Transaction[],
  interval: transactionInterval
): GroupedTransactionData[] {
  const groupFn = (timestamp: number) => {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-based in JS
    const day = date.getDate();

    if (interval === 'daily') {
      return `${year}-${pad(month)}-${pad(day)}`;
    }

    if (interval === 'weekly') {
      const start = getStartOfWeek(date);
      return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    }

    if (interval === 'monthly') {
      return `${year}-${pad(month)}`;
    }

    return '';
  };

  const map = new Map<string, GroupedTransactionData>();

  for (const tx of transactions) {
    const key = groupFn(tx.docUpdated!);
    const cost = Number(tx.cost || 0);
    const net = Number(tx.net_amount || 0);
    const gross = Number(tx.gross_amount || 0);
    const margin = net - cost;
    const productName = tx.name || 'Unknown';

    // Calculate margin percentages
    const marginPercent = cost > 0 ? (margin / cost) * 100 : 0;
    const grossMarginPercent = gross > 0 ? (margin / gross) * 100 : 0;

    const existing = map.get(key);
    if (existing) {
      existing.cost += cost;
      existing.gross += gross;
      existing.net += net;
      existing.margin += margin;
      existing.count += 1;

      // Track product names and counts
      if (!existing.products) {
        existing.products = {};
      }
      existing.products[productName] =
        (existing.products[productName] || 0) + 1;

      // Recalculate percentages based on updated totals
      existing.marginPercent =
        existing.cost > 0 ? (existing.margin / existing.cost) * 100 : 0;
      existing.grossMarginPercent =
        existing.gross > 0 ? (existing.margin / existing.gross) * 100 : 0;
    } else {
      map.set(key, {
        date: key,
        cost,
        gross,
        net,
        margin,
        marginPercent,
        grossMarginPercent,
        count: 1,
        products: {[productName]: 1},
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function getStartOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start of week
  const start = new Date(date);
  start.setDate(date.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}
