"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import {
  Recurrence,
  EndRule,
  MonthlyPattern,
} from "@/app/lib/recurrence-types";

interface HabitsCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: {
    name: string;
    recurrence: Recurrence;
    completion_type: "simple" | "count";
    target_count: number | null;
  }) => void;
}

export default function HabitsCreator({
  isOpen,
  onClose,
  onSave,
}: HabitsCreatorProps) {
  const [name, setName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Completion settings
  const [completionType, setCompletionType] = useState<"simple" | "count">(
    "simple"
  );
  const [targetCount, setTargetCount] = useState<number>(1);

  // Recurrence settings
  const [recurrenceType, setRecurrenceType] = useState<
    "daily" | "weekly" | "monthly" | "custom"
  >("daily");
  const [interval, setInterval] = useState(1);

  // Weekly settings
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]);

  // Monthly settings
  const [monthlyType, setMonthlyType] = useState<"day" | "weekday">("day");
  const [monthDay, setMonthDay] = useState(1);
  const [monthWeekday, setMonthWeekday] = useState(0);
  const [monthOccurrence, setMonthOccurrence] = useState(1);

  // Custom settings
  const [customDays, setCustomDays] = useState(3);

  // End settings
  const [endType, setEndType] = useState<"never" | "on" | "after">("never");
  const [endDate, setEndDate] = useState("");
  const [endCount, setEndCount] = useState(10);

  const daysOfWeek = [
    { label: "Mon", value: 0 },
    { label: "Tue", value: 1 },
    { label: "Wed", value: 2 },
    { label: "Thu", value: 3 },
    { label: "Fri", value: 4 },
    { label: "Sat", value: 5 },
    { label: "Sun", value: 6 },
  ];

  const weekdayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const occurrenceNames = ["First", "Second", "Third", "Fourth", "Last"];

  const toggleWeekday = (day: number) => {
    setWeeklyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const buildRecurrence = (): Recurrence => {
    const endRule: EndRule =
      endType === "never"
        ? { type: "never" }
        : endType === "on"
        ? { type: "on", date: endDate }
        : { type: "after", count: endCount };

    switch (recurrenceType) {
      case "daily":
        return { type: "daily", interval, ends: endRule };

      case "weekly":
        return { type: "weekly", interval, days: weeklyDays, ends: endRule };

      case "monthly": {
        const pattern: MonthlyPattern =
          monthlyType === "day"
            ? { type: "day", day: monthDay }
            : {
                type: "weekday",
                weekday: monthWeekday,
                occurrence: monthOccurrence === 4 ? -1 : monthOccurrence + 1,
              };
        return { type: "monthly", interval, pattern, ends: endRule };
      }

      case "custom":
        return { type: "custom", days: customDays, ends: endRule };
    }
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a habit name");
      return;
    }

    onSave({
      name: name.trim(),
      recurrence: { type: "daily", interval: 1, ends: { type: "never" } },
      completion_type: "simple",
      target_count: null,
    });

    setName("");
  };

  const handleAdvancedSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a habit name");
      return;
    }

    if (recurrenceType === "weekly" && weeklyDays.length === 0) {
      alert("Please select at least one day for weekly recurrence");
      return;
    }

    if (completionType === "count" && targetCount <= 0) {
      alert("Please enter a valid target count");
      return;
    }

    if (endType === "on" && !endDate) {
      alert("Please select an end date");
      return;
    }

    onSave({
      name: name.trim(),
      recurrence: buildRecurrence(),
      completion_type: completionType,
      target_count: completionType === "count" ? targetCount : null,
    });

    setName("");
    resetAdvancedForm();
    setShowAdvanced(false);
  };

  const resetAdvancedForm = () => {
    setRecurrenceType("daily");
    setInterval(1);
    setWeeklyDays([]);
    setMonthlyType("day");
    setMonthDay(1);
    setMonthWeekday(0);
    setMonthOccurrence(1);
    setCustomDays(3);
    setEndType("never");
    setEndDate("");
    setEndCount(10);
    setCompletionType("simple");
    setTargetCount(1);
  };

  return (
    <div className="bg-stone-50 rounded-lg shadow-sm border border-stone-200 p-3 mb-4">
      {/* Quick Add Form */}
      <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add new habit (e.g., Morning Run)"
          className="flex-1 px-3 py-2 text-sm text-stone-700 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white placeholder:text-stone-400"
          maxLength={100}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-1"
        >
          <Plus size={16} />
          Add
        </button>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-md text-sm font-medium transition-colors"
          title="Advanced options"
        >
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </form>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-stone-300">
          <p className="text-xs text-stone-600 mb-3 font-medium">
            Advanced Options
          </p>

          <form onSubmit={handleAdvancedSubmit} className="space-y-3">
            {/* Recurrence Type */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Repeats
              </label>
              <select
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value as any)}
                className="w-full px-3 py-1.5 text-sm text-stone-600 border border-stone-300 rounded-md focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom (every X days)</option>
              </select>
            </div>

            {/* Daily: Interval */}
            {recurrenceType === "daily" && (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Every
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-1.5 text-sm text-stone-600 border border-stone-300 rounded-md focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                  />
                  <span className="text-xs text-stone-600">day(s)</span>
                </div>
              </div>
            )}

            {/* Weekly: Days + Interval */}
            {recurrenceType === "weekly" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Every
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={interval}
                      onChange={(e) =>
                        setInterval(parseInt(e.target.value) || 1)
                      }
                      className="w-20 px-3 py-1.5 text-sm text-stone-600 border border-stone-300 rounded-md focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                    />
                    <span className="text-xs text-stone-600">week(s) on</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleWeekday(day.value)}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                        weeklyDays.includes(day.value)
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Monthly: Day or Weekday pattern */}
            {recurrenceType === "monthly" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Every
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={interval}
                      onChange={(e) =>
                        setInterval(parseInt(e.target.value) || 1)
                      }
                      className="w-20 px-3 py-1.5 text-sm text-stone-600 border border-stone-300 rounded-md focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                    />
                    <span className="text-xs text-stone-600">month(s)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={monthlyType === "day"}
                      onChange={() => setMonthlyType("day")}
                      className="w-3 h-3 text-emerald-600"
                    />
                    <span className="text-xs text-stone-700">On day</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={monthDay}
                      onChange={(e) =>
                        setMonthDay(parseInt(e.target.value) || 1)
                      }
                      disabled={monthlyType !== "day"}
                      className="w-16 px-2 py-0.5 text-xs text-stone-600 border border-stone-300 rounded-md disabled:bg-stone-100"
                    />
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={monthlyType === "weekday"}
                      onChange={() => setMonthlyType("weekday")}
                      className="w-3 h-3 text-emerald-600"
                    />
                    <span className="text-xs text-stone-700">On the</span>
                    <select
                      value={monthOccurrence}
                      onChange={(e) =>
                        setMonthOccurrence(parseInt(e.target.value))
                      }
                      disabled={monthlyType !== "weekday"}
                      className="px-2 py-0.5 text-xs text-stone-600 border border-stone-300 rounded-md disabled:bg-stone-100"
                    >
                      {occurrenceNames.map((name, idx) => (
                        <option key={idx} value={idx}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={monthWeekday}
                      onChange={(e) =>
                        setMonthWeekday(parseInt(e.target.value))
                      }
                      disabled={monthlyType !== "weekday"}
                      className="px-2 py-0.5 text-xs text-stone-600 border border-stone-300 rounded-md disabled:bg-stone-100"
                    >
                      {weekdayNames.map((name, idx) => (
                        <option key={idx} value={idx}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            )}

            {/* Custom: Every X days */}
            {recurrenceType === "custom" && (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Repeat every
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={customDays}
                    onChange={(e) =>
                      setCustomDays(parseInt(e.target.value) || 1)
                    }
                    className="w-20 px-3 py-1.5 text-sm text-stone-600 border border-stone-300 rounded-md focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                  />
                  <span className="text-xs text-stone-600">days</span>
                </div>
              </div>
            )}

            {/* End Rule */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Ends
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={endType === "never"}
                    onChange={() => setEndType("never")}
                    className="w-3 h-3 text-emerald-600"
                  />
                  <span className="text-xs text-stone-700">Never</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={endType === "on"}
                    onChange={() => setEndType("on")}
                    className="w-3 h-3 text-emerald-600"
                  />
                  <span className="text-xs text-stone-700">On</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={endType !== "on"}
                    className="px-2 py-0.5 text-xs text-stone-600 border border-stone-300 rounded-md disabled:bg-stone-100"
                  />
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={endType === "after"}
                    onChange={() => setEndType("after")}
                    className="w-3 h-3 text-emerald-600"
                  />
                  <span className="text-xs text-stone-700">After</span>
                  <input
                    type="number"
                    min="1"
                    value={endCount}
                    onChange={(e) => setEndCount(parseInt(e.target.value) || 1)}
                    disabled={endType !== "after"}
                    className="w-16 px-2 py-0.5 text-xs text-stone-600 border border-stone-300 rounded-md disabled:bg-stone-100"
                  />
                  <span className="text-xs text-stone-700">occurrences</span>
                </label>
              </div>
            </div>

            {/* Completion Type */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Track as
              </label>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={completionType === "simple"}
                    onChange={() => setCompletionType("simple")}
                    className="w-3 h-3 text-emerald-600"
                  />
                  <span className="text-xs text-stone-700">
                    Done / Not Done
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={completionType === "count"}
                    onChange={() => setCompletionType("count")}
                    className="w-3 h-3 text-emerald-600"
                  />
                  <span className="text-xs text-stone-700">Count</span>
                  <input
                    type="number"
                    min="1"
                    value={targetCount}
                    onChange={(e) =>
                      setTargetCount(parseInt(e.target.value) || 1)
                    }
                    disabled={completionType !== "count"}
                    className="w-16 px-2 py-0.5 text-xs text-stone-600 border border-stone-300 rounded-md disabled:bg-stone-100"
                  />
                  <span className="text-xs text-stone-700">times</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors"
              >
                Create Habit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdvanced(false);
                  resetAdvancedForm();
                }}
                className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium py-1.5 px-3 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
