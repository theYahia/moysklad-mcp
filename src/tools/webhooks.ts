import { z } from "zod";
import { moyskladGet, moyskladPost } from "../client.js";

// --- list_webhooks ---
export const listWebhooksSchema = z.object({
  limit: z.number().int().min(1).max(100).default(100).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleListWebhooks(params: z.infer<typeof listWebhooksSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  const result = await moyskladGet(`/entity/webhook?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}

// --- create_webhook ---
export const createWebhookSchema = z.object({
  url: z.string().url().describe("Webhook callback URL (must be HTTPS)"),
  action: z.enum(["CREATE", "UPDATE", "DELETE"]).describe("Which entity action triggers the webhook"),
  entityType: z.string().describe("Entity type to watch, e.g. 'customerorder', 'product', 'demand', 'counterparty'"),
});

export async function handleCreateWebhook(params: z.infer<typeof createWebhookSchema>): Promise<string> {
  const body = { url: params.url, action: params.action, entityType: params.entityType };
  const result = await moyskladPost("/entity/webhook", body);
  return JSON.stringify(result, null, 2);
}
