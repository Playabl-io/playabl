/* eslint-disable no-case-declarations */
import { APIGatewayEvent } from "aws-lambda";
import Stripe from "stripe";
import { supabase } from "./supabase";
import axios from "axios";

const stripeKey = process.env.StripeSecretKey;
const stripe = new Stripe(stripeKey, {
  apiVersion: "2022-08-01",
});

export async function createStripeAccount(event: APIGatewayEvent) {
  const { communityId } = JSON.parse(event.body);
  const account = await stripe.accounts.create({ type: "standard" });
  const { error } = await supabase
    .from("communities")
    .update({ stripe_account_id: account.id })
    .eq("id", communityId)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    return_url: `https://app.playabl.io/communities/${communityId}/manage/access`,
    refresh_url: `https://app.playabl.io/communities/${communityId}/manage/access/reauth`,
    type: "account_onboarding",
  });
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify({
      redirect_url: accountLink.url,
    }),
  };
}

export async function finishStripeSetup(event: APIGatewayEvent) {
  const { stripeAccountId, communityId } = JSON.parse(event.body);
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    return_url: `https://app.playabl.io/communities/${communityId}/manage/access`,
    refresh_url: `https://app.playabl.io/communities/${communityId}/manage/access/reauth`,
    type: "account_onboarding",
  });
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify({
      redirect_url: accountLink.url,
    }),
  };
}

export async function checkStripeSetup(event: APIGatewayEvent) {
  const stripeAccountId = event.queryStringParameters.stripeAccountId;
  const account = await stripe.accounts.retrieve(stripeAccountId);
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify({
      setup_complete: account.details_submitted,
    }),
  };
}

export async function getStripePrices(event: APIGatewayEvent) {
  const stripeAccountId = event.queryStringParameters.stripeAccountId;
  const prices = await stripe.prices.list(
    { limit: 10, expand: ["data.product"] },
    { stripeAccount: stripeAccountId }
  );
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(prices),
  };
}

export async function getStripePrice(event: APIGatewayEvent) {
  const stripeAccountId = event.queryStringParameters.stripeAccountId;
  const priceId = event.queryStringParameters.priceId;
  const price = await stripe.prices.retrieve(
    priceId,
    { expand: ["product"] },
    { stripeAccount: stripeAccountId }
  );
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(price),
  };
}

export async function updateStripePrice(event: APIGatewayEvent) {
  const { update, priceId, stripeAccountId } = JSON.parse(event.body);
  const price = await stripe.prices.update(priceId, update, {
    stripeAccount: stripeAccountId,
  });
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(price),
  };
}

export async function getStripeProduct(event: APIGatewayEvent) {
  const stripeAccountId = event.queryStringParameters.stripeAccountId;
  const productId = event.queryStringParameters.productId;
  const product = await stripe.products.retrieve(productId, {
    stripeAccount: stripeAccountId,
  });
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(product),
  };
}

/**
 * Payment links
 */
export async function createPaymentLink(event: APIGatewayEvent) {
  const { stripeAccountId, priceId, metadata } = JSON.parse(event.body);

  const price = await stripe.prices.retrieve(
    priceId,
    { expand: ["product"] },
    { stripeAccount: stripeAccountId }
  );

  const params: Stripe.PaymentLinkCreateParams = {
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
  };

  if (price.type === "recurring") {
    params.application_fee_percent = 3;
  }

  if (price.type === "one_time") {
    let applicationFeeAmount;
    if (price.unit_amount) {
      applicationFeeAmount = Math.max(price.unit_amount * 0.03, 0.25);
    } else {
      applicationFeeAmount = 1;
    }
    params.application_fee_amount = applicationFeeAmount;
  }

  const paymentLink = await stripe.paymentLinks.create(params, {
    stripeAccount: stripeAccountId,
  });
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(paymentLink),
  };
}

export async function getStripePaymentLink(event: APIGatewayEvent) {
  const stripeAccountId = event.queryStringParameters.stripeAccountId;
  const paymentLinkId = event.queryStringParameters.paymentLinkId;
  const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId, {
    stripeAccount: stripeAccountId,
  });
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(paymentLink),
  };
}

export async function updateStripePaymentLink(event: APIGatewayEvent) {
  const { update, paymentLinkId, stripeAccountId } = JSON.parse(event.body);
  const paymentLink = await stripe.paymentLinks.update(paymentLinkId, update, {
    stripeAccount: stripeAccountId,
  });
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(paymentLink),
  };
}

export async function handleStripeWebhook(event: APIGatewayEvent) {
  const sig = event.headers["Stripe-Signature"];
  const webhookSecret = process.env.StripeWebhookKey;
  let webhookEvent;

  try {
    webhookEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.log(err);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  await sendToSlack(webhookEvent);
  // Handle the event
  switch (webhookEvent.type) {
    case "account.updated":
      const accountObject = webhookEvent.data.object;
      console.log({ accountObject });
      // Then define and call a function to handle the webhookEvent account.updated
      break;
    case "application_fee.created":
      const applicationFeeObject = webhookEvent.data.object;
      console.log({ applicationFeeObject });
      // Then define and call a function to handle the webhookEvent application_fee.created
      break;
    case "checkout.session.completed":
      const checkoutSessionCompleted = webhookEvent.data.object;
      const {
        playabl_community_id: communityId,
        payment_link_type: linkType,
        access_levels: accessLevels,
      } = checkoutSessionCompleted.metadata;
      const email = checkoutSessionCompleted.customer_details.email;

      if (linkType === "community_join") {
        await provisionUserAccess({
          email,
          communityId,
          accessLevels,
        });
      }
      // Then define and call a function to handle the webhookEvent charge.failed
      break;
    case "charge.failed":
      const chargeFailedObject = webhookEvent.data.object;
      console.log({ chargeFailedObject });
      // Then define and call a function to handle the webhookEvent charge.failed
      break;
    case "charge.succeeded":
      const chargeSucceededObject = webhookEvent.data.object;
      console.log({ chargeSucceededObject });
      // Then define and call a function to handle the webhookEvent charge.succeeded
      break;
    case "customer.subscription.created":
      const subscriptionCreated = webhookEvent.data.object;
      console.log({ subscriptionCreated });
      // Then define and call a function to handle the webhookEvent customer.subscription.created
      break;
    case "customer.subscription.deleted":
      const subscriptionDeleted = webhookEvent.data.object;
      console.log({ subscriptionDeleted });
      // Then define and call a function to handle the webhookEvent customer.subscription.deleted
      break;
    case "customer.subscription.updated":
      const subscriptionUpdated = webhookEvent.data.object;
      console.log({ subscriptionUpdated });
      // Then define and call a function to handle the webhookEvent customer.subscription.updated
      break;
    case "invoice.paid":
      const invoicePaid = webhookEvent.data.object;
      console.log({ invoicePaid });
      // Then define and call a function to handle the webhookEvent customer.subscription.updated
      break;
    case "payment_intent.requires_action":
      const paymentIntentRequiresAction = webhookEvent.data.object;
      console.log({ paymentIntentRequiresAction });
      // Then define and call a function to handle the webhookEvent payment_intent.requires_action
      break;
    case "payment_intent.succeeded":
      const paymentIntentSucceeded = webhookEvent.data.object;
      console.log({ paymentIntentSucceeded });
      // Then define and call a function to handle the webhookEvent payment_intent.succeeded
      break;
    case "payment_link.created":
      const paymentLinkCreated = webhookEvent.data.object;
      console.log({ paymentLinkCreated });
      // Then define and call a function to handle the webhookEvent payment_link.created
      break;
    case "radar.early_fraud_warning.created":
      const earlyFraudWarningCreated = webhookEvent.data.object;
      console.log({ earlyFraudWarningCreated });
      // Then define and call a function to handle the webhookEvent radar.early_fraud_warning.created
      break;
    // ... handle other webhookEvent types
    default:
      console.log(`Unhandled webhookEvent type ${webhookEvent.type}`);
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
  };
}

async function checkForUser(email: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  if (data) return data;
}

async function addUserToCommunity({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  const { error } = await supabase
    .from("community_memberships")
    .insert({
      community_id: communityId,
      user_id: userId,
      role_id: 3,
    })
    .single();
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
}

async function assignUserAccess({
  userId,
  communityId,
  accessLevelIds,
}: {
  userId: string;
  communityId: string;
  accessLevelIds: string[];
}) {
  console.log(
    `Adding user access to ${communityId} for levels ${accessLevelIds}`
  );
  const { error } = await supabase.from("community_access").insert(
    accessLevelIds.map((accessLevelId) => ({
      community_id: communityId,
      user_id: userId,
      access_level_id: accessLevelId,
    }))
  );
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
}

async function provisionUserAccess({
  email,
  communityId,
  accessLevels,
}: {
  email: string;
  communityId: string;
  accessLevels: string;
}) {
  console.log("Provision access for", email);
  const accessLevelIds = JSON.parse(accessLevels ?? "[]");
  const user = await checkForUser(email);
  if (!user) {
    throw new Error("Unable to find a user to provision access to!");
  }
  await addUserToCommunity({ userId: user.id, communityId });
  await assignUserAccess({ userId: user.id, communityId, accessLevelIds });
}

function sendToSlack(webhookEvent) {
  return axios.post(process.env.SlackStripeWebhook, {
    text: "New stripe event",
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: webhookEvent.type,
        },
      },
      {
        type: "section",
        text: {
          type: "plain_text",
          text: webhookEvent.account,
        },
      },
      {
        type: "section",
        text: {
          type: "plain_text",
          text: JSON.stringify(webhookEvent),
        },
      },
    ],
  });
}
