export interface PerformancePoint {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
  ts: number;
}

export function mapMonitoringRows(rows: Array<Record<string, unknown>>): PerformancePoint[] {
  return [...rows]
    .reverse()
    .map((row) => {
      const recordedAt = String(row.recorded_at ?? '');
      const date = new Date(recordedAt);
      const ts = Number.isNaN(date.getTime()) ? Date.now() : date.getTime();
      return {
        time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.round(Number(row.cpu_usage) || 0),
        memory: Math.round(Number(row.memory_usage) || 0),
        disk: Math.round(Number(row.disk_usage) || 0),
        ts,
      };
    });
}

export function downsamplePerformanceHistory(
  points: PerformancePoint[],
  maxPoints = 24
): PerformancePoint[] {
  if (points.length <= maxPoints) return points;

  const step = Math.ceil(points.length / maxPoints);
  const result: PerformancePoint[] = [];

  for (let i = 0; i < points.length; i += step) {
    const chunk = points.slice(i, i + step);
    const last = chunk[chunk.length - 1];
    const avg = (key: 'cpu' | 'memory' | 'disk') =>
      Math.round(chunk.reduce((sum, p) => sum + p[key], 0) / chunk.length);

    result.push({
      time: last.time,
      ts: last.ts,
      cpu: avg('cpu'),
      memory: avg('memory'),
      disk: avg('disk'),
    });
  }

  return result;
}

export function appendLivePoint(
  history: PerformancePoint[],
  metrics: { cpu: number; memory: number; disk: number },
  maxPoints = 120
): PerformancePoint[] {
  const now = new Date();
  const point: PerformancePoint = {
    time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    cpu: Math.round(metrics.cpu),
    memory: Math.round(metrics.memory),
    disk: Math.round(metrics.disk),
    ts: now.getTime(),
  };

  const last = history[history.length - 1];
  if (last && now.getTime() - last.ts < 25_000) {
    return history.map((p, i) => (i === history.length - 1 ? point : p));
  }

  const next = [...history, point];
  return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
}

export function computeSystemHealth(metrics: { cpu: number; memory: number; disk: number }): number {
  const load = (metrics.cpu + metrics.memory + metrics.disk) / 3;
  return Math.max(0, Math.min(100, Math.round(100 - load)));
}
