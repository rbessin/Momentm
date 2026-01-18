export interface Note {
  id: string;
  user_id: string;
  project_id: string | null;
  task_id: string | null;
  title: string | null;
  content: {
    type: "text" | "drawing";
    text?: string;
    drawing?: string;
  };
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}
