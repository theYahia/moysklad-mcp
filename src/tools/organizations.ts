import { z } from "zod";
import { moyskladGet } from "../client.js";

// --- list_organizations ---
export const listOrganizationsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(100).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleListOrganizations(params: z.infer<typeof listOrganizationsSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  const result = await moyskladGet(`/entity/organization?${query.toString()}`);
  const data = result as { meta: { size: number }; rows: Array<Record<string, unknown>> };
  return JSON.stringify({
    total: data.meta?.size,
    organizations: (data.rows ?? []).map((o) => ({
      id: o.id, name: o.name, inn: o.inn,
      meta_href: (o.meta as Record<string, unknown>)?.href,
    })),
  }, null, 2);
}
