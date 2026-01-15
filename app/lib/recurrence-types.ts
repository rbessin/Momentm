// recurrence-types.ts
export type EndRule =
  | { type: "never" }
  | { type: "on"; date: string }
  | { type: "after"; count: number };

export type MonthlyPattern =
  | { type: "day"; day: number }
  | { type: "weekday"; weekday: number; occurrence: number };

export type Recurrence =
  | { type: "daily"; interval: number; ends: EndRule }
  | { type: "weekly"; interval: number; days: number[]; ends: EndRule }
  | {
      type: "monthly";
      interval: number;
      pattern: MonthlyPattern;
      ends: EndRule;
    }
  | { type: "custom"; days: number; ends: EndRule };

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  color: string | null;
  status: "active" | "archived";
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  recurrence: Recurrence;
  completion_type: "simple" | "count";
  target_count: number | null;
}
