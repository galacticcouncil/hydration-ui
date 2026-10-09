import assert from "node:assert/strict"
import { mkdtemp, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { VAULT_ABI } from "../src/modules/strategies/propeller/config/abi.ts"
const { default: playwright } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
)
const outputDir =
  process.env.OUTPUT_DIR || (await mkdtemp(join(tmpdir(), "propeller-evm-")))
assert.ok(
  process.argv.includes("--sign-lark-public-account"),
  "Signing requires the explicit public Lark test-account flag",
)
const require = createRequire(import.meta.url),
  pjs = process.env.POLKADOT_MODULE_ROOT
    ? createRequire(resolve(process.env.POLKADOT_MODULE_ROOT, "package.json"))
    : require
const {
    createPublicClient,
    createWalletClient,
    http,
    parseAbi,
    decodeFunctionData,
    decodeEventLog,
    defineChain,
    maxUint256,
  } = require("viem"),
  { mnemonicToAccount } = require("viem/accounts"),
  { ApiPromise, WsProvider } = pjs("@polkadot/api")
const accountIndex = Number(process.env.EVM_ACCOUNT_INDEX || 0)
const rejectApprovalOnce = process.argv.includes("--reject-approval-once")
assert.ok([0, 1].includes(accountIndex))
const GENESIS =
    "0x0be0149961bbb0a547d7cda66e0d973e9ef37a7dd4744041b52739d738778878",
  origin = "http://127.0.0.1:4178",
  rpc = "https://0.lark.hydration.cloud",
  account = mnemonicToAccount(
    "test test test test test test test test test test test junk",
    { addressIndex: accountIndex },
  ),
  owner = account.address.toLowerCase(),
  vault = "0x79b41c78a2b5ac1ddc3c80877449b1cc8f850c46",
  asset = "0x0000000000000000000000000000000100000022",
  dispatch = "0x0000000000000000000000000000000000000401"
assert.equal(
  owner,
  [
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  ][accountIndex],
)
const chain = defineChain({
    id: 222222,
    name: "Public Lark 0 fixture",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [rpc] } },
  }),
  client = createPublicClient({ transport: http(rpc) }),
  directClient = createPublicClient({
    transport: http("https://node0.lark.hydration.cloud"),
  }),
  walletClient = createWalletClient({ account, chain, transport: http(rpc) }),
  api = await ApiPromise.create({
    provider: new WsProvider("wss://node0.lark.hydration.cloud"),
  })
assert.equal(api.genesisHash.toHex(), GENESIS)
assert.equal(
  await client.request({ method: "chain_getBlockHash", params: [0] }),
  GENESIS,
)
const abi = parseAbi([
  "function approve(address spender,uint256 amount) returns(bool)",
  "function deposit(uint256 assets,address receiver) returns(uint256)",
  "function requestRedeem(uint256 shares,address owner) returns(uint256)",
  "function balanceOf(address owner) view returns(uint256)",
  "function allowance(address owner,address spender) view returns(uint256)",
  "function queueTail() view returns(uint256)",
])
const report = {
  fixture:
    "Public Hardhat mnemonic via injected EIP-1193 provider; real Lark signatures; no extension prompt",
  owner,
  rpc,
  genesis: GENESIS,
  requests: [],
  signatures: [],
  checks: [],
}
function inspectEvm(to, data, value) {
  assert.equal(BigInt(value ?? 0), 0n)
  to = to.toLowerCase()
  assert.ok([vault, asset].includes(to), "Unexpected EVM target")
  const d = decodeFunctionData({ abi, data })
  if (d.functionName === "requestRedeem") assert.equal(d.args[0], maxUint256)
  if (to === asset) {
    assert.equal(d.functionName, "approve")
    assert.equal(d.args[0].toLowerCase(), vault)
    assert.ok(d.args[1] <= 10n ** 16n)
  } else {
    assert.ok(["deposit", "requestRedeem"].includes(d.functionName))
    assert.equal(d.args[1].toLowerCase(), owner)
    assert.ok(
      d.args[0] <= 10n ** 16n ||
        (d.functionName === "requestRedeem" && d.args[0] === maxUint256),
    )
  }
  return d.functionName
}
function inspectCall(call) {
  const name = `${call.section}.${call.method}`
  if (name === "utility.batchAll") return call.args[0].flatMap(inspectCall)
  if (name === "multiTransactionPayment.setCurrency") {
    assert.equal(call.args[0].toString(), "0")
    return [name]
  }
  assert.equal(name, "evm.call")
  assert.equal(call.args[0].toHex().toLowerCase(), owner)
  return [
    inspectEvm(
      call.args[1].toHex(),
      call.args[2].toHex(),
      call.args[3].toString(),
    ),
  ]
}
function inspect(to, data, value) {
  return to.toLowerCase() === dispatch
    ? inspectCall(api.createType("Call", data))
    : [inspectEvm(to, data, value)]
}
const browser = await playwright.chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
  }),
  context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  }),
  page = await context.newPage(),
  errors = []
page.on("pageerror", (e) => errors.push(String(e)))
page.setDefaultTimeout(20000)
let selected = "0x1"
const snapshot = async (at) => {
  const block = at ?? (await directClient.getBlockNumber({ cacheTime: 0 }))
  const read = (address, functionName, args = []) =>
    directClient.readContract({
      address,
      abi,
      functionName,
      args,
      blockNumber: block,
    })
  const [shares, queueTail, collateral] = await Promise.all([
    read(vault, "balanceOf", [account.address]),
    read(vault, "queueTail"),
    read(asset, "balanceOf", [account.address]),
  ])
  return { block, shares, queueTail, collateral }
}
async function finalizedEvidence() {
  const deadline = Date.now() + 120000
  let finalizedBlock
  do {
    const hash = await api.rpc.chain.getFinalizedHead()
    finalizedBlock = (await api.rpc.chain.getHeader(hash)).number.toBigInt()
    if (finalizedBlock >= report.withdrawn.block) break
    await page.waitForTimeout(1000)
  } while (Date.now() < deadline)
  assert.ok(
    finalizedBlock >= report.withdrawn.block,
    "Withdrawal did not finalize",
  )
  report.finalizedBlock = finalizedBlock
  report.finalized = await snapshot(finalizedBlock)
  assert.equal(report.finalized.shares, 0n)
  report.transactions = []
  report.vaultEvents = []
  const ownerTopic = "0x" + owner.slice(2).padStart(64, "0")
  for (
    let number = Number(report.before.block) + 1;
    number <= Number(report.withdrawn.block);
    number++
  ) {
    const hash = await api.rpc.chain.getBlockHash(number)
    const events = await api.query.system.events.at(hash)
    const indices = new Set()
    for (const { phase, event } of events) {
      if (
        !phase.isApplyExtrinsic ||
        event.section !== "evm" ||
        event.method !== "Log"
      )
        continue
      const log = event.data[0].toJSON()
      if (
        [asset, vault].includes(log.address.toLowerCase()) &&
        log.topics.some((topic) => topic.toLowerCase() === ownerTopic)
      )
        indices.add(phase.asApplyExtrinsic.toNumber())
    }
    if (!indices.size) continue
    const signedBlock = await api.rpc.chain.getBlock(hash)
    for (const index of indices) {
      const tx = signedBlock.block.extrinsics[index]
      const ownEvents = events
        .filter(
          ({ phase }) =>
            phase.isApplyExtrinsic &&
            phase.asApplyExtrinsic.toNumber() === index,
        )
        .map(({ event }) => ({
          name: `${event.section}.${event.method}`,
          data: event.data.toHuman(),
        }))
      assert.ok(ownEvents.some((e) => e.name === "system.ExtrinsicSuccess"))
      assert.ok(
        !ownEvents.some((e) =>
          ["system.ExtrinsicFailed", "evm.ExecutedFailed"].includes(e.name),
        ),
      )
      report.transactions.push({
        block: number,
        blockHash: hash.toHex(),
        hash: tx.hash.toHex(),
        index,
        method: tx.method.toHuman(),
        events: ownEvents,
      })
      for (const event of ownEvents) {
        if (
          event.name !== "evm.Log" ||
          event.data.log.address.toLowerCase() !== vault
        )
          continue
        try {
          const decoded = decodeEventLog({ abi: VAULT_ABI, ...event.data.log })
          report.vaultEvents.push({
            block: number,
            hash: tx.hash.toHex(),
            ...decoded,
          })
        } catch {}
      }
    }
  }
  const shadowAddress = api
    .createType("AccountId", "0x45544800" + owner.slice(2) + "00".repeat(8))
    .toString()
  report.collateralDust = report.transactions
    .flatMap((tx) => tx.events)
    .filter(
      (event) =>
        event.name === "tokens.DustLost" &&
        event.data.currencyId === "34" &&
        event.data.who === shadowAddress,
    )
    .reduce(
      (total, event) => total + BigInt(event.data.amount.replaceAll(",", "")),
      0n,
    )
  assert.equal(
    report.before.collateral - report.deposited.collateral,
    1000000000000000n + report.collateralDust,
  )
  const deposited = report.vaultEvents.find(
    (e) => e.eventName === "Deposited" && e.args.assets === 1000000000000000n,
  )
  const requested = report.vaultEvents.find(
    (e) => e.eventName === "RedeemRequested",
  )
  assert.ok(deposited, "Missing finalized deposit event")
  assert.ok(requested, "Missing finalized withdrawal event")
  assert.ok(requested.args.shares > 0n)
  report.checks.push("canonical finalized deposit and Max withdrawal events")
}
try {
  await context.exposeBinding(
    "__larkEvm",
    async (source, { method, params = [] }) => {
      assert.equal(new URL(source.page.url()).origin, origin)
      report.requests.push(method)
      console.log("wallet request", method)
      if (["eth_accounts", "eth_requestAccounts"].includes(method))
        return [account.address]
      if (method === "eth_chainId") return selected
      if (method === "wallet_addEthereumChain") {
        assert.equal(BigInt(params[0].chainId), 222222n)
        assert.ok(
          params[0].rpcUrls.every((url) =>
            [
              "https://0.lark.hydration.cloud",
              "https://node0.lark.hydration.cloud",
            ].includes(url.replace(/\/$/, "")),
          ),
        )
        report.network = params[0]
        return null
      }
      if (method === "wallet_switchEthereumChain") {
        assert.equal(BigInt(params[0].chainId), 222222n)
        selected = params[0].chainId
        return null
      }
      if (method === "eth_signTypedData_v4") {
        assert.equal(selected, "0x3640e")
        assert.equal(params[0].toLowerCase(), owner)
        assert.ok(report.signatures.length < 8)
        const d = JSON.parse(params[1])
        assert.equal(BigInt(d.domain.chainId), 222222n)
        assert.equal(
          d.domain.verifyingContract.toLowerCase(),
          "0x000000000000000000000000000000000000080a",
        )
        assert.equal(d.primaryType, "CallPermit")
        assert.equal(d.message.from.toLowerCase(), owner)
        assert.equal(BigInt(d.message.value), 0n)
        assert.ok(BigInt(d.message.gaslimit) <= 15000000n)
        const calls = inspect(d.message.to, d.message.data, d.message.value)
        if (
          rejectApprovalOnce &&
          calls.includes("approve") &&
          !report.rejectedApproval
        ) {
          report.rejectedApproval = true
          return { rejected: true }
        }
        report.signatures.push({ method, calls, message: d.message })
        return account.signTypedData(d)
      }
      if (method === "eth_sendTransaction") {
        assert.equal(selected, "0x3640e")
        assert.ok(report.signatures.length < 8)
        const tx = params[0]
        assert.equal(tx.from.toLowerCase(), owner)
        const calls = inspect(tx.to, tx.data, tx.value)
        report.signatures.push({ method, calls, tx })
        const args = { account, chain, to: tx.to, data: tx.data }
        for (const k of [
          "gas",
          "value",
          "maxFeePerGas",
          "maxPriorityFeePerGas",
          "gasPrice",
        ])
          if (tx[k] != null) args[k] = BigInt(tx[k])
        if (tx.nonce != null) args.nonce = Number(tx.nonce)
        const hash = await walletClient.sendTransaction(args)
        report.signatures.at(-1).hash = hash
        return hash
      }
      assert.ok(
        [
          "eth_getBalance",
          "eth_getBlockByNumber",
          "eth_blockNumber",
          "eth_call",
          "eth_getTransactionCount",
          "eth_estimateGas",
          "eth_gasPrice",
          "eth_getTransactionReceipt",
          "eth_getTransactionByHash",
          "eth_getCode",
          "net_version",
          "eth_feeHistory",
          "eth_maxPriorityFeePerGas",
        ].includes(method),
        "Unexpected wallet request " + method,
      )
      return client.request({ method, params })
    },
  )
  await context.addInitScript(() => {
    const listeners = new Map()
    const provider = {
      isMetaMask: true,
      request: async (args) => {
        const result = await window.__larkEvm(args)
        if (result?.rejected)
          throw Object.assign(
            new Error("Public fixture rejected the approval"),
            { code: 4001 },
          )
        if (args.method === "wallet_switchEthereumChain")
          for (const fn of listeners.get("chainChanged") || [])
            fn(args.params[0].chainId)
        return result
      },
      on: (type, fn) => {
        listeners.set(type, [...(listeners.get(type) || []), fn])
        return provider
      },
      removeListener: (type, fn) => {
        listeners.set(
          type,
          (listeners.get(type) || []).filter((x) => x !== fn),
        )
        return provider
      },
    }
    const announce = () =>
      window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", {
          detail: {
            info: {
              uuid: "77777777-7777-4777-8777-777777777777",
              name: "MetaMask",
              rdns: "io.metamask",
              icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
            },
            provider,
          },
        }),
      )
    window.ethereum = provider
    window.addEventListener("eip6963:requestProvider", announce)
    announce()
  })
  report.before = await snapshot()
  await page.goto(origin + "/strategies/juicer?asset=ETH", {
    waitUntil: "domcontentloaded",
  })
  await page
    .getByText("Remaining capacity:", { exact: true })
    .waitFor({ timeout: 45000 })
  await page
    .getByRole("button", { name: "Connect Wallet", exact: true })
    .first()
    .click()
  await page.getByText("MetaMask", { exact: true }).click()
  await page
    .getByRole("dialog")
    .getByText(new RegExp(owner.slice(0, 6), "i"))
    .first()
    .click()
  console.log("connected EVM fixture")
  const form = page.locator("form").first()
  await form.locator("input[inputmode=decimal]").fill("0.001")
  await form.locator("button[type=submit]").click()
  async function finish(predicate) {
    const end = Date.now() + 180000
    let last = 0
    while (Date.now() < end) {
      const change = page.getByRole("button", {
        name: "Change fee payment asset",
        exact: true,
      })
      if (
        (await change.isVisible()) &&
        (await change.isEnabled()) &&
        !report.checks.includes("change fee payment asset to funded HDX")
      ) {
        await change.click()
        await page
          .getByRole("dialog")
          .last()
          .getByText("HDX", { exact: true })
          .click()
        report.checks.push("change fee payment asset to funded HDX")
        console.log("selected HDX fees")
      }
      const button = page.getByRole("button", {
        name: "Sign Transaction",
        exact: true,
      })
      if (
        Date.now() - last > 2500 &&
        (await button.isVisible()) &&
        (await button.isEnabled())
      ) {
        await button.click()
        last = Date.now()
        console.log("review confirmed")
      }
      if (
        await page
          .getByText("Failed to submit transaction", { exact: true })
          .isVisible()
      ) {
        if (report.rejectedApproval && !report.retriedApproval) {
          await page.getByRole("button", { name: /^try again$/i }).click()
          report.retriedApproval = true
          continue
        }
        const copy = page.getByRole("button", { name: /^copy error$/i })
        report.submitError = await copy.getAttribute("title")
        throw Error("EVM submit failed: " + report.submitError)
      }
      const state = await snapshot()
      if (predicate(state)) return state
      await page.waitForTimeout(800)
    }
    throw Error("EVM lifecycle timed out")
  }
  report.deposited = await finish(
    (s) =>
      s.shares > report.before.shares &&
      report.before.collateral - s.collateral >= 1000000000000000n,
  )
  report.collateralDebited =
    report.before.collateral - report.deposited.collateral
  assert.ok(report.collateralDebited >= 1000000000000000n)
  report.checks.push("real EVM approval and deposit")
  console.log("PASS EVM deposit")
  await page
    .getByRole("button", { name: "Withdraw ETH", exact: true })
    .waitFor({ timeout: 45000 })
  if (rejectApprovalOnce) {
    assert.equal(report.rejectedApproval, true)
    assert.equal(report.retriedApproval, true)
    await page
      .getByText(/The deposit could not complete/)
      .waitFor({ state: "hidden" })
    report.checks.push("successful retry clears the rejected-approval error")
    console.log("PASS successful retry clears the deposit error")
  }
  await page.getByRole("button", { name: "Withdraw ETH", exact: true }).click()
  await page.getByRole("dialog").getByRole("button", { name: /^max$/i }).click()
  await page.getByRole("dialog").getByRole("checkbox").check()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Request withdrawal", exact: true })
    .click()
  report.withdrawn = await finish(
    (s) => s.queueTail > report.deposited.queueTail && s.shares === 0n,
  )
  assert.equal(report.withdrawn.shares, 0n)
  report.checks.push("real EVM Max withdrawal")
  console.log("PASS EVM Max withdrawal")
  assert.deepEqual(errors, [])
  await finalizedEvidence()
  report.passed = true
} catch (e) {
  report.error = String(e)
  report.body = await page.locator("body").innerText()
  console.error(report.error, report.body.slice(-3000))
  report.passed = false
  process.exitCode = 1
} finally {
  report.errors = errors
  await writeFile(
    join(outputDir, "evm-check.json"),
    JSON.stringify(
      report,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    ),
  )
  await page.screenshot({
    path: join(outputDir, "evm-check.png"),
    fullPage: true,
  })
  await api.disconnect()
  await browser.close()
}
