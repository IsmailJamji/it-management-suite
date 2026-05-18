import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import CloudCard from '../components/ui/CloudCard';
import ProgressBar from '../components/ui/ProgressBar';
import ServerInfoCard from '../components/ServerInfoCard';
import ModernIcon from '../components/ModernIcon';
import {
  RefreshCw,
  Monitor,
  CheckCircle2,
  FolderKanban,
  ArrowRight,
  Wifi,
} from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import SystemPerformanceChart from '../components/charts/SystemPerformanceChart';

interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  totalTasks: number;
  completedTasks: number;
  totalProjects: number;
  activeProjects: number;
  totalUsers: number;
  systemHealth: number;
}

const CHART_COLORS = ['#05CD99', '#FF6B35', '#4318FF'];

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [currentMode, setCurrentMode] = useState<'server' | 'client' | 'local' | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalDevices: 0,
    activeDevices: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalUsers: 0,
    systemHealth: 0,
  });
  const [loading, setLoading] = useState(true);

  const handleHealthChange = (health: number) => {
    setStats((prev) => ({ ...prev, systemHealth: health }));
  };

  useEffect(() => {
    loadDashboardData();
    loadCurrentMode();
  }, []);

  const loadCurrentMode = async () => {
    try {
      if (window.electronAPI?.installation) {
        const config = await window.electronAPI.installation.getConfig();
        setCurrentMode(config?.mode || null);
      }
    } catch (error) {
      console.error('Failed to load current mode:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const devices = await window.electronAPI.devices.getAll();
      const activeDevices = devices.filter((d: { status: string }) => d.status === 'active').length;
      const tasks = await window.electronAPI.tasks.getAll();
      const completedTasks = tasks.filter((t: { status: string }) => t.status === 'completed').length;
      const projects = await window.electronAPI.projects.getAll();
      const activeProjects = projects.filter((p: { status: string }) => p.status === 'active').length;

      let totalUsers = 0;
      if (isAdmin()) {
        const users = await window.electronAPI.users.getAll();
        totalUsers = users.length;
      }

      setStats((prev) => ({
        ...prev,
        totalDevices: devices.length,
        activeDevices,
        totalTasks: tasks.length,
        completedTasks,
        totalProjects: projects.length,
        activeProjects,
        totalUsers,
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const taskCompletionRate = stats.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;
  const deviceActiveRate = stats.totalDevices
    ? Math.round((stats.activeDevices / stats.totalDevices) * 100)
    : 0;
  const projectActiveRate = stats.totalProjects
    ? Math.round((stats.activeProjects / stats.totalProjects) * 100)
    : 0;

  const kpiCards = useMemo(
    () => [
      {
        label: t('dashboard.activeDevices'),
        value: stats.activeDevices,
        icon: Monitor,
        color: 'text-primary',
        bg: 'bg-accent',
      },
      {
        label: t('dashboard.completedTasks'),
        value: stats.completedTasks,
        icon: CheckCircle2,
        color: 'text-cloud-green',
        bg: 'bg-emerald-50',
      },
      {
        label: t('dashboard.activeProjects'),
        value: stats.activeProjects,
        icon: FolderKanban,
        color: 'text-cloud-orange',
        bg: 'bg-orange-50',
      },
    ],
    [stats, t]
  );

  const deviceStatusData = [
    { name: t('dashboard.deviceStatus.active'), value: stats.activeDevices, color: CHART_COLORS[0] },
    {
      name: t('dashboard.deviceStatus.inactive'),
      value: Math.max(0, stats.totalDevices - stats.activeDevices),
      color: CHART_COLORS[1],
    },
    { name: t('dashboard.deviceStatus.maintenance'), value: 0, color: CHART_COLORS[2] },
  ].filter((d) => d.value > 0 || stats.totalDevices === 0);

  const recentActivity = [
    {
      label: `${stats.totalDevices} ${t('dashboard.totalDevices').toLowerCase()}`,
      type: t('dashboard.activity.inventory'),
      date: t('dashboard.activity.today'),
      status: 'ok',
    },
    {
      label: `${stats.completedTasks}/${stats.totalTasks} ${t('dashboard.totalTasks').toLowerCase()}`,
      type: t('dashboard.activity.tasks'),
      date: t('dashboard.activity.today'),
      status: 'done',
    },
    {
      label: `${stats.activeProjects} ${t('dashboard.activeProjects').toLowerCase()}`,
      type: t('dashboard.activity.projects'),
      date: t('dashboard.activity.week'),
      status: 'info',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête type CloudCash */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-cloud-navy md:text-3xl">
            {t('dashboard.weeklySumup')}, {user?.firstName}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-cloud-muted md:text-base">
            {t('dashboard.weeklySumupDesc')}
          </p>
        </div>
        <button
          type="button"
          onClick={loadDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-cloud-navy shadow-cloud transition hover:shadow-cloud-lg disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('actions.refresh')}
        </button>
      </div>

      {/* Ligne principale : carte santé + KPIs */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <CloudCard className="xl:col-span-7 overflow-hidden p-0" hover>
          <div className="grid md:grid-cols-2">
            <div className="relative min-h-[200px] bg-gradient-to-br from-primary via-[#5B4FFF] to-cloud-blue-light p-6 text-white md:min-h-[240px]">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 right-12 h-20 w-20 rounded-full bg-white/10" />
              <Wifi className="mb-4 h-8 w-8 opacity-90" />
              <p className="text-sm font-medium text-white/80">{t('dashboard.infrastructureHealth')}</p>
              <p className="mt-2 text-4xl font-bold">{stats.systemHealth}%</p>
              <p className="mt-2 text-xs text-white/70">{t('dashboard.healthScore')}</p>
            </div>
            <div className="flex flex-col justify-center gap-5 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cloud-muted">
                  {t('dashboard.totalDevices')}
                </p>
                <p className="text-2xl font-bold text-cloud-navy">{stats.totalDevices}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cloud-muted">
                  {t('dashboard.totalTasks')}
                </p>
                <p className="text-2xl font-bold text-cloud-navy">{stats.totalTasks}</p>
              </div>
              {isAdmin() && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-cloud-muted">
                    {t('dashboard.totalUsers')}
                  </p>
                  <p className="text-2xl font-bold text-cloud-navy">{stats.totalUsers}</p>
                </div>
              )}
              <ProgressBar
                value={stats.systemHealth}
                label={t('dashboard.systemStatus')}
                color="blue"
              />
            </div>
          </div>
        </CloudCard>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:col-span-5 xl:grid-cols-1">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <CloudCard key={kpi.label} className="flex items-center gap-4" hover padding="sm">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${kpi.bg}`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-cloud-muted">{kpi.label}</p>
                  <p className="text-xl font-bold text-cloud-navy">{kpi.value}</p>
                </div>
              </CloudCard>
            );
          })}
        </div>
      </div>

      {currentMode === 'server' && <ServerInfoCard />}

      {/* Statistiques + graphiques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CloudCard className="lg:col-span-1">
          <h3 className="text-lg font-bold text-cloud-navy">{t('dashboard.outcomeStats')}</h3>
          <p className="mb-6 text-sm text-cloud-muted">{t('dashboard.outcomeStatsDesc')}</p>
          <div className="space-y-5">
            <ProgressBar
              value={deviceActiveRate}
              label={t('dashboard.activeDevices')}
              color="green"
            />
            <ProgressBar
              value={taskCompletionRate}
              label={t('dashboard.completedTasks')}
              color="orange"
            />
            <ProgressBar
              value={projectActiveRate}
              label={t('dashboard.activeProjects')}
              color="blue"
            />
          </div>
        </CloudCard>

        <CloudCard className="lg:col-span-2">
          <h3 className="text-lg font-bold text-cloud-navy">{t('dashboard.performance')}</h3>
          <p className="mb-4 text-sm text-cloud-muted">{t('dashboard.performanceDesc')}</p>
          <SystemPerformanceChart
            labels={{
              cpu: t('dashboard.charts.cpu'),
              memory: t('dashboard.charts.memory'),
              disk: t('dashboard.charts.disk'),
              noData: t('dashboard.charts.noData'),
            }}
            onHealthChange={handleHealthChange}
          />
        </CloudCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <CloudCard className="lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-cloud-navy">{t('dashboard.recentActivity')}</h3>
              <p className="text-sm text-cloud-muted">{t('dashboard.recentActivityDesc')}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs font-semibold uppercase tracking-wide text-cloud-muted">
                  <th className="pb-3 pr-4">{t('dashboard.table.event')}</th>
                  <th className="pb-3 pr-4">{t('dashboard.table.type')}</th>
                  <th className="pb-3 pr-4">{t('dashboard.table.date')}</th>
                  <th className="pb-3 text-right">{t('dashboard.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row, i) => (
                  <tr key={i} className="border-b border-border/40 last:border-0">
                    <td className="py-4 pr-4 font-medium text-cloud-navy">{row.label}</td>
                    <td className="py-4 pr-4 text-cloud-muted">{row.type}</td>
                    <td className="py-4 pr-4 text-cloud-muted">{row.date}</td>
                    <td className="py-4 text-right">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          row.status === 'ok'
                            ? 'bg-emerald-50 text-cloud-green'
                            : row.status === 'done'
                              ? 'bg-accent text-primary'
                              : 'bg-orange-50 text-cloud-orange'
                        }`}
                      >
                        {row.status === 'ok' ? 'OK' : row.status === 'done' ? 'Done' : 'Info'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CloudCard>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <CloudCard>
            <h3 className="mb-4 text-lg font-bold text-cloud-navy">{t('dashboard.deviceStatusTitle')}</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceStatusData.length ? deviceStatusData : [{ name: '-', value: 1, color: '#E9EDF7' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(deviceStatusData.length ? deviceStatusData : [{ color: '#E9EDF7' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}`, name]}
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 4px 24px rgba(112,144,176,0.15)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={28}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs text-cloud-muted">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CloudCard>

          <Link
            to="/system"
            className="group relative overflow-hidden rounded-[20px] bg-gradient-to-br from-cloud-orange to-[#FF8F6B] p-6 text-white shadow-lg shadow-cloud-orange/25 transition hover:brightness-105"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" />
            <ModernIcon name="system" size={28} className="mb-3 opacity-90" />
            <p className="text-lg font-bold">{t('dashboard.viewSystem')}</p>
            <p className="mt-1 text-sm text-white/85">{t('dashboard.viewSystemDesc')}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
              {t('actions.view')}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
