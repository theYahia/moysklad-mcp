import { describe, it, expect, vi } from "vitest";

vi.mock("../src/client.js", () => ({ moyskladGet: vi.fn(), moyskladPost: vi.fn(), moyskladPut: vi.fn() }));

import { moyskladGet, moyskladPost, moyskladPut } from "../src/client.js";
import { handleSearchProducts, handleGetProduct, handleCreateProduct, handleUpdatePrices } from "../src/tools/products.js";
import { handleGetStock } from "../src/tools/stock.js";
import { handleGetCounterparties } from "../src/tools/counterparties.js";
import { handleCreateCustomerOrder, handleGetOrders } from "../src/tools/orders.js";
import { handleGetProfitReport } from "../src/tools/reports.js";
import { handleCreateSupply } from "../src/tools/supply.js";

const mockGet = moyskladGet as ReturnType<typeof vi.fn>;
const mockPost = moyskladPost as ReturnType<typeof vi.fn>;
const mockPut = moyskladPut as ReturnType<typeof vi.fn>;

import { beforeEach } from "vitest";
beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockPut.mockReset();
});

describe("search_products", () => {
  it("converts prices from kopecks to rubles", async () => {
    mockGet.mockResolvedValue({ meta: { size: 1 }, rows: [{ id: "abc", name: "T", salePrices: [{ value: 150000 }], buyPrice: { value: 100000 } }] });
    const r = JSON.parse(await handleSearchProducts({ search: "T", limit: 25, offset: 0 }));
    expect(r.total).toBe(1);
    expect(r.products[0].sale_price_rubles).toBe(1500);
    expect(r.products[0].buy_price_rubles).toBe(1000);
  });
});

describe("get_product", () => {
  it("returns product with prices in rubles", async () => {
    mockGet.mockResolvedValue({ id: "u1", name: "W", salePrices: [{ value: 99900 }], buyPrice: { value: 50000 } });
    const r = JSON.parse(await handleGetProduct({ id: "u1" }));
    expect(r.sale_price_rubles).toBe(999);
    expect(r.buy_price_rubles).toBe(500);
  });
});

describe("create_product", () => {
  it("converts rubles to kopecks", async () => {
    mockPost.mockResolvedValue({ id: "n", name: "P", salePrices: [{ value: 250050 }], buyPrice: { value: 100000 } });
    const r = JSON.parse(await handleCreateProduct({ name: "P", sale_price_rubles: 2500.5, buy_price_rubles: 1000 }));
    expect(r.sale_price_rubles).toBe(2500.5);
    const b = (mockPost.mock.calls[0] as any)[1];
    expect(b.salePrices[0].value).toBe(250050);
  });
});

describe("update_prices", () => {
  it("fetches then PUTs updated prices", async () => {
    mockGet.mockResolvedValue({ salePrices: [{ value: 100000, priceType: { meta: { href: "x" } } }] });
    mockPut.mockResolvedValue({ id: "u1", name: "W", salePrices: [{ value: 200000 }], buyPrice: { value: 150000 } });
    const r = JSON.parse(await handleUpdatePrices({ id: "u1", sale_price_rubles: 2000, buy_price_rubles: 1500 }));
    expect(r.sale_price_rubles).toBe(2000);
    expect(r.buy_price_rubles).toBe(1500);
  });
});

describe("get_stock", () => {
  it("converts salePrice to rubles", async () => {
    mockGet.mockResolvedValue({ meta: { size: 2 }, rows: [
      { name: "A", stock: 10, reserve: 2, inTransit: 0, quantity: 8, salePrice: 100000 },
      { name: "B", stock: 5, reserve: 0, inTransit: 3, quantity: 8, salePrice: 200000 },
    ] });
    const r = JSON.parse(await handleGetStock({ limit: 25, offset: 0, group_by: "product", stock_mode: "all" }));
    expect(r.items[0].sale_price_rubles).toBe(1000);
    expect(r.items[1].sale_price_rubles).toBe(2000);
  });
});

describe("get_counterparties", () => {
  it("returns counterparty data", async () => {
    mockGet.mockResolvedValue({ meta: { size: 1 }, rows: [{ id: "c1", name: "OOO", inn: "7707083893", companyType: "legal" }] });
    const r = JSON.parse(await handleGetCounterparties({ search: "OOO", limit: 25, offset: 0 }));
    expect(r.counterparties[0].inn).toBe("7707083893");
  });
});

describe("create_customer_order", () => {
  it("converts rubles to kopecks in positions", async () => {
    mockPost.mockResolvedValue({ id: "o1", name: "001", moment: "2024-01-15", sum: 500000 });
    const r = JSON.parse(await handleCreateCustomerOrder({
      organization_href: "https://api.moysklad.ru/api/remap/1.2/entity/organization/o1",
      agent_href: "https://api.moysklad.ru/api/remap/1.2/entity/counterparty/c1",
      positions: [{ assortment_href: "https://api.moysklad.ru/api/remap/1.2/entity/product/p1", quantity: 5, price_rubles: 1000 }],
    }));
    expect(r.sum_rubles).toBe(5000);
    const b = (mockPost.mock.calls[0] as any)[1];
    expect(b.positions[0].price).toBe(100000);
  });
});

describe("get_orders", () => {
  it("converts order sums to rubles", async () => {
    mockGet.mockResolvedValue({ meta: { size: 1 }, rows: [{ id: "o1", name: "001", moment: "2024-01-15", sum: 300000 }] });
    const r = JSON.parse(await handleGetOrders({ limit: 10, offset: 0, order: "created,desc" }));
    expect(r.orders[0].sum_rubles).toBe(3000);
  });
});

describe("get_profit_report", () => {
  it("converts profit amounts to rubles", async () => {
    mockGet.mockResolvedValue({ meta: { size: 1 }, rows: [{ assortment: { name: "PA" }, sellQuantity: 100, sellSum: 10000000, sellCostSum: 5000000, returnQuantity: 2, returnSum: 200000, profit: 4800000, margin: 48 }] });
    const r = JSON.parse(await handleGetProfitReport({ limit: 25, offset: 0 }));
    expect(r.items[0].profit_rubles).toBe(48000);
    expect(r.items[0].margin).toBe(48);
  });
});

describe("create_supply", () => {
  it("creates supply with kopeck conversion", async () => {
    mockPost.mockResolvedValue({ id: "s1", name: "001", moment: "2024-01-15", sum: 1000000, created: "2024-01-15T10:00:00" });
    const r = JSON.parse(await handleCreateSupply({
      organization_href: "https://api.moysklad.ru/api/remap/1.2/entity/organization/o1",
      agent_href: "https://api.moysklad.ru/api/remap/1.2/entity/counterparty/c1",
      positions: [{ assortment_href: "https://api.moysklad.ru/api/remap/1.2/entity/product/p1", quantity: 10, price_rubles: 500 }],
    }));
    expect(r.sum_rubles).toBe(10000);
    const b = (mockPost.mock.calls[0] as any)[1];
    expect(b.positions[0].price).toBe(50000);
  });
});
