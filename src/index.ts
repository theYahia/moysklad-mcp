#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { searchProductsSchema, handleSearchProducts } from "./tools/products.js";
import { getStockSchema, handleGetStock } from "./tools/stock.js";
import { createOrderSchema, handleCreateOrder } from "./tools/orders.js";
import { getCounterpartiesSchema, handleGetCounterparties } from "./tools/counterparties.js";

const server = new McpServer({
  name: "moysklad-mcp",
  version: "1.0.0",
});

server.tool(
  "search_products",
  "Search products in MoySklad by name or article. Prices are in kopecks (divide by 100 for rubles).",
  searchProductsSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleSearchProducts(params) }] }),
);

server.tool(
  "get_stock",
  "Get current stock/inventory report from MoySklad. Shows quantities, reserves, and in-transit.",
  getStockSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetStock(params) }] }),
);

server.tool(
  "create_order",
  "Create a customer order in MoySklad. Prices should be in rubles (converted to kopecks automatically).",
  createOrderSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleCreateOrder(params) }] }),
);

server.tool(
  "get_counterparties",
  "Search counterparties (customers/suppliers) in MoySklad by name or INN.",
  getCounterpartiesSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetCounterparties(params) }] }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[moysklad-mcp] Server started. 4 tools available. Note: all prices in kopecks.");
}

main().catch((error) => {
  console.error("[moysklad-mcp] Error:", error);
  process.exit(1);
});
