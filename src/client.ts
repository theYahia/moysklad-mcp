const BASE_URL = "https://api.moysklad.ru/api/remap/1.2";
const TIMEOUT = 15_000;
const MAX_RETRIES = 3;

function getToken(): string {
  const token = process.env.MOYSKLAD_TOKEN;
  if (!token) throw new Error("MOYSKLAD_TOKEN is not set");
  return token;
}

export async function moyskladGet(path: string): Promise<unknown> {
  return moyskladRequest("GET", path);
}

export async function moyskladPost(path: string, body: unknown): Promise<unknown> {
  return moyskladRequest("POST", path, body);
}

async function moyskladRequest(method: string, path: string, body?: unknown): Promise<unknown> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
          "Authorization": `Bearer ${getToken()}`,
          "Content-Type": "application/json",
          "Accept": "application/json;charset=utf-8",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) return response.json();

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[moysklad-mcp] ${response.status}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const text = await response.text();
      throw new Error(`MoySklad HTTP ${response.status}: ${text}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        console.error(`[moysklad-mcp] Timeout, retry (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("MoySklad: all retries exhausted");
}
