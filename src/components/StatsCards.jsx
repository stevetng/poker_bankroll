function formatMoney(val) {
  const sign = val >= 0 ? '+' : '';
  return `${sign}$${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Total Profit',
      value: formatMoney(stats.totalProfit),
      color: stats.totalProfit >= 0 ? 'green' : 'red',
    },
    {
      label: 'Sessions Played',
      value: stats.totalSessions,
      color: 'neutral',
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      color: stats.winRate >= 50 ? 'green' : 'red',
    },
    {
      label: 'Hourly Rate',
      value: formatMoney(stats.hourlyRate),
      color: stats.hourlyRate >= 0 ? 'green' : 'red',
    },
    {
      label: 'Avg Session',
      value: formatMoney(stats.avgProfit),
      color: stats.avgProfit >= 0 ? 'green' : 'red',
    },
    {
      label: 'Avg Duration',
      value: formatDuration(stats.avgDuration),
      color: 'neutral',
    },
    {
      label: 'Biggest Win',
      value: formatMoney(stats.biggestWin),
      color: 'green',
    },
    {
      label: 'Biggest Loss',
      value: formatMoney(stats.biggestLoss),
      color: stats.biggestLoss < 0 ? 'red' : 'green',
    },
    {
      label: 'Current Streak',
      value: `${Math.abs(stats.currentStreak)} ${stats.currentStreak >= 0 ? 'W' : 'L'}`,
      color: stats.currentStreak >= 0 ? 'green' : 'red',
    },
  ];

  return (
    <div className="stats-cards">
      {cards.map((c) => (
        <div key={c.label} className={`stat-card stat-${c.color}`}>
          <div className="stat-label">{c.label}</div>
          <div className="stat-value">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
