import { hexToBytes } from "viem"

import type { AccountIntentEntry } from "@/api/intents"

export type Intent = AccountIntentEntry["intent"]

// Intent.IntentSubmitted of intent 33113655064623107617176158217601,
// mainnet block 17 193 874 (HOLLAR → ZEC xc TWAP, 3 orders).
export const FORWARD_DATA =
  "0x0000000000000000000000000221a7568a88c46b619a439399ae60fed55cff2300000000000000000000000000000000000000000000000000008cf4e7b6e710000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000ae0126f5c2370e563e9f4dda435f03a63d7c109d8d041dcc08f275c88e7b442c5aa8d3cb2a630adea257e305aa768555b4b8a6f0568a012c03000000000000000000000000091cd59a0000000000000000000000000006ddd0000000006aff18dd0026f5c2370e563e9f4dda435f03a63d7c109d8d04146e65703134313a7a65632e6f6d66742e6e656172237431525070736f3750566368534757704758456d6355485244755445757831746b7645000000000000000000000000000000000000"

export const DISPATCHER = "0x2c967d7e00a18c1c926fd77de733a27c3fdb3f2b"

export const forward = (
  contract: string = DISPATCHER,
  data: Uint8Array = hexToBytes(FORWARD_DATA),
): Intent["on_resolved"] => ({
  type: "Forward",
  value: { contract, data },
})

export const dcaIntent = (onResolved: Intent["on_resolved"]): Intent => ({
  data: {
    type: "Dca",
    value: {
      asset_in: 222,
      asset_out: 20,
      amount_in: 1850000000000000000n,
      amount_out: 900000000000000n,
      slippage: 30000,
      budget: 5550000000000000000n,
      remaining_budget: 5550000000000000000n,
      period: 150,
      last_execution_block: 17193724,
    },
  },
  deadline: undefined,
  on_resolved: onResolved,
})

export const swapIntent = (onResolved: Intent["on_resolved"]): Intent => ({
  data: {
    type: "Swap",
    value: {
      asset_in: 222,
      asset_out: 20,
      amount_in: 1850000000000000000n,
      amount_out: 900000000000000n,
      partial: { type: "No", value: undefined },
    },
  },
  deadline: 1795102941000n,
  on_resolved: onResolved,
})
