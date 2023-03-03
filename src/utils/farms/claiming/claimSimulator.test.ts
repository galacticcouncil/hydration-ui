import "interfaces/augment-bignumber"

import { test, expect } from "vitest"
import {
  TypeRegistry,
  U32,
  U64,
  U128,
  UInt,
  Text,
  Option,
  Struct,
  Enum,
  GenericAccountId,
  GenericAccountId32,
} from "@polkadot/types"

import { OmnipoolLiquidityMiningClaimSim } from "utils/farms/claiming/claimSimulator"
import { getAccountResolver } from "utils/farms/claiming/accountResolver"
import { MultiCurrencyContainer } from "utils/farms/claiming/multiCurrency"
import { createMutableFarmEntries } from "./mutableFarms"
import { createEnum, createStruct } from "utils/test/createTestApi"
import {
  PalletLiquidityMiningFarmState,
  PalletLiquidityMiningGlobalFarmData,
  PalletLiquidityMiningYieldFarmData,
  PalletLiquidityMiningYieldFarmEntry,
} from "@polkadot/types/lookup"
import { decodeAddress } from "@polkadot/util-crypto"
import BigNumber from "bignumber.js"
import BN from "bn.js"

const registry = new TypeRegistry()

test("create mock type registry", () => {
  const accountResolver = getAccountResolver(registry)

  const multiCurrency = new MultiCurrencyContainer(
    [
      [
        new GenericAccountId32(
          registry,
          decodeAddress("7L53bUT5Bn9vNULtfmkmPZWG7Lki3TdaRiBiRiEu8uSA9rYF"),
        ),
        new U32(registry, "0x00000000"),
      ],
      [
        new GenericAccountId32(
          registry,
          decodeAddress("7L53bUT5Bn9vNULtfmm38b3rDqRuW1jTAP8DyevjbjJtRZ6X"),
        ),
        new U32(registry, "0x00000000"),
      ],
    ],
    [
      {
        free: new BN("100059809463094"),
        reserved: new BN("0"),
        frozen: new BN("0"),
      },
      {
        free: new BN("999999940184820114"),
        reserved: new BN("0"),
        frozen: new BN("0"),
      },
    ],
  )

  const entries = createMutableFarmEntries([
    {
      globalFarm: createStruct<PalletLiquidityMiningGlobalFarmData>(registry, {
        id: [U32, new U32(registry, "1")],
        owner: [
          GenericAccountId,
          decodeAddress("7Lpe5LRa2Ntx9KGDk77xzoBPYTCAvj7QqaBx4Nz2TFqL3sLw"),
        ],
        updatedAt: [U32, new U32(registry, "102753")],
        totalSharesZ: [U128, new U128(registry, "76997989532819")],
        accumulatedRpz: [U128, new U128(registry, "1350456433599719")],
        rewardCurrency: [U32, new U32(registry, "0")],
        pendingRewards: [U128, new U128(registry, "33670017124")],
        accumulatedPaidRewards: [U128, new U128(registry, "26145162762")],
        yieldPerPeriod: [UInt, new UInt(registry, "57077625570")],
        plannedYieldingPeriods: [U32, new U32(registry, "10000000")],
        blocksPerPeriod: [U32, new U32(registry, "1")],
        incentivizedAsset: [U32, new U32(registry, "1")],
        maxRewardPerPeriod: [U128, new U128(registry, "100000000000")],
        minDeposit: [U128, new U128(registry, "1000")],
        liveYieldFarmsCount: [U32, new U32(registry, "3")],
        totalYieldFarmsCount: [U32, new U32(registry, "3")],
        priceAdjustment: [U128, new U128(registry, "1000000000000000000")],
        state: [
          Enum,
          createEnum<PalletLiquidityMiningFarmState>(registry, {
            Active: [Text, new Text(registry, "Active")],
            Stopped: [Text],
            Terminated: [Text],
          }),
        ],
      }),

      yieldFarm: createStruct<PalletLiquidityMiningYieldFarmData>(registry, {
        id: [U32, new U32(registry, "4")],
        updatedAt: [U32, new U32(registry, "102753")],
        totalShares: [U128, new U128(registry, "100187046783")],
        totalValuedShares: [U128, new U128(registry, "25697989532819")],
        accumulatedRpvs: [U128, new U128(registry, "1350456251032194")],
        accumulatedRpz: [U128, new U128(registry, "1350456433599719")],
        loyaltyCurve: [Option, new Option(registry, Struct, undefined)],
        multiplier: [U128, new U128(registry, "1000000000000000000")],
        entriesCount: [U64, new U64(registry, "9")],
        totalStopped: [U32, new U32(registry, "0")],
        leftToDistribute: [U128, new U128(registry, "26139445970")],
        state: [
          Enum,
          createEnum<PalletLiquidityMiningFarmState>(registry, {
            Active: [Text, new Text(registry, "Active")],
            Stopped: [Text],
            Terminated: [Text],
          }),
        ],
      }),
    },
  ])

  const simulator = new OmnipoolLiquidityMiningClaimSim(
    accountResolver,
    multiCurrency,
    [
      {
        id: "0",
        existentialDeposit: new BigNumber("1000000000000"),
      },
    ],
  )

  const result = simulator.claim_rewards(
    entries.globalFarms["1"],
    entries.yieldFarms["4"],
    createStruct<PalletLiquidityMiningYieldFarmEntry>(registry, {
      globalFarmId: [U32, new U32(registry, "1")],
      yieldFarmId: [U32, new U32(registry, "4")],
      valuedShares: [U128, new U128(registry, "3078002878")],
      stoppedAtCreation: [U32, new U32(registry, "0")],
      accumulatedRpvs: [U128, new U128(registry, "386871776323198")],
      accumulatedClaimedRewards: [U128, new U128(registry, "2753688")],
      enteredAt: [U32, new U32(registry, "85871")],
      updatedAt: [U32, new U32(registry, "101545")],
    }),
    new BigNumber("117955"),
  )

  expect(result?.value.toString()).toEqual("2,882,992".replaceAll(",", ""))
  expect(result?.assetId.toString()).toEqual("0")
})
