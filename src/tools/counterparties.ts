import { z } from "zod";
import { moyskladGet, moyskladPost } from "../client.js";

// --- list_counterparties ---
export const getCounterpartiesSchema = z.object({
  search: z.string().optional().describe("Search by counterparty name"),
  filter_inn: z.string().optional().describe("Filter by INN (tax ID)"),
  filter_phone: z.string().optional().describe("Filter by phone number"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleGetCounterparties(params: z.infer<typeof getCounterpartiesSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  if (params.search) query.set("search", params.search);
  const filters: string[] = [];
  if (params.filter_inn) filters.push(`inn=${params.filter_inn}`);
  if (params.filter_phone) filters.push(`phone=${params.filter_phone}`);
  if (filters.length) query.set("filter", filters.join(";"));
  const result = await moyskladGet(`/entity/counterparty?${query.toString()}`);
  return formatCounterparties(result);
}

// --- get_counterparty ---
export const getCounterpartySchema = z.object({
  id: z.string().describe("Counterparty UUID"),
});

export async function handleGetCounterparty(params: z.infer<typeof getCounterpartySchema>): Promise<string> {
  const result = await moyskladGet(`/entity/counterparty/${params.id}`);
  return JSON.stringify(result, null, 2);
}

// --- create_counterparty ---
export const createCounterpartySchema = z.object({
  name: z.string().describe("Counterparty name (required)"),
  inn: z.string().optional().describe("INN (tax identification number)"),
  phone: z.string().optional().describe("Phone number"),
  email: z.string().optional().describe("Email address"),
  companyType: z.enum(["legal", "entrepreneur", "individual"]).default("legal").describe("Company type"),
  description: z.string().optional().describe("Comment/description"),
});

export async function handleCreateCounterparty(params: z.infer<typeof createCounterpartySchema>): Promise<string> {
  const body: Record<string, unknown> = { name: params.name, companyType: params.companyType };
  if (params.inn) body.inn = params.inn;
  if (params.phone) body.phone = params.phone;
  if (params.email) body.email = params.email;
  if (params.description) body.description = params.description;
  const result = await moyskladPost("/entity/counterparty", body);
  return JSON.stringify(result, null, 2);
}

function formatCounterparties(raw: unknown): string {
  const data = raw as { meta: { size: number }; rows: Array<Record<string, unknown>> };
  return JSON.stringify({
    total: data.meta?.size,
    counterparties: (data.rows ?? []).map((c) => ({
      id: c.id, name: c.name, phone: c.phone, email: c.email, inn: c.inn, companyType: c.companyType,
    })),
  }, null, 2);
}
