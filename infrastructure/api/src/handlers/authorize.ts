import { supabase } from "./supabase";

exports.authorizer = async (event) => {
  const token = event.authorizationToken;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user || user.aud !== "authenticated") {
      return {
        principalId: token || "", // The principal user identification associated with the token sent by the client.
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "*",
              Effect: "Deny",
              Resource: "arn:aws:execute-api:us-east-1:*:*",
            },
          ],
        },
      };
    }

    // Send response to caller
    return {
      principalId: user.id, // The principal user identification associated with the token sent by the client.
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "arn:aws:execute-api:us-east-1:*:*",
          },
        ],
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
