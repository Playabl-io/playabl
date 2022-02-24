export interface Notification {
  id: number;
  created_at: string;
  user_id: string;
  message: string;
  related_url?: string;
  read: boolean;
  email: string;
}
