import { Habit, Recurrence, EndRule, MonthlyPattern } from "./recurrence-types";

export function isHabitActiveOnDate(
  habit: Habit,
  date: Date,
  completionHistory?: { date: Date }[]
): boolean {
  const { recurrence, created_at } = habit;
  const habitStart = new Date(created_at);

  if (date < habitStart) return false;

  if (!isWithinEndRule(date, recurrence.ends, habitStart, completionHistory)) {
    return false;
  }

  switch (recurrence.type) {
    case "daily":
      return isActiveDaily(date, habitStart, recurrence.interval);
    case "weekly":
      return isActiveWeekly(
        date,
        habitStart,
        recurrence.interval,
        recurrence.days
      );
    case "monthly":
      return isActiveMonthly(
        date,
        habitStart,
        recurrence.interval,
        recurrence.pattern
      );
    case "custom":
      return isActiveCustom(date, habitStart, recurrence.days);
    default:
      return false;
  }
}

function isWithinEndRule(
  date: Date,
  endRule: EndRule,
  habitStart: Date,
  completionHistory?: { date: Date }[]
): boolean {
  if (endRule.type === "never") return true;

  if (endRule.type === "on") {
    const endDate = new Date(endRule.date);
    return date <= endDate;
  }

  if (endRule.type === "after" && completionHistory) {
    const completedCount = completionHistory.filter(
      (c) => c.date <= date
    ).length;
    return completedCount < endRule.count;
  }

  return true;
}

function isActiveDaily(date: Date, start: Date, interval: number): boolean {
  const daysDiff = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysDiff >= 0 && daysDiff % interval === 0;
}

function isActiveWeekly(
  date: Date,
  start: Date,
  interval: number,
  activeDays: number[]
): boolean {
  const dayOfWeek = (date.getDay() + 6) % 7;
  if (!activeDays.includes(dayOfWeek)) return false;

  const weeksDiff = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  return weeksDiff >= 0 && weeksDiff % interval === 0;
}

function isActiveMonthly(
  date: Date,
  start: Date,
  interval: number,
  pattern: MonthlyPattern
): boolean {
  const monthsDiff =
    (date.getFullYear() - start.getFullYear()) * 12 +
    (date.getMonth() - start.getMonth());

  if (monthsDiff < 0 || monthsDiff % interval !== 0) return false;

  if (pattern.type === "day") {
    return date.getDate() === pattern.day;
  }

  if (pattern.type === "weekday") {
    return isNthWeekdayOfMonth(date, pattern.weekday, pattern.occurrence);
  }

  return false;
}

function isActiveCustom(date: Date, start: Date, dayInterval: number): boolean {
  const daysDiff = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysDiff >= 0 && daysDiff % dayInterval === 0;
}

function isNthWeekdayOfMonth(
  date: Date,
  weekday: number,
  occurrence: number
): boolean {
  const dayOfWeek = (date.getDay() + 6) % 7;
  if (dayOfWeek !== weekday) return false;

  const dayOfMonth = date.getDate();
  const nthOccurrence = Math.ceil(dayOfMonth / 7);

  if (occurrence === -1) {
    const nextWeek = new Date(date);
    nextWeek.setDate(date.getDate() + 7);
    return nextWeek.getMonth() !== date.getMonth();
  }

  return nthOccurrence === occurrence;
}

export function getActiveDatesInRange(
  habit: Habit,
  startDate: Date,
  endDate: Date,
  completionHistory?: { date: Date }[]
): Date[] {
  const activeDates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    if (isHabitActiveOnDate(habit, current, completionHistory)) {
      activeDates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return activeDates;
}

export function formatRecurrence(recurrence: Recurrence): string {
  let base = "";

  switch (recurrence.type) {
    case "daily":
      base =
        recurrence.interval === 1
          ? "Daily"
          : `Every ${recurrence.interval} days`;
      break;

    case "weekly": {
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const days = recurrence.days.map((d) => dayNames[d]).join(", ");
      base =
        recurrence.interval === 1
          ? `Weekly on ${days}`
          : `Every ${recurrence.interval} weeks on ${days}`;
      break;
    }

    case "monthly": {
      if (recurrence.pattern.type === "day") {
        base =
          recurrence.interval === 1
            ? `Monthly on day ${recurrence.pattern.day}`
            : `Every ${recurrence.interval} months on day ${recurrence.pattern.day}`;
      } else {
        const weekdays = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        const ordinals = ["first", "second", "third", "fourth"];
        const ordinal =
          recurrence.pattern.occurrence === -1
            ? "last"
            : ordinals[recurrence.pattern.occurrence - 1];
        const weekday = weekdays[recurrence.pattern.weekday];
        base =
          recurrence.interval === 1
            ? `Monthly on the ${ordinal} ${weekday}`
            : `Every ${recurrence.interval} months on the ${ordinal} ${weekday}`;
      }
      break;
    }

    case "custom":
      base = `Every ${recurrence.days} days`;
      break;
  }

  if (recurrence.ends.type === "on") {
    return `${base}, until ${new Date(
      recurrence.ends.date
    ).toLocaleDateString()}`;
  } else if (recurrence.ends.type === "after") {
    return `${base}, ${recurrence.ends.count} times`;
  }

  return base;
}
