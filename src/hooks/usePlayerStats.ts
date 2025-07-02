
import { useState, useEffect } from 'react';

interface PlayerStats {
  totalPlayers: number;
  newThisMonth: number;
  recentPlayers: Array<{
    id: string;
    name: string;
    skill: string;
    age: number;
    email: string;
    sessionsCount: number;
  }>;
}

export const usePlayerStats = () => {
  const [stats, setStats] = useState<PlayerStats>({
    totalPlayers: 0,
    newThisMonth: 0,
    recentPlayers: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      try {
        const playersStr = localStorage.getItem("players");
        if (!playersStr) {
          setStats({
            totalPlayers: 0,
            newThisMonth: 0,
            recentPlayers: []
          });
          setIsLoading(false);
          return;
        }

        const players = JSON.parse(playersStr);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count new players this month (assuming they have a createdAt field)
        const newThisMonth = players.filter(player => {
          if (!player.createdAt) return false;
          const createdDate = new Date(player.createdAt);
          return createdDate >= startOfMonth;
        }).length;

        // Get recent players (last 3)
        const recentPlayers = players
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 3)
          .map(player => ({
            id: player.id,
            name: player.name,
            skill: player.skill || 'Beginner',
            age: player.age || 0,
            email: player.email || '',
            sessionsCount: player.sessionsCount || 0
          }));

        setStats({
          totalPlayers: players.length,
          newThisMonth,
          recentPlayers
        });

      } catch (error) {
        console.error('Error calculating player stats:', error);
        setStats({
          totalPlayers: 0,
          newThisMonth: 0,
          recentPlayers: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    calculateStats();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'players') {
        calculateStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events
    const handlePlayersUpdate = () => {
      calculateStats();
    };

    window.addEventListener('playersUpdated', handlePlayersUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('playersUpdated', handlePlayersUpdate);
    };
  }, []);

  return { stats, isLoading };
};
