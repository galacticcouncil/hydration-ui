import { ChainEcosystem } from "@galacticcouncil/xc-core"

const networkToEcosystem: Record<string, ChainEcosystem> = {
  polkadot: ChainEcosystem.Polkadot,
  kusama: ChainEcosystem.Kusama,
  ethereum: ChainEcosystem.Ethereum,
  solana: ChainEcosystem.Solana,
  sui: ChainEcosystem.Sui,
}

export function resolveNetwork(networkUrn: string) {
  const parts = networkUrn.indexOf(":") > 0 ? networkUrn.split(":") : []
  const [, , network, chainId] = parts
  const ecosystem = networkToEcosystem[network ?? ""]
  if (!ecosystem || !chainId) return
  return {
    ecosystem,
    chainId,
  }
}

function getNativeAssetPath(networkUrn: string) {
  switch (networkUrn) {
    case "urn:ocn:polkadot:2004":
      return "0x0000000000000000000000000000000000000802"
    case "urn:ocn:ethereum:1":
      return "0x0000000000000000000000000000000000000000"
    case "urn:ocn:ethereum:8453":
      return "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42"
    case "urn:ocn:sui:0x35834a8a":
      return "SUI"
    default:
      return "0"
  }
}

export function resolveAssetIcon(key: string) {
  if (key.indexOf("|") < 0) {
    return
  }

  const [networkUrn, assetUrn] = key.split("|")

  if (!networkUrn || !assetUrn) {
    return
  }

  const network = resolveNetwork(networkUrn)
  if (!network) {
    return
  }

  const assetKey = assetUrn === "" ? "native" : assetUrn.split(":").join("/")
  const assetId =
    assetKey === "native" ? getNativeAssetPath(networkUrn) : assetKey

  return {
    ...network,
    networkUrn,
    assetId,
  }
}
