import { z } from "zod";
import { moyskladPost } from "../client.js";

export const createOrderSchema = z.object({
  organization_href: z.string().describe("Meta href of the organization (seller). Get from /entity/organization"),
  agent_href: z.string().describe("Meta href of the counterparty (buyer). Get from /entity/counterparty"),
  description: z.string().optional().describe("Order description/comment"),
  positions: z.array(z.object({
    assortment_href: z.string().describe("Meta href of the product"),
    quantity: z.number().min(1).describe("Quantity"),
    price_rubles: z.number().optional().describe("Price per unit in rubles (will be converted to kopecks)"),
  })).min(1).describe("Order line items"),
});

export async function handleCreateOrder(params: z.infer<typeof createOrderSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    organization: { meta: { href: params.organization_href, type: "organization", mediaType: "application/json" } },
    agent: { meta: { href: params.agent_href, type: "counterparty", mediaType: "application/json" } },
    positions: params.positions.map(p => ({
      quantity: p.quantity,
      price: p.price_rubles !== undefined ? Math.round(p.price_rubles * 100) : undefined,
      assortment: { meta: { href: p.assortment_href, type: "product", mediaType: "application/json" } },
    })),
  };
  if (params.description) body.description = params.description;

  const result = await moyskladPost("/entity/customerorder", body);
  return JSON.stringify(result, null, 2);
}
