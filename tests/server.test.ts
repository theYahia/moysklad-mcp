import { describe, it, expect, vi } from "vitest";

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn(),
}));

// Prevent process.exit from killing the test runner
vi.spyOn(process, "exit").mockImplementation((() => {}) as any);

describe("server smoke test", () => {
  it("registers exactly 10 tools", async () => {
    const { server } = await import("../src/index.js");
    const s = server as any;
    expect(s._registeredTools).toBeDefined();
    const toolNames = Object.keys(s._registeredTools);
    expect(toolNames.length).toBe(10);
    const expected = [
      "search_products", "get_product", "create_product", "get_stock",
      "update_prices", "get_counterparties", "create_customer_order",
      "get_orders", "get_profit_report", "create_supply",
    ];
    for (const n of expected) {
      expect(toolNames).toContain(n);
    }
  });
});
