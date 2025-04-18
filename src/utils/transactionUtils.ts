import {Transaction} from '../interfaces/interfaces.ts';

export type transactionInterval = 'daily' | 'weekly' | 'monthly';

export function groupTransactions(
  transactions: Transaction[],
  interval: transactionInterval
) {
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

  const map = new Map<
    string,
    {
      date: string;
      cost: number;
      gross: number;
      net: number;
      margin: number;
      count: number;
    }
  >();

  for (const tx of transactions) {
    const key = groupFn(tx.docUpdated!);
    const cost = Number(tx.cost || 0);
    const net = Number(tx.net_amount || 0);

    const existing = map.get(key);
    if (existing) {
      existing.cost += cost;
      existing.gross += Number(tx.gross_amount || 0);
      existing.net += net;
      existing.margin += net - cost;
      existing.count += 1;
    } else {
      map.set(key, {
        date: key,
        cost: Number(tx.cost || 0),
        gross: Number(tx.gross_amount || 0),
        net: Number(tx.net_amount || 0),
        margin: net - cost,
        count: 1,
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
