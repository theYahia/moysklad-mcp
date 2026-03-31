---
name: warehouse-management
description: Manage MoySklad warehouse — products, stock, orders, counterparties
argument-hint: <action> [details]
allowed-tools:
  - Bash
  - Read
---

# /warehouse-management — MoySklad Operations

## Algorithm

1. Use `search_products` to find products by name or article
2. Use `get_stock` to check current inventory levels
3. Use `get_counterparties` to find customers/suppliers
4. Use `create_order` to place customer orders

## Important

- All prices from API are in **kopecks** (divide by 100 for rubles)
- When creating orders, pass prices in **rubles** (auto-converted to kopecks)

## Response Format

```
## MoySklad Inventory

### Products matching "laptop"
1. Laptop Pro 15 — Article: LP15 — Price: 89,990 RUB — Stock: 42
2. ...

### Stock Summary
Total items: 156
Low stock (<5): 3 products
```

## Examples

```
/warehouse-management search products "laptop"
/warehouse-management check stock
/warehouse-management find counterparty "Romashka"
```
