// Daily health check of the Devnet demo (Netlify Scheduled Function): insurer treasury balance,
// open escrow vaults and the live dApp. Read-only. Sends the result to the maintainer's Telegram
// (TG_TOKEN / TG_CHAT_ID live only in the Netlify environment).

const RPC = process.env["SOLANA_RPC_URL"] || "https://api.devnet.solana.com";
const TREASURY = "LxtEpBFNvEEBmESNA6ExiYHdrdZCfNGkCbndLVimv7C";
const PROGRAM = "Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z";
const LOW_SOL = 1;

async function rpc(method, params) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(RPC, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        signal: AbortSignal.timeout(15_000),
      });
      const json = await res.json();
      if (json.result !== undefined) return json.result;
    } catch {
      // retry below
    }
    await new Promise((r) => setTimeout(r, 3_000));
  }
  return undefined;
}

export async function report() {
  const balance = await rpc("getBalance", [TREASURY]);
  const vaults = await rpc("getProgramAccounts", [
    PROGRAM,
    {
      encoding: "base64",
      dataSlice: { offset: 0, length: 0 },
      filters: [{ memcmp: { offset: 8, bytes: TREASURY } }],
    },
  ]);
  const site = await fetch("https://silksol.datariglab.kz/", {
    signal: AbortSignal.timeout(15_000),
  })
    .then((r) => r.status)
    .catch(() => "нет ответа");

  const sol = balance === undefined ? undefined : balance.value / 1e9;
  const open = vaults
    ? `${vaults.length} (${(vaults.reduce((s, a) => s + a.account.lamports, 0) / 1e9).toFixed(4)} SOL)`
    : "?";
  if (sol === undefined)
    return `🔴 SilkSol: Devnet RPC не ответил, баланс казны неизвестен. Сайт: ${site}`;
  if (sol < LOW_SOL)
    return `🔴 СРОЧНО: казна SilkSol почти пуста — ${sol} SOL\nПополни из Phantom (Devnet): ${TREASURY}\nили https://faucet.solana.com\nОткрытых хранилищ: ${open} · сайт: ${site}`;
  if (site !== 200) return `🔴 SilkSol: сайт отвечает ${site}. Казна ${sol} SOL, хранилищ ${open}`;
  return `🟢 SilkSol: всё в порядке\nКазна: ${sol} SOL\nОткрытых хранилищ: ${open}\nСайт: 200`;
}

export default async () => {
  const text = await report();
  const res = await fetch(`https://api.telegram.org/bot${process.env["TG_TOKEN"]}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: process.env["TG_CHAT_ID"], text }),
  });
  console.log(text, "→ telegram", res.status);
};

export const config = { schedule: "0 4 * * *" }; // 09:00 Asia/Aqtau
