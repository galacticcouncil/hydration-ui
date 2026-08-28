const NECKWORK_URL = "https://hydration-explorer.neckwork.net"

export type ActivityType =
  | "cross-chain"
  | "swap"
  | "dca"
  | "lend"
  | "borrow"
  | "repay"
  | "withdraw"

export const neckwork = {
  base: NECKWORK_URL,
  account: (address: string) =>
    `${NECKWORK_URL}/account/${encodeURIComponent(address)}`,
  contract: (address: string) => `${neckwork.account(address)}?view=contract`,
  block: (blockNumber: string | number) => {
    return `${NECKWORK_URL}/block/${blockNumber}`
  },
  extrinsic: (blockNumber: number, indexInBlock: number) => {
    return `${NECKWORK_URL}/extrinsic/${blockNumber}-${indexInBlock}`
  },
  event: (blockNumber: number, eventIndexInBlock: number) => {
    return `${NECKWORK_URL}/event/${blockNumber}-${eventIndexInBlock}`
  },
  extrinsicHash: (hash: string) => {
    return `${NECKWORK_URL}/extrinsic/${hash}`
  },
  activityEvent: (
    slug: ActivityType,
    blockNumber: number,
    eventIndexInBlock: number,
  ) => {
    return `${NECKWORK_URL}/${slug}/${blockNumber}-e${eventIndexInBlock}`
  },
  activityExtrinsic: (
    slug: ActivityType,
    blockNumber: number,
    extrinsicIndexInBlock: number,
  ) => {
    return `${NECKWORK_URL}/${slug}/${blockNumber}-${extrinsicIndexInBlock}`
  },
  activityDca: (scheduleId: number) => {
    return `${NECKWORK_URL}/dca/${scheduleId}`
  },
}
