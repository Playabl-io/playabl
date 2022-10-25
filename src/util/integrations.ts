import { Integration } from "@/typings/Integration";

export function makeNewIntegration(
  communityId: string
): Omit<Integration, "id" | "created_at" | "updated_at"> {
  return {
    type: "slack",
    triggers: [
      {
        action: "create",
        active: false,
        label: "When a user joins the community",
        entity: "user",
      },
      {
        action: "create",
        active: false,
        label: "When a new game is posted",
        entity: "game",
      },
    ],
    endpoint: "",
    name: "",
    community_id: communityId,
    is_active: false,
  };
}
