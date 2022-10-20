import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const topicArn = process.env.TopicArn;

exports.publishGameHandler = async (event) => {
  const client = new SNSClient({
    region: "us-east-1",
  });

  const parsedBody = JSON.parse(event.body);
  const message = JSON.stringify(parsedBody);
  const params = {
    TopicArn: topicArn,
    Message: message,
    Subject: "NEW_GAME",
    MessageAttributes: {
      action: {
        Name: "action",
        DataType: "String",
        StringValue: "create",
      },
      entity: {
        Name: "entity",
        DataType: "String",
        StringValue: "game",
      },
    },
  };
  const command = new PublishCommand(params);

  let response;

  try {
    await client.send(command);
    response = {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify({
        message: "Game published",
      }),
    };
  } catch (error) {
    console.error(error);
    response = {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify({
        message: error instanceof Error ? error.message : "some error happened",
      }),
    };
  }
  return response;
};
