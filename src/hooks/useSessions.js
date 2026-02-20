import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useSessions(uid) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', uid, 'sessions'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSessions(data);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const addSession = useCallback(
    async (session) => {
      if (!uid) return;
      await addDoc(collection(db, 'users', uid, 'sessions'), {
        date: session.date,
        gameType: session.gameType,
        stakes: session.stakes,
        location: session.location,
        duration: Number(session.duration),
        buyIn: Number(session.buyIn),
        cashOut: Number(session.cashOut),
        notes: session.notes || '',
      });
    },
    [uid]
  );

  const deleteSession = useCallback(
    async (id) => {
      if (!uid) return;
      await deleteDoc(doc(db, 'users', uid, 'sessions', id));
    },
    [uid]
  );

  const editSession = useCallback(
    async (id, updated) => {
      if (!uid) return;
      await updateDoc(doc(db, 'users', uid, 'sessions', id), {
        date: updated.date,
        gameType: updated.gameType,
        stakes: updated.stakes,
        location: updated.location,
        duration: Number(updated.duration),
        buyIn: Number(updated.buyIn),
        cashOut: Number(updated.cashOut),
        notes: updated.notes || '',
      });
    },
    [uid]
  );

  return { sessions, loading, addSession, deleteSession, editSession };
}
