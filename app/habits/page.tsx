"use client";

import { useState, useEffect } from "react";
import {
  Trash,
  Archive,
  Edit2,
  ArchiveRestore,
  TrendingUp,
  Plus,
  ArrowLeft,
  ArrowRight,
  Search,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import HabitsCreator from "../components/habits/HabitsCreator";
import EditHabitModal from "../components/habits/EditHabitModal";
import HabitsFilters from "../components/habits/HabitsFilters";
import AnalyticsDashboard from "../components/habits/AnalyticsDashboard";
import { Habit, Recurrence } from "@/app/lib/recurrence-types";
import { Completion } from "@/app/lib/completion-types";
import { isHabitActiveOnDate } from "@/app/lib/recurrence-utils";
import { getHabitStatistics } from "@/app/lib/completion-utils";
import { CompletionCell } from "../components/habits/CompletionCell";

export default function HabitsPage() {
  const supabase = createClient();

  const [view, setView] = useState<"week" | "month">("week");
  const [statusView, setStatusView] = useState<"active" | "archived">("active");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCompletions, setIsLoadingCompletions] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCompletionType, setSelectedCompletionType] = useState("");
  const [sortBy, setSortBy] = useState("created");

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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const fetchHabits = async () => {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("status", statusView)
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

  // Filter and sort habits
  const filteredAndSortedHabits = habits
    .filter((habit) => {
      if (
        searchQuery &&
        !habit.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (selectedCategory && habit.category !== selectedCategory) {
        return false;
      }
      if (selectedTag && (!habit.tags || !habit.tags.includes(selectedTag))) {
        return false;
      }
      if (
        selectedCompletionType &&
        habit.completion_type !== selectedCompletionType
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "completion_rate": {
          const statsA = getHabitStatistics(
            a,
            completions,
            dates[0],
            dates[dates.length - 1],
          );
          const statsB = getHabitStatistics(
            b,
            completions,
            dates[0],
            dates[dates.length - 1],
          );
          return statsB.completionRate - statsA.completionRate;
        }
        case "streak": {
          const statsA = getHabitStatistics(
            a,
            completions,
            dates[0],
            dates[dates.length - 1],
          );
          const statsB = getHabitStatistics(
            b,
            completions,
            dates[0],
            dates[dates.length - 1],
          );
          return statsB.currentStreak - statsA.currentStreak;
        }
        default:
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
      }
    });

  const handleToggleCompletion = async (
    habitId: string,
    date: Date,
    increment: boolean,
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
        (c) => c.habit_id === habitId && c.completed_date === dateStr,
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
        (c) => c.habit_id === habitId && c.completed_date === dateStr,
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
              prev.map((c) => (c.id === existing.id ? data : c)),
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
    description: string | null;
    category: string | null;
    color: string | null;
    tags: string[] | null;
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
        description: habitData.description,
        category: habitData.category,
        color: habitData.color,
        tags: habitData.tags,
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
      setShowCreator(false);
    }
  };

  const editHabit = async (habitData: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    color: string | null;
    tags: string[] | null;
    recurrence: Recurrence;
    completion_type: "simple" | "count";
    target_count: number | null;
  }) => {
    const { data, error } = await supabase
      .from("habits")
      .update({
        name: habitData.name,
        description: habitData.description,
        category: habitData.category,
        color: habitData.color,
        tags: habitData.tags,
        recurrence: habitData.recurrence,
        completion_type: habitData.completion_type,
        target_count: habitData.target_count,
      })
      .eq("id", habitData.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating habit:", error);
      alert(`Failed to update habit: ${error.message}`);
      return;
    }

    if (data) {
      setHabits((prev) => prev.map((h) => (h.id === data.id ? data : h)));
      setEditingHabit(null);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!confirm("Delete this habit permanently?")) return;

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

  const unarchiveHabit = async (habitId: string) => {
    const { error } = await supabase
      .from("habits")
      .update({ status: "active" })
      .eq("id", habitId);

    if (error) {
      console.error("Error unarchiving habit:", error);
      alert("Failed to unarchive habit. Please try again.");
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
  }, [statusView]);

  useEffect(() => {
    if (!isLoading) {
      fetchCompletions();
    }
  }, [currentDate, view]);

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Loading bar */}
        {isLoadingCompletions && (
          <div className="fixed top-0 left-0 right-0 h-1 bg-emerald-200 z-50">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{
                width: "100%",
                animation: "loading 1s ease-in-out infinite",
              }}
            />
          </div>
        )}

        {/* Consolidated Header - Single Card */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 mb-4">
          {/* Row 1: Title + Navigation + Add Button */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-semibold text-stone-900">Habits</h1>

            <div className="flex items-center gap-3">
              {/* Date Navigation */}
              <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentDate(getPreviousDateRange())}
                  className="p-1.5 hover:bg-white rounded transition-colors"
                  title="Previous"
                >
                  <ArrowLeft className="w-4 h-4 text-stone-700" />
                </button>

                <span className="text-sm text-stone-700 px-3 min-w-[140px] text-center font-medium">
                  {view === "week"
                    ? `${dates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${dates[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : currentDate.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                </span>

                <button
                  onClick={() => setCurrentDate(getNextDateRange())}
                  className="p-1.5 hover:bg-white rounded transition-colors"
                  title="Next"
                >
                  <ArrowRight className="w-4 h-4 text-stone-700" />
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-xs rounded hover:bg-white transition-colors text-stone-700 font-medium"
                >
                  Today
                </button>
                <button
                  onClick={() => setView("week")}
                  className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${
                    view === "week"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-stone-700 hover:bg-white"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setView("month")}
                  className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${
                    view === "month"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-stone-700 hover:bg-white"
                  }`}
                >
                  Month
                </button>
              </div>

              {/* Add Habit */}
              <button
                onClick={() => setShowCreator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Row 2: Status + Search + Filters + Analytics */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Status Tabs */}
              <div className="flex gap-1">
                <button
                  onClick={() => setStatusView("active")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                    statusView === "active"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusView("archived")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                    statusView === "archived"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  Archived
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search habits..."
                  className="pl-9 pr-4 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-48"
                />
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showFilters
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                Filters{" "}
                {(selectedCategory || selectedTag || selectedCompletionType) &&
                  "•"}
              </button>
            </div>

            {/* Analytics */}
            {statusView === "active" && habits.length > 0 && (
              <button
                onClick={() => setShowAnalytics(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </button>
            )}
          </div>

          {/* Expandable Filters */}
          {showFilters && statusView === "active" && (
            <div className="mt-3 pt-3 border-t border-stone-200">
              <HabitsFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                selectedCompletionType={selectedCompletionType}
                setSelectedCompletionType={setSelectedCompletionType}
                sortBy={sortBy}
                setSortBy={setSortBy}
                habits={habits}
              />
            </div>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="text-center py-6 text-stone-600 bg-white rounded-lg shadow-sm border border-stone-200">
            Loading habits...
          </div>
        ) : filteredAndSortedHabits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-stone-200">
            <div className="text-6xl mb-4">
              {statusView === "active" ? "🎯" : "📦"}
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">
              {statusView === "active"
                ? searchQuery ||
                  selectedCategory ||
                  selectedTag ||
                  selectedCompletionType
                  ? "No habits match your filters"
                  : "No active habits"
                : "No archived habits"}
            </h3>
            <p className="text-stone-600 text-sm mb-4">
              {statusView === "active"
                ? searchQuery ||
                  selectedCategory ||
                  selectedTag ||
                  selectedCompletionType
                  ? "Try adjusting your filters"
                  : "Create your first habit to start tracking!"
                : "Archived habits will appear here"}
            </p>
            {statusView === "active" &&
              !searchQuery &&
              !selectedCategory &&
              !selectedTag &&
              !selectedCompletionType && (
                <button
                  onClick={() => setShowCreator(true)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm shadow-sm"
                >
                  Create First Habit
                </button>
              )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-x-auto">
            <div
              className={
                isLoadingCompletions
                  ? "opacity-60 transition-opacity"
                  : "transition-opacity"
              }
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="p-3 text-left border-b border-stone-200 text-sm font-semibold text-stone-700 sticky left-0 bg-stone-50 z-10">
                      Habit
                    </th>
                    {dates.map((date, idx) => (
                      <th
                        key={idx}
                        className="p-3 text-center border-b border-stone-200 text-xs font-medium text-stone-600"
                      >
                        <div>
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </div>
                        <div className="text-stone-500">{date.getDate()}</div>
                      </th>
                    ))}
                    <th className="p-3 text-center border-b border-stone-200 text-xs font-medium text-stone-600">
                      Stats
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedHabits.map((habit) => {
                    const habitCompletions = completions.filter(
                      (c) => c.habit_id === habit.id,
                    );

                    const stats = getHabitStatistics(
                      habit,
                      completions,
                      dates[0],
                      dates[dates.length - 1],
                    );

                    return (
                      <tr
                        key={habit.id}
                        className="hover:bg-stone-50/50 transition-colors"
                      >
                        <td
                          className="p-3 border-b border-stone-200 sticky left-0 bg-white border-r border-stone-200"
                          style={{ zIndex: 10 }}
                        >
                          <div className="flex items-center justify-between gap-2 bg-white">
                            <div className="flex items-center gap-2 min-w-0">
                              {habit.color && (
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: habit.color }}
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-stone-900 group relative truncate">
                                  {habit.name}
                                  {habit.description && (
                                    <div className="hidden group-hover:block absolute left-0 top-full mt-1 p-2 bg-stone-800 text-white text-xs rounded shadow-lg whitespace-normal max-w-xs z-20">
                                      {habit.description}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  {habit.category && (
                                    <span className="text-xs text-stone-500">
                                      {habit.category}
                                    </span>
                                  )}
                                  {habit.completion_type === "count" && (
                                    <span className="text-xs text-emerald-600 font-medium">
                                      • {habit.target_count}x
                                    </span>
                                  )}
                                  {habit.tags && habit.tags.length > 0 && (
                                    <div className="flex gap-1">
                                      {habit.tags.slice(0, 2).map((tag) => (
                                        <span
                                          key={tag}
                                          className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      {habit.tags.length > 2 && (
                                        <span className="text-xs text-stone-500">
                                          +{habit.tags.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              {statusView === "active" ? (
                                <>
                                  <button
                                    onClick={() => setEditingHabit(habit)}
                                    className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                    title="Edit habit"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => archiveHabit(habit.id)}
                                    className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                    title="Archive habit"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteHabit(habit.id)}
                                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete habit"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => unarchiveHabit(habit.id)}
                                    className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                    title="Restore habit"
                                  >
                                    <ArchiveRestore className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteHabit(habit.id)}
                                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete habit"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        {dates.map((date, idx) => {
                          const isActive = isHabitActiveOnDate(
                            habit,
                            date,
                            habitCompletions.map((c) => ({
                              date: new Date(c.completed_date),
                            })),
                          );

                          return (
                            <td
                              key={idx}
                              className="p-2 border-b border-stone-200 text-center"
                            >
                              <div className="flex justify-center">
                                {statusView === "active" ? (
                                  <CompletionCell
                                    habit={habit}
                                    date={date}
                                    completions={completions}
                                    isActive={isActive}
                                    onToggle={handleToggleCompletion}
                                  />
                                ) : isActive ? (
                                  <div className="w-10 h-10 flex items-center justify-center">
                                    <span className="text-stone-300 text-xs">
                                      —
                                    </span>
                                  </div>
                                ) : null}
                              </div>
                            </td>
                          );
                        })}
                        <td className="p-3 border-b border-stone-200 text-center">
                          <div className="text-xs text-stone-700">
                            <div className="font-semibold text-emerald-600">
                              {Math.round(stats.completionRate * 100)}%
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

        {/* Modals */}
        {showCreator && (
          <HabitsCreator
            isOpen={showCreator}
            onClose={() => setShowCreator(false)}
            onSave={saveNewHabit}
          />
        )}

        {editingHabit && (
          <EditHabitModal
            habit={editingHabit}
            isOpen={!!editingHabit}
            onClose={() => setEditingHabit(null)}
            onSave={editHabit}
          />
        )}

        {showAnalytics && (
          <AnalyticsDashboard
            habits={habits.filter((h) => h.status === "active")}
            completions={completions}
            onClose={() => setShowAnalytics(false)}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes loading {
          0%,
          100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }

        tbody tr {
          position: relative;
        }

        tbody tr:hover .flex.items-center.gap-1 {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
