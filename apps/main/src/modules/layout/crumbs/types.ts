export type AssetCrumbConfig = {
  type: "asset"
  param: string
  from?: string
  field?: "name" | "symbol"
}

export type PoolCrumbConfig = {
  type: "pool"
  param: string
  from?: string
}

export type AssetCrumbProps = Omit<AssetCrumbConfig, "type"> & {
  assetId?: string
}

export type PoolCrumbProps = Omit<PoolCrumbConfig, "type"> & {
  assetId?: string
}
