import type { Request, Response } from "express";
import { verifyTransactionByReference, isValidFlutterwaveWebhookSignature } from "../lib/flutterwave.js";
import { completePaymentFromFlutterwaveVerification } from "../lib/paymentCompletion.js";

type WebhookPayload = {
  type?: string;
  data?: { status?: string; tx_ref?: string };
};

/**
 * Raw JSON body only — register before express.json().
 */
export async function flutterwaveWebhookHandler(req: Request, res: Response): Promise<void> {
  const raw =
    Buffer.isBuffer(req.body) ? req.body.toString("utf8") : typeof req.body === "string" ? req.body : "";

  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  const signature = req.headers["flutterwave-signature"] as string | undefined;

  if (secretHash) {
    if (!isValidFlutterwaveWebhookSignature(raw, signature, secretHash)) {
      res.status(401).end();
      return;
    }
  } else {
    console.warn("[flutterwave] FLUTTERWAVE_SECRET_HASH is not set — webhook signatures are not verified");
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(raw) as WebhookPayload;
  } catch {
    res.status(400).end();
    return;
  }

  if (payload.type !== "charge.completed") {
    res.status(200).end();
    return;
  }

  const txRef = payload.data?.tx_ref;
  const status = payload.data?.status;
  if (!txRef || status !== "successful") {
    res.status(200).end();
    return;
  }

  try {
    const verified = await verifyTransactionByReference(txRef);
    if (!verified) {
      res.status(500).end();
      return;
    }
    const result = await completePaymentFromFlutterwaveVerification(txRef, verified);
    if (!result.ok) {
      console.warn("[flutterwave] webhook completion failed:", result.error, { txRef });
      res.status(200).end();
      return;
    }
    res.status(200).end();
  } catch (e) {
    console.error("[flutterwave] webhook error", e);
    res.status(500).end();
  }
}
