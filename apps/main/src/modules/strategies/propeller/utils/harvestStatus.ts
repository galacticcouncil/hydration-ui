import { type Hex, type PublicClient } from "viem"

import {
  MAIN_DEBT_ABI,
  SUBLOOP_ABI,
  VAULT_ABI,
} from "@/modules/strategies/propeller/config/abi"

export type HarvestStatus = {
  state:
    | "paused"
    | "accounting"
    | "service"
    | "reserve"
    | "minimum"
    | "capacity"
    | "awaiting"
  reserveGap: bigint
  minimumSurplus: bigint
  blockNumber: bigint
}

export const readHarvestStatus = async (
  client: PublicClient,
  vault: Hex,
  blockNumber: bigint,
): Promise<HarvestStatus> => {
  const at = { blockNumber }
  const [source, ledger, vaultPaused] = await Promise.all([
    client.readContract({
      address: vault,
      abi: VAULT_ABI,
      functionName: "yieldSource",
      ...at,
    }),
    client.readContract({
      address: vault,
      abi: VAULT_ABI,
      functionName: "mainDebt",
      ...at,
    }),
    client.readContract({
      address: vault,
      abi: VAULT_ABI,
      functionName: "paused",
      ...at,
    }),
  ])
  const [
    equity8,
    principal,
    unwind,
    reserve,
    capacity,
    threshold,
    paused,
    emergency,
    accounting,
    service,
  ] = await Promise.all([
    client.readContract({
      address: source,
      abi: SUBLOOP_ABI,
      functionName: "totalEquity",
      ...at,
    }),
    client.readContract({
      address: source,
      abi: SUBLOOP_ABI,
      functionName: "principalEquity",
      ...at,
    }),
    client.readContract({
      address: source,
      abi: SUBLOOP_ABI,
      functionName: "unwindTargetEquity",
      ...at,
    }),
    client.readContract({
      address: source,
      abi: SUBLOOP_ABI,
      functionName: "executionCostReserve",
      ...at,
    }),
    client.readContract({
      address: source,
      abi: SUBLOOP_ABI,
      functionName: "harvestCapacity",
      ...at,
    }),
    client.readContract({
      address: source,
      abi: SUBLOOP_ABI,
      functionName: "harvestThreshold",
      ...at,
    }),
    client.readContract({
      address: source,
      abi: SUBLOOP_ABI,
      functionName: "paused",
      ...at,
    }),
    client.readContract({
      address: source,
      abi: SUBLOOP_ABI,
      functionName: "emergencyPaused",
      ...at,
    }),
    client.readContract({
      address: ledger,
      abi: MAIN_DEBT_ABI,
      functionName: "pendingSourceAccounting",
      ...at,
    }),
    client.readContract({
      address: ledger,
      abi: MAIN_DEBT_ABI,
      functionName: "serviceBlocked",
      ...at,
    }),
  ])
  const equity = equity8 * 10n ** 10n
  const protectedValue = principal + unwind + reserve
  const available = equity > protectedValue ? equity - protectedValue : 0n
  const reserveGap = protectedValue > equity ? protectedValue - equity : 0n
  const minimumSurplus = (principal * threshold + 10n ** 18n - 1n) / 10n ** 18n
  const state =
    vaultPaused || paused || emergency
      ? "paused"
      : accounting
        ? "accounting"
        : service
          ? "service"
          : capacity > 0n
            ? "awaiting"
            : equity <= protectedValue
              ? "reserve"
              : available < minimumSurplus
                ? "minimum"
                : "capacity"
  return { state, reserveGap, minimumSurplus, blockNumber }
}
