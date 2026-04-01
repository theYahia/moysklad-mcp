import { z } from "zod";
import { moyskladGet } from "../client.js";

// --- list_stores ---
export const listStoresSchema = z.object({
  limit: z.number().int().min(1).max(100).default(100).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleListStores(params: z.infer<typeof listStoresSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  const result = await moyskladGet(`/entity/store?${query.toString()}`);
  const data = result as { meta: { size: number }; rows: Array<Record<string, unknown>> };
  return JSON.stringify({
    total: data.meta?.size,
    stores: (data.rows ?? []).map((s) => ({
      id: s.id, name: s.name, address: s.address,
      meta_href: (s.meta as Record<string, unknown>)?.href,
    })),
  }, null, 2);
}
