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
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const COLORS = ['#000080', '#8b0000', '#006400', '#b8860b', '#4b0082', '#ff6600', '#008080'];

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

function compactDollar(v) {
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v}`;
}

export function ProfitTimeline({ data }) {
  if (!data.length) return null;
  return (
    <div className="chart-container chart-hero">
      <h3>Cumulative Profit</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="label" stroke="#888" fontSize={11} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis stroke="#888" fontSize={11} tickFormatter={compactDollar} width={50} />
          <Tooltip content={<MoneyTooltip />} />
          <ReferenceLine y={0} stroke="#555" />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="#000080"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
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
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="label" stroke="#888" fontSize={11} interval="preserveStartEnd" />
          <YAxis stroke="#888" fontSize={11} tickFormatter={compactDollar} width={50} />
          <Tooltip content={<MoneyTooltip />} />
          <ReferenceLine y={0} stroke="#555" />
          <Bar dataKey="profit" name="Profit" radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? '#006400' : '#8b0000'} />
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
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 50)}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis type="number" stroke="#888" fontSize={11} tickFormatter={compactDollar} />
          <YAxis type="category" dataKey="name" stroke="#888" fontSize={11} width={80} />
          <Tooltip content={<MoneyTooltip />} />
          <ReferenceLine x={0} stroke="#555" />
          <Bar dataKey="profit" name="Profit" radius={[0, 2, 2, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? '#006400' : '#8b0000'} />
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
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="name" stroke="#888" fontSize={11} interval="preserveStartEnd" />
          <YAxis stroke="#888" fontSize={11} tickFormatter={compactDollar} width={50} />
          <Tooltip content={<MoneyTooltip />} />
          <ReferenceLine y={0} stroke="#555" />
          <Bar dataKey="profit" name="Profit" radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? '#006400' : '#8b0000'} />
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
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="sessions"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, sessions }) => `${name} (${sessions})`}
            fontSize={11}
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
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 50)}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis type="number" stroke="#888" fontSize={11} tickFormatter={(v) => `$${v}/hr`} />
          <YAxis type="category" dataKey="name" stroke="#888" fontSize={11} width={80} />
          <Tooltip
            formatter={(value) =>
              `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}/hr`
            }
          />
          <Bar dataKey="hourly" name="Hourly Rate" radius={[0, 2, 2, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.hourly >= 0 ? '#4169e1' : '#8b0000'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
