import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'poker_bankroll_sessions';

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useSessions() {
  const [sessions, setSessions] = useState(loadSessions);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const addSession = useCallback((session) => {
    setSessions((prev) => [
      ...prev,
      {
        id: uuidv4(),
        date: session.date,
        gameType: session.gameType,
        stakes: session.stakes,
        location: session.location,
        duration: Number(session.duration),
        buyIn: Number(session.buyIn),
        cashOut: Number(session.cashOut),
        notes: session.notes || '',
      },
    ]);
  }, []);

  const deleteSession = useCallback((id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const editSession = useCallback((id, updated) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              date: updated.date,
              gameType: updated.gameType,
              stakes: updated.stakes,
              location: updated.location,
              duration: Number(updated.duration),
              buyIn: Number(updated.buyIn),
              cashOut: Number(updated.cashOut),
              notes: updated.notes || '',
            }
          : s
      )
    );
  }, []);

  return { sessions, addSession, deleteSession, editSession };
}
