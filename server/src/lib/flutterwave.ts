import crypto from "node:crypto";

const FW_API = "https://api.flutterwave.com/v3";

/** Currencies we treat as whole units for the amount string (matches typical FW + app usage). */
const WHOLE_UNIT_CURRENCIES = new Set([
  "NGN",
  "KES",
  "GHS",
  "UGX",
  "TZS",
  "ZAR",
  "RWF",
  "XAF",
  "XOF",
  "ZMW",
]);

export function formatFlutterwaveAmount(total: number, currency: string): string {
  const c = currency.toUpperCase();
  if (WHOLE_UNIT_CURRENCIES.has(c)) {
    return String(Math.round(total));
  }
  return total.toFixed(2);
}

export type FlutterwaveVerifyData = {
  id: number;
  tx_ref: string;
  status: string;
  amount: number;
  currency: string;
  charged_amount?: number;
};

function parseVerifyData(d: Record<string, unknown>): FlutterwaveVerifyData | null {
  const idRaw = d.id;
  const id = typeof idRaw === "number" ? idRaw : typeof idRaw === "string" ? Number(idRaw) : NaN;
  if (!Number.isFinite(id) || typeof d.tx_ref !== "string" || typeof d.status !== "string") {
    return null;
  }
  return {
    id,
    tx_ref: d.tx_ref,
    status: d.status,
    amount: Number(d.amount),
    currency: String(d.currency),
    charged_amount: d.charged_amount != null ? Number(d.charged_amount) : undefined,
  };
}

export async function initializeStandardPayment(params: {
  txRef: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  customer: { email: string; name: string; phone_number?: string };
  meta?: Record<string, string>;
}): Promise<{ link: string }> {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) {
    throw new Error("Flutterwave is not configured (FLUTTERWAVE_SECRET_KEY)");
  }

  const body: Record<string, unknown> = {
    tx_ref: params.txRef,
    amount: formatFlutterwaveAmount(params.amount, params.currency),
    currency: params.currency.toUpperCase(),
    redirect_url: params.redirectUrl,
    customer: {
      email: params.customer.email,
      name: params.customer.name,
      ...(params.customer.phone_number ? { phone_number: params.customer.phone_number } : {}),
    },
    customizations: {
      title: process.env.FLUTTERWAVE_CHECKOUT_TITLE ?? "Lumetra Learning",
      description: "Tutoring subscription",
    },
  };

  if (params.meta && Object.keys(params.meta).length > 0) {
    body.meta = params.meta;
  }

  const res = await fetch(`${FW_API}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    status?: string;
    message?: string;
    data?: { link?: string };
  };

  if (!res.ok || json.status !== "success" || !json.data?.link) {
    throw new Error(json.message || `Flutterwave checkout failed (${res.status})`);
  }

  return { link: json.data.link };
}

export async function verifyTransactionByReference(txRef: string): Promise<FlutterwaveVerifyData | null> {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) {
    throw new Error("Flutterwave is not configured (FLUTTERWAVE_SECRET_KEY)");
  }

  const url = `${FW_API}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${secret}` },
  });

  const json = (await res.json()) as {
    status?: string;
    data?: Record<string, unknown>;
  };

  if (json.status !== "success" || !json.data) {
    return null;
  }

  return parseVerifyData(json.data);
}

export async function verifyTransactionById(transactionId: string): Promise<FlutterwaveVerifyData | null> {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) {
    throw new Error("Flutterwave is not configured (FLUTTERWAVE_SECRET_KEY)");
  }

  const res = await fetch(`${FW_API}/transactions/${encodeURIComponent(transactionId)}/verify`, {
    headers: { Authorization: `Bearer ${secret}` },
  });

  const json = (await res.json()) as {
    status?: string;
    data?: Record<string, unknown>;
  };

  if (json.status !== "success" || !json.data) {
    return null;
  }

  return parseVerifyData(json.data);
}

export function isValidFlutterwaveWebhookSignature(rawBody: string, signature: string | undefined, secretHash: string): boolean {
  if (!signature) return false;
  const hash = crypto.createHmac("sha256", secretHash).update(rawBody).digest("base64");
  return hash === signature;
}
