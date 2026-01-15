export interface Completion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  count: number;
  completed_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompletionSummary {
  habit_id: string;
  completed_date: string;
  total_count: number;
  num_entries: number;
  completion_times: string[];
  last_updated: string;
}

export interface DailyProgress {
  date: string;
  isActive: boolean;
  completedCount: number;
  targetCount: number;
  isFullyCompleted: boolean;
  completionRate: number;
}
