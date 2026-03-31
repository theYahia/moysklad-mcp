import { z } from "zod";
import { moyskladGet } from "../client.js";

export const getStockSchema = z.object({
  search: z.string().optional().describe("Search by product name"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
  group_by: z.enum(["product", "variant", "store"]).default("product").describe("Group results by product, variant, or store"),
});

export async function handleGetStock(params: z.infer<typeof getStockSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  query.set("groupBy", params.group_by);
  if (params.search) query.set("search", params.search);

  const result = await moyskladGet(`/report/stock/all?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
