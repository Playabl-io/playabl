import { Integration } from "@/typings/Integration";

export function makeNewIntegration(
  communityId: string
): Omit<Integration, "id"> {
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

export function makeSlackMessage({
  creator,
  name,
  description,
  url,
  imageUrl,
}: {
  creator: string;
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
}) {
  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "New game on Playabl",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${creator}* has just added a new game!`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${name}*\n\n${description}`,
        },
        ...(imageUrl && {
          accessory: {
            type: "image",
            image_url: imageUrl,
            alt_text: "game cover image",
          },
        }),
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<${url}|View on Playabl>`,
        },
      },
    ],
  };
}
