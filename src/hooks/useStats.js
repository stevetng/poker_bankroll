import { useMemo } from 'react';
import { parseISO, format } from 'date-fns';

export function useStats(sessions) {
  return useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalProfit: 0,
        totalSessions: 0,
        winRate: 0,
        avgProfit: 0,
        avgDuration: 0,
        hourlyRate: 0,
        biggestWin: 0,
        biggestLoss: 0,
        currentStreak: 0,
        profitOverTime: [],
        profitByGameType: [],
        profitByStakes: [],
        profitByLocation: [],
        profitByMonth: [],
        sessionResults: [],
        hourlyByGameType: [],
      };
    }

    const sorted = [...sessions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    let cumulative = 0;
    const profitOverTime = sorted.map((s) => {
      const profit = s.cashOut - s.buyIn;
      cumulative += profit;
      return {
        date: s.date,
        profit,
        cumulative,
        label: format(parseISO(s.date), 'MMM d'),
      };
    });

    const sessionResults = sorted.map((s) => ({
      date: s.date,
      profit: s.cashOut - s.buyIn,
      label: format(parseISO(s.date), 'MMM d'),
      gameType: s.gameType,
    }));

    const totalProfit = sessions.reduce(
      (sum, s) => sum + (s.cashOut - s.buyIn),
      0
    );
    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const wins = sessions.filter((s) => s.cashOut - s.buyIn > 0).length;

    let streak = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i].cashOut - sorted[i].buyIn;
      if (i === sorted.length - 1) {
        streak = p >= 0 ? 1 : -1;
      } else {
        if ((p >= 0 && streak > 0) || (p < 0 && streak < 0)) {
          streak += streak > 0 ? 1 : -1;
        } else {
          break;
        }
      }
    }

    const profits = sessions.map((s) => s.cashOut - s.buyIn);

    // Group by helper
    function groupBy(key) {
      const map = {};
      sessions.forEach((s) => {
        const k = s[key] || 'Unknown';
        if (!map[k]) map[k] = { totalProfit: 0, count: 0, totalHours: 0 };
        map[k].totalProfit += s.cashOut - s.buyIn;
        map[k].count += 1;
        map[k].totalHours += s.duration / 60;
      });
      return Object.entries(map).map(([name, data]) => ({
        name,
        profit: data.totalProfit,
        sessions: data.count,
        hourly: data.totalHours > 0 ? data.totalProfit / data.totalHours : 0,
      }));
    }

    // Group by month
    const monthMap = {};
    sessions.forEach((s) => {
      const month = format(parseISO(s.date), 'yyyy-MM');
      if (!monthMap[month]) monthMap[month] = { profit: 0, sessions: 0 };
      monthMap[month].profit += s.cashOut - s.buyIn;
      monthMap[month].sessions += 1;
    });
    const profitByMonth = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        name: format(parseISO(month + '-01'), 'MMM yyyy'),
        profit: data.profit,
        sessions: data.sessions,
      }));

    return {
      totalProfit,
      totalSessions: sessions.length,
      winRate: (wins / sessions.length) * 100,
      avgProfit: totalProfit / sessions.length,
      avgDuration: sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length,
      hourlyRate: totalHours > 0 ? totalProfit / totalHours : 0,
      biggestWin: Math.max(...profits),
      biggestLoss: Math.min(...profits),
      currentStreak: streak,
      profitOverTime,
      profitByGameType: groupBy('gameType'),
      profitByStakes: groupBy('stakes'),
      profitByLocation: groupBy('location'),
      profitByMonth,
      sessionResults,
      hourlyByGameType: groupBy('gameType'),
    };
  }, [sessions]);
}
