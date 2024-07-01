import { BN_0 } from "utils/constants"
import BigNumber from "bignumber.js"
import { u32 } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"

export class MultiCurrencyContainer {
  result = new Map<string, BigNumber>()

  getKey(asset: u32, accountId: AccountId32): string {
    return [accountId.toString(), asset.toString()].join(",")
  }

  constructor(
    keys: [AccountId32, u32][],
    values: { free: BigNumber; reserved: BigNumber; frozen: BigNumber }[],
  ) {
    for (let i = 0; i < keys.length; ++i) {
      const [accountId, asset] = keys[i]
      this.result.set(
        this.getKey(asset, accountId),
        new BigNumber(values[i].free.toString()),
      )
    }
  }

  free_balance(asset: u32, accountId: AccountId32): BigNumber {
    // TODO: use existencial amounts as a placeholder
    const result = this.result.get(this.getKey(asset, accountId)) ?? BN_0
    return result
  }

  transfer(
    asset: u32,
    sourceAccount: AccountId32,
    targetAccount: AccountId32,
    amount: BigNumber,
  ) {
    const sourceKey = this.getKey(asset, sourceAccount)
    const targetKey = this.getKey(asset, targetAccount)

    const sourceValue = this.result.get(sourceKey) ?? BN_0
    const targetValue = this.result.get(targetKey) ?? BN_0

    if (sourceValue.lt(amount))
      throw new Error("Attempting to transfer more than is present")

    this.result.set(sourceKey, sourceValue.minus(amount))
    this.result.set(targetKey, targetValue.plus(amount))
  }
}
