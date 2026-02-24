import { useState, useMemo } from 'react';
import { parseISO, format, getDay, startOfDay, endOfDay } from 'date-fns';
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
} from 'recharts';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatMoney(val) {
  const sign = val >= 0 ? '+' : '';
  return `${sign}$${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function compactDollar(v) {
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v}`;
}

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

function getUniqueValues(sessions, key) {
  return [...new Set(sessions.map((s) => s[key]).filter(Boolean))].sort();
}

export default function Reports({ sessions }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStakes, setSelectedStakes] = useState([]);
  const [selectedGameTypes, setSelectedGameTypes] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [minDuration, setMinDuration] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [resultFilter, setResultFilter] = useState('all');

  const allStakes = useMemo(() => getUniqueValues(sessions, 'stakes'), [sessions]);
  const allGameTypes = useMemo(() => getUniqueValues(sessions, 'gameType'), [sessions]);
  const allLocations = useMemo(() => getUniqueValues(sessions, 'location'), [sessions]);

  const toggleMulti = (arr, setArr, val) => {
    setArr((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  };

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const d = parseISO(s.date);
      if (dateFrom && d < startOfDay(parseISO(dateFrom))) return false;
      if (dateTo && d > endOfDay(parseISO(dateTo))) return false;
      if (selectedStakes.length > 0 && !selectedStakes.includes(s.stakes)) return false;
      if (selectedGameTypes.length > 0 && !selectedGameTypes.includes(s.gameType)) return false;
      if (selectedLocations.length > 0 && !selectedLocations.includes(s.location)) return false;
      if (selectedDays.length > 0 && !selectedDays.includes(getDay(d))) return false;
      if (minDuration && s.duration < Number(minDuration)) return false;
      if (maxDuration && s.duration > Number(maxDuration)) return false;
      const profit = s.cashOut - s.buyIn;
      if (resultFilter === 'wins' && profit <= 0) return false;
      if (resultFilter === 'losses' && profit >= 0) return false;
      return true;
    });
  }, [sessions, dateFrom, dateTo, selectedStakes, selectedGameTypes, selectedLocations, selectedDays, minDuration, maxDuration, resultFilter]);

  const report = useMemo(() => {
    if (filtered.length === 0) return null;
    const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
    const totalProfit = filtered.reduce((s, x) => s + (x.cashOut - x.buyIn), 0);
    const totalHours = filtered.reduce((s, x) => s + x.duration, 0) / 60;
    const wins = filtered.filter((x) => x.cashOut - x.buyIn > 0).length;
    const profits = filtered.map((x) => x.cashOut - x.buyIn);

    let cumulative = 0;
    const cumulativeData = sorted.map((s) => {
      cumulative += s.cashOut - s.buyIn;
      return { label: format(parseISO(s.date), 'MMM d'), cumulative, profit: s.cashOut - s.buyIn };
    });

    const byDay = {};
    filtered.forEach((s) => {
      const day = getDay(parseISO(s.date));
      if (!byDay[day]) byDay[day] = { profit: 0, count: 0, hours: 0 };
      byDay[day].profit += s.cashOut - s.buyIn;
      byDay[day].count += 1;
      byDay[day].hours += s.duration / 60;
    });
    const dayData = DAY_NAMES.map((name, i) => ({
      name: name.slice(0, 3),
      profit: byDay[i]?.profit || 0,
      sessions: byDay[i]?.count || 0,
    }));

    const byStakes = {};
    filtered.forEach((s) => {
      if (!byStakes[s.stakes]) byStakes[s.stakes] = { profit: 0, count: 0 };
      byStakes[s.stakes].profit += s.cashOut - s.buyIn;
      byStakes[s.stakes].count += 1;
    });
    const stakesData = Object.entries(byStakes).map(([name, d]) => ({ name, profit: d.profit, sessions: d.count }));

    return {
      totalProfit, totalSessions: filtered.length,
      winRate: (wins / filtered.length) * 100,
      hourlyRate: totalHours > 0 ? totalProfit / totalHours : 0,
      avgProfit: totalProfit / filtered.length,
      totalHours,
      biggestWin: Math.max(...profits),
      biggestLoss: Math.min(...profits),
      cumulativeData, dayData, stakesData,
    };
  }, [filtered]);

  const clearFilters = () => {
    setDateFrom(''); setDateTo(''); setSelectedStakes([]); setSelectedGameTypes([]);
    setSelectedLocations([]); setSelectedDays([]); setMinDuration(''); setMaxDuration(''); setResultFilter('all');
  };

  const hasFilters = dateFrom || dateTo || selectedStakes.length || selectedGameTypes.length || selectedLocations.length || selectedDays.length || minDuration || maxDuration || resultFilter !== 'all';

  return (
    <div className="reports">
      <h2>Reports</h2>

      <div className="report-filters">
        <div className="filter-section">
          <label>Date Range</label>
          <div className="filter-row">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span className="filter-dash">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>

        <div className="filter-section">
          <label>Day of Week</label>
          <div className="chip-group">
            {DAY_NAMES.map((name, i) => (
              <button key={i} className={`chip ${selectedDays.includes(i) ? 'chip-active' : ''}`} onClick={() => toggleMulti(selectedDays, setSelectedDays, i)}>{name.slice(0, 3)}</button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label>Stakes</label>
          <div className="chip-group">
            {allStakes.map((s) => (
              <button key={s} className={`chip ${selectedStakes.includes(s) ? 'chip-active' : ''}`} onClick={() => toggleMulti(selectedStakes, setSelectedStakes, s)}>{s}</button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label>Game Type</label>
          <div className="chip-group">
            {allGameTypes.map((g) => (
              <button key={g} className={`chip ${selectedGameTypes.includes(g) ? 'chip-active' : ''}`} onClick={() => toggleMulti(selectedGameTypes, setSelectedGameTypes, g)}>{g}</button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label>Location</label>
          <div className="chip-group">
            {allLocations.map((l) => (
              <button key={l} className={`chip ${selectedLocations.includes(l) ? 'chip-active' : ''}`} onClick={() => toggleMulti(selectedLocations, setSelectedLocations, l)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label>Session Duration (min)</label>
          <div className="filter-row">
            <input type="number" value={minDuration} onChange={(e) => setMinDuration(e.target.value)} placeholder="Min" min="0" />
            <span className="filter-dash">to</span>
            <input type="number" value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)} placeholder="Max" min="0" />
          </div>
        </div>

        <div className="filter-section">
          <label>Result</label>
          <div className="chip-group">
            {[['all', 'All'], ['wins', 'Wins Only'], ['losses', 'Losses Only']].map(([val, label]) => (
              <button key={val} className={`chip ${resultFilter === val ? 'chip-active' : ''}`} onClick={() => setResultFilter(val)}>{label}</button>
            ))}
          </div>
        </div>

        {hasFilters && <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear All Filters</button>}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>No sessions match the selected filters.</p></div>
      ) : report && (
        <div className="report-results">
          <div className="report-summary">
            <div className="report-stat"><span className="report-stat-label">Sessions</span><span className="report-stat-value">{report.totalSessions}</span></div>
            <div className="report-stat"><span className="report-stat-label">Net Profit</span><span className={`report-stat-value ${report.totalProfit >= 0 ? 'text-green' : 'text-red'}`}>{formatMoney(report.totalProfit)}</span></div>
            <div className="report-stat"><span className="report-stat-label">Win Rate</span><span className={`report-stat-value ${report.winRate >= 50 ? 'text-green' : 'text-red'}`}>{report.winRate.toFixed(1)}%</span></div>
            <div className="report-stat"><span className="report-stat-label">Hourly</span><span className={`report-stat-value ${report.hourlyRate >= 0 ? 'text-green' : 'text-red'}`}>{formatMoney(report.hourlyRate)}/hr</span></div>
            <div className="report-stat"><span className="report-stat-label">Avg Session</span><span className={`report-stat-value ${report.avgProfit >= 0 ? 'text-green' : 'text-red'}`}>{formatMoney(report.avgProfit)}</span></div>
            <div className="report-stat"><span className="report-stat-label">Hours</span><span className="report-stat-value">{report.totalHours.toFixed(1)}</span></div>
            <div className="report-stat"><span className="report-stat-label">Best</span><span className="report-stat-value text-green">{formatMoney(report.biggestWin)}</span></div>
            <div className="report-stat"><span className="report-stat-label">Worst</span><span className={`report-stat-value ${report.biggestLoss < 0 ? 'text-red' : 'text-green'}`}>{formatMoney(report.biggestLoss)}</span></div>
          </div>

          <div className="chart-container">
            <h3>Filtered Cumulative Profit</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={report.cumulativeData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={11} interval="preserveStartEnd" />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickFormatter={compactDollar} width={50} />
                <Tooltip content={<MoneyTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                <Line type="monotone" dataKey="cumulative" stroke="#60a5fa" strokeWidth={2} dot={{ r: 2 }} name="Cumulative" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Profit by Day of Week</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={report.dayData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickFormatter={compactDollar} width={50} />
                <Tooltip content={<MoneyTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]}>
                  {report.dayData.map((entry, i) => (
                    <Cell key={i} fill={entry.profit >= 0 ? '#34d399' : '#fb7185'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {report.stakesData.length > 1 && (
            <div className="chart-container">
              <h3>Profit by Stakes</h3>
              <ResponsiveContainer width="100%" height={Math.max(160, report.stakesData.length * 50)}>
                <BarChart data={report.stakesData} layout="vertical" margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} tickFormatter={compactDollar} />
                  <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} width={60} />
                  <Tooltip content={<MoneyTooltip />} />
                  <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" />
                  <Bar dataKey="profit" name="Profit" radius={[0, 4, 4, 0]}>
                    {report.stakesData.map((entry, i) => (
                      <Cell key={i} fill={entry.profit >= 0 ? '#34d399' : '#fb7185'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="report-session-list">
            <h3>Matching Sessions ({filtered.length})</h3>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Date</th><th>Game</th><th>Stakes</th><th>Location</th><th>Duration</th><th>Profit</th></tr></thead>
                <tbody>
                  {[...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)).map((s) => {
                    const profit = s.cashOut - s.buyIn;
                    return (
                      <tr key={s.id}>
                        <td>{format(parseISO(s.date), 'MMM d, yyyy')}</td>
                        <td>{s.gameType}</td><td>{s.stakes}</td><td>{s.location}</td>
                        <td>{formatDuration(s.duration)}</td>
                        <td className={profit >= 0 ? 'text-green' : 'text-red'}>{profit >= 0 ? '+' : ''}${profit.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
