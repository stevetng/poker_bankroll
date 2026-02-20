import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSessions } from './hooks/useSessions';
import { useBankroll } from './hooks/useBankroll';
import { useStats } from './hooks/useStats';
import Auth from './components/Auth';
import SessionForm from './components/SessionForm';
import SessionList from './components/SessionList';
import StatsCards from './components/StatsCards';
import RecentSessions from './components/RecentSessions';
import Reports from './components/Reports';
import {
  ProfitTimeline,
  SessionResultsChart,
  ProfitByCategory,
  MonthlyProfitChart,
  SessionDistributionPie,
  HourlyRateChart,
} from './components/Charts';
import './App.css';

const TABS = ['Dashboard', 'Log Session', 'Reports', 'History'];

export default function App() {
  const { user, loading: authLoading, error: authError, signUp, signIn, signOut, clearError } = useAuth();
  const uid = user?.uid;

  const { sessions, loading: sessionsLoading, addSession, deleteSession, editSession } = useSessions(uid);
  const { startingBankroll, setStartingBankroll } = useBankroll(uid);
  const stats = useStats(sessions);
  const [tab, setTab] = useState('Dashboard');
  const [editing, setEditing] = useState(null);

  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-window">
            <div className="auth-titlebar"><span>Loading...</span></div>
            <div className="loading-body">
              <p>Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <Auth onSignIn={signIn} onSignUp={signUp} error={authError} onClearError={clearError} />
      </div>
    );
  }

  const handleEdit = (session) => {
    setEditing(session);
    setTab('Log Session');
  };

  const handleSubmit = (data) => {
    if (editing) {
      editSession(editing.id, data);
      setEditing(null);
    } else {
      addSession(data);
    }
    setTab('Dashboard');
  };

  const handleCancel = () => {
    setEditing(null);
    setTab('Dashboard');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Poker Bankroll Tracker</h1>
        <div className="header-right">
          <nav className="tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`tab ${tab === t ? 'active' : ''}`}
                onClick={() => {
                  setTab(t);
                  if (t !== 'Log Session') setEditing(null);
                }}
              >
                {t}
              </button>
            ))}
          </nav>
          <button className="btn btn-signout" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="app-main">
        {sessionsLoading ? (
          <div className="empty-state">
            <p>Loading sessions...</p>
          </div>
        ) : (
          <>
            {tab === 'Dashboard' && (
              <div className="dashboard">
                <StatsCards
                  stats={stats}
                  startingBankroll={startingBankroll}
                  onSetStartingBankroll={setStartingBankroll}
                />
                {sessions.length > 0 ? (
                  <>
                    <ProfitTimeline data={stats.profitOverTime} />

                    <div className="dashboard-split">
                      <RecentSessions
                        sessions={sessions}
                        onEdit={handleEdit}
                        onViewAll={() => setTab('History')}
                      />
                      <SessionResultsChart data={stats.sessionResults} />
                    </div>

                    <MonthlyProfitChart data={stats.profitByMonth} />

                    <div className="charts-grid">
                      <ProfitByCategory data={stats.profitByStakes} title="Profit by Stakes" />
                      <HourlyRateChart data={stats.hourlyByGameType} />
                      <ProfitByCategory data={stats.profitByLocation} title="Profit by Location" />
                      <SessionDistributionPie data={stats.profitByGameType} />
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <p>Log your first session to see stats and charts.</p>
                    <button className="btn btn-primary" onClick={() => setTab('Log Session')}>
                      Log Session
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'Log Session' && (
              <SessionForm
                onSubmit={handleSubmit}
                initial={editing}
                onCancel={editing ? handleCancel : undefined}
              />
            )}

            {tab === 'Reports' && (
              <Reports sessions={sessions} />
            )}

            {tab === 'History' && (
              <SessionList sessions={sessions} onDelete={deleteSession} onEdit={handleEdit} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
