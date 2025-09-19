import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { TooltipProps } from 'recharts';

type MiniTopChartProps = {
  data: Array<Record<string, number | string>>;
  xKey: string;
  yKey: string;
  kind?: 'line' | 'bar';
  className?: string;
};

function formatLabel(label: unknown) {
  if (typeof label === 'string') return label;
  if (typeof label === 'number') {
    const d = new Date(label);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return String(label ?? '');
}

const numberFmt = new Intl.NumberFormat(undefined);

function MiniTooltip({ active, label, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  const value = typeof p.value === 'number' ? p.value : Number(p.value ?? 0);

  return (
    <div
      style={{
        borderRadius: 6,
        border: '1px solid var(--tw-prose-hr, rgba(0,0,0,0.08))',
        background: 'var(--tooltip-bg, rgba(255,255,255,0.95))',
        padding: '6px 8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>
        {formatLabel(label)}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>
        {numberFmt.format(value)}
      </div>
    </div>
  );
}

export function MiniTopChart({
  data,
  xKey,
  yKey,
  kind = 'line',
  className = '',
}: MiniTopChartProps) {
  const commonAxes = (
    <>
      <XAxis
        dataKey={xKey}
        interval="preserveStartEnd"
        tick={{ fontSize: 10, opacity: 0.8 }}
        tickLine={false}
        axisLine={false}
        minTickGap={24}
      />
      <YAxis hide domain={['auto', 'auto']} />
    </>
  );

  const commonTooltip = (
    <Tooltip
      cursor={{ strokeOpacity: 0.15 }}
      isAnimationActive={false}
      wrapperStyle={{ outline: 'none' }}
      contentStyle={{
        borderRadius: 6,
        border: '1px solid var(--tw-prose-hr, rgba(0,0,0,0.08))',
        background: 'var(--tooltip-bg, rgba(255,255,255,0.95))',
        padding: '6px 8px',
      }}
      labelStyle={{ fontSize: 11, opacity: 0.8 }}
      itemStyle={{ fontSize: 12 }}
      content={<MiniTooltip />}
    />
  );

  return (
    <div className={`h-[70px] ${className} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        {kind === 'bar' ? (
          <BarChart
            data={data}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          >
            {commonAxes}
            {commonTooltip}
            <Bar
              dataKey={yKey}
              fill="currentColor"
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          >
            {commonAxes}
            {commonTooltip}
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="currentColor"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
