
import { useState, useEffect } from 'react';

interface RevenueStats {
  monthlyRevenue: number;
  outstandingAmount: number;
  recentTransactions: Array<{
    id: string;
    playerName: string;
    sessionType: string;
    amount: number;
    date: string;
  }>;
}

export const useRevenueStats = () => {
  const [stats, setStats] = useState<RevenueStats>({
    monthlyRevenue: 0,
    outstandingAmount: 0,
    recentTransactions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      try {
        const paymentsStr = localStorage.getItem("payments");
        if (!paymentsStr) {
          setStats({
            monthlyRevenue: 0,
            outstandingAmount: 0,
            recentTransactions: []
          });
          setIsLoading(false);
          return;
        }

        const payments = JSON.parse(paymentsStr);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate monthly revenue (paid this month)
        const monthlyRevenue = payments
          .filter(payment => {
            if (payment.status !== 'paid') return false;
            const paymentDate = new Date(payment.paymentDate || payment.createdAt);
            return paymentDate >= startOfMonth;
          })
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // Calculate outstanding amount
        const outstandingAmount = payments
          .filter(payment => payment.status === 'pending' || payment.status === 'overdue')
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // Get recent transactions (last 2 paid)
        const recentTransactions = payments
          .filter(payment => payment.status === 'paid')
          .sort((a, b) => {
            const dateA = new Date(a.paymentDate || a.createdAt || 0);
            const dateB = new Date(b.paymentDate || b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 2)
          .map(payment => ({
            id: payment.id,
            playerName: payment.playerName || 'Unknown Player',
            sessionType: payment.sessionType || 'Session',
            amount: payment.amount || 0,
            date: payment.paymentDate || payment.createdAt
          }));

        setStats({
          monthlyRevenue,
          outstandingAmount,
          recentTransactions
        });

      } catch (error) {
        console.error('Error calculating revenue stats:', error);
        setStats({
          monthlyRevenue: 0,
          outstandingAmount: 0,
          recentTransactions: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    calculateStats();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'payments') {
        calculateStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { stats, isLoading };
};
