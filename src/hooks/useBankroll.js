import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'poker_bankroll_config';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { startingBankroll: 0 };
  } catch {
    return { startingBankroll: 0 };
  }
}

export function useBankroll() {
  const [config, setConfig] = useState(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const setStartingBankroll = useCallback((amount) => {
    setConfig((prev) => ({ ...prev, startingBankroll: Number(amount) }));
  }, []);

  return { startingBankroll: config.startingBankroll, setStartingBankroll };
}
