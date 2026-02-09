import { format, parseISO } from 'date-fns';

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function RecentSessions({ sessions, onEdit, onViewAll }) {
  const sorted = [...sessions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  if (sorted.length === 0) return null;

  return (
    <div className="recent-sessions">
      <div className="recent-header">
        <h3>Recent Sessions</h3>
        {sessions.length > 10 && (
          <button className="btn-link" onClick={onViewAll}>
            View all {sessions.length}
          </button>
        )}
      </div>
      <ul className="session-feed">
        {sorted.map((s) => {
          const profit = s.cashOut - s.buyIn;
          const isWin = profit >= 0;
          return (
            <li key={s.id} className="feed-item" onClick={() => onEdit(s)}>
              <div className="feed-left">
                <span className={`feed-indicator ${isWin ? 'win' : 'loss'}`} />
                <div className="feed-info">
                  <span className="feed-date">
                    {format(parseISO(s.date), 'MMM d, yyyy')}
                  </span>
                  <span className="feed-meta">
                    {s.gameType} {s.stakes} &middot; {s.location} &middot; {formatDuration(s.duration)}
                  </span>
                </div>
              </div>
              <div className={`feed-profit ${isWin ? 'text-green' : 'text-red'}`}>
                {isWin ? '+' : ''}${profit.toLocaleString()}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
