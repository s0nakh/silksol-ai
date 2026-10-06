import type { InsurerRequest, InsurerResult } from "./insurer";

// The insurer/oracle runs as a separate Netlify Function (see oracle/), because the treasury
// secret must stay server-side. Its URL is public; the secret is not.
const INSURER_URL =
  import.meta.env["VITE_INSURER_URL"] || "https://silksol-oracle.netlify.app/api/insurer";

/** Calls the SilkSol insurer/oracle. Any network failure is reported as "not_configured" so the UI falls back to simulation. */
export async function insurerAction({ data }: { data: InsurerRequest }): Promise<InsurerResult> {
  try {
    const res = await fetch(INSURER_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as InsurerResult;
    if (typeof json?.ok !== "boolean") throw new Error("Bad response");
    return json;
  } catch {
    return {
      ok: false,
      reason: "not_configured",
      message: "SilkSol insurer service is unreachable.",
    };
  }
}
