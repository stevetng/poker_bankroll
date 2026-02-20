import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useBankroll(uid) {
  const [startingBankroll, setStartingBankrollLocal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setStartingBankrollLocal(0);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', uid, 'config', 'bankroll'), (snap) => {
      if (snap.exists()) {
        setStartingBankrollLocal(snap.data().startingBankroll ?? 0);
      } else {
        setStartingBankrollLocal(0);
      }
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const setStartingBankroll = useCallback(
    async (amount) => {
      if (!uid) return;
      await setDoc(doc(db, 'users', uid, 'config', 'bankroll'), {
        startingBankroll: Number(amount),
      });
    },
    [uid]
  );

  return { startingBankroll, loading, setStartingBankroll };
}
