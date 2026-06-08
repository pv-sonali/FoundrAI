import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Users, Briefcase, RefreshCw, BarChart2, DollarSign, Key, ListFilter } from 'lucide-react';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'founder' | 'admin';
  subscription: 'free' | 'pro' | 'enterprise';
  aiCredits: number;
}

interface AuditLog {
  _id: string;
  userId?: {
    name: string;
    email: string;
  };
  action: string;
  details: string;
  ipAddress?: string;
  creditsUsed: number;
  createdAt: string;
}

export const AdminPanel: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load user list
      const usersRes = await apiRequest('/admin/users');
      // Load stats and logs
      const statsRes = await apiRequest('/admin/analytics');

      if (usersRes.success && statsRes.success) {
        setUsers(usersRes.users || []);
        setStats(statsRes.stats);
        setAuditLogs(statsRes.auditLogs || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadData();
    }
  }, [currentUser]);

  const handleUpdateCredits = async (targetUser: UserRecord, amount: number) => {
    setUpdatingId(targetUser._id);
    try {
      const res = await apiRequest(`/admin/users/${targetUser._id}`, {
        method: 'PUT',
        body: {
          aiCredits: Math.max(0, targetUser.aiCredits + amount),
        },
      });

      if (res.success && res.user) {
        setUsers((prev) => prev.map((u) => (u._id === targetUser._id ? { ...u, aiCredits: res.user.aiCredits } : u)));
      }
    } catch (err) {
      console.error('Failed to update credits:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpgradeTier = async (targetUser: UserRecord, tier: 'free' | 'pro' | 'enterprise') => {
    setUpdatingId(targetUser._id);
    try {
      const res = await apiRequest(`/admin/users/${targetUser._id}`, {
        method: 'PUT',
        body: {
          subscription: tier,
          aiCredits: tier === 'pro' ? 250 : tier === 'enterprise' ? 1000 : 20,
        },
      });

      if (res.success && res.user) {
        setUsers((prev) => prev.map((u) => (u._id === targetUser._id ? { ...u, subscription: res.user.subscription, aiCredits: res.user.aiCredits } : u)));
      }
    } catch (err) {
      console.error('Failed to change user tier:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex h-64 items-center justify-center text-red-400 select-none font-mono text-xs">
        ACCESS DENIED. ADMINISTRATOR PRIVILEGES REQUIRED.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in select-none">
      {/* Header */}
      <div className="border-b border-dark-border pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-gold" />
            Admin Cockpit & Telemetry
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage SaaS users, customize credits, monitor database logs, and review platform MRR growth.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-custom border border-dark-border hover:border-gold/50 bg-dark-card hover:bg-dark-border text-white text-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-gold' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-gold"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Scorecards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-custom border border-dark-border bg-dark-card p-5">
              <div className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> Total SaaS Users
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-2">{stats?.totalUsers || 0}</div>
            </div>

            <div className="rounded-custom border border-dark-border bg-dark-card p-5">
              <div className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" /> Active Startups
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-2">{stats?.totalStartups || 0}</div>
            </div>

            <div className="rounded-custom border border-dark-border bg-dark-card p-5">
              <div className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                <Key className="h-3.5 w-3.5" /> Total Credits Used
              </div>
              <div className="text-2xl font-bold text-gold font-mono mt-2">{stats?.totalCreditsSpent || 0}</div>
            </div>

            <div className="rounded-custom border border-dark-border bg-dark-card p-5">
              <div className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-gold" /> Estimated MRR
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-2">${stats?.monthlyRecurringRevenue || 0}/mo</div>
            </div>
          </div>

          {/* User Management & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* User List Table */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gold" /> Account Credit Allocations
              </h3>
              
              <div className="rounded-custom border border-dark-border bg-dark-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-dark-border bg-black/60">
                        <th className="px-4 py-3 text-[10px] uppercase font-mono text-gray-400">Founder</th>
                        <th className="px-4 py-3 text-[10px] uppercase font-mono text-gray-400">Plan</th>
                        <th className="px-4 py-3 text-[10px] uppercase font-mono text-gray-400">Credits</th>
                        <th className="px-4 py-3 text-[10px] uppercase font-mono text-gray-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/60">
                      {users.map((item) => (
                        <tr key={item._id} className="hover:bg-dark-border/10 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white">{item.name}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{item.email}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="uppercase font-mono text-[10px] text-gray-300">
                              {item.subscription}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-gold font-bold">
                            {item.aiCredits}
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-1">
                            <button
                              disabled={updatingId === item._id}
                              onClick={() => handleUpdateCredits(item, 50)}
                              className="rounded-md border border-dark-border hover:border-gold bg-black hover:bg-gold hover:text-black text-[9px] font-semibold px-2 py-1 transition-all cursor-pointer"
                            >
                              +50 Cr
                            </button>
                            <button
                              disabled={updatingId === item._id}
                              onClick={() => handleUpgradeTier(item, item.subscription === 'free' ? 'pro' : 'free')}
                              className="rounded-md border border-dark-border hover:border-gold bg-black text-[9px] font-mono px-2 py-1 transition-all cursor-pointer"
                            >
                              Swap Plan
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Credit Timeline Usage Chart */}
            <div className="rounded-custom border border-dark-border bg-dark-card p-6 flex flex-col justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4 text-gold" /> Credit Utilization Volume
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.usageTimeline || []}>
                    <XAxis dataKey="day" stroke="#555555" fontSize={11} tickLine={false} />
                    <YAxis stroke="#555555" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111111', borderColor: '#222222', borderRadius: '8px' }}
                      itemStyle={{ color: '#ffffff', fontSize: '11px' }}
                    />
                    <Bar dataKey="credits" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Audit Logs */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <ListFilter className="h-4 w-4 text-gold" /> System Activity Audit Logs
            </h3>
            <div className="rounded-custom border border-dark-border bg-dark-card overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-dark-border bg-black/60">
                      <th className="px-4 py-2.5 text-[9px] uppercase font-mono text-gray-400">Timestamp</th>
                      <th className="px-4 py-2.5 text-[9px] uppercase font-mono text-gray-400">Actor</th>
                      <th className="px-4 py-2.5 text-[9px] uppercase font-mono text-gray-400">Action Code</th>
                      <th className="px-4 py-2.5 text-[9px] uppercase font-mono text-gray-400">Operation Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/40 font-mono">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-dark-border/10 transition-colors">
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-white">
                          {log.userId ? log.userId.name : 'System Guest'}
                        </td>
                        <td className="px-4 py-2.5 text-gold font-bold">
                          {log.action}
                        </td>
                        <td className="px-4 py-2.5 text-gray-400">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
