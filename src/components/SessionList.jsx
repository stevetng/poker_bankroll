import { useState } from 'react';
import { format, parseISO } from 'date-fns';

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function SessionList({ sessions, onDelete, onEdit }) {
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sorted = [...sessions]
    .filter((s) => {
      if (!filter) return true;
      const q = filter.toLowerCase();
      return (
        s.gameType.toLowerCase().includes(q) ||
        s.stakes.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.date.includes(q)
      );
    })
    .sort((a, b) => {
      let av, bv;
      if (sortField === 'date') {
        av = new Date(a.date);
        bv = new Date(b.date);
      } else if (sortField === 'profit') {
        av = a.cashOut - a.buyIn;
        bv = b.cashOut - b.buyIn;
      } else if (sortField === 'duration') {
        av = a.duration;
        bv = b.duration;
      } else if (sortField === 'buyIn') {
        av = a.buyIn;
        bv = b.buyIn;
      } else {
        av = a[sortField];
        bv = b[sortField];
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const arrow = (field) =>
    sortField === field ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  if (sessions.length === 0) {
    return (
      <div className="empty-state">
        <p>No sessions logged yet. Add your first session above to get started.</p>
      </div>
    );
  }

  return (
    <div className="session-list">
      <div className="list-header">
        <h2>Session History ({sessions.length})</h2>
        <input
          type="text"
          className="filter-input"
          placeholder="Filter sessions..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('date')}>Date{arrow('date')}</th>
              <th onClick={() => handleSort('gameType')}>Game{arrow('gameType')}</th>
              <th onClick={() => handleSort('stakes')}>Stakes{arrow('stakes')}</th>
              <th onClick={() => handleSort('location')}>Location{arrow('location')}</th>
              <th onClick={() => handleSort('duration')}>Duration{arrow('duration')}</th>
              <th onClick={() => handleSort('buyIn')}>Buy-In{arrow('buyIn')}</th>
              <th onClick={() => handleSort('profit')}>Profit{arrow('profit')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const profit = s.cashOut - s.buyIn;
              return (
                <tr key={s.id}>
                  <td>{format(parseISO(s.date), 'MMM d, yyyy')}</td>
                  <td>{s.gameType}</td>
                  <td>{s.stakes}</td>
                  <td>{s.location}</td>
                  <td>{formatDuration(s.duration)}</td>
                  <td>${s.buyIn.toLocaleString()}</td>
                  <td className={profit >= 0 ? 'text-green' : 'text-red'}>
                    {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
                  </td>
                  <td className="actions">
                    <button className="btn-icon" onClick={() => onEdit(s)} title="Edit">
                      ✎
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => {
                        if (confirm('Delete this session?')) onDelete(s.id);
                      }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
