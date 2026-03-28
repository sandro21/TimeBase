import { CalendarEvent } from "@/lib/calculations/stats";

export interface DashboardPayload {
  filter: string;
  totalEvents: number;
  uniqueActivities: number;
  totalHours: number;
  topActivities: {
    name: string;
    count: number;
    hours: number;
    revenue?: number;
  }[];
  isPro: boolean;
  totalRevenue?: number;
  billableHours?: number;
  nonBillableHours?: number;
  avgHourlyRate?: number;
}

export function buildDashboardPayload(
  events: CalendarEvent[],
  filter: string,
  isPro: boolean,
  billingRates: Record<string, number>
): string {
  const totalMinutes = events.reduce((s, e) => s + e.durationMinutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const actMap = new Map<string, { count: number; minutes: number }>();
  for (const e of events) {
    const prev = actMap.get(e.title) ?? { count: 0, minutes: 0 };
    prev.count += 1;
    prev.minutes += e.durationMinutes;
    actMap.set(e.title, prev);
  }

  const sorted = [...actMap.entries()]
    .sort((a, b) => b[1].minutes - a[1].minutes)
    .slice(0, 10);

  let billableMinutes = 0;
  let totalRevenue = 0;

  if (isPro) {
    for (const e of events) {
      const rate = billingRates[e.title] ?? 0;
      const rev = (e.durationMinutes / 60) * rate;
      totalRevenue += rev;
      if (rate > 0) billableMinutes += e.durationMinutes;
    }
  }

  const topActivities = sorted.map(([name, d]) => {
    const hours = Math.round((d.minutes / 60) * 10) / 10;
    const entry: DashboardPayload["topActivities"][number] = {
      name,
      count: d.count,
      hours,
    };
    if (isPro) {
      const rate = billingRates[name] ?? 0;
      entry.revenue = Math.round(hours * rate);
    }
    return entry;
  });

  const payload: DashboardPayload = {
    filter,
    totalEvents: events.length,
    uniqueActivities: actMap.size,
    totalHours,
    topActivities,
    isPro,
  };

  if (isPro) {
    payload.totalRevenue = Math.round(totalRevenue);
    payload.billableHours = Math.round((billableMinutes / 60) * 10) / 10;
    payload.nonBillableHours =
      Math.round(((totalMinutes - billableMinutes) / 60) * 10) / 10;
    const billHrs = billableMinutes / 60;
    payload.avgHourlyRate =
      billHrs > 0 ? Math.round((totalRevenue / billHrs) * 100) / 100 : 0;
  }

  return JSON.stringify(payload);
}
