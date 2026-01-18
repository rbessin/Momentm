export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  status: "active" | "completed" | "on-hold" | "archived";
  start_date: string | null;
  target_end_date: string | null;
  actual_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  completed: boolean;
  completed_at: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}
