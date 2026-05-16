// Vendored verbatim from upstream `packages/common/src/models/constants.ts`.
// No edits: nothing here references shared-models or the chain registry.
export type WakuShardInfo = {
  clusterId: number
  shard: number
  shardId: number
  pubsubTopic: string
}

export type WakuNetworkConfig = {
  clusterId: number
  shards: number[]
}

export const formatWakuRelayShardTopic = (
  clusterId: number,
  shardId: number,
): string => `/waku/2/rs/${clusterId}/${shardId}`

export const createWakuShardInfo = (
  clusterId: number,
  shardId: number,
  pubsubTopic: string = formatWakuRelayShardTopic(clusterId, shardId),
): WakuShardInfo => ({
  clusterId,
  shard: shardId,
  shardId,
  pubsubTopic,
})

export const createWakuNetworkConfig = (
  clusterId: number,
  shardId: number,
): WakuNetworkConfig => ({
  clusterId,
  shards: [shardId],
})

export const parseWakuRelayShardTopic = (
  pubSubTopic: string,
): { clusterId: number; shardId: number } | undefined => {
  const match = /^\/waku\/2\/rs\/(\d+)\/(\d+)$/.exec(pubSubTopic)
  if (!match) {
    return undefined
  }

  return {
    clusterId: Number(match[1]),
    shardId: Number(match[2]),
  }
}

export const WAKU_RAILGUN_PUB_SUB_TOPIC = formatWakuRelayShardTopic(5, 1)

export const WAKU_RAILGUN_DEFAULT_SHARD = createWakuShardInfo(5, 1)

export const WAKU_RAILGUN_DEFAULT_NETWORK_CONFIG = createWakuNetworkConfig(5, 1)

export const WAKU_RAILGUN_DEFAULT_SHARDS = {
  clusterId: 5,
  shards: [0, 1, 2, 3, 4, 5],
}

export const WAKU_RAILGUN_DEFAULT_ENR_TREE_URL =
  "enrtree://APMYHUVNQWHJNPI5L2KQ765EMCKUAMRWPUH3U2QIKPK6XEV3OW442@discovery.rootedinprivacy.com"

export const WAKU_RAILGUN_DEFAULT_PEERS_WEB: string[] = [
  "/dns4/relay-a.rootedinprivacy.com/tcp/8000/wss/p2p/16Uiu2HAmFbD2ZvAFi2j9jjDo6g4HFbQAhfjDfnTTrbyRGQRmtG7x",
  "/dns4/relay-b.rootedinprivacy.com/tcp/8000/wss/p2p/16Uiu2HAmPtEAoPPok7VLrpNNC6t92ZQFqLndHvkdx6Fk3CxA4MaG",
  "/dns4/client-edge.rootedinprivacy.com/tcp/8000/wss/p2p/16Uiu2HAmQdCGG5qREQCq96kucmpUVupmvLwrTRjMazPAaMTNP97A",
]

export const WAKU_RAILGUN_DEFAULT_PEERS_NODE: string[] = []
