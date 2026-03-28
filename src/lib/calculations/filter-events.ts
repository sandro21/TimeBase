import { CalendarEvent } from "./stats";

export function filterEventsByTimeRange(
  events: CalendarEvent[],
  filterType: "Month" | "Year" | "LifeTime",
  year: number,
  month: number,
  minDate: Date | null,
  maxDate: Date | null
): CalendarEvent[] {
  // Always filter out future events (cutoff at today)
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  if (filterType === "LifeTime") {
    return events.filter((event) => event.start <= today);
  }

  if (filterType === "Year") {
    const startOfYear = new Date(year, 0, 1);
    let endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
    
    // Clamp to available date range
    if (minDate && startOfYear < minDate) {
      startOfYear.setTime(minDate.getTime());
    }
    if (maxDate && endOfYear > maxDate) {
      endOfYear.setTime(maxDate.getTime());
    }
    // Always cap at today to exclude future events
    if (endOfYear > today) {
      endOfYear = today;
    }

    return events.filter((event) => {
      const eventDate = event.start;
      return eventDate >= startOfYear && eventDate <= endOfYear;
    });
  }

  if (filterType === "Month") {
    const startOfMonth = new Date(year, month, 1);
    let endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    // Clamp to available date range
    if (minDate && startOfMonth < minDate) {
      startOfMonth.setTime(minDate.getTime());
    }
    if (maxDate && endOfMonth > maxDate) {
      endOfMonth.setTime(maxDate.getTime());
    }
    // Always cap at today to exclude future events
    if (endOfMonth > today) {
      endOfMonth = today;
    }

    return events.filter((event) => {
      const eventDate = event.start;
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  }

  // Default to all events up to today (shouldn't reach here, but just in case)
  return events.filter((event) => event.start <= today);
}

export function getFirstEventDate(events: CalendarEvent[]): Date | null {
  if (events.length === 0) return null;
  
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  return sorted[0].start;
}

export function getLastEventDate(events: CalendarEvent[]): Date | null {
  if (events.length === 0) return null;
  
  const sorted = [...events].sort((a, b) => b.start.getTime() - a.start.getTime());
  return sorted[0].start;
}

