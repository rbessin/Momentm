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
