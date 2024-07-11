import { useMutation, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { Parachain, SubstrateApis } from "@galacticcouncil/xcm-core"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"
import { arrayToMap } from "utils/rx"
import { AccountId32 } from "@open-web3/orml-types/interfaces"
import BigNumber from "bignumber.js"
import { Maybe, undefinedNoop } from "utils/helpers"
import { useTranslation } from "react-i18next"
import { useStore } from "state/store"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { ISubmittableResult } from "@polkadot/types/types"
import { BN_NAN } from "utils/constants"

export const ASSETHUB_EXTERNAL_ASSET_SUFFIX = "_ah_"
export const ASSETHUB_ASSET_CREATION_DOT_COST = 10

export const assethub = chainsMap.get("assethub") as Parachain

export const assetHubNativeToken = assethub.assetsData.get("dot")

// TEMP CHOPSTICKS SETUP
//@ts-ignore
//assethub.ws = "ws://172.25.126.217:8000"
//const hydradx = chainsMap.get("hydradx") as Parachain
//@ts-ignore
//hydradx.ws = "ws://172.25.126.217:8001"

export const getAssetHubAssets = async () => {
  try {
    const apiPool = SubstrateApis.getInstance()
    const api = await apiPool.api(assethub.ws)
    const dataRaw = await api.query.assets.metadata.entries()

    const data: TExternalAsset[] = dataRaw.map(([key, dataRaw]) => {
      const id = key.args[0].toString()
      const data = dataRaw

      return {
        id,
        // @ts-ignore
        decimals: data.decimals.toNumber() as number,
        // @ts-ignore
        symbol: data.symbol.toHuman() as string,
        // @ts-ignore
        name: data.name.toHuman() as string,
        origin: assethub.parachainId,
      }
    })

    return { data, id: assethub.parachainId }
  } catch (e) {}
}

export const getAssetHubAssetsIds = async () => {
  try {
    const apiPool = SubstrateApis.getInstance()
    const api = await apiPool.api(assethub.ws)
    const dataRaw = await api.query.assets.asset.entries()
    return dataRaw
      .map(([meta]) => Number(meta.args[0].toString()))
      .sort((a, b) => a - b)
  } catch (e) {
    return []
  }
}

/**
 * Used for fetching tokens only from Asset Hub parachain
 */
export const useAssetHubAssetRegistry = (enabled?: boolean) => {
  return useQuery(
    QUERY_KEYS.assetHubAssetRegistry,
    async () => {
      const assetHub = await getAssetHubAssets()

      if (assetHub) {
        return assetHub.data
      }
    },
    {
      enabled,
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours,
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
      select: (data) => arrayToMap("id", data),
    },
  )
}

export const getAssetHubNativeBalance =
  (account: AccountId32 | string) => async () => {
    try {
      const apiPool = SubstrateApis.getInstance()
      const api = await apiPool.api(assethub.ws)

      const res = await api.query.system.account(account)
      const freeBalance = new BigNumber(res.data.free.toHex())
      const frozenBalance = new BigNumber(res.data.frozen.toHex())
      const reservedBalance = new BigNumber(res.data.reserved.toHex())
      const balance = freeBalance.minus(frozenBalance)
      const total = freeBalance.plus(reservedBalance)

      return {
        accountId: account,
        balance,
        total,
        freeBalance,
      }
    } catch (e) {}
  }

export const useAssetHubNativeBalance = (
  account: Maybe<AccountId32 | string>,
) => {
  return useQuery(
    QUERY_KEYS.assetHubNativeBalance(account),
    account ? getAssetHubNativeBalance(account) : undefinedNoop,
    {
      enabled: !!account,
    },
  )
}

export const useGetNextAssetHubId = () => {
  const mutation = useMutation(async () => {
    const ids = await getAssetHubAssetsIds()

    let smallestId = 1

    for (let i = 0; i < ids.length; i++) {
      if (ids[i] === smallestId) {
        smallestId++
      } else if (Number(ids[i]) > smallestId) {
        break
      }
    }

    return smallestId
  })

  return {
    getNextAssetHubId: mutation.mutateAsync,
  }
}

export type CreateTokenValues = {
  id: string
  name: string
  symbol: string
  deposit: string
  supply: string
  decimals: number
  account: string
}

export const useCreateAssetHubToken = ({
  onSuccess,
}: {
  onSuccess?: () => ISubmittableResult
} = {}) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const { account } = useAccount()
  const { data: nativeBalance } = useAssetHubNativeBalance(account?.address)

  return useMutation(async (values: CreateTokenValues) => {
    if (!account) throw new Error("Missing account")
    if (!assetHubNativeToken) throw new Error("Missing native token")

    const apiPool = SubstrateApis.getInstance()
    const api = await apiPool.api(assethub.ws)

    if (!api) throw new Error("Asset Hub is not connected")

    const supply = BigNumber(values.supply)
      .shiftedBy(values.decimals)
      .toString()

    const deposit = BigNumber(values.deposit)
      .shiftedBy(values.decimals)
      .toString()

    const tx = api.tx.utility.batchAll([
      api.tx.assets.create(values.id, values.account, deposit),
      api.tx.assets.setMetadata(
        values.id,
        values.name,
        values.symbol,
        values.decimals,
      ),
      api.tx.assets.mint(values.id, values.account, supply),
    ])
    const paymentInfo = await tx.paymentInfo(account.address)

    const feeAssetDecimals = assetHubNativeToken.decimals ?? 10
    const feeBalance =
      nativeBalance?.balance?.shiftedBy(feeAssetDecimals) ?? BN_NAN
    const fee = new BigNumber(paymentInfo.partialFee.toString()).shiftedBy(
      -feeAssetDecimals,
    )

    return await createTransaction(
      {
        title: t("wallet.addToken.reviewTransaction.modal.create.title"),
        tx: api.tx.utility.batchAll([
          api.tx.assets.create(values.id, values.account, deposit),
          api.tx.assets.setMetadata(
            values.id,
            values.name,
            values.symbol,
            values.decimals,
          ),
          api.tx.assets.mint(values.id, values.account, supply),
        ]),
        xcallMeta: {
          srcChain: assethub.key,
          srcChainFee: fee.plus(ASSETHUB_ASSET_CREATION_DOT_COST).toString(),
          srcChainFeeBalance: feeBalance.toString(),
          srcChainFeeSymbol: assetHubNativeToken.asset.originSymbol,
        },
      },
      {
        onSuccess,
      },
    )
  })
}
