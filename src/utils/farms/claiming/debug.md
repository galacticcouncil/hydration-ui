```js
useQueryReduce(
  [userDeposits, farms, accountBalances, assetList, bestNumberQuery] as const,
  (userDeposits, farms, accountBalances, assetList, bestNumberQuery) => {
    const deposits = depositNft != null ? [depositNft] : userDeposits ?? []

    for (const record of deposits) {
      for (const farmEntry of record.deposit.yieldFarmEntries) {
        const farm = farms?.find(
          (i) =>
            i.globalFarm.id.eq(farmEntry.globalFarmId) &&
            i.yieldFarm.id.eq(farmEntry.yieldFarmId),
        )

        if (farm == null) continue

        console.log(`
const accountResolver = getAccountResolver(registry)

const multiCurrency = new MultiCurrencyContainer(
[
  ${accountAddresses
    .map(
      ([address, assetId]) => `[
    new GenericAccountId32(
      registry,
      decodeAddress("${encodeAddress(address, HYDRA_ADDRESS_PREFIX)}"),
    ),
    new U32(registry, "${assetId.toHex()}"),
  ],`,
    )
    .join("\n    ")
    .trimStart()}
],
[
  ${(accountBalances ?? [])
    .map(
      (balances) => `{
    free: new BN("${balances.free.toString()}"),
    reserved: new BN("${balances.reserved.toString()}"),
    frozen: new BN("${balances.frozen.toString()}"),
  },`,
    )
    .join("\n    ")
    .trimStart()}
],
)

const entries = createMutableFarmEntries([{
globalFarm: createStruct<PalletLiquidityMiningGlobalFarmData>(registry, {
  id: [U32, new U32(registry, "${farm.globalFarm.id.toString()}")],
  owner: [
    GenericAccountId,
    decodeAddress("${encodeAddress(
      farm.globalFarm.owner,
      HYDRA_ADDRESS_PREFIX,
    )}"),
  ],
  updatedAt: [U32, new U32(registry, "${farm.globalFarm.updatedAt.toString()}")],
  totalSharesZ: [
    U128,
    new U128(registry, "${farm.globalFarm.totalSharesZ.toString()}"),
  ],
  accumulatedRpz: [
    U128,
    new U128(registry, "${farm.globalFarm.accumulatedRpz.toString()}"),
  ],
  rewardCurrency: [U32, new U32(registry, "${farm.globalFarm.rewardCurrency.toString()}")],
  pendingRewards: [U128, new U128(registry, "${farm.globalFarm.pendingRewards.toString()}")],
  accumulatedPaidRewards: [
    U128,
    new U128(registry, "${farm.globalFarm.accumulatedPaidRewards.toString()}"),
  ],
  yieldPerPeriod: [UInt, new UInt(registry, "${farm.globalFarm.yieldPerPeriod.toString()}")],
  plannedYieldingPeriods: [U32, new U32(registry, "${farm.globalFarm.plannedYieldingPeriods.toString()}")],
  blocksPerPeriod: [U32, new U32(registry, "${farm.globalFarm.blocksPerPeriod.toString()}")],
  incentivizedAsset: [U32, new U32(registry, "${farm.globalFarm.incentivizedAsset.toString()}")],
  maxRewardPerPeriod: [U128, new U128(registry, "${farm.globalFarm.maxRewardPerPeriod.toString()}")],
  minDeposit: [U128, new U128(registry, "${farm.globalFarm.minDeposit.toString()}")],
  liveYieldFarmsCount: [U32, new U32(registry, "${farm.globalFarm.liveYieldFarmsCount.toString()}")],
  totalYieldFarmsCount: [U32, new U32(registry, "${farm.globalFarm.totalYieldFarmsCount.toString()}")],
  priceAdjustment: [
    U128,
    new U128(registry, "${farm.globalFarm.priceAdjustment.toString()}"),
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
  id: [U32, new U32(registry, "${farm.yieldFarm.id.toString()}")],
  updatedAt: [U32, new U32(registry, "${farm.yieldFarm.updatedAt.toString()}")],
  totalShares: [
    U128,
    new U128(registry, "${farm.yieldFarm.totalShares.toString()}"),
  ],
  totalValuedShares: [
    U128,
    new U128(registry, "${farm.yieldFarm.totalValuedShares.toString()}"),
  ],
  accumulatedRpvs: [
    U128,
    new U128(registry, "${farm.yieldFarm.accumulatedRpvs.toString()}"),
  ],
  accumulatedRpz: [
    U128,
    new U128(registry, "${farm.yieldFarm.accumulatedRpz.toString()}"),
  ],
  loyaltyCurve: [
    Option,
    new Option(
      registry,
      Struct,
      ${
        farm.yieldFarm.loyaltyCurve.isNone
          ? "undefined"
          : `createStruct<PalletLiquidityMiningLoyaltyCurve>(registry, {
        initialRewardPercentage: [
          U128,
          new U128(registry, "${farm.yieldFarm.loyaltyCurve
            .unwrap()
            .initialRewardPercentage.toString()}"),
        ],
        scaleCoef: [U32, new U32(registry, "${farm.yieldFarm.loyaltyCurve
          .unwrap()
          .scaleCoef.toString()}")],
      })`
      },
    ),
  ],
  multiplier: [
    U128,
    new U128(registry, "${farm.yieldFarm.multiplier.toString()}"),
  ],
  entriesCount: [U64, new U64(registry, "${farm.yieldFarm.entriesCount.toString()}")],
  totalStopped: [U32, new U32(registry, "${farm.yieldFarm.totalStopped.toString()}")],
  leftToDistribute: [U128, new U128(registry, "${farm.yieldFarm.leftToDistribute.toString()}")],
  state: [
    Enum,
    createEnum<PalletLiquidityMiningFarmState>(registry, {
      Active: [Text, new Text(registry, "Active")],
      Stopped: [Text],
      Terminated: [Text],
    }),
  ],
}),
}])

const simulator = new OmnipoolLiquidityMiningClaimSim(
accountResolver,
multiCurrency,
[
  ${assetList
    .map(
      (asset) => `
  {
    id: "${asset.id.toString()}",
    existentialDeposit: new BigNumber("${asset.existentialDeposit.toString()}"),
  }`,
    )
    .join("\n    ")
    .trimStart()}
],
)

const result = simulator.claim_rewards(
entries.globalFarms["${farmEntry.globalFarmId.toString()}"],
entries.yieldFarms["${farmEntry.yieldFarmId.toString()}"],
createStruct<PalletLiquidityMiningYieldFarmEntry>(registry, {
  globalFarmId: [U32, new U32(registry, "${farmEntry.globalFarmId.toString()}")],
  yieldFarmId: [U32, new U32(registry, "${farmEntry.yieldFarmId.toString()}")],
  valuedShares: [
    U128,
    new U128(registry, "${farmEntry.valuedShares.toString()}"),
  ],
  stoppedAtCreation: [U32, new U32(registry, "${farmEntry.stoppedAtCreation.toString()}")],
  accumulatedRpvs: [U128, new U128(registry, "${farmEntry.accumulatedRpvs.toString()}")],
  accumulatedClaimedRewards: [U128, new U128(registry, "${farmEntry.accumulatedClaimedRewards.toString()}")],
  enteredAt: [U32, new U32(registry, "${farmEntry.enteredAt.toString()}")],
  updatedAt: [U32, new U32(registry, "${farmEntry.updatedAt.toString()}")],
}),
new BigNumber("${bestNumberQuery.relaychainBlockNumber.toString()}"),
)
`)
      }
    }
  },
).data
```
