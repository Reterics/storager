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
  products?: Record<string, number>;
  productsRevenue?: Record<string, number>;
  productsCost?: Record<string, number>;
}

function getGroupKey(timestamp: number, interval: transactionInterval): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  if (interval === 'daily') {
    return `${year}-${month}-${day}`;
  } else if (interval === 'weekly') {
    const start = getStartOfWeek(date);
    return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  } else if (interval === 'monthly') {
    return `${year}-${month}`;
  } else if (interval === 'yearly') {
    return `${year}`;
  }

  return '';
}

export function groupTransactions(
  transactions: Transaction[],
  interval: transactionInterval
): GroupedTransactionData[] {
  const map = new Map<string, GroupedTransactionData>();

  const now = new Date();
  const keys: string[] = [];

  if (interval === 'daily') {
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      keys.push(key);
    }
  } else if (interval === 'weekly') {
    for (let i = 0; i < 26; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      const startOfWeek = getStartOfWeek(d);
      const key = `${startOfWeek.getFullYear()}-${pad(startOfWeek.getMonth() + 1)}-${pad(startOfWeek.getDate())}`;
      keys.push(key);
    }
  } else if (interval === 'monthly') {
    for (let i = 0; i < 12; i++) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      keys.push(key);
    }
  } else if (interval === 'yearly') {
    for (let i = 0; i < 5; i++) {
      const y = now.getFullYear() - i;
      keys.push(`${y}`);
    }
  }

  // Prepopulate empty buckets
  keys.forEach(key => {
    if (!map.has(key)) {
      map.set(key, {
        date: key,
        cost: 0,
        gross: 0,
        net: 0,
        margin: 0,
        marginPercent: 0,
        grossMarginPercent: 0,
        count: 0,
        products: {},
        productsRevenue: {},
        productsCost: {},
      });
    }
  });

  for (const tx of transactions) {
    const key = getGroupKey(tx.docUpdated!, interval);
    const cost = Number(tx.cost || 0);
    const net = Number(tx.net_amount || 0);
    const gross = Number(tx.gross_amount || 0);
    const quantity = Number(tx.quantity || 1);
    const margin = net - cost;
    const productName = tx.name || 'Unknown';

    // Calculate margin percentages
    // const marginPercent = cost > 0 ? (margin / cost) * 100 : 0;
    // const grossMarginPercent = gross > 0 ? (margin / gross) * 100 : 0;

    const existing = map.get(key);
    if (existing) {
      existing.cost += cost;
      existing.gross += gross;
      existing.net += net;
      existing.margin += margin;
      existing.count += quantity;

      // Track product names and counts
      existing.products ??= {};
      existing.productsRevenue ??= {};
      existing.productsCost ??= {};

      existing.products[productName] = (existing.products[productName] || 0) + quantity;
      existing.productsRevenue[productName] = (existing.productsRevenue[productName] || 0) + gross;
      existing.productsCost[productName] = (existing.productsCost[productName] || 0) + cost;

      // Recalculate percentages based on updated totals
      existing.marginPercent =
        existing.cost > 0 ? (existing.margin / existing.cost) * 100 : 0;
      existing.grossMarginPercent =
        existing.gross > 0 ? (existing.margin / existing.gross) * 100 : 0;
    }/* else {
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
    }*/
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
