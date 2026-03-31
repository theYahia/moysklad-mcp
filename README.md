# @theyahia/moysklad-mcp

MCP server for **MoySklad** warehouse management API. 10 tools for products, stock, orders, counterparties, supplies, and reports.

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

## Tools

| Tool | Description |
|------|-------------|
| `search_products` | Search products by name or article |
| `get_product` | Get a single product by UUID |
| `create_product` | Create a new product |
| `get_stock` | Get current stock/inventory report |
| `update_prices` | Update sale/buy/min prices for a product |
| `get_counterparties` | Search counterparties by name or INN |
| `create_customer_order` | Create a customer order |
| `get_orders` | Get customer orders with filtering |
| `get_profit_report` | Profit report by product |
| `create_supply` | Create an incoming supply |

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

## License

MIT
