"use client";

import { useState, useEffect } from "react";

import { Trash, Archive } from "lucide-react";

import { createClient } from "@/app/lib/supabase/client";
import HabitsHeader from "../components/habits/HabitsHeader";
import HabitsCreator from "../components/habits/HabitsCreator";
import { Habit, Recurrence } from "@/app/lib/recurrence-types";
import { Completion } from "@/app/lib/completion-types";
import { isHabitActiveOnDate } from "@/app/lib/recurrence-utils";
import { getHabitStatistics } from "@/app/lib/completion-utils";
import { CompletionCell } from "../components/habits/CompletionCell";

export default function HabitsPage() {
  const supabase = createClient();

  const [view, setView] = useState<"week" | "month">("week");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCompletions, setIsLoadingCompletions] = useState(false);

  const getDateRange = () => {
    if (view === "week") {
      const current = new Date(currentDate);
      const day = current.getDay();
      const diff = current.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(current.setDate(diff));

      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
      }
      return dates;
    } else {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const dates = [];
      for (let i = 1; i <= daysInMonth; i++) {
        dates.push(new Date(year, month, i));
      }
      return dates;
    }
  };

  const dates = getDateRange();

  const getPreviousDateRange = () => {
    if (view === "week") {
      const previousWeekDate = new Date(currentDate);
      previousWeekDate.setDate(previousWeekDate.getDate() - 7);
      return previousWeekDate;
    } else {
      const previousMonthDate = new Date(currentDate);
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
      return previousMonthDate;
    }
  };

  const getNextDateRange = () => {
    if (view === "week") {
      const nextWeekDate = new Date(currentDate);
      nextWeekDate.setDate(nextWeekDate.getDate() + 7);
      return nextWeekDate;
    } else {
      const nextMonthDate = new Date(currentDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      return nextMonthDate;
    }
  };

  const fetchHabits = async () => {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching habits:", error);
      return;
    }

    setHabits(data || []);
  };

  const fetchCompletions = async () => {
    setIsLoadingCompletions(true);
    const fetchStart = new Date(dates[0]);
    fetchStart.setMonth(fetchStart.getMonth() - 3);
    const fetchEnd = new Date(dates[dates.length - 1]);
    fetchEnd.setMonth(fetchEnd.getMonth() + 3);

    const { data, error } = await supabase
      .from("habit_completions")
      .select("*")
      .gte("completed_date", fetchStart.toISOString().split("T")[0])
      .lte("completed_date", fetchEnd.toISOString().split("T")[0])
      .order("completed_date", { ascending: true });

    if (error) {
      console.error("Error fetching completions:", error);
      setIsLoadingCompletions(false);
      return;
    }

    setCompletions(data || []);
    setIsLoadingCompletions(false);
  };

  const handleToggleCompletion = async (
    habitId: string,
    date: Date,
    increment: boolean
  ) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in");
      return;
    }

    const dateStr = date.toISOString().split("T")[0];

    if (habit.completion_type === "simple") {
      const existing = completions.find(
        (c) => c.habit_id === habitId && c.completed_date === dateStr
      );

      if (existing) {
        const { error } = await supabase
          .from("habit_completions")
          .delete()
          .eq("id", existing.id);

        if (error) {
          console.error("Error deleting completion:", error);
          return;
        }

        setCompletions((prev) => prev.filter((c) => c.id !== existing.id));
      } else {
        const { data, error } = await supabase
          .from("habit_completions")
          .insert({
            user_id: user.id,
            habit_id: habitId,
            completed_date: dateStr,
            count: 1,
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding completion:", error);
          return;
        }

        if (data) {
          setCompletions((prev) => [...prev, data]);
        }
      }
    } else {
      const existing = completions.find(
        (c) => c.habit_id === habitId && c.completed_date === dateStr
      );

      if (existing) {
        const newCount = increment
          ? existing.count + 1
          : Math.max(0, existing.count - 1);

        if (newCount === 0) {
          const { error } = await supabase
            .from("habit_completions")
            .delete()
            .eq("id", existing.id);

          if (error) {
            console.error("Error deleting completion:", error);
            return;
          }

          setCompletions((prev) => prev.filter((c) => c.id !== existing.id));
        } else {
          const { data, error } = await supabase
            .from("habit_completions")
            .update({ count: newCount })
            .eq("id", existing.id)
            .select()
            .single();

          if (error) {
            console.error("Error updating completion:", error);
            return;
          }

          if (data) {
            setCompletions((prev) =>
              prev.map((c) => (c.id === existing.id ? data : c))
            );
          }
        }
      } else if (increment) {
        const { data, error } = await supabase
          .from("habit_completions")
          .insert({
            user_id: user.id,
            habit_id: habitId,
            completed_date: dateStr,
            count: 1,
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding completion:", error);
          return;
        }

        if (data) {
          setCompletions((prev) => [...prev, data]);
        }
      }
    }
  };

  const saveNewHabit = async (habitData: {
    name: string;
    recurrence: Recurrence;
    completion_type: "simple" | "count";
    target_count: number | null;
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to create habits");
      return;
    }

    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: user.id,
        name: habitData.name,
        recurrence: habitData.recurrence,
        completion_type: habitData.completion_type,
        target_count: habitData.target_count,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating habit:", error);
      alert(`Failed to create habit: ${error.message}`);
      return;
    }

    if (data) {
      setHabits((prev) => [...prev, data]);
    }
  };

  const deleteHabit = async (habitId: string) => {
    const { error } = await supabase.from("habits").delete().eq("id", habitId);

    if (error) {
      console.error("Error deleting habit:", error);
      alert("Failed to delete habit. Please try again.");
      return;
    }

    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
  };

  const archiveHabit = async (habitId: string) => {
    const { error } = await supabase
      .from("habits")
      .update({ status: "archived" })
      .eq("id", habitId);

    if (error) {
      console.error("Error archiving habit:", error);
      alert("Failed to archive habit. Please try again.");
      return;
    }

    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchHabits();
      await fetchCompletions();
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchCompletions();
    }
  }, [currentDate, view]);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-full mx-auto">
        <HabitsHeader
          view={view}
          setView={setView}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          getPreviousDateRange={getPreviousDateRange}
          getNextDateRange={getNextDateRange}
          dates={dates}
        />

        {/* Habit Creator */}
        <HabitsCreator isOpen={true} onClose={() => {}} onSave={saveNewHabit} />

        {isLoading ? (
          <div className="text-center py-6 text-emerald-700 bg-stone-50 rounded-lg shadow-sm border border-stone-200">
            Loading habits...
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-6 text-emerald-700 bg-stone-50 rounded-lg shadow-sm border border-stone-200">
            No habits yet. Add one above to get started!
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-x-auto">
            <div
              className={
                isLoadingCompletions ? "opacity-60 transition-opacity" : ""
              }
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="p-3 text-left border-b text-sm font-semibold text-stone-700 sticky left-0 bg-stone-50 z-10">
                      Habit
                    </th>
                    {dates.map((date, idx) => (
                      <th
                        key={idx}
                        className="p-3 text-center border-b text-xs font-medium text-stone-600"
                      >
                        <div>
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </div>
                        <div>{date.getDate()}</div>
                      </th>
                    ))}
                    <th className="p-3 text-center border-b text-xs font-medium text-stone-600">
                      Stats
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit) => {
                    const habitCompletions = completions.filter(
                      (c) => c.habit_id === habit.id
                    );

                    const stats = getHabitStatistics(
                      habit,
                      completions,
                      dates[0],
                      dates[dates.length - 1]
                    );

                    return (
                      <tr key={habit.id} className="hover:bg-stone-50 z-10">
                        <td
                          className="p-3 border-b sticky left-0 bg-white border-r border-stone-200"
                          style={{ position: "sticky", zIndex: 10 }}
                        >
                          <div className="flex items-center justify-between gap-2 bg-white">
                            <div>
                              <div className="text-sm font-medium text-stone-800">
                                {habit.name}
                              </div>
                              {habit.completion_type === "count" && (
                                <div className="text-xs text-stone-500">
                                  Target: {habit.target_count}x
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-y-1">
                              <button
                                onClick={() => deleteHabit(habit.id)}
                                className="text-stone-400 hover:text-red-600 text-xs"
                                title="Delete habit"
                              >
                                <Trash size={14} />
                              </button>
                              <button
                                onClick={() => archiveHabit(habit.id)}
                                className="text-stone-400 hover:text-yellow-600 text-xs"
                                title="Archive habit"
                              >
                                <Archive size={14} />
                              </button>
                            </div>
                          </div>
                        </td>
                        {dates.map((date, idx) => {
                          const isActive = isHabitActiveOnDate(
                            habit,
                            date,
                            habitCompletions.map((c) => ({
                              date: new Date(c.completed_date),
                            }))
                          );

                          return (
                            <td key={idx} className="p-3 border-b text-center">
                              <div className="flex justify-center">
                                <CompletionCell
                                  habit={habit}
                                  date={date}
                                  completions={completions}
                                  isActive={isActive}
                                  onToggle={handleToggleCompletion}
                                />
                              </div>
                            </td>
                          );
                        })}
                        <td className="p-3 border-b text-center">
                          <div className="text-xs text-stone-600">
                            <div className="font-semibold">
                              {Math.round(stats.completionRate * 100)} %
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
