import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import {
  VAULT_ABI,
  SUBLOOP_ABI,
  MAIN_DEBT_ABI,
  YIELD_ACCOUNTING_ABI,
  FEE_CONTROLLER_ABI,
} from "../src/modules/strategies/propeller/config/abi.ts"
const artifactRoot = process.argv[2]
if (!artifactRoot)
  throw new Error("Usage: node tests/propeller-abi.mjs /path/to/forge/out")
const groups = {
  CollateralVault: VAULT_ABI,
  SubLoop: SUBLOOP_ABI,
  JuicerMainDebt: MAIN_DEBT_ABI,
  JuicerYieldAccounting: YIELD_ACCOUNTING_ABI,
  JuicerFeeController: FEE_CONTROLLER_ABI,
}
const type = (p) =>
  p.type.startsWith("tuple")
    ? `(${p.components.map(type).join(",")})${p.type.slice(5)}`
    : p.type
const signature = (fn) => `${fn.name}(${fn.inputs.map(type).join(",")})`
let checked = 0
let checkedEvents = 0
for (const [name, abi] of Object.entries(groups)) {
  const compiled = JSON.parse(
    await readFile(
      path.join(artifactRoot, `${name}.sol`, `${name}.json`),
      "utf8",
    ),
  ).abi
  const functions = abi.filter((item) => item.type === "function")
  for (const fn of functions) {
    const actual = compiled.find(
      (item) => item.type === "function" && signature(item) === signature(fn),
    )
    assert.ok(actual, `${name}: missing ${signature(fn)}`)
    assert.deepEqual(
      fn.outputs.map(type),
      actual.outputs.map(type),
      `${name}.${fn.name}: outputs`,
    )
    assert.equal(
      fn.stateMutability,
      actual.stateMutability,
      `${name}.${fn.name}: mutability`,
    )
    checked++
  }
  console.log(
    `PASS ${name}: ${functions.length} function signatures, outputs and mutability`,
  )
  for (const event of abi.filter((item) => item.type === "event")) {
    const actual = compiled.find(
      (item) => item.type === "event" && signature(item) === signature(event),
    )
    assert.ok(actual, `${name}: missing event ${signature(event)}`)
    assert.deepEqual(
      event.inputs.map((input) => input.indexed),
      actual.inputs.map((input) => input.indexed),
      `${name}.${event.name}: indexed event fields`,
    )
    assert.equal(event.anonymous, actual.anonymous)
    checkedEvents++
  }
}
console.log(`PASS ${checked} UI contract functions match compiled artifacts`)
console.log(
  `PASS ${checkedEvents} UI event signatures and indexed fields match compiled artifacts`,
)
