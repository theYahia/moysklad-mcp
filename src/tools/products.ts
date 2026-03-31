import { z } from "zod";
import { moyskladGet } from "../client.js";

export const searchProductsSchema = z.object({
  search: z.string().optional().describe("Search query for product name"),
  filter_article: z.string().optional().describe("Filter by article/SKU"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results (max 1000)"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleSearchProducts(params: z.infer<typeof searchProductsSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  if (params.search) query.set("search", params.search);
  if (params.filter_article) query.set("filter", `article=${params.filter_article}`);

  const result = await moyskladGet(`/entity/product?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
