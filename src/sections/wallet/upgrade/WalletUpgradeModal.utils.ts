import { ApiPromise } from "@polkadot/api"
import { InjectedExtension } from "@polkadot/extension-inject/types"
import { getSpecTypes } from "@polkadot/types-known"
import { formatBalance, isNumber } from "@polkadot/util"
import { base64Encode } from "@polkadot/util-crypto"
import { defaults as addressDefaults } from "@polkadot/util-crypto/address/defaults"
import { getWalletBySource } from "@talismn/connect-wallets"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useCacheApiMetadataStore } from "state/metadata"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"

export type ChainMetadata = ReturnType<typeof getChainMetadata>

function getChainMetadata(api: ApiPromise) {
  const DEFAULT_SS58 = api.registry.createType("u32", addressDefaults.prefix)
  const DEFAULT_DECIMALS = api.registry.createType("u32", 12)

  return {
    icon: "polkadot" as const,
    ss58Format: isNumber(api.registry.chainSS58)
      ? api.registry.chainSS58
      : DEFAULT_SS58.toNumber(),
    tokenDecimals: (api.registry.chainDecimals || [
      DEFAULT_DECIMALS.toNumber(),
    ])[0],
    tokenSymbol: (api.registry.chainTokens ||
      formatBalance.getDefaults().unit)[0],
  }
}

export const useUpdateMetadataMutation = () => {
  const { account } = useAccount()
  const { api } = useRpcProvider()

  const cache = useCacheApiMetadataStore()

  const state = useQuery(
    QUERY_KEYS.metadataVersion,
    async () => {
      const wallet = getWalletBySource(account?.provider)
      const extension = wallet?.extension as InjectedExtension | undefined

      if (wallet == null) throw new Error("Missing wallet")
      if (extension == null) throw new Error("Missing extension")

      const known = (await extension.metadata?.get())?.find(({ genesisHash }) =>
        api.genesisHash.eq(genesisHash),
      )

      const needsUpdate =
        !known ||
        api.runtimeVersion.specVersion.gtn(known.specVersion) ||
        !cache.checkMetadata(
          api.genesisHash,
          extension.name,
          getChainMetadata(api),
        )

      return {
        currVersion: known?.specVersion.toString(),
        nextVersion: api.runtimeVersion.specVersion?.toString(),
        needsUpdate: !window.walletExtension?.isNovaWallet && needsUpdate,
      }
    },
    {
      enabled: account != null && !account?.isExternalWalletConnected,
    },
  )

  const mutation = useMutation(async () => {
    const wallet = getWalletBySource(account?.provider)
    const extension = wallet?.extension as InjectedExtension | undefined

    if (wallet == null) throw new Error("Missing wallet")
    if (extension == null) throw new Error("Missing extension")

    const chain = ((await api.rpc.system.chain()) || "<unknown>").toString()
    const chainType = "substrate"

    const metadata = getChainMetadata(api)

    const result = await extension?.metadata?.provide({
      ...metadata,
      chain,
      chainType,
      genesisHash: api.genesisHash.toHex(),
      metaCalls: base64Encode(api.runtimeMetadata.asCallsOnly.toU8a()),
      specVersion: api.runtimeVersion.specVersion.toNumber(),
      // @ts-expect-error Invalid Polkadot types
      types: getSpecTypes(
        api.registry,
        chain,
        api.runtimeVersion.specName,
        api.runtimeVersion.specVersion,
      ),
    })

    if (!result) throw new Error("Failed to update metadata")
    cache.setMetadata(api.genesisHash, extension.name, metadata)
  })

  return { state, mutation }
}
