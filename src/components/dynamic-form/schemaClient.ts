// src/components/dynamic-form/schemaClient.ts

import { CONFIG } from "./constants";

// Minimal types for the S3 JSON (adjust as needed in your project)
export type LeadSdkAction = {
  id: string;
  title: string;
  channel: {
    id: number;
    name: string;
    uid: string;            // chlead_...
    encodedUid: string;     // ch-...
    locationId: number;
  };
  product: string;
  template?: {
    uid: string;
    templateName: string;
    templateSchema?: unknown;
  };
};

export type LeadSdkJson = {
  generatedAt: string;
  source: string;
  accountId: number;
  count: number;
  actions: LeadSdkAction[];
};

// Type for chatbot-configs.json
type ChatbotConfig = {
  id: string;
  name: string;
  greeting: string;
  subtitle: string;
  avatar: string;
  LEAD_SDK_ACCOUNT_ID: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    position: string;
  };
};

// -------- Config --------
const UIS3_BASE = CONFIG.S3PATH;

// -------- Internal cache (retained for widget lifetime) --------
let cachedLeadSdk: LeadSdkJson | null = null;
let inflight: Promise<LeadSdkJson> | null = null;
let cachedConfig: ChatbotConfig | null = null;

/**
 * Clear the in-memory cache (e.g., if you want to force refresh after a settings change).
 */
export function clearLeadSdkCache() {
  cachedLeadSdk = null;
  inflight = null;
  cachedConfig = null;
}

/**
 * Fetch chatbot config from public/chatbot-configs.json
 */
export async function getChatbotConfig(): Promise<ChatbotConfig> {
  if (cachedConfig) return cachedConfig;

  const s3Base = `${CONFIG.S3PATH}/${CONFIG.UNIQUEID}/chatbot-configs.json`;
  console.log("Full Path:", `${s3Base}/${CONFIG.UNIQUEID}/chatbot-configs.json`);
  const res = await fetch(s3Base);
  if (!res.ok) throw new Error(`Failed to load chatbot-configs.json: ${res.statusText}`);
  const json = await res.json();

  // Assuming you want the "default" config
  const config: ChatbotConfig = json.default;
  cachedConfig = config;
  return config;
}

/**
 * Generic fetcher by full S3 URL.
 */
export async function getLeadSdkJsonByUrl(url: string, signal?: AbortSignal): Promise<LeadSdkJson> {
  const res = await fetch(url, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
    credentials: "omit",
    mode: "cors",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Lead SDK JSON fetch failed (${res.status}): ${text || res.statusText}`);
  }

  const data = (await res.json()) as LeadSdkJson;
  return data;
}

/**
 * Fetches the Lead SDK JSON from S3.
 * - Fetches once, then returns cached data on subsequent calls.
 * - The `uniqueId` argument is accepted for future flexibility (not required for the S3 path).
 */
export async function getLeadSdkJson(uniqueId?: string, signal?: AbortSignal): Promise<LeadSdkJson> {
  if (cachedLeadSdk) return cachedLeadSdk;
  if (inflight) return inflight;

  const config = await getChatbotConfig();
  const url = `${UIS3_BASE}/${encodeURIComponent(CONFIG.UNIQUEID)}/lead-sdk.json`;

  inflight = getLeadSdkJsonByUrl(url, signal)
    .then((data) => {
      cachedLeadSdk = data;
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
