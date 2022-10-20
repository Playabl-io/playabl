import { SNSEvent } from "aws-lambda";
import { supabase } from "./supabase";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const topicArn = process.env.TopicArn;

export const checkGameForIntegration = async (event: SNSEvent) => {
  const game = JSON.parse(event.Records[0].Sns.Message);
  const { data, error, status } = await supabase
    .from("integrations")
    .select("*")
    .eq("community_id", game.community_id)
    .order("created_at");
  if (error && status !== 406) {
    console.log(error.message);
    console.log(error.details);
  }
  if (!data) return;
  const activeGameIntegrations = data?.filter((integration) => {
    return (
      integration.is_active &&
      integration.triggers.some(
        (trigger) => trigger.entity === "game" && trigger.active
      )
    );
  });

  if (activeGameIntegrations.length > 0) {
    const action = event.Records[0].Sns.MessageAttributes.action;
    const client = new SNSClient({
      region: "us-east-1",
    });

    for (const integration of activeGameIntegrations) {
      const params = {
        TopicArn: topicArn,
        Subject: "NEW_GAME",
        Message: JSON.stringify({ integration, game }),
        MessageAttributes: {
          action: {
            Name: "action",
            DataType: "String",
            StringValue: action.Value,
          },
          entity: {
            Name: "entity",
            DataType: "String",
            StringValue: "game",
          },
        },
      };
      const command = new PublishCommand(params);
      try {
        await client.send(command);
      } catch (error) {
        console.log(error);
      }
    }
  }
};
