import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { Parachain, ParachainAssetData } from "@galacticcouncil/xcm-core"
import { Wallet } from "@galacticcouncil/xcm-sdk"
import { AccountId32 } from "@open-web3/orml-types/interfaces"
import { ApiPromise } from "@polkadot/api"
import { ISubmittableResult } from "@polkadot/types/types"
import { Option, u32 } from "@polkadot/types"
import { useMutation, useQueries, useQuery } from "@tanstack/react-query"
import { useExternalApi } from "api/external"
import BigNumber from "bignumber.js"
import { useTranslation } from "react-i18next"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Transaction, useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import {
  BN_0,
  BN_1,
  BN_NAN,
  HYDRATION_PARACHAIN_ADDRESS,
} from "utils/constants"
import { Maybe, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { arrayToMap } from "utils/rx"
import BN from "bignumber.js"
import { useSpotPrice } from "api/spotPrice"
import { useCrossChainWallet } from "api/xcm"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import { Buffer } from "buffer"

export const ASSETHUB_XCM_ASSET_SUFFIX = "_ah_"
export const ASSETHUB_TREASURY_ADDRESS =
  "13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB"

export const ASSETHUB_ID_BLACKLIST = [
  "34",
  "41",
  "43",
  "47",
  "49",
  "52",
  "53",
  "54",
  "65",
  "73",
  "74",
  "75",
  "92",
  "92",
  "97",
  "22222000",
  "22222001",
  "22222002",
  "22222003",
  "22222004",
]

export const assethub = chainsMap.get("assethub") as Parachain
export const assethubNativeToken = assethub.assetsData.get(
  "dot",
) as ParachainAssetData

export const getAssetHubAssets = async (api: ApiPromise) => {
  try {
    const [dataRaw, assetsRaw] = await Promise.all([
      api.query.assets.metadata.entries(),
      api.query.assets.asset.entries(),
    ])

    const data: TExternalAsset[] = dataRaw.map(([key, dataRaw]) => {
      const id = key.args[0].toString()
      const data = dataRaw

      const asset = assetsRaw.find((asset) => asset[0].args.toString() === id)

      const supply = asset?.[1].unwrap().supply.toString()
      const admin = asset?.[1].unwrap().admin.toString()
      const owner = asset?.[1].unwrap().owner.toString()
      const isWhiteListed =
        admin === ASSETHUB_TREASURY_ADDRESS &&
        owner === ASSETHUB_TREASURY_ADDRESS

      return {
        id,
        decimals: data.decimals.toNumber(),
        // decode from hex because of non-standard characters
        symbol: Buffer.from(data.symbol.toHex().slice(2), "hex").toString(
          "utf8",
        ),
        name: Buffer.from(data.name.toHex().slice(2), "hex").toString("utf8"),
        supply,
        origin: assethub.parachainId,
        isWhiteListed,
      }
    })
    return { data, id: assethub.parachainId }
  } catch (e) {}
}

export const getAssetHubAssetsIds = async (api: ApiPromise) => {
  try {
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
export const useAssetHubAssetRegistry = (enabled = true) => {
  const { data: api } = useExternalApi("assethub")

  return useQuery(
    QUERY_KEYS.assetHubAssetRegistry,
    async () => {
      if (!api) throw new Error("Asset Hub is not connected")
      const assetHub = await getAssetHubAssets(api)

      if (assetHub) {
        return assetHub.data
      }
    },
    {
      enabled: enabled && !!api,
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours,
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
      select: (data) => {
        const assets = data ?? []
        const filteredAssets = assets.filter(
          ({ id }) => !ASSETHUB_ID_BLACKLIST.includes(id),
        )
        return arrayToMap("id", filteredAssets)
      },
    },
  )
}

export const getAssetHubNativeBalance =
  (api: ApiPromise, account: AccountId32 | string) => async () => {
    try {
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
  const { data: api } = useExternalApi("assethub")
  const enabled = !!account && !!api
  return useQuery(
    QUERY_KEYS.assetHubNativeBalance(account),
    enabled ? getAssetHubNativeBalance(api, account) : undefinedNoop,
    {
      enabled,
    },
  )
}

export const getAssetHubTokenBalance =
  (api: ApiPromise, id: string | u32, account: AccountId32 | string) =>
  async () => {
    try {
      const codec = await api.query.assets.account(id, account)
      // @ts-ignore
      const balance = !codec.isNone
        ? // @ts-ignore
          codec.unwrap().balance.toBigNumber()
        : BN_0

      return {
        accountId: account,
        assetId: id,
        balance,
      }
    } catch (e) {}
  }

export const useAssetHubTokenBalances = (
  ids: string[],
  account: AccountId32 | string,
) => {
  const { data: api } = useExternalApi("assethub")
  const enabled = !!account && !!api
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: QUERY_KEYS.assetHubTokenBalance(
        id.toString(),
        account.toString(),
      ),
      queryFn: enabled
        ? getAssetHubTokenBalance(api, id, account)
        : undefinedNoop,
      enabled: enabled && !!id,
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours,
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
    })),
  })
}

export const useAssetHubTokenBalance = (
  id: string,
  account: AccountId32 | string,
) => {
  const { data: api } = useExternalApi("assethub")
  const enabled = !!account && !!api && !!id
  return useQuery(
    QUERY_KEYS.assetHubTokenBalance(account.toString(), id.toString()),
    enabled ? getAssetHubTokenBalance(api, id, account) : undefinedNoop,
    { enabled },
  )
}

export const useGetNextAssetHubId = () => {
  const { data: api } = useExternalApi("assethub")
  const mutation = useMutation(async () => {
    if (!api) throw new Error("Asset Hub is not connected")

    if (typeof api.query.assets.nextAssetId === "function") {
      const res = await api.query.assets.nextAssetId<Option<u32>>()
      if (!res.isNone) {
        return res.unwrap().toNumber()
      }
    }

    const ids = await getAssetHubAssetsIds(api)

    let smallestId = 22_222_000

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
  dotAmount?: string
}

type SwapNativeOptions = {
  asset: ParachainAssetData
  address: string
  nativeAmount: string
  assetAmount: string
}

export function assetHubSwapNativeForAssetExactOut(
  api: ApiPromise,
  options: SwapNativeOptions,
) {
  return api.tx.assetConversion.swapTokensForExactTokens(
    [
      api
        .createType("MultiLocation", {
          parents: 1,
          interior: {
            here: null,
          },
        })
        .toU8a(),
      api
        .createType("MultiLocation", {
          parents: 0,
          interior: {
            x2: [
              { palletInstance: options.asset.palletInstance },
              { generalIndex: options.asset.id },
            ],
          },
        })
        .toU8a(),
    ],
    options.assetAmount,
    options.nativeAmount,
    options.address,
    true,
  )
}

type XCMOutTransferOptions = {
  asset: ParachainAssetData
  address: string
  amount: string
  dstChain: string
}

export async function getAssetHubXcmOutTransfer(
  api: ApiPromise,
  wallet: Wallet,
  options: XCMOutTransferOptions,
) {
  const xTransfer = await wallet.transfer(
    options.asset.asset.key,
    options.address,
    "assethub",
    options.address,
    options.dstChain,
  )

  const call = await xTransfer.buildCall(options.amount)
  return api.tx(call.data)
}

export function getCreateAssetCalls(
  api: ApiPromise,
  values: CreateTokenValues,
) {
  const supply = BigNumber(values.supply).shiftedBy(values.decimals).toString()

  const deposit = BigNumber(values.deposit)
    .shiftedBy(values.decimals)
    .toString()

  return [
    api.tx.assets.create(values.id, values.account, deposit),
    api.tx.assets.setMetadata(
      values.id,
      values.name,
      values.symbol,
      values.decimals,
    ),
    api.tx.assets.mint(values.id, values.account, supply),
    api.tx.assets.touchOther(values.id, HYDRATION_PARACHAIN_ADDRESS),
  ]
}

export const useCreateAssetHubToken = ({
  onSuccess,
  steps,
}: {
  onSuccess?: () => ISubmittableResult
  steps?: Transaction["steps"]
} = {}) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const { account } = useAccount()
  const { data: api } = useExternalApi("assethub")
  const { data: nativeBalance } = useAssetHubNativeBalance(account?.address)
  const wallet = useCrossChainWallet()

  // DOT to USDT spot price
  const { data: spotPrice } = useSpotPrice("10", "5")

  return useMutation(async (values: CreateTokenValues) => {
    if (!account) throw new Error("Missing account")
    if (!api) throw new Error("Asset Hub is not connected")

    const usdt = assethub.assetsData.get("usdt")
    if (!usdt) throw new Error("USDT asset not found")

    const usdtDotExchangeRate = spotPrice?.spotPrice ?? BN_1
    const usdtAmount = BN(0.5)
    const slippage = BN(1.05) // 5%
    const nativeAmount = usdtAmount.times(usdtDotExchangeRate).times(slippage)

    // Swap DOT for USDT on AH
    const swapCall = assetHubSwapNativeForAssetExactOut(api, {
      asset: usdt,
      address: account.address,
      assetAmount: BN(usdtAmount)
        .shiftedBy(usdt?.decimals ?? 0)
        .toString(),
      nativeAmount: BN(nativeAmount)
        .shiftedBy(assethubNativeToken.decimals ?? 0)
        .decimalPlaces(0)
        .toString(),
    })

    // Transfer half of the USDT to Hydration
    const usdtTransferCall = await getAssetHubXcmOutTransfer(api, wallet, {
      asset: usdt,
      address: account.address,
      amount: usdtAmount.div(2).toString(),
      dstChain: "hydration",
    })

    // Transfer DOT from AH to Polkadot
    const dotTransferCall = values.dotAmount
      ? await getAssetHubXcmOutTransfer(api, wallet, {
          asset: assethubNativeToken,
          address: account.address,
          amount: values.dotAmount,
          dstChain: "polkadot",
        })
      : null

    const tx = api.tx.utility.batchAll([
      swapCall,
      usdtTransferCall,
      ...(dotTransferCall ? [dotTransferCall] : []),
      ...getCreateAssetCalls(api, values),
    ])

    const { fee, feeBalance, feeSymbol } = await calculateNativeFee(tx, {
      balance: nativeBalance?.balance ?? BN_NAN,
      address: account.address,
    })

    return await createTransaction(
      {
        title: t("wallet.addToken.reviewTransaction.modal.create.title"),
        tx,
        xcallMeta: {
          srcChain: assethub.key,
          srcChainFee: fee,
          srcChainFeeBalance: feeBalance,
          srcChainFeeSymbol: feeSymbol,
        },
      },
      {
        steps,
        toast: createToastMessages("wallet.addToken.toast.create", {
          t,
          tOptions: { name: values.name, chainName: assethub.name },
          components: ["span.highlight"],
        }),
        onSuccess,
      },
    )
  })
}

export const useAssetHubExistentialDeposit = (id: string) => {
  const { data: api } = useExternalApi("assethub")
  return useQuery(QUERY_KEYS.assetHubExistentialDeposit(id), async () => {
    if (!api) throw new Error("Asset Hub is not connected")
    const response = await api.query.assets.asset(id)
    const details = response.unwrap()
    return BN(details.minBalance.toString())
  })
}

export const useAssetHubRevokeAdminRights = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const { t } = useTranslation()
  const { data: api } = useExternalApi("assethub")
  const { account } = useAccount()
  const { data: nativeBalance } = useAssetHubNativeBalance(account?.address)
  const { createTransaction } = useStore()

  return useMutation(async (id: string) => {
    if (!account) throw new Error("Missing account")
    if (!api) throw new Error("Asset Hub is not connected")
    if (!id) throw new Error("Missing asset id")

    const tx = api.tx.utility.batchAll([
      api.tx.assets.setTeam(
        id,
        ASSETHUB_TREASURY_ADDRESS,
        ASSETHUB_TREASURY_ADDRESS,
        ASSETHUB_TREASURY_ADDRESS,
      ),
      api.tx.assets.transferOwnership(id, ASSETHUB_TREASURY_ADDRESS),
    ])

    const { fee, feeBalance, feeSymbol } = await calculateNativeFee(tx, {
      balance: nativeBalance?.balance ?? BN_NAN,
      address: account.address,
    })

    return createTransaction(
      {
        title: t("memepad.summary.adminRights.burn"),
        tx,
        xcallMeta: {
          srcChain: assethub.key,
          srcChainFee: fee,
          srcChainFeeBalance: feeBalance,
          srcChainFeeSymbol: feeSymbol,
        },
      },
      {
        toast: createToastMessages("memepad.summary.adminRights.toast", {
          t,
        }),
        onSuccess,
      },
    )
  })
}

const getAssetHubAssetAdminRights = async (api: ApiPromise, id: string) => {
  try {
    const asset = await api.query.assets.asset(id)

    const admin = asset.unwrap().admin.toString()
    const owner = asset.unwrap().owner.toString()

    return {
      admin,
      owner,
    }
  } catch (e) {
    return { admin: "", owner: "" }
  }
}

export const useAssetHubAssetAdminRights = (id: string) => {
  const { data: api } = useExternalApi("assethub")
  return useQuery(QUERY_KEYS.assetHubAssetAdminRights(id), async () => {
    if (!api) throw new Error("Asset Hub is not connected")
    return getAssetHubAssetAdminRights(api, id)
  })
}

async function calculateNativeFee(
  tx: SubmittableExtrinsic<"promise">,
  { balance, address }: { balance: BigNumber; address: string },
) {
  const paymentInfo = await tx.paymentInfo(address)
  const feeAssetDecimals = assethubNativeToken.decimals || 10
  const feeBalance = balance?.shiftedBy(feeAssetDecimals) ?? BN_NAN
  const fee = new BigNumber(paymentInfo.partialFee.toString()).shiftedBy(
    -feeAssetDecimals,
  )

  return {
    fee: fee.toString(),
    feeBalance: feeBalance.toString(),
    feeSymbol: assethubNativeToken.asset.originSymbol,
  }
}