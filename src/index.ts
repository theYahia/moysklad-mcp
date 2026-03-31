#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  searchProductsSchema, handleSearchProducts,
  getProductSchema, handleGetProduct,
  createProductSchema, handleCreateProduct,
  updatePricesSchema, handleUpdatePrices,
} from "./tools/products.js";
import { getStockSchema, handleGetStock } from "./tools/stock.js";
import { createCustomerOrderSchema, handleCreateCustomerOrder, getOrdersSchema, handleGetOrders } from "./tools/orders.js";
import { getCounterpartiesSchema, handleGetCounterparties } from "./tools/counterparties.js";
import { getProfitReportSchema, handleGetProfitReport } from "./tools/reports.js";
import { createSupplySchema, handleCreateSupply } from "./tools/supply.js";

const server = new McpServer({ name: "moysklad-mcp", version: "2.0.0" });

server.tool("search_products", "Search products in MoySklad by name or article. Prices returned in RUBLES.", searchProductsSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleSearchProducts(params) }] }));

server.tool("get_product", "Get a single product by UUID. Prices returned in RUBLES.", getProductSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetProduct(params) }] }));

server.tool("create_product", "Create a new product. Prices in RUBLES (converted to kopecks internally).", createProductSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleCreateProduct(params) }] }));

server.tool("get_stock", "Get current stock/inventory report. Shows quantities, reserves, and in-transit.", getStockSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetStock(params) }] }));

server.tool("update_prices", "Update sale/buy/min prices for a product. Prices in RUBLES.", updatePricesSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleUpdatePrices(params) }] }));

server.tool("get_counterparties", "Search counterparties (customers/suppliers) by name or INN.", getCounterpartiesSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetCounterparties(params) }] }));

server.tool("create_customer_order", "Create a customer order. Prices in RUBLES (converted to kopecks).", createCustomerOrderSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleCreateCustomerOrder(params) }] }));

server.tool("get_orders", "Get customer orders with filtering and sorting. Sums in RUBLES.", getOrdersSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetOrders(params) }] }));

server.tool("get_profit_report", "Get profit report by product. Shows sales, costs, returns, profit, margin.", getProfitReportSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetProfitReport(params) }] }));

server.tool("create_supply", "Create an incoming supply (purchase receipt). Prices in RUBLES.", createSupplySchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleCreateSupply(params) }] }));

async function main() {
  const httpPort = process.env.HTTP_PORT || (process.argv.includes("--http") ? process.argv[process.argv.indexOf("--http") + 1] : null);
  if (httpPort) {
    const port = parseInt(String(httpPort), 10) || 3000;
    await startHttpTransport(port);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[moysklad-mcp] Server started (stdio). 10 tools available.`);
  }
}

async function startHttpTransport(port: number) {
  const { createServer } = await import("node:http");
  const { StreamableHTTPServerTransport } = await import("@modelcontextprotocol/sdk/server/streamableHttp.js");
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined as unknown as (() => string) });
  const httpServer = createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", tools: 10, transport: "streamable-http" }));
      return;
    }
    if (req.url === "/mcp") { await transport.handleRequest(req, res); return; }
    res.writeHead(404); res.end("Not found. Use /mcp or /health.");
  });
  await server.connect(transport);
  httpServer.listen(port, () => {
    console.error(`[moysklad-mcp] HTTP server on port ${port}. 10 tools available.`);
  });
}

const isDirectRun = process.argv[1]?.endsWith("index.js") || process.argv[1]?.endsWith("index.ts");
if (isDirectRun) {
  main().catch((error) => { console.error("[moysklad-mcp] Error:", error); process.exit(1); });
}

export { server };
