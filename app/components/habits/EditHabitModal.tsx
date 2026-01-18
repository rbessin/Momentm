"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Recurrence,
  EndRule,
  MonthlyPattern,
  Habit,
} from "@/app/lib/recurrence-types";

interface EditHabitModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    color: string | null;
    tags: string[] | null;
    recurrence: Recurrence;
    completion_type: "simple" | "count";
    target_count: number | null;
  }) => void;
}

export default function EditHabitModal({
  habit,
  isOpen,
  onClose,
  onSave,
}: EditHabitModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("#10b981");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [completionType, setCompletionType] = useState<"simple" | "count">(
    "simple",
  );
  const [targetCount, setTargetCount] = useState<number>(1);
  const [recurrenceType, setRecurrenceType] = useState<
    "daily" | "weekly" | "monthly" | "custom"
  >("daily");
  const [interval, setInterval] = useState(1);
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
  const [monthlyType, setMonthlyType] = useState<"day" | "weekday">("day");
  const [monthDay, setMonthDay] = useState(1);
  const [monthWeekday, setMonthWeekday] = useState(0);
  const [monthOccurrence, setMonthOccurrence] = useState(1);
  const [customDays, setCustomDays] = useState(3);
  const [endType, setEndType] = useState<"never" | "on" | "after">("never");
  const [endDate, setEndDate] = useState("");
  const [endCount, setEndCount] = useState(10);

  useEffect(() => {
    if (habit && isOpen) {
      setName(habit.name);
      setDescription(habit.description || "");
      setCategory(habit.category || "");
      setColor(habit.color || "#10b981");
      setTags(habit.tags || []);
      setCompletionType(habit.completion_type);
      setTargetCount(habit.target_count || 1);

      // Parse recurrence
      const rec = habit.recurrence;
      setRecurrenceType(rec.type);

      if (
        rec.type === "daily" ||
        rec.type === "weekly" ||
        rec.type === "monthly"
      ) {
        setInterval(rec.interval);
      }

      if (rec.type === "weekly") {
        setWeeklyDays(rec.days);
      }

      if (rec.type === "monthly") {
        if (rec.pattern.type === "day") {
          setMonthlyType("day");
          setMonthDay(rec.pattern.day);
        } else {
          setMonthlyType("weekday");
          setMonthWeekday(rec.pattern.weekday);
          setMonthOccurrence(
            rec.pattern.occurrence === -1 ? 4 : rec.pattern.occurrence - 1,
          );
        }
      }

      if (rec.type === "custom") {
        setCustomDays(rec.days);
      }

      // Parse end rule
      if (rec.ends.type === "never") {
        setEndType("never");
      } else if (rec.ends.type === "on") {
        setEndType("on");
        setEndDate(rec.ends.date);
      } else if (rec.ends.type === "after") {
        setEndType("after");
        setEndCount(rec.ends.count);
      }
    }
  }, [habit, isOpen]);

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

  const predefinedColors = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];

  const toggleWeekday = (day: number) => {
    setWeeklyDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort(),
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
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

  const handleSubmit = (e: React.FormEvent) => {
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
      id: habit.id,
      name: name.trim(),
      description: description.trim() || null,
      category: category.trim() || null,
      color: color,
      tags: tags.length > 0 ? tags : null,
      recurrence: buildRecurrence(),
      completion_type: completionType,
      target_count: completionType === "count" ? targetCount : null,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800">Edit Habit</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Habit Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm text-stone-700 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm text-stone-700 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              maxLength={200}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm text-stone-700 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              maxLength={50}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Color
            </label>
            <div className="flex items-center gap-2">
              {predefinedColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === presetColor
                      ? "ring-2 ring-stone-400 ring-offset-2"
                      : "hover:ring-2 hover:ring-stone-300"
                  }`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                className="flex-1 px-3 py-2 text-sm text-stone-700 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                maxLength={20}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-md text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-emerald-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recurrence Type */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Repeats
            </label>
            <select
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm text-stone-700 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom (every X days)</option>
            </select>
          </div>

          {/* Daily */}
          {recurrenceType === "daily" && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Every
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={interval}
                  onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 text-sm text-stone-700 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                />
                <span className="text-sm text-stone-700">day(s)</span>
              </div>
            </div>
          )}

          {/* Weekly */}
          {recurrenceType === "weekly" && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Every
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 text-sm text-stone-700 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                  <span className="text-sm text-stone-700">week(s) on</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekday(day.value)}
                    className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
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

          {/* Monthly */}
          {recurrenceType === "monthly" && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Every
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 text-sm text-stone-700 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                  <span className="text-sm text-stone-700">month(s)</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={monthlyType === "day"}
                    onChange={() => setMonthlyType("day")}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <span className="text-sm text-stone-700">On day</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={monthDay}
                    onChange={(e) => setMonthDay(parseInt(e.target.value) || 1)}
                    disabled={monthlyType !== "day"}
                    className="w-20 px-3 py-1.5 text-sm text-stone-700 border border-stone-300 rounded-md disabled:bg-stone-100"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={monthlyType === "weekday"}
                    onChange={() => setMonthlyType("weekday")}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <span className="text-sm text-stone-700">On the</span>
                  <select
                    value={monthOccurrence}
                    onChange={(e) =>
                      setMonthOccurrence(parseInt(e.target.value))
                    }
                    disabled={monthlyType !== "weekday"}
                    className="px-3 py-1.5 text-sm text-stone-700 border border-stone-300 rounded-md disabled:bg-stone-100"
                  >
                    {occurrenceNames.map((name, idx) => (
                      <option key={idx} value={idx}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={monthWeekday}
                    onChange={(e) => setMonthWeekday(parseInt(e.target.value))}
                    disabled={monthlyType !== "weekday"}
                    className="px-3 py-1.5 text-sm text-stone-700 border border-stone-300 rounded-md disabled:bg-stone-100"
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

          {/* Custom */}
          {recurrenceType === "custom" && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Repeat every
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 text-sm text-stone-700 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                />
                <span className="text-sm text-stone-700">days</span>
              </div>
            </div>
          )}

          {/* End Rule */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Ends
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={endType === "never"}
                  onChange={() => setEndType("never")}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="text-sm text-stone-700">Never</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={endType === "on"}
                  onChange={() => setEndType("on")}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="text-sm text-stone-700">On</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={endType !== "on"}
                  className="px-3 py-1.5 text-sm text-stone-700 border border-stone-300 rounded-md disabled:bg-stone-100"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={endType === "after"}
                  onChange={() => setEndType("after")}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="text-sm text-stone-700">After</span>
                <input
                  type="number"
                  min="1"
                  value={endCount}
                  onChange={(e) => setEndCount(parseInt(e.target.value) || 1)}
                  disabled={endType !== "after"}
                  className="w-20 px-3 py-1.5 text-sm text-stone-700 border border-stone-300 rounded-md disabled:bg-stone-100"
                />
                <span className="text-sm text-stone-700">occurrences</span>
              </label>
            </div>
          </div>

          {/* Completion Type */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Track as
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={completionType === "simple"}
                  onChange={() => setCompletionType("simple")}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="text-sm text-stone-700">Done / Not Done</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={completionType === "count"}
                  onChange={() => setCompletionType("count")}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="text-sm text-stone-700">Count</span>
                <input
                  type="number"
                  min="1"
                  value={targetCount}
                  onChange={(e) =>
                    setTargetCount(parseInt(e.target.value) || 1)
                  }
                  disabled={completionType !== "count"}
                  className="w-20 px-3 py-1.5 text-sm text-stone-700 border border-stone-300 rounded-md disabled:bg-stone-100"
                />
                <span className="text-sm text-stone-700">times</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
