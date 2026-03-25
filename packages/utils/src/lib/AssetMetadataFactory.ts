import { ChainEcosystem } from "@galacticcouncil/xc-core"

export type TAssetResouce = {
  baseUrl: string
  branch: string
  cdn: {
    [key: string]: string
  }
  path: string
  repository: string
  items: string[]
}

export type TMetadataResource = {
  assets: {
    external: {
      whitelist: {
        [key: string]: string
      }
    }
    xcscanAssetUrnMap: {
      [key: string]: string
    }
  }
}

const DEFAULT_ASSETS_METADATA: TMetadataResource["assets"] = {
  external: {
    whitelist: {},
  },
  xcscanAssetUrnMap: {},
}

const BASE_URL =
  "https://raw.githubusercontent.com/galacticcouncil/intergalactic-asset-metadata/master"

export class AssetMetadataFactory {
  private static _instance: AssetMetadataFactory = new AssetMetadataFactory()
  private assets: TAssetResouce["items"] = []
  private chains: TAssetResouce["items"] = []
  private metadata: TMetadataResource | undefined = undefined

  private constructor() {
    if (AssetMetadataFactory._instance) {
      throw new Error("Use AssetMetadataFactory.getInstance() instead of new.")
    }
    AssetMetadataFactory._instance = this
  }

  public static getInstance(): AssetMetadataFactory {
    return AssetMetadataFactory._instance
  }

  private async fetchData<T>(path: string): Promise<T | null> {
    try {
      const response = await fetch(BASE_URL + path)
      if (!response.ok) {
        return null
      }
      return (await response.json()) as T
    } catch {
      return null
    }
  }

  public async fetchAssets(): Promise<string[]> {
    if (!this.assets.length) {
      const data = await this.fetchData<TAssetResouce>("/assets-v2.json")
      if (data) {
        this.assets = data.items.map(
          (item) => `${this.getBaseUrl(data)}/${item}`,
        )
      }
    }

    return this.assets
  }

  public async fetchChains(): Promise<string[]> {
    if (!this.chains.length) {
      const data = await this.fetchData<TAssetResouce>("/chains-v2.json")
      if (data) {
        this.chains = data.items.map(
          (item) => `${this.getBaseUrl(data)}/${item}`,
        )
      }
    }

    return this.chains
  }

  public async fetchMetadata(): Promise<TMetadataResource> {
    if (!this.metadata) {
      const data = await this.fetchData<TMetadataResource>("/metadata.json")
      if (data) this.metadata = data
    }

    return this.metadata ?? { assets: DEFAULT_ASSETS_METADATA }
  }

  public getBaseUrl(data: TAssetResouce): string {
    const { cdn, path, repository } = data
    return [cdn["jsDelivr"], repository + "@latest", path].join("/")
  }

  public getAssetLogoSrc(
    chainId: string | number,
    assetId: string | number,
    ecosystem: ChainEcosystem = ChainEcosystem.Polkadot,
  ): string {
    const id =
      ecosystem === ChainEcosystem.Ethereum
        ? assetId.toString().toLowerCase()
        : assetId.toString()
    const key = [ecosystem.toLowerCase(), chainId, "assets", id].join("/")
    return this.assets.find((path) => path.includes(key + "/icon")) ?? ""
  }

  public getChainLogoSrc(
    chainId: string | number,
    ecosystem: ChainEcosystem = ChainEcosystem.Polkadot,
  ): string {
    const key = [ecosystem.toLowerCase(), chainId].join("/")
    return this.chains.find((path) => path.includes(key + "/icon")) ?? ""
  }

  public getAssetsMetadata(): TMetadataResource["assets"] {
    return this.metadata?.assets || DEFAULT_ASSETS_METADATA
  }
}
