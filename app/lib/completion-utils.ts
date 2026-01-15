import { Habit } from "./recurrence-types";
import { Completion } from "./completion-types";
import { isHabitActiveOnDate, getActiveDatesInRange } from "./recurrence-utils";

export function getCompletionsForDate(
  completions: Completion[],
  habitId: string,
  date: Date
): Completion[] {
  const dateStr = date.toISOString().split("T")[0];
  return completions.filter(
    (c) => c.habit_id === habitId && c.completed_date === dateStr
  );
}

export function getTotalCountForDate(
  completions: Completion[],
  habitId: string,
  date: Date
): number {
  const dayCompletions = getCompletionsForDate(completions, habitId, date);
  return dayCompletions.reduce((sum, c) => sum + c.count, 0);
}

export function isFullyCompleted(
  habit: Habit,
  completions: Completion[],
  date: Date
): boolean {
  const totalCount = getTotalCountForDate(completions, habit.id, date);

  if (habit.completion_type === "simple") {
    return totalCount > 0;
  } else {
    return totalCount >= (habit.target_count || 0);
  }
}

export function getCompletionProgress(
  habit: Habit,
  completions: Completion[],
  date: Date
): number {
  if (habit.completion_type === "simple") {
    return isFullyCompleted(habit, completions, date) ? 1 : 0;
  }

  const totalCount = getTotalCountForDate(completions, habit.id, date);
  const target = habit.target_count || 1;
  return Math.min(totalCount / target, 1);
}

export function calculateStreak(
  habit: Habit,
  completions: Completion[],
  fromDate: Date = new Date()
): number {
  let streak = 0;
  const currentDate = new Date(fromDate);

  while (true) {
    if (
      isHabitActiveOnDate(
        habit,
        currentDate,
        completions.map((c) => ({ date: new Date(c.completed_date) }))
      )
    ) {
      if (isFullyCompleted(habit, completions, currentDate)) {
        streak++;
      } else {
        break;
      }
    }

    currentDate.setDate(currentDate.getDate() - 1);

    if (
      currentDate < new Date(fromDate.getTime() - 365 * 24 * 60 * 60 * 1000)
    ) {
      break;
    }
  }

  return streak;
}

export function calculateCompletionRate(
  habit: Habit,
  completions: Completion[],
  startDate: Date,
  endDate: Date
): number {
  const activeDates = getActiveDatesInRange(
    habit,
    startDate,
    endDate,
    completions.map((c) => ({ date: new Date(c.completed_date) }))
  );

  if (activeDates.length === 0) return 0;

  const completedDates = activeDates.filter((date) =>
    isFullyCompleted(habit, completions, date)
  );

  return completedDates.length / activeDates.length;
}

export function getHabitStatistics(
  habit: Habit,
  completions: Completion[],
  startDate: Date,
  endDate: Date
) {
  const activeDates = getActiveDatesInRange(
    habit,
    startDate,
    endDate,
    completions.map((c) => ({ date: new Date(c.completed_date) }))
  );

  if (habit.completion_type === "simple") {
    // Simple habits: count completed days
    const completedDates = activeDates.filter((date) =>
      isFullyCompleted(habit, completions, date)
    );

    return {
      totalActiveDays: activeDates.length,
      completedDays: completedDates.length,
      completionRate:
        activeDates.length > 0 ? completedDates.length / activeDates.length : 0,
      totalCount: completedDates.length,
      currentStreak: calculateStreak(habit, completions, endDate),
      partiallyCompletedDays: 0,
    };
  } else {
    // Count habits: count total completions vs total target
    const totalTarget = activeDates.length * (habit.target_count || 1);
    const totalCompleted = completions
      .filter((c) => {
        const date = new Date(c.completed_date);
        return date >= startDate && date <= endDate;
      })
      .reduce((sum, c) => sum + c.count, 0);

    const completedDates = activeDates.filter((date) =>
      isFullyCompleted(habit, completions, date)
    );

    const partiallyCompletedDays = activeDates.filter((date) => {
      const count = getTotalCountForDate(completions, habit.id, date);
      const target = habit.target_count || 1;
      return count > 0 && count < target;
    }).length;

    return {
      totalActiveDays: activeDates.length,
      completedDays: completedDates.length,
      completionRate: totalTarget > 0 ? totalCompleted / totalTarget : 0,
      totalCount: totalCompleted,
      currentStreak: calculateStreak(habit, completions, endDate),
      partiallyCompletedDays,
    };
  }
}
