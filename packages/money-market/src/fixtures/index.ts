import type { Hex } from "viem"
import { decodeFunctionResult } from "viem"

import { uiIncentiveDataProviderAbi, uiPoolDataProviderAbi } from "@/core/abi"
import reservesDataFixture from "@/fixtures/reserves-data.json"
import reservesIncentivesDataFixture from "@/fixtures/reserves-incentives-data.json"
import userReservesDataFixture from "@/fixtures/user-reserves-data.json"

/**
 * Real contract responses, captured once and replayed. Nothing here touches the
 * network.
 *
 * Each fixture stores the *raw* return data of a single `eth_call` rather than
 * a decoded object, for two reasons: a decoded payload would have to serialise
 * `bigint`, and re-hydrating it would mean the test asserted against the
 * re-hydration rather than against what the chain said. Decoding the committed
 * hex with the package's own ABI produces exactly what `readContract` returns,
 * so a fixture can be fed straight through the `@wagmi/core` mock seam.
 *
 * To re-capture, replay the recorded `address`/`functionName`/`args` against
 * `rpcUrl` at a fresh block and overwrite `data`, `blockNumber`,
 * `blockTimestamp` and `capturedAt`. The capture script is deliberately not
 * committed.
 */

export type Fixture = {
  readonly market: string
  readonly chainId: number
  readonly rpcUrl: string
  readonly blockNumber: number
  /** Unix seconds of the captured block — the timestamp to derive against. */
  readonly blockTimestamp: number
  readonly capturedAt: string
  readonly address: string
  readonly functionName: string
  readonly args: readonly string[]
  readonly data: string
}

export const reservesDataCapture: Fixture = reservesDataFixture
export const userReservesDataCapture: Fixture = userReservesDataFixture
export const reservesIncentivesDataCapture: Fixture =
  reservesIncentivesDataFixture

/** The block every fixture was captured at, in unix seconds. */
export const fixtureTimestamp = reservesDataCapture.blockTimestamp

/** The user `user-reserves-data.json` was captured for. */
export const fixtureUser = userReservesDataCapture.args[1] as Hex

export const getReservesDataFixture = () =>
  decodeFunctionResult({
    abi: uiPoolDataProviderAbi,
    functionName: "getReservesData",
    data: reservesDataCapture.data as Hex,
  })

export const getUserReservesDataFixture = () =>
  decodeFunctionResult({
    abi: uiPoolDataProviderAbi,
    functionName: "getUserReservesData",
    data: userReservesDataCapture.data as Hex,
  })

export const getReservesIncentivesDataFixture = () =>
  decodeFunctionResult({
    abi: uiIncentiveDataProviderAbi,
    functionName: "getReservesIncentivesData",
    data: reservesIncentivesDataCapture.data as Hex,
  })
