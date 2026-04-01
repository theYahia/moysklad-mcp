import { z } from "zod";
import { moyskladPost } from "../client.js";

// --- create_demand ---
export const createDemandSchema = z.object({
  organization_href: z.string().describe("Meta href of the organization (seller)"),
  agent_href: z.string().describe("Meta href of the counterparty (buyer)"),
  store_href: z.string().describe("Meta href of the warehouse to ship from. Get from list_stores"),
  customer_order_href: z.string().optional().describe("Meta href of the linked customer order (optional)"),
  positions: z.array(z.object({
    assortment_href: z.string().describe("Meta href of the product"),
    quantity: z.number().min(0.01).describe("Quantity to ship"),
    price_rubles: z.number().optional().describe("Price per unit in RUBLES"),
  })).min(1).describe("Shipment line items"),
  description: z.string().optional().describe("Shipment description/comment"),
});

export async function handleCreateDemand(params: z.infer<typeof createDemandSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    organization: { meta: { href: params.organization_href, type: "organization", mediaType: "application/json" } },
    agent: { meta: { href: params.agent_href, type: "counterparty", mediaType: "application/json" } },
    store: { meta: { href: params.store_href, type: "store", mediaType: "application/json" } },
    positions: params.positions.map((p) => {
      const pos: Record<string, unknown> = {
        quantity: p.quantity,
        assortment: { meta: { href: p.assortment_href, type: "product", mediaType: "application/json" } },
      };
      if (p.price_rubles !== undefined) pos.price = Math.round(p.price_rubles * 100);
      return pos;
    }),
  };
  if (params.customer_order_href) {
    body.customerOrder = { meta: { href: params.customer_order_href, type: "customerorder", mediaType: "application/json" } };
  }
  if (params.description) body.description = params.description;
  const result = await moyskladPost("/entity/demand", body);
  const d = result as Record<string, unknown>;
  return JSON.stringify({
    id: d.id, name: d.name, moment: d.moment,
    sum_rubles: typeof d.sum === "number" ? (d.sum as number) / 100 : null,
    created: d.created,
  }, null, 2);
}
