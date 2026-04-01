import { describe, it, expect, vi } from "vitest";

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn(),
}));

// Prevent process.exit from killing the test runner
vi.spyOn(process, "exit").mockImplementation((() => {}) as any);

describe("server smoke test", () => {
  it("registers exactly 21 tools", async () => {
    const { server } = await import("../src/index.js");
    const s = server as any;
    expect(s._registeredTools).toBeDefined();
    const toolNames = Object.keys(s._registeredTools);
    expect(toolNames.length).toBe(21);
    const expected = [
      "search_products", "get_product", "create_product", "update_prices",
      "get_stock", "get_stock_by_store",
      "get_counterparties", "get_counterparty", "create_counterparty",
      "create_customer_order", "get_orders", "get_customer_order", "update_customer_order_status",
      "create_demand", "create_supply",
      "list_stores", "list_organizations",
      "get_profit_report", "get_sales_report",
      "list_webhooks", "create_webhook",
    ];
    for (const n of expected) {
      expect(toolNames).toContain(n);
    }
  });
});
