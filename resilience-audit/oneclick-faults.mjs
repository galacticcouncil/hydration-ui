import path from "node:path"
import output from "./output.cjs"
const { outputDir } = output
import assert from "node:assert/strict"
import fs from "node:fs"

import axios from "../node_modules/@defuse-protocol/one-click-sdk-typescript/node_modules/axios/index.js"
import {
  OneClickService,
  OpenAPI,
} from "@defuse-protocol/one-click-sdk-typescript"
import { getOneClickQuote } from "../node_modules/@galacticcouncil/xc-swap/build/index.mjs"

const observationMs = 150
const observations = []
const originalAdapter = axios.defaults.adapter
const originalToken = OpenAPI.TOKEN
OpenAPI.TOKEN = undefined

const quote = {
  amount: 100000000000000000n,
  destinationAsset: "nep141:wrap.near",
  recipient: "audit.near",
  refundTo: "0x0000000000000000000000000000000000000001",
  slippageBps: 100,
  deadline: Date.now() + 60000,
  dry: true,
}

async function observe(promise) {
  return Promise.race([
    Promise.resolve(promise).then(
      (value) => ({ state: "fulfilled", value }),
      (error) => ({ state: "rejected", message: error.message }),
    ),
    new Promise((resolve) =>
      setTimeout(() => resolve({ state: "pending" }), observationMs),
    ),
  ])
}

try {
  for (const mode of ["network-reject", "http-503", "silent-hang"]) {
    for (const [api, request] of [
      ["tokens", () => OneClickService.getTokens()],
      ["quote-helper", () => getOneClickQuote(quote)],
      // This SDK endpoint is tested here; current UI settlement monitoring
      // uses IntentScan instead, as recorded in the audit findings.
      [
        "status-sdk-only",
        () => OneClickService.getExecutionStatus("audit-deposit"),
      ],
    ]) {
      const requests = []
      axios.defaults.adapter = async (config) => {
        requests.push({
          url: config.url,
          method: config.method,
          timeoutMs: config.timeout,
          hasCancelToken: Boolean(config.cancelToken),
        })
        if (mode === "network-reject")
          throw new Error("simulated 1Click network failure")
        if (mode === "http-503")
          return {
            status: 503,
            statusText: "Service Unavailable",
            data: { error: "simulated 1Click outage" },
            headers: {},
            config,
          }
        return new Promise(() => {})
      }
      const promise = request()
      const result = await observe(promise)
      assert.equal(
        result.state,
        mode === "silent-hang" ? "pending" : "rejected",
      )
      assert.equal(requests.length, 1)
      assert.equal(requests[0].timeoutMs, 0)
      observations.push({
        api,
        mode,
        ...result,
        requests,
        exposesCancel: typeof promise.cancel === "function",
      })
    }
  }
  const result = {
    kind: "Actual locked 1Click SDK and xc-swap helper with mocked Axios adapter; no live API calls or transactions",
    observationMs,
    assertions: 27,
    observations,
    sourceConclusions: [
      "Axios request timeout is zero. Silent requests stayed pending during the observation window; source supplies no network deadline.",
      "Direct service methods expose cancellation; the xc-swap async quote helper returns a native Promise and does not expose cancel.",
      "The quote payload deadline describes swap validity, and does not configure an HTTP request timeout.",
      "Current UI does not use the tested SDK status method; it separately fetches IntentScan order status.",
    ],
  }
  const target = path.join(outputDir, "oneclick-faults.json")
  fs.writeFileSync(target, JSON.stringify(result, null, 2) + "\n")
  console.log(
    JSON.stringify({
      assertions: result.assertions,
      checks: observations.map(({ api, mode, state, exposesCancel }) => ({
        api,
        mode,
        state,
        exposesCancel,
      })),
    }),
  )
} finally {
  axios.defaults.adapter = originalAdapter
  OpenAPI.TOKEN = originalToken
}
