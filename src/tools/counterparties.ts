import { z } from "zod";
import { moyskladGet } from "../client.js";

export const getCounterpartiesSchema = z.object({
  search: z.string().optional().describe("Search by counterparty name"),
  filter_inn: z.string().optional().describe("Filter by INN (tax ID)"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleGetCounterparties(params: z.infer<typeof getCounterpartiesSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  if (params.search) query.set("search", params.search);
  if (params.filter_inn) query.set("filter", `inn=${params.filter_inn}`);

  const result = await moyskladGet(`/entity/counterparty?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
