import { readFileSync } from "node:fs"
import { join } from "node:path"

import { type Abi, type AbiParameter } from "viem"
import { describe, expect, it } from "vitest"

import {
  FEE_CONTROLLER_ABI,
  MAIN_DEBT_ABI,
  SUBLOOP_ABI,
  VAULT_ABI,
  YIELD_ACCOUNTING_ABI,
} from "@/modules/strategies/juicer/config/abi"

// The compiled contracts live in the money-market repo, so this only runs when
// pointed at its forge output; run it after a contract change:
//   JUICER_CONTRACTS_OUT=/path/to/money-market/propeller-vault/out-production yarn test abi
const artifactRoot = process.env.JUICER_CONTRACTS_OUT

// keyed by the contract's artifact name, which still carries the Propeller title
const CONTRACTS: Record<string, Abi> = {
  CollateralVault: VAULT_ABI,
  SubLoop: SUBLOOP_ABI,
  PropellerMainDebt: MAIN_DEBT_ABI,
  PropellerYieldAccounting: YIELD_ACCOUNTING_ABI,
  PropellerFeeController: FEE_CONTROLLER_ABI,
}

type AbiParam = AbiParameter & { components?: readonly AbiParam[] }

const paramType = (param: AbiParam): string =>
  param.type.startsWith("tuple")
    ? `(${(param.components ?? []).map(paramType).join(",")})${param.type.slice(5)}`
    : param.type

const signature = (item: {
  name: string
  inputs: readonly AbiParam[]
}): string => `${item.name}(${item.inputs.map(paramType).join(",")})`

const readCompiledAbi = (root: string, name: string): Abi =>
  JSON.parse(readFileSync(join(root, `${name}.sol`, `${name}.json`), "utf8"))
    .abi

describe.skipIf(!artifactRoot)(
  "Juicer ABIs match the compiled contracts",
  () => {
    describe.each(Object.entries(CONTRACTS))("%s", (name, abi) => {
      // the body still runs at collection when the suite is skipped
      const compiled = artifactRoot ? readCompiledAbi(artifactRoot, name) : []

      const functions = abi.filter((item) => item.type === "function")
      it.each(functions.map((fn) => [signature(fn), fn] as const))(
        "function %s",
        (sig, fn) => {
          const actual = compiled.find(
            (item) => item.type === "function" && signature(item) === sig,
          )
          expect(actual, `${name}: missing ${sig}`).toBeDefined()
          if (actual?.type !== "function") return
          expect(fn.outputs.map(paramType)).toEqual(
            actual.outputs.map(paramType),
          )
          expect(fn.stateMutability).toBe(actual.stateMutability)
        },
      )

      const events = abi.filter((item) => item.type === "event")
      it.each(events.map((event) => [signature(event), event] as const))(
        "event %s",
        (sig, event) => {
          const actual = compiled.find(
            (item) => item.type === "event" && signature(item) === sig,
          )
          expect(actual, `${name}: missing event ${sig}`).toBeDefined()
          if (actual?.type !== "event") return
          expect(event.inputs.map((input) => input.indexed)).toEqual(
            actual.inputs.map((input) => input.indexed),
          )
          expect(event.anonymous).toBe(actual.anonymous)
        },
      )
    })
  },
)
