import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ModernIcon from '../components/ModernIcon';
import ServerInfoCard from '../components/ServerInfoCard';
import { 
  AlertTriangle,
  TrendingUp,
  Clock,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

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
    systemHealth: 85
  });
  const [loading, setLoading] = useState(true);

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
      
      // Load devices
      const devices = await window.electronAPI.devices.getAll();
      const activeDevices = devices.filter((d: any) => d.status === 'active').length;
      
      // Load tasks
      const tasks = await window.electronAPI.tasks.getAll();
      const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
      
      // Load projects
      const projects = await window.electronAPI.projects.getAll();
      const activeProjects = projects.filter((p: any) => p.status === 'active').length;
      
      // Load users (admin only)
      let totalUsers = 0;
      if (isAdmin()) {
        const users = await window.electronAPI.users.getAll();
        totalUsers = users.length;
      }

      setStats({
        totalDevices: devices.length,
        activeDevices,
        totalTasks: tasks.length,
        completedTasks,
        totalProjects: projects.length,
        activeProjects,
        totalUsers,
        systemHealth: 85 // This would come from system monitoring
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t('dashboard.totalDevices'),
      subtitle: t('dashboard.totalDevicesSubtitle'),
      value: stats.totalDevices,
      change: '+12%',
      changeType: 'positive' as const,
      icon: 'devices',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: t('dashboard.activeDevices'),
      subtitle: t('dashboard.activeDevicesSubtitle'),
      value: stats.activeDevices,
      change: '+5%',
      changeType: 'positive' as const,
      icon: 'system',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: t('dashboard.totalTasks'),
      subtitle: t('dashboard.totalTasksSubtitle'),
      value: stats.totalTasks,
      change: '+8%',
      changeType: 'positive' as const,
      icon: 'tasks',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: t('dashboard.completedTasks'),
      subtitle: t('dashboard.completedTasksSubtitle'),
      value: stats.completedTasks,
      change: '+15%',
      changeType: 'positive' as const,
      icon: 'tasks',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      title: t('dashboard.activeProjects'),
      subtitle: t('dashboard.activeProjectsSubtitle'),
      value: stats.activeProjects,
      change: '+3%',
      changeType: 'positive' as const,
      icon: 'projects',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    ...(isAdmin() ? [{
      title: t('dashboard.totalUsers'),
      subtitle: t('dashboard.totalUsersSubtitle'),
      value: stats.totalUsers,
      change: '+2%',
      changeType: 'positive' as const,
      icon: 'users',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    }] : [])
  ];

  // Sample data for charts
  const systemPerformanceData = [
    { time: '00:00', cpu: 20, memory: 45, disk: 30 },
    { time: '04:00', cpu: 15, memory: 40, disk: 32 },
    { time: '08:00', cpu: 60, memory: 70, disk: 35 },
    { time: '12:00', cpu: 80, memory: 85, disk: 40 },
    { time: '16:00', cpu: 70, memory: 75, disk: 38 },
    { time: '20:00', cpu: 40, memory: 50, disk: 33 },
  ];

  const deviceStatusData = [
    { name: t('dashboard.deviceStatus.active'), value: stats.activeDevices, color: '#10B981' },
    { name: t('dashboard.deviceStatus.inactive'), value: stats.totalDevices - stats.activeDevices, color: '#EF4444' },
    { name: t('dashboard.deviceStatus.maintenance'), value: 2, color: '#F59E0B' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-2xl p-8 border border-primary/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-lg text-muted-foreground">
                Here's what's happening with your IT infrastructure today
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          return (
            <div key={index} className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{stat.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{stat.subtitle}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <ModernIcon name={stat.icon} size={20} className={stat.color} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">{stat.change} from last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Server Information Card - Only show in Server mode */}
      {currentMode === 'server' && (
        <div className="mb-8">
          <ServerInfoCard />
        </div>
      )}

      {/* Modern Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Performance Chart */}
        <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">System Performance</h3>
                <p className="text-sm text-muted-foreground">Real-time resource utilization</p>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={systemPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={3} name={t('dashboard.charts.cpu')} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={3} name={t('dashboard.charts.memory')} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="disk" stroke="#F59E0B" strokeWidth={3} name={t('dashboard.charts.disk')} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Status Chart */}
        <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Device Status</h3>
                <p className="text-sm text-muted-foreground">Current device distribution</p>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-6">
            {deviceStatusData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <span className="text-sm text-muted-foreground">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Recent Activity */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Latest system events and updates</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">New device registered: LAPTOP-001</p>
              <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
            </div>
            <div className="text-xs text-green-600 font-medium">Success</div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Task completed: Update antivirus software</p>
              <p className="text-xs text-muted-foreground mt-1">15 minutes ago</p>
            </div>
            <div className="text-xs text-blue-600 font-medium">Completed</div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">System alert: High CPU usage detected</p>
              <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
            </div>
            <div className="text-xs text-yellow-600 font-medium">Warning</div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">New project created: Network Security Audit</p>
              <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
            </div>
            <div className="text-xs text-purple-600 font-medium">Created</div>
          </div>
        </div>
      </div>

      {/* Modern System Health Alert */}
      {stats.systemHealth < 80 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">System Health Alert</h3>
              <p className="text-sm text-red-700 mb-3">
                System health is at {stats.systemHealth}%. Consider checking device performance and running maintenance tasks.
              </p>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                  Run Diagnostics
                </button>
                <button className="px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
