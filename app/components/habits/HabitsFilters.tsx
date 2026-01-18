"use client";

import { X } from "lucide-react";
import { Habit } from "@/app/lib/recurrence-types";

interface HabitsFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  selectedCompletionType: string;
  setSelectedCompletionType: (type: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  habits: Habit[];
}

export default function HabitsFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  selectedCompletionType,
  setSelectedCompletionType,
  sortBy,
  setSortBy,
  habits,
}: HabitsFiltersProps) {
  const categories = Array.from(
    new Set(habits.map((h) => h.category).filter(Boolean)),
  ) as string[];

  const allTags = Array.from(new Set(habits.flatMap((h) => h.tags || [])));

  const hasActiveFilters =
    selectedCategory ||
    selectedTag ||
    selectedCompletionType ||
    sortBy !== "created";

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedTag("");
    setSelectedCompletionType("");
    setSortBy("created");
  };

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Category Filter - only show if categories exist */}
      {categories.length > 0 && (
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-stone-600 mb-1.5">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tag Filter - only show if tags exist */}
      {allTags.length > 0 && (
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-stone-600 mb-1.5">
            Tag
          </label>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Type Filter */}
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-medium text-stone-600 mb-1.5">
          Type
        </label>
        <select
          value={selectedCompletionType}
          onChange={(e) => setSelectedCompletionType(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">All Types</option>
          <option value="simple">Simple</option>
          <option value="count">Count</option>
        </select>
      </div>

      {/* Sort */}
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-medium text-stone-600 mb-1.5">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
        >
          <option value="created">Date Created</option>
          <option value="name">Name (A-Z)</option>
          <option value="completion_rate">Completion Rate</option>
          <option value="streak">Current Streak</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="px-4 py-1.5 text-sm text-stone-600 bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
