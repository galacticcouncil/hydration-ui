import assert from "node:assert/strict"
import { writeFile } from "node:fs/promises"
import {
  createPublicClient,
  decodeEventLog,
  decodeFunctionData,
  erc20Abi,
  http,
  maxUint256,
  parseUnits,
} from "viem"
import { VAULT_ABI } from "../src/modules/strategies/propeller/config/abi.ts"
import { PROPELLER_VAULTS } from "../src/modules/strategies/propeller/config/vaults.ts"
import {
  injectPublicTestWallet,
  PUBLIC_TEST_NAME,
  TEST_ORIGIN,
} from "./propeller-public-test-wallet.mjs"

const positional = process.argv.slice(2).filter((arg) => !arg.startsWith("--"))
const action = positional[0] || "connect"
const withdrawMax = process.argv.includes("--max")
const keeperIdle = process.argv.includes("--keeper-idle")
assert.ok(!withdrawMax || action === "withdraw", "--max requires withdraw")
assert.ok(
  [
    "connect",
    "cancel-approval",
    "cancel-deposit",
    "deposit",
    "withdraw",
    "claim",
  ].includes(action),
  "Unknown public-wallet test action",
)
const symbol = positional[1] || "ETH"
assert.ok(["ETH", "tBTC"].includes(symbol))
const amount = positional[2] || (symbol === "ETH" ? "0.01" : "0.0001")
const amountRaw = parseUnits(amount, 18)
assert.ok(
  amountRaw > 0n && amountRaw <= (symbol === "ETH" ? 10n ** 17n : 10n ** 15n),
)
const writes = action !== "connect"
assert.ok(
  !writes || process.argv.includes("--sign-lark-public-account"),
  "Signing requires the explicit public Lark test-account flag",
)
const vault = PROPELLER_VAULTS[symbol === "ETH" ? 0 : 1].vaultAddress
const asset =
  symbol === "ETH"
    ? "0x0000000000000000000000000000000100000022"
    : "0x00000000000000000000000000000001000f453d"
const client = createPublicClient({
  transport: http("https://node0.lark.hydration.cloud"),
})
const serialize = (value) =>
  JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2)
const report = {
  fixture:
    "Public sr25519 derivation injected as PJS; actual Lark signatures, no real extension approval",
  action,
  symbol,
  amount,
  withdrawMax,
  keeperIdle,
  vault,
}
const { default: playwright } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
)
const browser = await playwright.chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
})
const context = await browser.newContext({
  viewport: { width: 1280, height: 1100 },
})
let wallet
let page
const errors = []
const consoleErrors = []
function progress(step) {
  ;(report.steps ??= []).push({ step, at: new Date().toISOString() })
  console.log(JSON.stringify({ progress: step, action, symbol }))
}
async function clickEnabled(locator) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if ((await locator.isVisible()) && (await locator.isEnabled())) {
      await locator.click({ force: true })
      return
    }
    await page.waitForTimeout(100)
  }
  throw new Error(`Control did not become available: ${locator}`)
}
async function snapshot(at) {
  const blockNumber = at ?? (await client.getBlockNumber({ cacheTime: 0 }))
  const read = (functionName, args = []) =>
    client.readContract({
      address: vault,
      abi: VAULT_ABI,
      functionName,
      args,
      blockNumber,
    })
  const [
    shares,
    totalAssets,
    totalSupply,
    pendingDeployment,
    queueTail,
    debtToken,
    userCollateral,
    allowance,
  ] = await Promise.all([
    read("balanceOf", [wallet.evm]),
    read("totalAssets"),
    read("totalSupply"),
    read("reinvestAssets"),
    read("queueTail"),
    read("hollarDebtToken"),
    client.readContract({
      address: asset,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [wallet.evm],
      blockNumber,
    }),
    client.readContract({
      address: asset,
      abi: erc20Abi,
      functionName: "allowance",
      args: [wallet.evm, vault],
      blockNumber,
    }),
  ])
  const debt = await client.readContract({
    address: debtToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [vault],
    blockNumber,
  })
  const substrateHash = await client.request({
    method: "chain_getBlockHash",
    params: [Number(blockNumber)],
  })
  const nativeBalance = await wallet.api.query.tokens.accounts.at(
    substrateHash,
    wallet.address,
    symbol === "ETH" ? 34 : 1000765,
  )
  const nativeCollateral = nativeBalance.free.toBigInt()
  return {
    blockNumber,
    shares,
    totalAssets,
    totalSupply,
    pendingDeployment,
    queueTail,
    debt,
    userCollateral,
    nativeCollateral,
    allowance,
  }
}
async function collectTransactions(fromBlock, toBlock) {
  const transactions = []
  for (let number = Number(fromBlock); number <= Number(toBlock); number++) {
    const hash = await client.request({
      method: "chain_getBlockHash",
      params: [number],
    })
    const signedBlock = await wallet.api.rpc.chain.getBlock(hash)
    const own = signedBlock.block.extrinsics
      .map((tx, index) => ({ tx, index }))
      .filter(
        ({ tx }) =>
          tx.isSigned &&
          tx.signer.toString() ===
            wallet.api.createType("AccountId", wallet.address).toString(),
      )
    if (!own.length) continue
    const events = await wallet.api.query.system.events.at(hash)
    for (const { tx, index } of own)
      transactions.push({
        block: number,
        blockHash: hash,
        hash: tx.hash.toHex(),
        index,
        method: tx.method.toHuman(),
        events: events
          .filter(
            ({ phase }) =>
              phase.isApplyExtrinsic &&
              phase.asApplyExtrinsic.toNumber() === index,
          )
          .map(({ event }) => ({
            name: `${event.section}.${event.method}`,
            data: event.data.toHuman(),
          })),
      })
  }
  return transactions
}
try {
  wallet = await injectPublicTestWallet(context, { allowSigning: writes })
  report.account = wallet.address
  report.evm = wallet.evm
  report.before = await snapshot()
  if (["deposit", "cancel-approval", "cancel-deposit"].includes(action))
    assert.ok(
      report.before.nativeCollateral >= amountRaw,
      "Public test account needs free collateral; reserved funding is not spendable",
    )
  page = await context.newPage()
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  await page.goto(`${TEST_ORIGIN}/strategies/juicer`, {
    waitUntil: "domcontentloaded",
  })
  await page.waitForFunction(
    () => document.body.textContent.includes("Est. APR"),
    undefined,
    { timeout: 45_000, polling: 100 },
  )
  await page
    .getByRole("button", { name: "Connect Wallet", exact: true })
    .first()
    .click({ force: true })
  await page.getByText("Polkadot.js", { exact: true }).click({ force: true })
  await page.getByText(PUBLIC_TEST_NAME, { exact: true }).click({ force: true })
  progress("connected")
  await page.waitForTimeout(2000)
  if (["deposit", "cancel-approval", "cancel-deposit"].includes(action)) {
    const row = page.getByRole("row").filter({
      has: page.getByText(symbol === "ETH" ? "Ethereum" : "Threshold BTC", {
        exact: true,
      }),
    })
    await clickEnabled(
      row.getByRole("button", { name: "Deposit", exact: true }),
    )
    progress("deposit-form-opened")
    await page
      .getByRole("dialog")
      .locator('input[inputmode="decimal"]')
      .fill(amount)
    if (action === "cancel-approval") {
      assert.equal(
        report.before.allowance,
        0n,
        "Cancellation scenario requires no existing allowance",
      )
      wallet.rejectNext()
    }
    if (action === "cancel-deposit") wallet.rejectNextFunction("deposit")
    await clickEnabled(
      page
        .getByRole("dialog")
        .getByRole("button", { name: "Deposit", exact: true }),
    )
    progress("deposit-requested")
  } else if (action === "withdraw") {
    assert.ok(
      withdrawMax
        ? report.before.shares > 0n
        : report.before.shares >= amountRaw,
    )
    await page
      .getByRole("button", { name: `Withdraw ${symbol}`, exact: true })
      .click({ force: true })
    if (withdrawMax)
      await page
        .getByRole("dialog")
        .getByRole("button", { name: /^max$/i })
        .click()
    else
      await page
        .getByRole("dialog")
        .locator('input[inputmode="decimal"]')
        .fill(amount)
    await page.getByRole("dialog").getByRole("checkbox").check({ force: true })
    await clickEnabled(
      page
        .getByRole("dialog")
        .getByRole("button", { name: "Request withdrawal", exact: true }),
    )
    progress("withdrawal-requested")
  } else if (action === "claim") {
    await page
      .getByRole("button", {
        name: `Claim available payouts for ${symbol} withdrawal`,
        exact: true,
      })
      .first()
      .click({ force: true, timeout: 20_000 })
  }
  if (writes) {
    const deadline = Date.now() + 120_000
    let lastClick = 0
    let completed = false
    while (Date.now() < deadline) {
      const sign = page.getByRole("button", {
        name: "Sign Transaction",
        exact: true,
      })
      if (
        Date.now() - lastClick > 2500 &&
        (await sign.isVisible()) &&
        (await sign.isEnabled())
      ) {
        await sign.click({ force: true })
        progress("review-confirmed")
        lastClick = Date.now()
      }
      report.after = await snapshot()
      completed =
        action === "cancel-approval" || action === "cancel-deposit"
          ? wallet.requests.some(({ rejected }) => rejected)
          : action === "deposit"
            ? report.after.shares > report.before.shares
            : action === "withdraw"
              ? report.after.queueTail > report.before.queueTail
              : report.after.userCollateral > report.before.userCollateral
      if (completed) break
      await page.waitForTimeout(1000)
    }
    assert.ok(completed, "UI lifecycle action did not finish before timeout")
    if (action !== "cancel-approval") {
      const deadline = Date.now() + 60_000
      while (Date.now() < deadline) {
        const hash = await wallet.api.rpc.chain.getFinalizedHead()
        const header = await wallet.api.rpc.chain.getHeader(hash)
        report.finalizedBlock = header.number.toNumber()
        if (report.finalizedBlock >= Number(report.after.blockNumber)) break
        await page.waitForTimeout(500)
      }
      assert.ok(
        report.finalizedBlock >= Number(report.after.blockNumber),
        "Submitted Lark transactions must finalize",
      )
      report.after = await snapshot(BigInt(report.finalizedBlock))
    }
    report.transactions = await collectTransactions(
      report.before.blockNumber,
      report.after.blockNumber,
    )
    report.vaultEvents = report.transactions.flatMap((transaction) =>
      transaction.events.flatMap((event) => {
        const log = event.name === "evm.Log" ? event.data.log : null
        if (log?.address.toLowerCase() !== vault.toLowerCase()) return []
        try {
          const decoded = decodeEventLog({ abi: VAULT_ABI, ...log })
          return [
            { block: transaction.block, hash: transaction.hash, ...decoded },
          ]
        } catch {
          return [] // The UI ABI intentionally omits unrelated vault events.
        }
      }),
    )
    for (const tx of report.transactions) {
      const canonical = await client.request({
        method: "chain_getBlockHash",
        params: [tx.block],
      })
      assert.equal(canonical, tx.blockHash)
    }
    if (action === "cancel-approval") {
      assert.equal(report.after.shares, report.before.shares)
      assert.equal(report.after.allowance, report.before.allowance)
      assert.equal(report.transactions.length, 0)
    } else {
      assert.ok(
        report.transactions.length > 0,
        "Actual signed transaction must be in a Lark block",
      )
      for (const transaction of report.transactions) {
        assert.ok(
          transaction.events.some(
            ({ name }) => name === "system.ExtrinsicSuccess",
          ),
        )
        assert.ok(
          !transaction.events.some(
            ({ name }) =>
              name.includes("ExecutedFailed") ||
              name.includes("ExtrinsicFailed"),
          ),
        )
      }
    }
    if (action === "cancel-deposit") {
      assert.equal(report.after.shares, report.before.shares)
      assert.equal(report.after.allowance, amountRaw)
      assert.ok(
        wallet.requests.some(
          ({ calls, rejected }) =>
            rejected && calls.some((call) => call.function === "deposit"),
        ),
      )
    }
    if (action === "withdraw") {
      const event = report.vaultEvents.find(
        ({ eventName }) => eventName === "RedeemRequested",
      )
      assert.ok(event, "Withdrawal must emit its request identity")
      assert.equal(event.args.owner.toLowerCase(), wallet.evm)
      if (withdrawMax) {
        const call = wallet.requests
          .flatMap(({ calls }) => calls)
          .find(({ function: name }) => name === "requestRedeem")
        assert.ok(call)
        const decoded = decodeFunctionData({ abi: VAULT_ABI, data: call.input })
        assert.equal(
          decoded.args[0],
          maxUint256,
          "Max must include earnings funded before execution",
        )
        assert.ok(event.args.shares > 0n)
        assert.equal(
          report.after.shares,
          0n,
          "Max must escrow the entire funded balance",
        )
      } else assert.equal(event.args.shares, amountRaw)
      report.requestId = event.args.requestId
    }
    if (action === "claim") {
      const event = report.vaultEvents.find(
        ({ eventName }) => eventName === "Claimed",
      )
      assert.ok(event, "Claim must emit the paid collateral amount")
      assert.equal(event.args.receiver.toLowerCase(), wallet.evm)
      assert.equal(
        event.args.collateral,
        report.after.nativeCollateral - report.before.nativeCollateral,
      )
      report.requestId = event.args.requestId
    }
    if (action === "deposit") {
      const event = report.vaultEvents.find(
        ({ eventName }) => eventName === "Deposited",
      )
      assert.ok(event, "Deposit must emit the assets and minted shares")
      assert.equal(event.args.user.toLowerCase(), wallet.evm)
      assert.equal(event.args.assets, amountRaw)
      assert.ok(event.args.shares > 0n)
      assert.equal(
        report.before.nativeCollateral - report.after.nativeCollateral,
        amountRaw,
      )
      assert.ok(
        wallet.requests.some(({ calls }) =>
          calls.some((call) => call.function === "deposit"),
        ),
      )
      assert.ok(
        wallet.requests.every(
          ({ calls }) =>
            calls.filter(({ name }) => name === "evmAccounts.bindEvmAddress")
              .length <= 1,
        ),
      )
      if (report.before.allowance >= amountRaw) {
        assert.equal(
          wallet.requests.length,
          1,
          "Existing allowance skips approval",
        )
        assert.equal(
          wallet.requests[0].calls.length,
          1,
          "Bound account skips binding",
        )
      }
      if (keeperIdle) {
        assert.equal(
          report.after.debt,
          report.before.debt,
          "Keeper is held off for this rehearsal: a deposit must not borrow",
        )
        assert.equal(
          report.after.pendingDeployment - report.before.pendingDeployment,
          amountRaw,
          "Deposited collateral must enter the pooled pending deployment amount",
        )
      }
    }
  }
  await page.waitForTimeout(1500)
  report.body = await page.locator("body").innerText()
  assert.deepEqual(errors, [])
  report.passed = true
} catch (error) {
  report.error = String(error)
  report.routeError = page
    ? await page
        .getByRole("button", { name: "Copy error", exact: true })
        .getAttribute("title", { timeout: 1000 })
        .catch(() => null)
    : null
  report.body = page
    ? await page
        .locator("body")
        .innerText()
        .catch(() => "Browser unavailable")
    : ""
  throw error
} finally {
  report.errors = errors
  report.consoleErrors = consoleErrors
  report.signatures = wallet?.requests ?? []
  if (process.env.REPORT_PATH)
    await writeFile(process.env.REPORT_PATH, serialize(report))
  console.log(serialize(report))
  await context.close()
  await browser.close()
  await wallet?.dispose()
}
