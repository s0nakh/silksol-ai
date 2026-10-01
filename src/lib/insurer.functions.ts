import { createServerFn } from "@tanstack/react-start";
import type { InsurerRequest, InsurerResult } from "./insurer";

const DEFAULT_RPC = "https://api.devnet.solana.com";

/**
 * Insurer/oracle actions signed by the SilkSol treasury on the server.
 * The secret (SILKSOL_TREASURY_SECRET, a Devnet keypair JSON array) never reaches the browser.
 */
export const insurerAction = createServerFn({ method: "POST" })
  .validator((d: InsurerRequest) => d)
  .handler(async ({ data }): Promise<InsurerResult> => {
    const { runInsurer } = await import("./insurer");
    return runInsurer(
      data,
      process.env["SILKSOL_TREASURY_SECRET"],
      process.env["SOLANA_RPC_URL"] || DEFAULT_RPC,
    );
  });
