"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase/client";
import HabitsHeader from "../components/habits/HabitsHeader";
import HabitsGrid from "../components/habits/HabitsGrid";
import { Habit, Completion } from "../lib/types";

export default function HabitsPage() {
  const supabase = createClient();

  // State
  const [view, setView] = useState<"week" | "month">("week");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loadedDateRange, setLoadedDateRange] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Calculate date range based on view
  const getDateRange = () => {
    if (view === "week") {
      // Get current week (Monday to Sunday)
      const current = new Date(currentDate);
      const day = current.getDay();
      const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
      const monday = new Date(current.setDate(diff));

      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
      }
      return dates;
    } else {
      // Get current month (1st to last day)
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

  // Get previous and next date range
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

  // Fetch habits and completions
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

  const fetchCompletions = async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from("habit_completions")
      .select("*")
      .gte("completed_date", startDate)
      .lte("completed_date", endDate)
      .order("completed_date", { ascending: true });

    if (error) {
      console.error("Error fetching completions:", error);
      return;
    }

    setCompletions((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const newCompletions = data?.filter((c) => !existingIds.has(c.id)) || [];
      return [...prev, ...newCompletions];
    });

    setLoadedDateRange((prev) => ({
      start: prev.start
        ? startDate < prev.start
          ? startDate
          : prev.start
        : startDate,
      end: prev.end ? (endDate > prev.end ? endDate : prev.end) : endDate,
    }));
  };

  const ensureCompletionsLoaded = async () => {
    const viewStart = dates[0].toISOString().split("T")[0];
    const viewEnd = dates[dates.length - 1].toISOString().split("T")[0];

    const needsFetch =
      !loadedDateRange.start ||
      !loadedDateRange.end ||
      viewStart < loadedDateRange.start ||
      viewEnd > loadedDateRange.end;

    if (needsFetch) {
      // Fetch 3 months before and after current view
      const fetchStart = new Date(dates[0]);
      fetchStart.setMonth(fetchStart.getMonth() - 3);

      const fetchEnd = new Date(dates[dates.length - 1]);
      fetchEnd.setMonth(fetchEnd.getMonth() + 3);

      await fetchCompletions(
        fetchStart.toISOString().split("T")[0],
        fetchEnd.toISOString().split("T")[0]
      );
    }
  };

  const toggleCompletion = async (habitId: string, date: Date) => {
    const dateStr = date.toISOString().split("T")[0];

    const existing = completions.find(
      (completion) =>
        completion.habit_id === habitId && completion.completed_date === dateStr
    );

    if (existing) {
      // DELETE
      const { error } = await supabase
        .from("habit_completions")
        .delete()
        .eq("id", existing.id);

      if (error) {
        console.error("Error deleting completion:", error);
        return;
      }

      setCompletions((prev) =>
        prev.filter((completion) => completion.id !== existing.id)
      );
    } else {
      //INSERT
      const { data, error } = await supabase
        .from("habit_completions")
        .insert({
          habit_id: habitId,
          completed_date: dateStr,
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
  };

  // Load data on mount, currentDate or view change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchHabits();
      await ensureCompletionsLoaded();
      setIsLoading(false);
    };
    loadData();
  }, [currentDate, view]);

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <HabitsHeader
          view={view}
          setView={setView}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          getPreviousDateRange={getPreviousDateRange}
          getNextDateRange={getNextDateRange}
          dates={dates}
        />

        {/* Grid Container */}
        <HabitsGrid
          habits={habits}
          completions={completions}
          dates={dates}
          isLoading={isLoading}
          onToggleCompletion={toggleCompletion}
        />
      </div>
    </div>
  );
}
