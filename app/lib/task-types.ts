export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  milestone_id: string | null;
  title: string;
  description: string | null;
  completed: boolean;
  completed_at: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  start_date: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}
