import Big from "big.js"

import { Papi } from "@/providers/rpcProvider"

export class TimeApi {
  private _api: Papi

  public constructor(api: Papi) {
    this._api = api
  }

  async getBlockTime(): Promise<number> {
    const time = await this._api.constants.Aura.SlotDuration()
    return Number(time)
  }

  async getBlockTimeV1(): Promise<number> {
    const [now, block, count] = await Promise.all([
      this._api.query.Timestamp.Now.getValue(),
      this._api.query.System.Number.getValue(),
      this._api.constants.System.BlockHashCount(),
    ])

    const blockNumberAt = block - count
    const blockHashAt =
      await this._api.query.System.BlockHash.getValue(blockNumberAt)
    const apiAtTs = await this._api.query.Timestamp.Now.getValue({
      at: blockHashAt.asHex(),
    })
    const diff = now - apiAtTs
    return Big(diff.toString()).div(count).toNumber()
  }
}
