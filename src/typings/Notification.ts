export interface Notification {
  type: string;
  id: number;
  created_at: string;
  user_id: string;
  message: string;
  related_url?: string;
  read: boolean;
  email: string;
  custom_fields?: Record<string, unknown>;
}
