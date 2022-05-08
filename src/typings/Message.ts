export interface Message {
  id: string;
  from: string;
  to: string[];
  topic_type: "game" | "community";
  topic_id: string;
  message: string;
  created_at: string;
  record_type: "text";
  failedToSend?: boolean;
}

export interface GameMessage extends Message {
  topic_type: "game";
}

export interface CommunityMessage extends Message {
  topic_type: "community";
}
