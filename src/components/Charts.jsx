import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa', '#fb923c', '#34d399'];

function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ${Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

export function ProfitTimeline({ data }) {
  if (!data.length) return null;
  return (
    <div className="chart-container">
      <h3>Cumulative Profit</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="label" stroke="#888" fontSize={12} />
          <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<MoneyTooltip />} />
          <ReferenceLine y={0} stroke="#555" />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="#4ade80"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Cumulative"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SessionResultsChart({ data }) {
  if (!data.length) return null;
  return (
    <div className="chart-container">
      <h3>Session Results</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="label" stroke="#888" fontSize={12} />
          <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<MoneyTooltip />} />
          <ReferenceLine y={0} stroke="#555" />
          <Bar dataKey="profit" name="Profit">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? '#4ade80' : '#f87171'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProfitByCategory({ data, title }) {
  if (!data.length) return null;
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis type="number" stroke="#888" fontSize={12} tickFormatter={(v) => `$${v}`} />
          <YAxis type="category" dataKey="name" stroke="#888" fontSize={12} width={120} />
          <Tooltip content={<MoneyTooltip />} />
          <ReferenceLine x={0} stroke="#555" />
          <Bar dataKey="profit" name="Profit">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? '#4ade80' : '#f87171'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyProfitChart({ data }) {
  if (!data.length) return null;
  return (
    <div className="chart-container">
      <h3>Monthly Profit</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="name" stroke="#888" fontSize={12} />
          <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<MoneyTooltip />} />
          <ReferenceLine y={0} stroke="#555" />
          <Bar dataKey="profit" name="Profit">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? '#4ade80' : '#f87171'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SessionDistributionPie({ data }) {
  if (!data.length) return null;
  return (
    <div className="chart-container">
      <h3>Sessions by Game Type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="sessions"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, sessions }) => `${name} (${sessions})`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HourlyRateChart({ data }) {
  if (!data.length) return null;
  return (
    <div className="chart-container">
      <h3>Hourly Rate by Game Type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis type="number" stroke="#888" fontSize={12} tickFormatter={(v) => `$${v}/hr`} />
          <YAxis type="category" dataKey="name" stroke="#888" fontSize={12} width={120} />
          <Tooltip
            formatter={(value) =>
              `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}/hr`
            }
          />
          <Bar dataKey="hourly" name="Hourly Rate">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.hourly >= 0 ? '#60a5fa' : '#f87171'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
