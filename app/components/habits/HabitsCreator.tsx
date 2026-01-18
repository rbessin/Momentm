"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
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
    description: string | null;
    category: string | null;
    color: string | null;
    tags: string[] | null;
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
      name: name.trim(),
      description: description.trim() || null,
      category: category.trim() || null,
      color: color,
      tags: tags.length > 0 ? tags : null,
      recurrence: buildRecurrence(),
      completion_type: completionType,
      target_count: completionType === "count" ? targetCount : null,
    });

    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setColor("#10b981");
    setTags([]);
    setTagInput("");
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-stone-900">
            Create New Habit
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Habit Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Run"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Description{" "}
              <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this habit..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Category & Color Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Category{" "}
                <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Health"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Color
              </label>
              <div className="flex items-center gap-2">
                {predefinedColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-7 h-7 rounded-full transition-all ${
                      color === presetColor
                        ? "ring-2 ring-emerald-600 ring-offset-2"
                        : "hover:ring-2 hover:ring-stone-300"
                    }`}
                    style={{ backgroundColor: presetColor }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Tags{" "}
              <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                maxLength={20}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-sm transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-emerald-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recurrence */}
          <div className="border-t border-stone-200 pt-5">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Frequency
            </label>

            <select
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-3"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom Interval</option>
            </select>

            {/* Daily */}
            {recurrenceType === "daily" && (
              <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-lg">
                <span className="text-sm text-stone-700">Repeat every</span>
                <input
                  type="number"
                  min="1"
                  value={interval}
                  onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 text-sm border border-stone-300 rounded text-center"
                />
                <span className="text-sm text-stone-700">day(s)</span>
              </div>
            )}

            {/* Weekly */}
            {recurrenceType === "weekly" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-lg">
                  <span className="text-sm text-stone-700">Repeat every</span>
                  <input
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-sm border border-stone-300 rounded text-center"
                  />
                  <span className="text-sm text-stone-700">week(s)</span>
                </div>
                <div>
                  <p className="text-sm text-stone-700 mb-2">On these days:</p>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleWeekday(day.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                          weeklyDays.includes(day.value)
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Monthly */}
            {recurrenceType === "monthly" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-lg">
                  <span className="text-sm text-stone-700">Repeat every</span>
                  <input
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-sm border border-stone-300 rounded text-center"
                  />
                  <span className="text-sm text-stone-700">month(s)</span>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded cursor-pointer">
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
                      onChange={(e) =>
                        setMonthDay(parseInt(e.target.value) || 1)
                      }
                      disabled={monthlyType !== "day"}
                      className="w-16 px-2 py-1 text-sm border border-stone-300 rounded text-center disabled:bg-stone-100"
                    />
                  </label>

                  <label className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded cursor-pointer">
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
                      className="px-2 py-1 text-sm border border-stone-300 rounded disabled:bg-stone-100"
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
                      className="px-2 py-1 text-sm border border-stone-300 rounded disabled:bg-stone-100"
                    >
                      {weekdayNames.map((name, idx) => (
                        <option key={idx} value={idx}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}

            {/* Custom */}
            {recurrenceType === "custom" && (
              <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-lg">
                <span className="text-sm text-stone-700">Repeat every</span>
                <input
                  type="number"
                  min="1"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 text-sm border border-stone-300 rounded text-center"
                />
                <span className="text-sm text-stone-700">days</span>
              </div>
            )}
          </div>

          {/* Completion Type */}
          <div className="border-t border-stone-200 pt-5">
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Tracking Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg cursor-pointer hover:bg-stone-100 transition-colors">
                <input
                  type="radio"
                  checked={completionType === "simple"}
                  onChange={() => setCompletionType("simple")}
                  className="w-4 h-4 text-emerald-600"
                />
                <div>
                  <div className="text-sm font-medium text-stone-800">
                    Simple Checkbox
                  </div>
                  <div className="text-xs text-stone-500">Done or not done</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg cursor-pointer hover:bg-stone-100 transition-colors">
                <input
                  type="radio"
                  checked={completionType === "count"}
                  onChange={() => setCompletionType("count")}
                  className="w-4 h-4 text-emerald-600"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-stone-800">
                    Count Target
                  </div>
                  <div className="text-xs text-stone-500">
                    Track multiple completions
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  value={targetCount}
                  onChange={(e) =>
                    setTargetCount(parseInt(e.target.value) || 1)
                  }
                  disabled={completionType !== "count"}
                  className="w-16 px-2 py-1 text-sm border border-stone-300 rounded text-center disabled:bg-stone-200"
                />
                <span className="text-sm text-stone-600">times</span>
              </label>
            </div>
          </div>

          {/* End Rule */}
          <div className="border-t border-stone-200 pt-5">
            <label className="block text-sm font-medium text-stone-700 mb-3">
              End Date{" "}
              <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded cursor-pointer">
                <input
                  type="radio"
                  checked={endType === "never"}
                  onChange={() => setEndType("never")}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="text-sm text-stone-700">Never ends</span>
              </label>

              <label className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded cursor-pointer">
                <input
                  type="radio"
                  checked={endType === "on"}
                  onChange={() => setEndType("on")}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="text-sm text-stone-700">Ends on</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={endType !== "on"}
                  className="px-2 py-1 text-sm border border-stone-300 rounded disabled:bg-stone-100"
                />
              </label>

              <label className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded cursor-pointer">
                <input
                  type="radio"
                  checked={endType === "after"}
                  onChange={() => setEndType("after")}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="text-sm text-stone-700">Ends after</span>
                <input
                  type="number"
                  min="1"
                  value={endCount}
                  onChange={(e) => setEndCount(parseInt(e.target.value) || 1)}
                  disabled={endType !== "after"}
                  className="w-20 px-2 py-1 text-sm border border-stone-300 rounded text-center disabled:bg-stone-100"
                />
                <span className="text-sm text-stone-700">completions</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
            >
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
