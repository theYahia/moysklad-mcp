export interface MoySkladProduct {
  id: string;
  name: string;
  code?: string;
  article?: string;
  description?: string;
  salePrices?: { value: number; currency: { meta: { href: string } } }[];
  buyPrice?: { value: number };
  stock?: number;
  meta: { href: string; type: string };
}

export interface MoySkladStock {
  name: string;
  code?: string;
  article?: string;
  stock: number;
  reserve: number;
  inTransit: number;
  quantity: number;
  salePrice: number;
}

export interface MoySkladCounterparty {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  inn?: string;
  companyType: string;
  meta: { href: string; type: string };
}

export interface MoySkladOrder {
  id: string;
  name: string;
  moment: string;
  sum: number;
  agent: { meta: { href: string } };
  positions: { rows: { quantity: number; price: number; assortment: { meta: { href: string } } }[] };
}

export interface MoySkladListResult<T> {
  meta: { href: string; type: string; size: number; limit: number; offset: number };
  rows: T[];
}
