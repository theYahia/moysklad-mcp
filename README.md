# @theyahia/moysklad-mcp

MCP server for **MoySklad** (МойСклад) warehouse and CRM management API. 21 tools covering the full order lifecycle: products, stock, counterparties, customer orders, shipments, supplies, warehouses, organizations, reports, and webhooks.

[![npm](https://img.shields.io/npm/v/@theyahia/moysklad-mcp)](https://www.npmjs.com/package/@theyahia/moysklad-mcp)
[![license](https://img.shields.io/npm/l/@theyahia/moysklad-mcp)](./LICENSE)

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "moysklad": {
      "command": "npx",
      "args": ["-y", "@theyahia/moysklad-mcp"],
      "env": {
        "MOYSKLAD_TOKEN": "your-bearer-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add moysklad -- npx -y @theyahia/moysklad-mcp
```

Set env: `MOYSKLAD_TOKEN` or both `MOYSKLAD_LOGIN` + `MOYSKLAD_PASSWORD`.

### Cursor / Windsurf

Add to MCP settings:

```json
{
  "moysklad": {
    "command": "npx",
    "args": ["-y", "@theyahia/moysklad-mcp"],
    "env": {
      "MOYSKLAD_TOKEN": "your-bearer-token"
    }
  }
}
```

## Tools (21)

### Products
| Tool | Description |
|------|-------------|
| `search_products` | Search products by name or article |
| `get_product` | Get a single product by UUID |
| `create_product` | Create a new product |
| `update_prices` | Update sale/buy/min prices |

### Stock
| Tool | Description |
|------|-------------|
| `get_stock` | Current stock report (quantity, reserve, in-transit) |
| `get_stock_by_store` | Stock broken down by warehouse |

### Counterparties
| Tool | Description |
|------|-------------|
| `get_counterparties` | Search by name, INN, or phone |
| `get_counterparty` | Get full counterparty details |
| `create_counterparty` | Create customer/supplier |

### Customer Orders
| Tool | Description |
|------|-------------|
| `create_customer_order` | Create order with positions |
| `get_orders` | List orders with filtering and sorting |
| `get_customer_order` | Get order with expanded positions |
| `update_customer_order_status` | Change order status |

### Shipments & Supply
| Tool | Description |
|------|-------------|
| `create_demand` | Create shipment linked to order and warehouse |
| `create_supply` | Create incoming supply (purchase receipt) |

### Reference Data
| Tool | Description |
|------|-------------|
| `list_stores` | List all warehouses |
| `list_organizations` | List all your legal entities |

### Reports
| Tool | Description |
|------|-------------|
| `get_profit_report` | Profit by product (revenue, cost, margin) |
| `get_sales_report` | Sales by product (quantity, revenue) |

### Webhooks
| Tool | Description |
|------|-------------|
| `list_webhooks` | List registered webhooks |
| `create_webhook` | Register a new webhook |

## Prices

The MoySklad API stores all prices in **kopecks** (1 ruble = 100 kopecks).
This MCP server handles the conversion automatically:

- **Input**: pass prices in **rubles** (e.g. `1500.50`)
- **Output**: prices are returned in **rubles**
- **Internally**: converted to/from kopecks when talking to the API

## Auth

Two options:

| Variable | Description |
|----------|-------------|
| `MOYSKLAD_TOKEN` | Bearer token (preferred) |
| `MOYSKLAD_LOGIN` + `MOYSKLAD_PASSWORD` | HTTP Basic auth |

Get a token in MoySklad: Settings > Users > Access tokens.

## HTTP Transport

```bash
# Start with Streamable HTTP transport
HTTP_PORT=3000 npx @theyahia/moysklad-mcp
# or
npx @theyahia/moysklad-mcp --http 3000
```

Endpoints: `POST /mcp` (JSON-RPC), `GET /health` (status).

## Rate Limiting

Built-in token-bucket rate limiter: 45 requests per 3 seconds (MoySklad API limit).
Automatic retry with exponential backoff on 429/5xx errors.

## E-commerce Stack

Build a full Russian e-commerce backend with MCP:

| Service | MCP Server | What it does |
|---------|-----------|-------------|
| MoySklad | `@theyahia/moysklad-mcp` | Warehouse, products, orders |
| CDEK | `@theyahia/cdek-mcp` | Delivery, tracking |
| DaData | `@theyahia/dadata-mcp` | Address validation |
| YooKassa | `@theyahia/yookassa-mcp` | Payments |

Part of the [russian-mcp](https://github.com/theYahia?tab=repositories&q=mcp) series.

## Demo Prompts

**Inventory check:**
> "Show me all products with low stock (less than 10 units) and their current prices"

**Order workflow:**
> "Create a customer order for counterparty 'OOO Roga i Kopyta' with 50 units of 'Widget Pro' at 1500 rubles each, then create a shipment from the main warehouse"

**Sales analytics:**
> "Pull the profit report and tell me which products have the highest margin this month"

## Development

```bash
npm install
npm run build
npm test
```

## API Reference

Based on [MoySklad API v1.2](https://dev.moysklad.ru/doc/api/remap/1.2/).

## License

MIT
