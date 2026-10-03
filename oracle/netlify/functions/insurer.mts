import { runInsurer, type InsurerRequest } from "../../../src/lib/insurer";

// SilkSol AI insurer/oracle endpoint (Netlify Function, free tier). The treasury keypair lives only
// in the Netlify environment variable SILKSOL_TREASURY_SECRET — never in git or the browser bundle.

const ALLOWED = [
  /^https:\/\/silksol\.datariglab\.kz$/,
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
  /^http:\/\/localhost:\d+$/,
];
const allowed = (origin: string | null) => !!origin && ALLOWED.some((r) => r.test(origin));

export default async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = {
    "access-control-allow-origin": allowed(origin) ? origin! : "https://silksol.datariglab.kz",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "content-type": "application/json",
    vary: "origin",
  };
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return reply(405, { ok: false, reason: "invalid_input", message: "POST only" });
  // Browsers always send Origin on a cross-site POST; scripts that omit it are turned away.
  if (!allowed(origin)) {
    return reply(403, { ok: false, reason: "invalid_input", message: "Origin not allowed" });
  }

  let body: InsurerRequest;
  try {
    body = (await req.json()) as InsurerRequest;
  } catch {
    return reply(400, { ok: false, reason: "invalid_input", message: "Bad JSON" });
  }
  if (!["lock", "settle", "instant"].includes(body?.action)) {
    return reply(400, { ok: false, reason: "invalid_input", message: "Unknown action" });
  }

  const result = await runInsurer(
    body,
    process.env["SILKSOL_TREASURY_SECRET"],
    process.env["SOLANA_RPC_URL"] || "https://api.devnet.solana.com",
  );
  return reply(200, result);
};

export const config = { path: "/api/insurer" };
