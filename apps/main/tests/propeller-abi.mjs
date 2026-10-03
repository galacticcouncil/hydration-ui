import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import {
  VAULT_ABI,
  SUBLOOP_ABI,
  MAIN_DEBT_ABI,
  YIELD_ACCOUNTING_ABI,
  FEE_CONTROLLER_ABI,
  EXECUTION_ABI,
} from "../src/modules/strategies/propeller/config/abi.ts"
const artifactRoot = process.argv[2]
if (!artifactRoot)
  throw new Error("Usage: node tests/propeller-abi.mjs /path/to/forge/out")
const groups = {
  CollateralVault: VAULT_ABI,
  SubLoop: SUBLOOP_ABI,
  PropellerMainDebt: MAIN_DEBT_ABI,
  PropellerYieldAccounting: YIELD_ACCOUNTING_ABI,
  PropellerFeeController: FEE_CONTROLLER_ABI,
  ExecutionController: EXECUTION_ABI,
}
const type = (p) =>
  p.type.startsWith("tuple")
    ? `(${p.components.map(type).join(",")})${p.type.slice(5)}`
    : p.type
const signature = (fn) => `${fn.name}(${fn.inputs.map(type).join(",")})`
let checked = 0
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
}
console.log(`PASS ${checked} UI contract functions match compiled artifacts`)
