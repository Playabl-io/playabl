import { Community } from "./Community";

export interface IntegrationTrigger {
  active: boolean;
  action: "create" | "delete";
  label: string;
  entity: "game" | "user";
}

export interface Integration {
  id: number;
  created_at: string;
  updated_at: string | null;
  type: "slack" | "discord" | "http";
  is_active: boolean;
  endpoint: string;
  name: string;
  triggers: IntegrationTrigger[];
  community_id: Community["id"];
  slack_access_token?: string;
  slack_configuration?: {
    url: string;
    channel: string;
    configuration_url: string;
  };
}
