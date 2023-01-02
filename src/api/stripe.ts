import { supabase } from "@/supabase";
import { log } from "@/util/logger";
import axios from "axios";
import Stripe from "stripe";

export async function checkStripeSetup(stripeAccountId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userToken = session?.access_token;
  if (!userToken) return;

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_PLAYABL_API}/customer/check`,
      {
        headers: {
          Authorization: userToken,
        },
        params: {
          stripeAccountId,
        },
      }
    );
    return data;
  } catch (error) {
    log({ error });
  }
}

export async function getStripePrices(stripeAccountId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userToken = session?.access_token;
  if (!userToken) return;

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_PLAYABL_API}/customer/prices`,
      {
        headers: {
          Authorization: userToken,
        },
        params: {
          stripeAccountId,
        },
      }
    );
    return data;
  } catch (error) {
    log({ error });
  }
}

export async function getStripePrice({
  stripeAccountId,
  priceId,
}: {
  stripeAccountId: string;
  priceId: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userToken = session?.access_token;
  if (!userToken) return;

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_PLAYABL_API}/customer/price`,
      {
        headers: {
          Authorization: userToken,
        },
        params: {
          stripeAccountId,
          priceId,
        },
      }
    );
    return data;
  } catch (error) {
    log({ error });
  }
}

export async function updateStripePice({
  stripeAccountId,
  priceId,
  update,
}: {
  stripeAccountId: string;
  priceId: string;
  update: Stripe.PriceUpdateParams;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userToken = session?.access_token;
  if (!userToken) return;

  try {
    const { data } = await axios.put(
      `${import.meta.env.VITE_PLAYABL_API}/customer/price`,
      {
        stripeAccountId,
        priceId,
        update,
      },
      {
        headers: {
          Authorization: userToken,
        },
      }
    );
    return data;
  } catch (error) {
    log({ error });
  }
}

export async function getStripeProduct({
  stripeAccountId,
  productId,
}: {
  stripeAccountId: string;
  productId: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userToken = session?.access_token;
  if (!userToken) return;

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_PLAYABL_API}/customer/product`,
      {
        headers: {
          Authorization: userToken,
        },
        params: {
          stripeAccountId,
          productId,
        },
      }
    );
    return data;
  } catch (error) {
    log({ error });
  }
}

export async function createStripeAccount(communityId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userToken = session?.access_token;
  if (!userToken) return;

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_PLAYABL_API}/customer/create`,
      {
        communityId,
      },
      {
        headers: {
          Authorization: userToken,
        },
      }
    );
    return data;
  } catch (error) {
    log({ error });
  }
}

export async function finishStripeSetup({
  communityId,
  stripeAccountId,
}: {
  communityId: string;
  stripeAccountId: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userToken = session?.access_token;
  if (!userToken) return;

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_PLAYABL_API}/customer/create`,
      {
        communityId,
        stripeAccountId,
      },
      {
        headers: {
          Authorization: userToken,
        },
      }
    );
    return data;
  } catch (error) {
    log({ error });
  }
}

export async function createStripePaymentLink({
  stripeAccountId,
  priceId,
  metadata,
}: {
  stripeAccountId: string;
  priceId: string;
  customer?: {
    id: string;
    email: string;
    stripeCustomerId?: string;
  };
  metadata: Record<string, string>;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userToken = session?.access_token;
  if (!userToken) return;

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_PLAYABL_API}/customer/paymentLink`,
      {
        stripeAccountId,
        priceId,
        metadata,
      },
      {
        headers: {
          Authorization: userToken,
        },
      }
    );
    return data;
  } catch (error) {
    log({ error });
  }
}

export async function getStripePaymentLink({
  stripeAccountId,
  paymentLinkId,
}: {
  stripeAccountId: string;
  paymentLinkId: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userToken = session?.access_token;
  if (!userToken) return;

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_PLAYABL_API}/customer/paymentLink`,
      {
        headers: {
          Authorization: userToken,
        },
        params: {
          stripeAccountId,
          paymentLinkId,
        },
      }
    );
    return data;
  } catch (error) {
    log({ error });
  }
}

export async function updateStripePaymentLink({
  stripeAccountId,
  paymentLinkId,
  update,
}: {
  stripeAccountId: string;
  paymentLinkId: string;
  update: Stripe.PaymentLinkUpdateParams;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userToken = session?.access_token;
  if (!userToken) return;

  try {
    const { data } = await axios.put(
      `${import.meta.env.VITE_PLAYABL_API}/customer/paymentLink`,
      {
        stripeAccountId,
        paymentLinkId,
        update,
      },
      {
        headers: {
          Authorization: userToken,
        },
      }
    );
    return data;
  } catch (error) {
    log({ error });
  }
}

export async function setActiveJoinPrice({
  communityId,
  priceId,
}: {
  communityId: string;
  priceId: string;
}) {
  const { data, error } = await supabase
    .from("communities")
    .update({
      join_price_id: priceId,
      allow_public_signup: false,
    })
    .eq("id", communityId);

  if (error) {
    log({ error });
  }

  return data;
}

export async function disablePaidAccess({
  communityId,
}: {
  communityId: string;
}) {
  const { data, error } = await supabase
    .from("communities")
    .update({
      join_price_id: null,
      join_payment_link: null,
      join_payment_link_id: null,
    })
    .eq("id", communityId);

  if (error) {
    log({ error });
  }

  return data;
}

export async function setJoinPaymentLink({
  communityId,
  paymentLink,
  paymentLinkId,
}: {
  communityId: string;
  paymentLink: string;
  paymentLinkId: string;
}) {
  const { data, error } = await supabase
    .from("communities")
    .update({
      join_payment_link: paymentLink,
      join_payment_link_id: paymentLinkId,
    })
    .eq("id", communityId);

  if (error) {
    log({ error });
  }

  return data;
}
