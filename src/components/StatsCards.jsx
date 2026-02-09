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
  const heroColor = stats.totalProfit >= 0 ? 'green' : 'red';

  const primaryCards = [
    {
      label: 'Hourly Rate',
      value: formatMoney(stats.hourlyRate),
      color: stats.hourlyRate >= 0 ? 'green' : 'red',
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      color: stats.winRate >= 50 ? 'green' : 'red',
    },
    {
      label: 'Sessions',
      value: stats.totalSessions,
      color: 'neutral',
    },
  ];

  const secondaryCards = [
    {
      label: 'Avg Session',
      value: formatMoney(stats.avgProfit),
      color: stats.avgProfit >= 0 ? 'green' : 'red',
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
      label: 'Avg Duration',
      value: formatDuration(stats.avgDuration),
      color: 'neutral',
    },
    {
      label: 'Streak',
      value: `${Math.abs(stats.currentStreak)} ${stats.currentStreak >= 0 ? 'W' : 'L'}`,
      color: stats.currentStreak >= 0 ? 'green' : 'red',
    },
  ];

  return (
    <div className="stats-section">
      <div className={`stat-hero stat-${heroColor}`}>
        <div className="stat-label">Total Profit</div>
        <div className="stat-value">{formatMoney(stats.totalProfit)}</div>
      </div>
      <div className="stats-primary">
        {primaryCards.map((c) => (
          <div key={c.label} className={`stat-card stat-${c.color}`}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="stats-secondary">
        {secondaryCards.map((c) => (
          <div key={c.label} className={`stat-card stat-sm stat-${c.color}`}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
