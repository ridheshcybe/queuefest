'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ReceptionistDashboard from '../../components/receptionistdashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[#00478d] text-4xl">
          refresh
        </span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ReceptionistDashboard />;
}