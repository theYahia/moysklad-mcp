# @theyahia/moysklad-mcp

MCP server for **MoySklad** (МойСклад) warehouse management. Provides tools for products, stock, orders, and counterparties.

## Tools

| Tool | Description |
|------|------------|
| `search_products` | Search products by name or article |
| `get_stock` | Get current stock/inventory report |
| `create_order` | Create a customer order |
| `get_counterparties` | Search counterparties by name or INN |

> **Note:** All prices in the MoySklad API are in kopecks. The `create_order` tool accepts prices in rubles and converts automatically.

## Setup

1. In MoySklad, go to **Settings > Users > Access tokens**
2. Create a new token with required permissions

## Usage with Claude Desktop

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

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MOYSKLAD_TOKEN` | Yes | Bearer token for MoySklad API |

## License

MIT
