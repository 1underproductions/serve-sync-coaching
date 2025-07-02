
import { useState, useEffect } from 'react';

interface SessionStats {
  totalUpcoming: number;
  todaySessions: number;
  thisWeekSessions: number;
  trendPercentage: number;
  trendPositive: boolean;
}

export const useSessionStats = () => {
  const [stats, setStats] = useState<SessionStats>({
    totalUpcoming: 0,
    todaySessions: 0,
    thisWeekSessions: 0,
    trendPercentage: 0,
    trendPositive: true
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      try {
        const sessionsStr = localStorage.getItem("sessions");
        if (!sessionsStr) {
          setStats({
            totalUpcoming: 0,
            todaySessions: 0,
            thisWeekSessions: 0,
            trendPercentage: 0,
            trendPositive: true
          });
          setIsLoading(false);
          return;
        }

        const sessions = JSON.parse(sessionsStr);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Start of current week (Monday)
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(today.getDate() - daysToMonday);
        
        // End of current week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Filter upcoming sessions (from now onwards)
        const upcomingSessions = sessions.filter(session => {
          const sessionDate = new Date(`${session.date} ${session.startTime}`);
          return sessionDate >= now;
        });

        // Sessions today
        const todaySessions = upcomingSessions.filter(session => {
          const sessionDate = new Date(`${session.date} ${session.startTime}`);
          return sessionDate >= today && sessionDate < tomorrow;
        });

        // Sessions this week
        const thisWeekSessions = upcomingSessions.filter(session => {
          const sessionDate = new Date(`${session.date} ${session.startTime}`);
          return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
        });

        // Calculate trend (compare with last week)
        const lastWeekStart = new Date(startOfWeek);
        lastWeekStart.setDate(startOfWeek.getDate() - 7);
        const lastWeekEnd = new Date(endOfWeek);
        lastWeekEnd.setDate(endOfWeek.getDate() - 7);

        const lastWeekSessions = sessions.filter(session => {
          const sessionDate = new Date(`${session.date} ${session.startTime}`);
          return sessionDate >= lastWeekStart && sessionDate <= lastWeekEnd;
        });

        let trendPercentage = 0;
        let trendPositive = true;

        if (lastWeekSessions.length > 0) {
          const change = thisWeekSessions.length - lastWeekSessions.length;
          trendPercentage = Math.round((Math.abs(change) / lastWeekSessions.length) * 100);
          trendPositive = change >= 0;
        } else if (thisWeekSessions.length > 0) {
          trendPercentage = 100;
          trendPositive = true;
        }

        setStats({
          totalUpcoming: upcomingSessions.length,
          todaySessions: todaySessions.length,
          thisWeekSessions: thisWeekSessions.length,
          trendPercentage,
          trendPositive
        });

      } catch (error) {
        console.error('Error calculating session stats:', error);
        setStats({
          totalUpcoming: 0,
          todaySessions: 0,
          thisWeekSessions: 0,
          trendPercentage: 0,
          trendPositive: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    calculateStats();

    // Listen for storage changes to update stats when sessions are modified
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sessions') {
        calculateStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events when sessions are updated in the same tab
    const handleSessionsUpdate = () => {
      calculateStats();
    };

    window.addEventListener('sessionsUpdated', handleSessionsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionsUpdated', handleSessionsUpdate);
    };
  }, []);

  return { stats, isLoading };
};
