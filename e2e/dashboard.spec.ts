import { expect, test, type Page } from "@playwright/test";

// E2E coverage of the judge-facing demo flow. Runs without a browser wallet,
// so every signature is the dApp's simulated Devnet path — no funds move.

const cargoTable = (page: Page) => page.locator("table tbody");
const cargoRow = (page: Page, id: string) => cargoTable(page).locator("tr", { hasText: `#${id}` });
const policyEngine = (page: Page) =>
  page.locator(".panel", { hasText: "Parametric policy & claim engine" });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Corridor intelligence" })).toBeVisible();
  // The page is server-rendered; wait until React has hydrated it so clicks reach handlers.
  await page.waitForFunction(
    () => {
      const el = document.querySelector("table tbody tr");
      return !!el && Object.keys(el).some((k) => k.startsWith("__reactFiber"));
    },
    undefined,
    { timeout: 60_000 },
  );
});

test.describe("Dashboard & telemetry", () => {
  test("renders demo disclaimer, KPIs and Middle Corridor route", async ({ page }) => {
    await expect(
      page.getByText(/Demo environment — balances, metrics, feeds and transactions are simulated/),
    ).toBeVisible();
    await expect(page.getByText("Solana Devnet", { exact: true })).toBeVisible();
    // Footer shows the live finalized Devnet slot fetched from the RPC.
    await expect(page.locator("footer")).toContainText(/Devnet block [\d,]{6,} · Finalized/, {
      timeout: 45_000, // public Devnet RPC can rate-limit parallel test pages
    });

    for (const [label, value] of [
      ["Active cargoes", "1,248"],
      ["Predictive risk index", "14.2%"],
      ["On-chain escrow", "$4.25M"],
      ["Instant payouts", "142"],
    ]) {
      const card = page.locator("article.metric-card", { hasText: label });
      await expect(card).toContainText(value);
    }

    for (const stop of ["Lianyungang", "Khorgos", "Aktau Port", "Baku", "Istanbul"]) {
      await expect(page.locator(".route-rail").getByText(stop, { exact: true })).toBeVisible();
    }
    await expect(page.getByText("Congestion detected")).toBeVisible();
    await expect(page.getByText("Aktau berth 4 · +21.6 hr dwell")).toBeVisible();
  });

  test("shows IoT telemetry breaching the dwell-time threshold", async ({ page }) => {
    const iot = page.locator(".panel", { hasText: "Live IoT telemetry" });
    await expect(iot).toContainText("4.2°C");
    // Default cargo #JOL-8921: the oracle reports 96 h at Aktau, over the 72 h trigger.
    await expect(iot).toContainText("96h");
    await expect(iot).toContainText("+24h over 72h");
    await expect(
      page.getByText(/delay of 96 h exceeded the insured 72-hour threshold/),
    ).toBeVisible();
  });
});

test.describe("Web3 wallet (demo mode)", () => {
  test("lists Solana Devnet wallets and falls back to simulated signatures", async ({ page }) => {
    await page.getByRole("button", { name: /Connect wallet/ }).click();
    const menu = page.getByRole("menu");
    await expect(menu.getByText("Solana Devnet wallets")).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /Phantom/ })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /Solflare/ })).toBeVisible();
    await expect(
      menu.getByText(
        "No wallet? The dashboard keeps working in demo mode with simulated signatures.",
      ),
    ).toBeVisible();
  });
});

test.describe("Cargo filters", () => {
  const cases: [filter: string, visible: string[]][] = [
    ["In Transit", ["MCC-2048", "TRK-7782"]],
    ["High Risk Delay", ["JOL-8921"]],
    ["Escrow Triggered", ["KZL-4107"]],
    ["All cargoes", ["JOL-8921", "MCC-2048", "KZL-4107", "TRK-7782"]],
  ];

  for (const [filter, visible] of cases) {
    test(`"${filter}" isolates the matching shipments`, async ({ page }) => {
      await page.getByRole("button", { name: filter, exact: true }).click();
      await expect(cargoTable(page).locator("tr")).toHaveCount(visible.length);
      for (const id of visible) await expect(cargoRow(page, id)).toBeVisible();
    });
  }
});

test.describe("On-chain escrow program", () => {
  test("policy engine links to the deployed Devnet program", async ({ page }) => {
    const proof = policyEngine(page).getByTestId("onchain-proof");
    await expect(proof).toContainText("On-chain escrow program");
    await expect(proof.getByRole("link", { name: /Gu7g\.\.\.Ar9Z/ })).toHaveAttribute(
      "href",
      "https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet",
    );
    // Status resolves either way; it must never stay stuck or crash the panel.
    await expect(proof).toContainText(/Live on Devnet|Devnet RPC unreachable/, { timeout: 20_000 });
  });
});

test.describe("Parametric policy lifecycle", () => {
  test("issue → lock collateral → oracle trigger → claim paid out", async ({ page }) => {
    const row = cargoRow(page, "JOL-8921");
    await row.getByRole("button", { name: "Issue Parametric Policy" }).click();

    const engine = policyEngine(page);
    await expect(engine.getByRole("heading", { name: "Cover · #JOL-8921" })).toBeVisible();
    await expect(row).toContainText("issued");

    await engine.getByRole("button", { name: "Lock Collateral & Sign (Devnet)" }).click();
    await expect(page.getByText("Collateral locked (Devnet)")).toBeVisible();
    await expect(row).toContainText("locked");

    await engine.getByRole("button", { name: /Trigger Oracle Event/ }).click();
    await expect(engine.getByText("Claim Paid Out · 2,500 Demo USDC")).toBeVisible();
    await expect(engine).toContainText("~1,250,000 eKZT via AIFC Gateway");
    await expect(engine).toContainText(/Settled in \d+ ms/);
    await expect(row).toContainText("Claim Paid Out (Demo USDC)");
  });

  test("oracle trigger is refused when dwell is within the threshold", async ({ page }) => {
    const row = cargoRow(page, "MCC-2048");
    await row.getByRole("button", { name: "Issue Parametric Policy" }).click();
    const engine = policyEngine(page);
    await engine.getByRole("button", { name: "Lock Collateral & Sign (Devnet)" }).click();
    await expect(row).toContainText("locked");

    await engine.getByRole("button", { name: "Trigger Oracle Event (dwell 6h)" }).click();
    await expect(page.getByText("Trigger not met · cargo #MCC-2048 — no payout")).toBeVisible();
    await expect(page.getByText(/dwell 6h ≤ 72h threshold/)).toBeVisible();
    await expect(engine.getByText("Claim Paid Out")).toHaveCount(0);
    await expect(row).toContainText("locked");
  });

  test("premium is priced from the AI risk score", async ({ page }) => {
    // premium = round(2500 * (0.004 + risk * 0.03)); JOL-8921 risk 68% → 61, MCC-2048 risk 12% → 19
    await expect(cargoRow(page, "JOL-8921")).toContainText("61 USDC");
    await expect(cargoRow(page, "MCC-2048")).toContainText("19 USDC");

    await cargoRow(page, "MCC-2048").click();
    const engine = policyEngine(page);
    await expect(engine).toContainText("12%");
    await expect(engine).toContainText("19");
  });
});

test.describe("Autonomous settlement", () => {
  test("review settlement acknowledges the 2,500 Demo USDC payout with eKZT equivalent", async ({
    page,
  }) => {
    await expect(page.getByText("Compensation triggered")).toBeVisible();
    await page.getByRole("button", { name: /Review settlement/ }).click();

    await expect(
      page.getByText("Settlement acknowledged for cargo #JOL-8921 (Simulated)"),
    ).toBeVisible();
    await expect(page.getByText("Settlement acknowledged", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Acknowledged/ })).toBeDisabled();
  });

  test("settles the cargo selected in the table, not a fixed one", async ({ page }) => {
    await cargoRow(page, "KZL-4107").click();
    await expect(
      page.getByRole("heading", { name: "Smart contract trigger · #KZL-4107" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Review settlement/ }).click();

    await expect(
      page.getByText("Settlement acknowledged for cargo #KZL-4107 (Simulated)"),
    ).toBeVisible();
    await expect(cargoRow(page, "KZL-4107")).toContainText("Claim Paid Out");
    await expect(cargoRow(page, "JOL-8921")).not.toContainText("Claim Paid Out");

    // Another cargo still has its own, unsettled claim.
    await cargoRow(page, "TRK-7782").click();
    await expect(page.getByRole("button", { name: /Review settlement/ })).toBeEnabled();
  });

  test("refuses settlement for a cargo whose dwell is below the trigger", async ({ page }) => {
    await cargoRow(page, "TRK-7782").click();
    await expect(page.getByText("No payout owed")).toBeVisible();
    await expect(page.getByText(/dwell of 18 h is within the insured 72-hour threshold/)).toBeVisible();
    await page.getByRole("button", { name: /Review settlement/ }).click();

    await expect(page.getByText("Trigger not met · cargo #TRK-7782 — no payout")).toBeVisible();
    await expect(cargoRow(page, "TRK-7782")).not.toContainText("Claim Paid Out");
    await expect(page.getByRole("button", { name: /Review settlement/ })).toBeEnabled();
  });
});

test.describe("Caspian Risk Vault", () => {
  test("deposits Demo USDC and updates stake and TVL", async ({ page }) => {
    const vault = page.locator(".panel", { hasText: "RWA tokenized liquidity" });
    await vault.getByRole("button", { name: "Stake" }).click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByText("Deposit / Withdraw (Devnet USDC / Demo). No real funds move."),
    ).toBeVisible();
    await expect(dialog.getByRole("spinbutton")).toHaveValue("1000");
    await expect(dialog).toContainText("970.00 csRV share tokens");
    await dialog.getByRole("button", { name: "Deposit (Demo)" }).click();

    await expect(page.getByText("Deposited 1,000 Demo USDC")).toBeVisible();
    await expect(dialog).toBeHidden();
    await expect(vault).toContainText("Your stake1,000");
  });

  test("rejects amounts above the demo wallet balance", async ({ page }) => {
    await page
      .locator(".panel", { hasText: "RWA tokenized liquidity" })
      .getByRole("button", { name: "Stake" })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("spinbutton").fill("20000");
    await expect(dialog.getByText("Enter an amount between 0 and 10,000.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Deposit (Demo)" })).toBeDisabled();
  });
});

test.describe("cNFT audit trail", () => {
  test("hashes every policy event into a compressed Merkle checkpoint", async ({ page }) => {
    const openTrail = () => page.getByRole("button", { name: /cNFT Audit Trail/ }).click();

    await openTrail();
    const drawer = page.getByRole("dialog");
    await expect(
      drawer.getByText("No checkpoints yet. Issue a policy to create one."),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();

    await cargoRow(page, "MCC-2048")
      .getByRole("button", { name: "Issue Parametric Policy" })
      .click();
    await policyEngine(page)
      .getByRole("button", { name: "Lock Collateral & Sign (Devnet)" })
      .click();
    await expect(page.getByText("Collateral locked (Devnet)")).toBeVisible();

    await openTrail();
    await expect(drawer.locator("div", { hasText: /^Logs2$/ })).toBeVisible();
    await expect(drawer.getByText("Policy issued")).toBeVisible();
    await expect(drawer.getByText("Collateral locked", { exact: true })).toBeVisible();
    await expect(drawer.getByText("Cargo #MCC-2048 · leaf #1")).toBeVisible();
    await expect(drawer.getByText("Cargo #MCC-2048 · leaf #2")).toBeVisible();
    await expect(drawer.getByText(/^root [1-9A-HJ-NP-Za-km-z]{20,}/).first()).toBeVisible();
  });
});
