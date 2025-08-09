import { AnyChain } from "@galacticcouncil/xcm-core"
import { Operation } from "@galacticcouncil/xcm-sdk"
import { Abi, Log } from "viem"

export type StandartizedOperation = Operation & {
  info: TransferInfo
}

export type Transfer = {
  id: string
  data: TransferData
  emitterChain: number
  emitterAddress: TransferEmmiter
  sequence: string
  sourceChain: TransferChain
  content: TransferContent
  vaa?: {
    raw: string
  }
}

export type TransferWithOperation = Transfer & {
  operation?: Operation
}

export type TransferEmmiter = {
  hex: string
  native: string
}

export type TransferData = {
  id: string
  symbol: string
  tokenAmount: string
}

export type TransferChain = {
  chainId: number
  timestamp: string | bigint
  transaction: TransferTx
  from: string
}

export type TransferTx = {
  txHash: string
}

export type TransferContent = {
  payload: TransferPayload
  info: TransferInfo
}

export type TransferInfo = {
  from: string
  fromChain: AnyChain
  to: string
  toChain: AnyChain
  status?: TransferStatus
}

export enum TransferStatus {
  WaitingForVaa = "WaitingForVaa",
  VaaEmitted = "VaaEmitted",
  Completed = "Completed",
  Unknown = "Unknown",
}

export type TransferPayload = {
  amount: bigint
  payloadID: number
  payload?: string
  to: string
  toChain: number
  tokenAddress: string
  tokenChain: number
}

export type TransferLog = Log<
  bigint,
  number,
  boolean,
  undefined,
  boolean | undefined,
  Abi,
  string
>
