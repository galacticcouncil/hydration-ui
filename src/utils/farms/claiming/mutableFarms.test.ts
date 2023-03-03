import "interfaces/augment-bignumber"

import { expect, test } from "vitest"
import {
  Struct,
  TypeRegistry,
  U128,
  U64,
  U32,
  UInt,
  Enum,
  Text,
  Option,
  GenericAccountId,
} from "@polkadot/types"
import { Codec, CodecClass, Registry } from "@polkadot/types/types"
import {
  PalletLiquidityMiningGlobalFarmData,
  PalletLiquidityMiningYieldFarmData,
  PalletLiquidityMiningFarmState,
  PalletLiquidityMiningLoyaltyCurve,
} from "@polkadot/types/lookup"

import { createMutableFarmEntries } from "./mutableFarms"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"

const registry = new TypeRegistry()

type StructPairType = [string | CodecClass<Codec>, unknown]

const createStruct = <T extends Struct>(
  registry: Registry,
  pairs: Record<keyof Omit<T, keyof Struct>, StructPairType>,
) => {
  return new (Struct.with(
    Object.fromEntries(
      Object.entries<StructPairType>(pairs).map(([key, [_class]]) => [
        key,
        _class,
      ]),
    ),
  ))(
    registry,
    Object.fromEntries(
      Object.entries<StructPairType>(pairs).map(([key, [_, instance]]) => [
        key,
        instance,
      ]),
    ),
  ) as unknown as T
}

type EnumPairType =
  | [string | CodecClass<Codec>, unknown]
  | [string | CodecClass<Codec>]

const createEnum = <T extends Enum>(
  registry: Registry,
  pairs: Record<T["type"], EnumPairType>,
) => {
  return new (Enum.with(
    Object.fromEntries(
      Object.entries<EnumPairType>(pairs).map(([key, [_class]]) => [
        key,
        _class,
      ]),
    ),
  ))(
    registry,
    Object.fromEntries(
      Object.entries<EnumPairType>(pairs)
        .map(([key, value]) => {
          if (value.length === 2) {
            return [key, value[1]]
          } else {
            return null
          }
        })
        .filter((x): x is [string | CodecClass<Codec>, unknown] => x != null),
    ),
  ) as unknown as T
}

test("proper cloning", () => {
  const entries = createMutableFarmEntries([
    {
      globalFarm: createStruct<PalletLiquidityMiningGlobalFarmData>(registry, {
        id: [U32, new U32(registry, 10)],
        owner: [
          GenericAccountId,
          decodeAddress("bXhmisFH9dL7obCbbNLXqZbsGvANArBQWeFSrJ2ZMQ3uK3tXg"),
        ],
        updatedAt: [U32, new U32(registry, "1560649")],
        totalSharesZ: [
          U128,
          new U128(registry, "0x0000000000000015bfc66805b7497cb0"),
        ],
        accumulatedRpz: [
          U128,
          new U128(registry, "0x0000000000000000001e209208975110"),
        ],
        rewardCurrency: [U32, new U32(registry, 0)],
        pendingRewards: [U128, new U128(registry, "3075389218210")],
        accumulatedPaidRewards: [
          U128,
          new U128(registry, "0x000000000000000000a97b9ce8510501"),
        ],
        yieldPerPeriod: [UInt, new UInt(registry, "304414003044")],
        plannedYieldingPeriods: [U32, new U32(registry, "151200")],
        blocksPerPeriod: [U32, new U32(registry, 2)],
        incentivizedAsset: [U32, new U32(registry, 0)],
        maxRewardPerPeriod: [U128, new U128(registry, "760582010582010")],
        minDeposit: [U128, new U128(registry, 1000)],
        liveYieldFarmsCount: [U32, new U32(registry, 2)],
        totalYieldFarmsCount: [U32, new U32(registry, 2)],
        priceAdjustment: [
          U128,
          new U128(registry, "0x00000000000000000de0b6b3a7640000"),
        ],
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
        id: [U32, new U32(registry, 14)],
        updatedAt: [U32, new U32(registry, 1560633)],
        totalShares: [
          U128,
          new U128(registry, "0x000000000000000006de55f7818e8cc1"),
        ],
        totalValuedShares: [
          U128,
          new U128(registry, "0x000000000000000008c33d5e7e6228fd"),
        ],
        accumulatedRpvs: [
          U128,
          new U128(registry, "0x0000000000000000001e1c2400c65aa8"),
        ],
        accumulatedRpz: [
          U128,
          new U128(registry, "0x0000000000000000001e1c2400c65ad1"),
        ],
        loyaltyCurve: [
          Option,
          new Option(
            registry,
            Struct,
            createStruct<PalletLiquidityMiningLoyaltyCurve>(registry, {
              initialRewardPercentage: [
                U128,
                new U128(registry, "0x000000000000000006f05b59d3b20000"),
              ],
              scaleCoef: [U32, new U32(registry, 50000)],
            }),
          ),
        ],
        multiplier: [
          U128,
          new U128(registry, "0x00000000000000000de0b6b3a7640000"),
        ],
        entriesCount: [U64, new U64(registry, 3)],
        leftToDistribute: [U128, new U128(registry, "360825852820805")],
        totalStopped: [U64, new U64(registry, 0)],
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

  const globalFarm = entries.globalFarms["10"]

  expect(globalFarm.id.toString()).toEqual("10")
  expect(globalFarm.owner.toString()).toEqual(
    encodeAddress(
      decodeAddress("bXhmisFH9dL7obCbbNLXqZbsGvANArBQWeFSrJ2ZMQ3uK3tXg"),
    ),
  )
  expect(globalFarm.rewardCurrency.toString()).toEqual("0")
  expect(globalFarm.state.type).toBe("Active")
  expect([
    globalFarm.state.isActive,
    globalFarm.state.isStopped,
    globalFarm.state.isTerminated,
  ]).toEqual([true, false, false])

  expect(globalFarm.updatedAt.toFixed()).toEqual(
    "1,560,649".replaceAll(",", ""),
  )
  expect(globalFarm.totalSharesZ.toFixed()).toEqual(
    "401,200,472,428,292,701,360".replaceAll(",", ""),
  )
  expect(globalFarm.accumulatedRpz.toFixed()).toEqual(
    "8,480,060,882,768,144".replaceAll(",", ""),
  )
  expect(globalFarm.pendingRewards.toFixed()).toEqual(
    "3,075,389,218,210".replaceAll(",", ""),
  )
  expect(globalFarm.accumulatedPaidRewards.toFixed()).toEqual(
    "47,705,184,906,839,297".replaceAll(",", ""),
  )
  expect(globalFarm.yieldPerPeriod.toFixed()).toEqual("0.000000304414003044")
  expect(globalFarm.plannedYieldingPeriods.toFixed()).toEqual(
    "151,200".replaceAll(",", ""),
  )
  expect(globalFarm.blocksPerPeriod.toFixed()).toEqual("2")
  expect(globalFarm.maxRewardPerPeriod.toFixed()).toEqual(
    "760,582,010,582,010".replaceAll(",", ""),
  )
  expect(globalFarm.minDeposit.toFixed()).toEqual("1,000".replaceAll(",", ""))
  expect(globalFarm.liveYieldFarmsCount.toFixed()).toEqual("2")
  expect(globalFarm.totalYieldFarmsCount.toFixed()).toEqual("2")
  expect(globalFarm.priceAdjustment.toFixed()).toEqual(
    "1,000,000,000,000,000,000".replaceAll(",", ""),
  )

  const yieldFarm = entries.yieldFarms["14"]

  expect(yieldFarm.id.toString()).toEqual("14".replaceAll(",", ""))
  expect(yieldFarm.updatedAt.toFixed()).toEqual("1,560,633".replaceAll(",", ""))
  expect(yieldFarm.totalShares.toFixed()).toEqual(
    "494,927,530,576,219,329".replaceAll(",", ""),
  )
  expect(yieldFarm.totalValuedShares.toFixed()).toEqual(
    "631,415,848,818,583,805".replaceAll(",", ""),
  )
  expect(yieldFarm.accumulatedRpvs.toFixed()).toEqual(
    "8,475,190,258,719,400".replaceAll(",", ""),
  )
  expect(yieldFarm.accumulatedRpz.toFixed()).toEqual(
    "8,475,190,258,719,441".replaceAll(",", ""),
  )
  expect(yieldFarm.loyaltyCurve.isEmpty).toEqual(false)
  expect(yieldFarm.multiplier.toFixed()).toEqual(
    "1,000,000,000,000,000,000".replaceAll(",", ""),
  )
  expect(yieldFarm.entriesCount.toFixed()).toEqual("3".replaceAll(",", ""))
  expect(yieldFarm.leftToDistribute.toFixed()).toEqual(
    "360,825,852,820,805".replaceAll(",", ""),
  )
  expect(yieldFarm.totalStopped.toFixed()).toEqual("0")
  expect(yieldFarm.state.type).toBe("Active")
  expect([
    yieldFarm.state.isActive,
    yieldFarm.state.isStopped,
    yieldFarm.state.isTerminated,
  ]).toEqual([true, false, false])
})
