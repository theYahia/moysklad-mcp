const BASE_URL = "https://api.moysklad.ru/api/remap/1.2";
const TIMEOUT = 15_000;
const MAX_RETRIES = 3;

const BUCKET_MAX = 45;
const BUCKET_REFILL_MS = 3000;
let tokenCount = BUCKET_MAX;
let lastRefill = Date.now();

async function acquireToken(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRefill;
  if (elapsed >= BUCKET_REFILL_MS) {
    tokenCount = BUCKET_MAX;
    lastRefill = now;
  }
  if (tokenCount > 0) {
    tokenCount--;
    return;
  }
  const waitMs = BUCKET_REFILL_MS - (Date.now() - lastRefill);
  if (waitMs > 0) {
    await new Promise(r => setTimeout(r, waitMs));
  }
  tokenCount = BUCKET_MAX - 1;
  lastRefill = Date.now();
}

function getAuthHeader(): string {
  const token = process.env.MOYSKLAD_TOKEN;
  if (token) return `Bearer ${token}`;

  const login = process.env.MOYSKLAD_LOGIN;
  const password = process.env.MOYSKLAD_PASSWORD;
  if (login && password) {
    const encoded = Buffer.from(`${login}:${password}`).toString("base64");
    return `Basic ${encoded}`;
  }

  throw new Error(
    "Auth not configured. Set MOYSKLAD_TOKEN or both MOYSKLAD_LOGIN and MOYSKLAD_PASSWORD.",
  );
}

export async function moyskladGet(path: string): Promise<unknown> {
  return moyskladRequest("GET", path);
}

export async function moyskladPost(path: string, body: unknown): Promise<unknown> {
  return moyskladRequest("POST", path, body);
}

export async function moyskladPut(path: string, body: unknown): Promise<unknown> {
  return moyskladRequest("PUT", path, body);
}

export async function moyskladDelete(path: string): Promise<unknown> {
  return moyskladRequest("DELETE", path);
}

async function moyskladRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    await acquireToken();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json;charset=utf-8",
          Accept: "application/json;charset=utf-8",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) {
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
      }

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(
          `[moysklad-mcp] ${response.status}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`,
        );
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(`MoySklad auth error ${response.status}: check credentials are valid and have required permissions`);
      }

      const text = await response.text();
      throw new Error(`MoySklad HTTP ${response.status}: ${text}`);
    } catch (error) {
      clearTimeout(timer);
      if (
        error instanceof DOMException &&
        error.name === "AbortError" &&
        attempt < MAX_RETRIES
      ) {
        console.error(`[moysklad-mcp] Timeout, retry (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("MoySklad: all retries exhausted");
}

export { acquireToken as _acquireToken, getAuthHeader as _getAuthHeader, BASE_URL };
