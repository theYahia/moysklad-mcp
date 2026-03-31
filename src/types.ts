/** Common MoySklad API list response wrapper */
export interface MoySkladListResult<T> {
  meta: { href: string; type: string; size: number; limit: number; offset: number };
  rows: T[];
}

/** MoySklad meta reference */
export interface MoySkladMeta {
  href: string;
  type: string;
  mediaType: string;
}
