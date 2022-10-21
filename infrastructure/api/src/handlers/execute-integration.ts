import { SNSEvent } from "aws-lambda";
import { supabase } from "./supabase";
import axios from "axios";

export const processGameIntegration = async (event: SNSEvent) => {
  const entityType = event.Records[0].Sns.MessageAttributes.entity.Value;
  const action = event.Records[0].Sns.MessageAttributes.action.Value;
  const message = JSON.parse(event.Records[0].Sns.Message);
  const integration = message.integration;
  const entity = message[entityType];

  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", entity.creator_id)
    .single();

  let publicUrl;
  if (entity.cover_image) {
    publicUrl = await getCoverImageUrl(entity.cover_image);
  }

  const messageCreator = {
    slack: {
      create: makeSlackMessageForNewGame,
    },
    discord: {
      create: makeDiscordMessageForNewGame,
    },
    http: {
      create: makeHttpMessageForNewGame,
    },
  };

  const result = messageCreator[integration.type]?.[action]?.({
    text: "New game added to Playabl",
    creator: data?.username,
    name: entity.title,
    description: entity.description_as_flat_text,
    url: `https://app.playabl.io/games/${entity.id}`,
    imageUrl: publicUrl,
  });
  await axios.post(integration.endpoint, result);
};

export const getCoverImageUrl = async (path: string) => {
  const { data: publicURL } = await supabase.storage
    .from("cover-images")
    .getPublicUrl(path);
  return publicURL.publicUrl ?? "";
};

function makeHttpMessageForNewGame({
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
    creator,
    name,
    description,
    url,
    imageUrl,
  };
}

function makeDiscordMessageForNewGame({
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
    embeds: [
      {
        title: `New game on Playabl - ${name}`,
        description: `Posted by ${creator}\n\n${description}`,
        url,
        ...(imageUrl && {
          image: {
            url: imageUrl,
          },
        }),
      },
    ],
  };
}

function makeSlackMessageForNewGame({
  text,
  creator,
  name,
  description,
  url,
  imageUrl,
}: {
  text: string;
  creator: string;
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
}) {
  return {
    text,
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
