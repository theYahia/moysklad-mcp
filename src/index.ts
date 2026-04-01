#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  searchProductsSchema, handleSearchProducts,
  getProductSchema, handleGetProduct,
  createProductSchema, handleCreateProduct,
  updatePricesSchema, handleUpdatePrices,
} from "./tools/products.js";
import { getStockSchema, handleGetStock, getStockByStoreSchema, handleGetStockByStore } from "./tools/stock.js";
import {
  createCustomerOrderSchema, handleCreateCustomerOrder,
  getOrdersSchema, handleGetOrders,
  getCustomerOrderSchema, handleGetCustomerOrder,
  updateCustomerOrderStatusSchema, handleUpdateCustomerOrderStatus,
} from "./tools/orders.js";
import { getCounterpartiesSchema, handleGetCounterparties, getCounterpartySchema, handleGetCounterparty, createCounterpartySchema, handleCreateCounterparty } from "./tools/counterparties.js";
import { getProfitReportSchema, handleGetProfitReport, getSalesReportSchema, handleGetSalesReport } from "./tools/reports.js";
import { createSupplySchema, handleCreateSupply } from "./tools/supply.js";
import { createDemandSchema, handleCreateDemand } from "./tools/shipments.js";
import { listStoresSchema, handleListStores } from "./tools/stores.js";
import { listOrganizationsSchema, handleListOrganizations } from "./tools/organizations.js";
import { listWebhooksSchema, handleListWebhooks, createWebhookSchema, handleCreateWebhook } from "./tools/webhooks.js";

const TOOL_COUNT = 21;
const server = new McpServer({ name: "moysklad-mcp", version: "3.0.0" });

const wrap = (handler: (params: any) => Promise<string>) =>
  async (params: any) => ({ content: [{ type: "text" as const, text: await handler(params) }] });

// --- Products (4 tools) ---
server.tool("search_products", "Search products in MoySklad by name or article. Prices returned in RUBLES.", searchProductsSchema.shape, wrap(handleSearchProducts));
server.tool("get_product", "Get a single product by UUID. Prices returned in RUBLES.", getProductSchema.shape, wrap(handleGetProduct));
server.tool("create_product", "Create a new product. Prices in RUBLES (converted to kopecks internally).", createProductSchema.shape, wrap(handleCreateProduct));
server.tool("update_prices", "Update sale/buy/min prices for a product. Prices in RUBLES.", updatePricesSchema.shape, wrap(handleUpdatePrices));

// --- Stock (2 tools) ---
server.tool("get_stock", "Get current stock/inventory report. Shows quantities, reserves, and in-transit.", getStockSchema.shape, wrap(handleGetStock));
server.tool("get_stock_by_store", "Get stock report broken down by warehouse/store. Shows how much of each product is in each store.", getStockByStoreSchema.shape, wrap(handleGetStockByStore));

// --- Counterparties (3 tools) ---
server.tool("get_counterparties", "Search counterparties (customers/suppliers) by name, INN, or phone.", getCounterpartiesSchema.shape, wrap(handleGetCounterparties));
server.tool("get_counterparty", "Get full details of a counterparty by UUID.", getCounterpartySchema.shape, wrap(handleGetCounterparty));
server.tool("create_counterparty", "Create a new counterparty. Set companyType to 'legal', 'entrepreneur', or 'individual'.", createCounterpartySchema.shape, wrap(handleCreateCounterparty));

// --- Customer Orders (4 tools) ---
server.tool("create_customer_order", "Create a customer order. Prices in RUBLES (converted to kopecks).", createCustomerOrderSchema.shape, wrap(handleCreateCustomerOrder));
server.tool("get_orders", "Get customer orders with filtering and sorting. Sums in RUBLES.", getOrdersSchema.shape, wrap(handleGetOrders));
server.tool("get_customer_order", "Get a single customer order by UUID with expanded positions.", getCustomerOrderSchema.shape, wrap(handleGetCustomerOrder));
server.tool("update_customer_order_status", "Change the status/state of a customer order.", updateCustomerOrderStatusSchema.shape, wrap(handleUpdateCustomerOrderStatus));

// --- Shipments & Supply (2 tools) ---
server.tool("create_demand", "Create a shipment (demand) to fulfill a customer order. Links to a warehouse.", createDemandSchema.shape, wrap(handleCreateDemand));
server.tool("create_supply", "Create an incoming supply (purchase receipt). Prices in RUBLES.", createSupplySchema.shape, wrap(handleCreateSupply));

// --- Reference Data (2 tools) ---
server.tool("list_stores", "List all warehouses/stores with names, addresses, and meta hrefs.", listStoresSchema.shape, wrap(handleListStores));
server.tool("list_organizations", "List all organizations (your legal entities) with names, INN, and meta hrefs.", listOrganizationsSchema.shape, wrap(handleListOrganizations));

// --- Reports (2 tools) ---
server.tool("get_profit_report", "Get profit report by product. Shows sales, costs, returns, profit, margin.", getProfitReportSchema.shape, wrap(handleGetProfitReport));
server.tool("get_sales_report", "Get sales report by product. Shows quantities sold and revenue.", getSalesReportSchema.shape, wrap(handleGetSalesReport));

// --- Webhooks (2 tools) ---
server.tool("list_webhooks", "List all registered webhooks with URL, action, entity type, and status.", listWebhooksSchema.shape, wrap(handleListWebhooks));
server.tool("create_webhook", "Register a new webhook for entity events (CREATE/UPDATE/DELETE).", createWebhookSchema.shape, wrap(handleCreateWebhook));

async function main() {
  const httpPort = process.env.HTTP_PORT || (process.argv.includes("--http") ? process.argv[process.argv.indexOf("--http") + 1] : null);
  if (httpPort) {
    const port = parseInt(String(httpPort), 10) || 3000;
    await startHttpTransport(port);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[moysklad-mcp] Server started (stdio). ${TOOL_COUNT} tools available.`);
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
      res.end(JSON.stringify({ status: "ok", tools: TOOL_COUNT, transport: "streamable-http" }));
      return;
    }
    if (req.url === "/mcp") { await transport.handleRequest(req, res); return; }
    res.writeHead(404); res.end("Not found. Use /mcp or /health.");
  });
  await server.connect(transport);
  httpServer.listen(port, () => {
    console.error(`[moysklad-mcp] HTTP server on port ${port}. ${TOOL_COUNT} tools available.`);
  });
}

const isDirectRun = process.argv[1]?.endsWith("index.js") || process.argv[1]?.endsWith("index.ts");
if (isDirectRun) {
  main().catch((error) => { console.error("[moysklad-mcp] Error:", error); process.exit(1); });
}

export { server };
