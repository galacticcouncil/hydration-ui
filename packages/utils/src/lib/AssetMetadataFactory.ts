import { ChainEcosystem } from "@galacticcouncil/xc-core"
import * as z from "zod/v4"

const assetResourceSchema = z.object({
  baseUrl: z.string(),
  branch: z.string(),
  cdn: z.record(z.string(), z.string()),
  path: z.string(),
  repository: z.string(),
  items: z.array(z.string()),
})

const metadataResourceSchema = z.object({
  assets: z.object({
    external: z.object({
      whitelist: z.record(z.string(), z.string()),
    }),
    xcscanAssetUrnMap: z.record(z.string(), z.string()),
  }),
})

export type TAssetResouce = z.infer<typeof assetResourceSchema>
export type TMetadataResource = z.infer<typeof metadataResourceSchema>

const DEFAULT_ASSETS_METADATA: TMetadataResource["assets"] = {
  external: {
    whitelist: {},
  },
  xcscanAssetUrnMap: {},
}

export const METADATA_CDN_URL =
  "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@master"

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

  private async fetchData<T>(
    path: string,
    schema: z.ZodType<T>,
  ): Promise<T | null> {
    try {
      const response = await fetch(METADATA_CDN_URL + path, {
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) {
        return null
      }
      return schema.safeParse(await response.json()).data ?? null
    } catch {
      return null
    }
  }

  public async fetchAssets(): Promise<string[]> {
    if (!this.assets.length) {
      const data = await this.fetchData("/assets-v2.json", assetResourceSchema)
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
      const data = await this.fetchData("/chains-v2.json", assetResourceSchema)
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
      const data = await this.fetchData(
        "/metadata.json",
        metadataResourceSchema,
      )
      if (data) this.metadata = data
    }

    return this.metadata ?? { assets: DEFAULT_ASSETS_METADATA }
  }

  public get isLoaded(): boolean {
    return !!this.assets.length && !!this.chains.length && !!this.metadata
  }

  public getBaseUrl(data: TAssetResouce): string {
    return [METADATA_CDN_URL, data.path].join("/")
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
