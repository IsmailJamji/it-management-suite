import React, { useCallback, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  appendLivePoint,
  computeSystemHealth,
  downsamplePerformanceHistory,
  mapMonitoringRows,
  PerformancePoint,
} from '../../utils/performanceChart';

interface SystemPerformanceChartProps {
  labels: { cpu: string; memory: string; disk: string; noData: string };
  onHealthChange?: (health: number) => void;
  pollIntervalMs?: number;
}

const CHART_LINES = [
  { key: 'cpu' as const, color: '#4318FF' },
  { key: 'memory' as const, color: '#05CD99' },
  { key: 'disk' as const, color: '#FF6B35' },
];

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-xl border border-border/40 bg-white px-3 py-2"
      style={{ boxShadow: '0 4px 24px rgba(112,144,176,0.15)' }}
    >
      <p className="mb-1 text-xs font-semibold text-cloud-navy">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs text-cloud-muted">
          <span style={{ color: entry.color }} className="font-semibold">
            {entry.name}
          </span>
          {' : '}
          <span className="font-medium text-cloud-navy">{entry.value}%</span>
        </p>
      ))}
    </div>
  );
};

const SystemPerformanceChart: React.FC<SystemPerformanceChartProps> = ({
  labels,
  onHealthChange,
  pollIntervalMs = 30_000,
}) => {
  const [data, setData] = useState<PerformancePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshLive = useCallback(async () => {
    if (!window.electronAPI?.system?.getLiveMetrics) return;

    try {
      const metrics = await window.electronAPI.system.getLiveMetrics();
      onHealthChange?.(computeSystemHealth(metrics));
      setData((prev) => {
        const updated = appendLivePoint(prev, metrics);
        return downsamplePerformanceHistory(updated, 24);
      });
    } catch (error) {
      console.error('Failed to load live metrics:', error);
    }
  }, [onHealthChange]);

  const loadHistory = useCallback(async () => {
    if (!window.electronAPI?.system) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let deviceId = await window.electronAPI.system.getCurrentDeviceId?.();

      if (!deviceId) {
        deviceId = await window.electronAPI.system.registerDevice();
      }

      let history: PerformancePoint[] = [];

      if (deviceId) {
        const rows = await window.electronAPI.system.getMonitoringData(deviceId, 24);
        if (Array.isArray(rows) && rows.length > 0) {
          history = downsamplePerformanceHistory(mapMonitoringRows(rows), 24);
        }
      }

      if (history.length > 0) {
        setData(history);
        const last = history[history.length - 1];
        onHealthChange?.(computeSystemHealth(last));
      }

      await refreshLive();
    } catch (error) {
      console.error('Failed to load performance history:', error);
      await refreshLive();
    } finally {
      setLoading(false);
    }
  }, [onHealthChange, refreshLive]);

  useEffect(() => {
    loadHistory();
    const interval = setInterval(refreshLive, pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadHistory, refreshLive, pollIntervalMs]);

  if (loading && data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-cloud-muted">
        {labels.noData}
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF7" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#A3AED0', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#A3AED0', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs font-medium text-cloud-muted">{value}</span>
            )}
          />
          {CHART_LINES.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              name={labels[line.key]}
              animationDuration={400}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SystemPerformanceChart;
