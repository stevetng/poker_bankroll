import { useState } from 'react';

function formatMoney(val) {
  const sign = val >= 0 ? '+' : '';
  return `${sign}$${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatBankroll(val) {
  return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function StatsCards({ stats, startingBankroll, onSetStartingBankroll }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(startingBankroll));
  const currentBankroll = startingBankroll + stats.totalProfit;
  const heroColor = stats.totalProfit >= 0 ? 'green' : 'red';

  const handleSave = () => {
    const val = parseFloat(input);
    if (!isNaN(val) && val >= 0) {
      onSetStartingBankroll(val);
    }
    setEditing(false);
  };

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
      <div className="bankroll-hero">
        <div className="bankroll-card">
          <div className="stat-label">Bankroll</div>
          {editing ? (
            <div className="bankroll-edit">
              <span className="bankroll-dollar">$</span>
              <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
                min="0"
                step="0.01"
              />
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div className="bankroll-display">
              <div className={`stat-value ${currentBankroll >= 0 ? 'stat-val-green' : 'stat-val-red'}`}>
                {formatBankroll(currentBankroll)}
              </div>
              <button
                className="btn-link bankroll-set"
                onClick={() => { setInput(String(startingBankroll)); setEditing(true); }}
              >
                {startingBankroll === 0 ? 'Set starting bankroll' : 'Edit starting'}
              </button>
            </div>
          )}
          {!editing && startingBankroll > 0 && (
            <div className="bankroll-sub">
              Started at {formatBankroll(startingBankroll)}
            </div>
          )}
        </div>
        <div className={`bankroll-card stat-${heroColor}`}>
          <div className="stat-label">Total Profit</div>
          <div className="stat-value">{formatMoney(stats.totalProfit)}</div>
        </div>
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
