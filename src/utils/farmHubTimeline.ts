import type { DailyLogEntry, GrowPlant, TimelineEntry } from '../types/farmHub';

export function buildTimeline(plants: GrowPlant[], logs: DailyLogEntry[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const p of plants) {
    entries.push({
      id: `t-start-${p.id}`,
      plantId: p.id,
      date: p.startedAt.slice(0, 10),
      type: 'growth',
      title: `${p.name} 재배 시작`,
      detail: `${p.growMethod === 'hydro' ? '수경' : '토양'} · ${envLabel(p.growEnvironment)}`,
    });
    const plantLogs = logs.filter((l) => l.plantId === p.id).sort((a, b) => a.date.localeCompare(b.date));
    for (const l of plantLogs) {
      entries.push({
        id: `t-log-${l.id}`,
        plantId: p.id,
        date: l.date,
        type: 'log',
        title: '생산일지',
        detail: `${l.watered ? '물주기 ✓' : '물주기 —'} · ${l.statusCheck} · ${l.memo.slice(0, 40)}${l.memo.length > 40 ? '…' : ''}`,
      });
    }
    if (p.harvest) {
      entries.push({
        id: `t-hv-${p.id}`,
        plantId: p.id,
        date: p.harvest.harvestedAt.slice(0, 10),
        type: 'harvest',
        title: '수확 완료',
        detail: `총 ${Math.round(p.harvest.totalGrams)}g · 생존율 ${Math.round(p.harvest.survivalRate * 100)}%`,
      });
    }
  }

  return entries.sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    if (d !== 0) return d;
    return b.id.localeCompare(a.id);
  });
}

function envLabel(e: GrowPlant['growEnvironment']): string {
  if (e === 'urban') return '도시형';
  if (e === 'garden') return '텃밭형';
  return '공장형';
}
