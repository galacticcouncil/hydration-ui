import { findNestedKey, H160 } from "@galacticcouncil/sdk"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import {
  acc,
  AnyChain,
  EvmChain,
  EvmParachain,
  Parachain,
  Precompile,
  Wormhole,
} from "@galacticcouncil/xcm-core"
import {
  Operation,
  WormholeClient,
  WormholeScan,
} from "@galacticcouncil/xcm-sdk"
import { TypeRegistry } from "@polkadot/types"
import { XcmVersionedLocation } from "@polkadot/types/lookup"
import * as Abi from "api/wormhole/abi"
import { HYDRATION_CHAIN_KEY } from "utils/constants"
import { decodeEventLog, GetContractEventsParameters } from "viem"
import BN from "bignumber.js"
import {
  Transfer,
  TransferData,
  TransferInfo,
  TransferLog,
  TransferPayload,
} from "./types"
import { isNotNil } from "utils/helpers"

const moonbeam = chainsMap.get("moonbeam") as EvmParachain

export class TransferApi {
  private whScan: WormholeScan
  private whClient: WormholeClient

  constructor() {
    this.whScan = new WormholeScan()
    this.whClient = new WormholeClient()
  }

  get chains(): AnyChain[] {
    return Array.from(chainsMap.values()).filter((c) => {
      const isEvmChain = c instanceof EvmParachain || c instanceof EvmChain
      return isEvmChain && c.client && Wormhole.isKnown(c)
    })
  }

  getChainById(wormholeId: number): AnyChain | undefined {
    return Array.from(chainsMap.values()).find(
      (c) =>
        Wormhole.isKnown(c) &&
        Wormhole.fromChain(c).getWormholeId() === wormholeId,
    )
  }

  async isTransferComplete(
    transfer: Transfer,
    vaaBytes: string,
  ): Promise<boolean> {
    const { toChain } = transfer.content.payload
    const ctx = this.getChainById(toChain)
    if (!ctx) return false
    return this.whClient.isTransferCompleted(ctx, vaaBytes)
  }

  async getOperations(address: string): Promise<Map<string, Operation>> {
    const fromAddress = acc.getMultilocationDerivatedAccount(2034, address, 1)
    const toAddress = H160.fromAny(address)

    const operations = await Promise.all([
      this.whScan.getOperations({
        address: fromAddress,
        page: "0",
        pageSize: "50",
      }),
      this.whScan.getOperations({
        address: toAddress,
        page: "0",
        pageSize: "50",
      }),
    ])

    return new Map(operations.flat().map((item) => [item.id, item]))
  }

  async getTransfers(account: string): Promise<Transfer[]> {
    const transfersPerChain = this.chains.map(async (c) =>
      this.getTransfer(account, c),
    )
    const transfers = await Promise.all(transfersPerChain)
    return transfers.flat()
  }

  async getTransfer(
    account: string,
    chain: AnyChain,
    period = 500n,
  ): Promise<Transfer[]> {
    const ctx = chain as EvmChain
    const ctxWh = Wormhole.fromChain(chain)
    const provider = ctx.client.getProvider()
    const tokenBridge = ctxWh.getTokenBridge()
    const blockNo = await provider.getBlockNumber()
    const address = H160.fromAny(account)

    const range: Partial<GetContractEventsParameters> = {
      fromBlock: blockNo - period,
      toBlock: "latest",
    }
    const [transferEvents, bridgeEvents] = await Promise.all([
      provider.getContractEvents({
        abi: Abi.Erc20,
        eventName: "Transfer",
        args: {
          from: address as `0x${string}`,
          to: tokenBridge as `0x${string}`,
        },
        ...range,
      }),
      provider.getContractEvents({
        abi: Abi.Meta,
        eventName: "LogMessagePublished",
        args: {
          sender: tokenBridge as `0x${string}`,
        },
        ...range,
      }),
    ])

    const bridgeEventsMap = new Map(
      bridgeEvents.map((bEvt) => [bEvt.transactionHash, bEvt]),
    )

    const events = transferEvents
      .map((tEvt) => {
        const bEvt = bridgeEventsMap.get(tEvt.transactionHash)
        return bEvt ? this.parseLogs(chain, tEvt, bEvt) : null
      })
      .filter(isNotNil)

    return Promise.all(events)
  }

  private async parseLogs(
    chain: AnyChain,
    tEvt: TransferLog,
    bEvt: TransferLog,
  ): Promise<Transfer> {
    const ctx = chain as EvmChain
    const ctxWh = Wormhole.fromChain(chain)
    const provider = ctx.client.getProvider()
    const tokenBridge = ctxWh.getTokenBridge()
    const chainId = ctxWh.getWormholeId()

    const block = await provider.getBlock({
      blockNumber: bEvt.blockNumber ?? undefined,
    })

    const tArgs = decodeEventLog({
      abi: Abi.Erc20,
      data: tEvt.data,
      topics: tEvt.topics,
      eventName: "Transfer",
    })

    const bArgs = decodeEventLog({
      abi: Abi.Meta,
      data: bEvt.data,
      topics: bEvt.topics,
      eventName: "LogMessagePublished",
    })

    const bArgsPayload = bArgs.args.payload
    const bPayload = await provider.readContract({
      address: tokenBridge as `0x${string}`,
      abi: Abi.TokenBridge,
      functionName: bArgsPayload.startsWith("0x03")
        ? "parseTransferWithPayload"
        : "parseTransfer",
      args: [bArgsPayload],
    })

    const from = tArgs.args.from
    const emitterAddress = tArgs.args.to
    const emitterAddressHex = ctxWh.normalizeAddress(emitterAddress)
    const value = tArgs.args.value
    const sequence = bArgs.args.sequence

    return {
      content: {
        payload: bPayload,
        info: this.getTransferInfo(from, chain, bPayload),
      },
      data: this.getTransferData(value, bPayload),
      emitterChain: chainId,
      emitterAddress: {
        hex: emitterAddressHex.toLowerCase(),
        native: emitterAddress.toLowerCase(),
      },
      id: [
        chainId,
        emitterAddressHex.replace("0x", "").toLowerCase(),
        sequence,
      ].join("/"),
      sequence: sequence.toString(),
      sourceChain: {
        chainId: chainId,
        timestamp: block.timestamp,
        transaction: {
          txHash: tEvt.transactionHash ?? "",
        },
        from: from.toLowerCase(),
      },
    }
  }

  private getTransferData(
    value: bigint,
    payload: TransferPayload,
  ): TransferData {
    const { tokenAddress, tokenChain } = payload
    const chain = this.getChainById(tokenChain)
    const token = this.toNative(tokenAddress)

    const assetData = Array.from(chain?.assetsData.values() ?? []).find(
      (a) => a.id?.toString().toLowerCase() === token.toLowerCase(),
    )

    if (!assetData || !chain)
      return {
        id: "",
        symbol: "",
        tokenAmount: "",
      }

    const { decimals, asset } = assetData

    const tokenAmount = BN(value.toString())
      .shiftedBy((decimals ?? 0) * -1)
      .toString()

    return {
      id: typeof assetData.id === "string" ? assetData.id : "",
      symbol: asset.originSymbol,
      tokenAmount: tokenAmount,
    }
  }

  private getTransferInfo(
    from: string,
    fromChain: AnyChain,
    payload: TransferPayload,
  ): TransferInfo {
    const isMrl = this.isMrlPayload(payload)
    if (isMrl) {
      const multilocation = this.decodeMrlPayload(payload)
      const json = multilocation.toJSON()
      const parachain = this.parseMultilocation("parachain", json)
      const account = this.parseMultilocation("accountId32", json)

      const to = account ? H160.fromAny(account.id) : ""

      return {
        from,
        fromChain,
        to,
        toChain: Array.from(chainsMap.values()).find(
          (c) => c instanceof Parachain && c.parachainId === parachain,
        ) as AnyChain,
      }
    }

    return {
      from,
      fromChain:
        fromChain.key === "moonbeam"
          ? (chainsMap.get(HYDRATION_CHAIN_KEY) as AnyChain)
          : fromChain,
      to: this.toNative(payload.to),
      toChain: this.getChainById(payload.toChain) as AnyChain,
    }
  }

  /**
   * Check whether transferWithPayload with MRL info
   *
   * @param payload - transfer payload
   * @returns true if mrl payload, otherwise false
   */
  private isMrlPayload(payload: TransferPayload): boolean {
    const { payloadID, to, toChain } = payload

    const moonbeamWormholeId = Wormhole.fromChain(moonbeam).getWormholeId()

    return (
      payloadID === 3 &&
      toChain === moonbeamWormholeId &&
      this.toNative(to) === Precompile.Bridge
    )
  }

  /**
   * Decode MRL payload
   *
   * @param payload - transfer payload
   * @returns xcm versioned multilocation
   */
  private decodeMrlPayload(payload: TransferPayload): XcmVersionedLocation {
    const registry = new TypeRegistry()
    return registry.createType(
      "VersionedMultiLocation",
      payload.payload?.replace("0x00", "0x"),
    ) as unknown as XcmVersionedLocation
  }

  /**
   * Parse multilocation JSON
   *
   * @param key - attr key
   * @param multilocation - multilocation JSON
   * @returns parsed arg if exist, otherwise undefined
   */
  private parseMultilocation(key: string, multilocation?: any) {
    if (multilocation) {
      const entry = findNestedKey(multilocation, key)
      return entry && entry[key]
    } else {
      return undefined
    }
  }

  private toNative(wormholeAddress: string) {
    return "0x" + wormholeAddress.substring(26)
  }
}
