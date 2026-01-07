export interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency: string;
  completion_mode: string;
  target_count: number | null;
  specific_days: number[] | null;
  created_at: string;
}

export interface Completion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
}
