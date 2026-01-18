"use client";

import { X } from "lucide-react";
import { Habit } from "@/app/lib/recurrence-types";
import { Completion } from "@/app/lib/completion-types";
import {
  getHabitStatistics,
  isFullyCompleted,
} from "@/app/lib/completion-utils";
import { isHabitActiveOnDate } from "@/app/lib/recurrence-utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsDashboardProps {
  habits: Habit[];
  completions: Completion[];
  onClose: () => void;
}

export default function AnalyticsDashboard({
  habits,
  completions,
  onClose,
}: AnalyticsDashboardProps) {
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const last30Days = getLast30Days();

  const dailyRates = last30Days.map((date) => {
    let totalActive = 0;
    let totalCompleted = 0;

    habits.forEach((habit) => {
      const habitCompletions = completions.filter(
        (c) => c.habit_id === habit.id,
      );
      const isActive = isHabitActiveOnDate(
        habit,
        date,
        habitCompletions.map((c) => ({ date: new Date(c.completed_date) })),
      );

      if (isActive) {
        totalActive++;
        if (isFullyCompleted(habit, completions, date)) {
          totalCompleted++;
        }
      }
    });

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      rate: totalActive > 0 ? (totalCompleted / totalActive) * 100 : 0,
    };
  });

  const dayOfWeekStats = [0, 1, 2, 3, 4, 5, 6].map((dayNum) => {
    const daysInRange = last30Days.filter(
      (d) => (d.getDay() + 6) % 7 === dayNum,
    );

    let totalActive = 0;
    let totalCompleted = 0;

    daysInRange.forEach((date) => {
      habits.forEach((habit) => {
        const habitCompletions = completions.filter(
          (c) => c.habit_id === habit.id,
        );
        const isActive = isHabitActiveOnDate(
          habit,
          date,
          habitCompletions.map((c) => ({ date: new Date(c.completed_date) })),
        );

        if (isActive) {
          totalActive++;
          if (isFullyCompleted(habit, completions, date)) {
            totalCompleted++;
          }
        }
      });
    });

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return {
      day: dayNames[dayNum],
      rate: totalActive > 0 ? (totalCompleted / totalActive) * 100 : 0,
      count: daysInRange.length,
    };
  });

  const bestDay = dayOfWeekStats.reduce((best, curr) =>
    curr.rate > best.rate ? curr : best,
  );
  const worstDay = dayOfWeekStats.reduce((worst, curr) =>
    curr.rate < worst.rate && curr.count > 0 ? curr : worst,
  );

  const habitStats = habits
    .map((habit) => {
      const stats = getHabitStatistics(
        habit,
        completions,
        last30Days[0],
        last30Days[last30Days.length - 1],
      );
      return {
        habit,
        ...stats,
      };
    })
    .sort((a, b) => b.completionRate - a.completionRate);

  const totalActiveHabits = habits.filter((h) => h.status === "active").length;
  const overallRate =
    habitStats.reduce((sum, h) => sum + h.completionRate, 0) /
    (habitStats.length || 1);
  const bestStreak = Math.max(...habitStats.map((h) => h.currentStreak), 0);
  const totalCompletions = completions.filter((c) => {
    const date = new Date(c.completed_date);
    return date >= last30Days[0] && date <= last30Days[last30Days.length - 1];
  }).length;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex items-center justify-between rounded-t-lg z-10">
          <h2 className="text-lg font-semibold text-stone-800">
            Analytics Dashboard
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="text-xs text-emerald-700 font-medium mb-1">
                Active Habits
              </div>
              <div className="text-2xl font-bold text-emerald-900">
                {totalActiveHabits}
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-xs text-blue-700 font-medium mb-1">
                Overall Rate (30d)
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {Math.round(overallRate * 100)}%
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="text-xs text-orange-700 font-medium mb-1">
                Best Streak
              </div>
              <div className="text-2xl font-bold text-orange-900">
                🔥 {bestStreak}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-xs text-purple-700 font-medium mb-1">
                Total Completions
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {totalCompletions}
              </div>
            </div>
          </div>

          {/* Completion Rate Chart */}
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <h3 className="text-sm font-semibold text-stone-800 mb-4">
              Completion Rate - Last 30 Days
            </h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="#6b7280"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    stroke="#6b7280"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number | undefined) =>
                      value !== undefined
                        ? [`${value.toFixed(1)}%`, "Rate"]
                        : ["0%", "Rate"]
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Day of Week & Top Habits */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Day of Week Performance */}
            <div className="bg-white rounded-lg border border-stone-200 p-4">
              <h3 className="text-sm font-semibold text-stone-800 mb-3">
                Day of Week Performance
              </h3>
              <div className="space-y-2">
                {dayOfWeekStats.map((stat) => (
                  <div key={stat.day} className="flex items-center gap-2">
                    <span className="text-xs text-stone-600 w-8 font-medium">
                      {stat.day}
                    </span>
                    <div className="flex-1 bg-stone-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${stat.rate}%` }}
                      >
                        {stat.rate > 20 && (
                          <span className="text-xs text-white font-medium">
                            {stat.rate.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    {stat.rate <= 20 && (
                      <span className="text-xs text-stone-600 w-10 text-right">
                        {stat.rate.toFixed(0)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-stone-200 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Best: {bestDay.day}</span>
                  <span className="text-emerald-600 font-medium">
                    {bestDay.rate.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Worst: {worstDay.day}</span>
                  <span className="text-red-600 font-medium">
                    {worstDay.rate.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Top Performing Habits */}
            <div className="bg-white rounded-lg border border-stone-200 p-4">
              <h3 className="text-sm font-semibold text-stone-800 mb-3">
                Top Habits (30d)
              </h3>
              <div className="space-y-2">
                {habitStats
                  .slice(0, 5)
                  .map(({ habit, completionRate, currentStreak }) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-2 bg-stone-50 rounded-md"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {habit.color && (
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: habit.color }}
                          />
                        )}
                        <span className="text-sm text-stone-800 truncate">
                          {habit.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-emerald-600 font-medium">
                          {Math.round(completionRate * 100)}%
                        </span>
                        {currentStreak > 0 && (
                          <span className="text-xs text-orange-600">
                            🔥 {currentStreak}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Calendar Heatmap */}
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <h3 className="text-sm font-semibold text-stone-800 mb-3">
              Activity Heatmap - Last 30 Days
            </h3>
            <div className="grid grid-cols-10 sm:grid-cols-15 lg:grid-cols-30 gap-1">
              {last30Days.map((date) => {
                let totalActive = 0;
                let totalCompleted = 0;

                habits.forEach((habit) => {
                  const habitCompletions = completions.filter(
                    (c) => c.habit_id === habit.id,
                  );
                  const isActive = isHabitActiveOnDate(
                    habit,
                    date,
                    habitCompletions.map((c) => ({
                      date: new Date(c.completed_date),
                    })),
                  );

                  if (isActive) {
                    totalActive++;
                    if (isFullyCompleted(habit, completions, date)) {
                      totalCompleted++;
                    }
                  }
                });

                const rate = totalActive > 0 ? totalCompleted / totalActive : 0;
                const intensity =
                  rate === 0
                    ? "bg-stone-100"
                    : rate < 0.3
                      ? "bg-emerald-200"
                      : rate < 0.6
                        ? "bg-emerald-400"
                        : rate < 0.9
                          ? "bg-emerald-600"
                          : "bg-emerald-700";

                return (
                  <div
                    key={date.toISOString()}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${intensity} group relative cursor-pointer`}
                    title={`${date.toLocaleDateString()}: ${totalCompleted}/${totalActive}`}
                  >
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-stone-800 text-white text-xs rounded whitespace-nowrap z-20 pointer-events-none">
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      <br />
                      {totalCompleted}/{totalActive} ({Math.round(rate * 100)}%)
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-stone-600">
              <span>Less</span>
              <div className="w-3 h-3 bg-stone-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-700 rounded-sm"></div>
              <span>More</span>
            </div>
          </div>

          {/* All Habits Stats */}
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <h3 className="text-sm font-semibold text-stone-800 mb-3">
              All Habits (Last 30 Days)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2 px-2 text-xs font-medium text-stone-600">
                      Habit
                    </th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-stone-600">
                      Active
                    </th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-stone-600">
                      Done
                    </th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-stone-600">
                      Rate
                    </th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-stone-600">
                      Streak
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {habitStats.map(
                    ({
                      habit,
                      totalActiveDays,
                      completedDays,
                      completionRate,
                      currentStreak,
                    }) => (
                      <tr
                        key={habit.id}
                        className="border-b border-stone-100 hover:bg-stone-50"
                      >
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            {habit.color && (
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: habit.color }}
                              />
                            )}
                            <span className="text-sm text-stone-800 truncate">
                              {habit.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-2 px-2 text-xs text-stone-600">
                          {totalActiveDays}
                        </td>
                        <td className="text-center py-2 px-2 text-xs text-stone-600">
                          {completedDays}
                        </td>
                        <td className="text-center py-2 px-2">
                          <span
                            className={`text-xs font-medium ${
                              completionRate >= 0.8
                                ? "text-emerald-600"
                                : completionRate >= 0.5
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}
                          >
                            {Math.round(completionRate * 100)}%
                          </span>
                        </td>
                        <td className="text-center py-2 px-2 text-xs text-stone-600">
                          {currentStreak > 0 ? `🔥 ${currentStreak}` : "—"}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
