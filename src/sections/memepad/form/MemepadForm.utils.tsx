import { zodResolver } from "@hookform/resolvers/zod"
import {
  assethub,
  assethubNativeToken,
  CreateTokenValues,
  useAssetHubAssetRegistry,
  useCreateAssetHubToken,
  useGetNextAssetHubId,
} from "api/external/assethub"
import { useRefetchProviderData } from "api/provider"
import { useCallback, useMemo, useState } from "react"
import type { PalletAssetsAssetDetails } from "@polkadot/types/lookup"
import { Option } from "@polkadot/types"
import { useForm } from "react-hook-form"
import { MemepadFormStep3 } from "sections/memepad/form/MemepadFormStep3"
import {
  CreateXYKPoolFormData,
  useCreateXYKPool,
  useCreateXYKPoolForm,
} from "sections/pools/modals/CreateXYKPool/CreateXYKPoolForm.utils"
import { externalAssetToRegisteredAsset } from "sections/wallet/addToken/modal/AddTokenFormModal.utils"
import {
  getInternalIdFromResult,
  TExternalAsset,
  useRegisterToken,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { positive, required } from "utils/validators"
import { z } from "zod"
import { MemepadFormStep1 } from "./MemepadFormStep1"
import { MemepadFormStep2 } from "./MemepadFormStep2"
import {
  createXcmAssetKey,
  syncAssethubXcmConfig,
  useCrossChainTransaction,
  wallet,
} from "api/xcm"
import { useTranslation } from "react-i18next"

import BN from "bignumber.js"
import { useExternalApi } from "api/external"
import { AssetAmount } from "@galacticcouncil/xcm-core"
import { useRpcProvider } from "providers/rpcProvider"
import { getParachainInputData } from "utils/externalAssets"
import { useSpotPrice } from "api/spotPrice"
import { useAccountFeePaymentAssets } from "api/payments"
import { TAsset } from "api/assetDetails"
import { BN_1 } from "utils/constants"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"

export const MEMEPAD_XCM_SRC_CHAIN = "assethub"
export const MEMEPAD_XCM_DST_CHAIN = "hydradx"

const MAX_NAME_LENGTH = 20
const MAX_SYMBOL_LENGTH = 6
const MAX_DECIMALS_COUNT = 20
const DEFAULT_DECIMALS_COUNT = 12

export type MemepadStep1Values = CreateTokenValues & {
  origin: number
}

export type MemepadStep2Values = {
  amount: string
  hydrationAddress: string
}

export type MemepadStep3Values = CreateXYKPoolFormData

export type MemepadSummaryValues = Partial<
  MemepadStep1Values & MemepadStep2Values & MemepadStep3Values
> & { internalId?: string; xykPoolAssetId?: string }

export type MemepadAlert = {
  key: string
  text: string
  variant: "warning" | "error" | "info"
}

export const useMemepadStep1Form = () => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const { data } = useAssetHubAssetRegistry()

  const { symbols, names } = useMemo(() => {
    const assets = data?.size ? [...data.values()] : []
    return {
      names: assets.map((asset) => asset.name.toLowerCase()),
      symbols: assets.map((asset) => asset.symbol.toLowerCase()),
    }
  }, [data])

  return useForm<MemepadStep1Values>({
    defaultValues: {
      id: "",
      name: "",
      symbol: "",
      deposit: "",
      supply: "",
      decimals: DEFAULT_DECIMALS_COUNT,
      origin: assethub.parachainId,
      account: account?.address ?? "",
    },
    resolver: (...args) => {
      const [values] = args
      return zodResolver(
        z.object({
          name: required
            .max(
              MAX_NAME_LENGTH,
              t("memepad.form.error.maxNameLength", { count: MAX_NAME_LENGTH }),
            )
            .refine(
              (value) => !names.includes(value.toLowerCase()),
              t("memepad.form.error.nameExists"),
            ),
          symbol: required
            .max(
              MAX_SYMBOL_LENGTH,
              t("memepad.form.error.maxSymbolLength", {
                count: MAX_SYMBOL_LENGTH,
              }),
            )
            .refine(
              (value) => !symbols.includes(value.toLowerCase()),
              t("memepad.form.error.symbolExists"),
            ),
          deposit: required.pipe(positive),
          supply: required.refine((value) => {
            const supply = BN(value)
            return supply.isFinite() && supply.gt(values.deposit)
          }, t("memepad.form.error.minSupply")),
          decimals: z.number().min(0).max(MAX_DECIMALS_COUNT),
          origin: z.number().min(0),
          account: required,
        }),
      )(...args)
    },
  })
}

export const useMemepadStep2Form = () => {
  const { account } = useAccount()

  return useForm<MemepadStep2Values>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      hydrationAddress: account?.address ?? "",
    },
  })
}

export const useMemepadForms = () => {
  const [step, setStep] = useState(0)
  const [alerts, setAlerts] = useState<MemepadAlert[]>([])
  const [summary, setSummary] = useState<MemepadSummaryValues | null>(null)

  const { addToken } = useUserExternalTokenStore()
  const refetchProvider = useRefetchProviderData()

  const formStep1 = useMemepadStep1Form()
  const formStep2 = useMemepadStep2Form()
  const formStep3 = useCreateXYKPoolForm(
    summary?.internalId,
    summary?.xykPoolAssetId,
  )

  const createToken = useCreateAssetHubToken()
  const registerToken = useRegisterToken({
    onSuccess: (internalId, asset) => {
      addToken(externalAssetToRegisteredAsset(asset, internalId))
      refetchProvider()
    },
  })
  const xTransfer = useCrossChainTransaction()
  const createXykPool = useCreateXYKPool(
    summary?.internalId ?? "",
    summary?.xykPoolAssetId ?? "",
    {
      onSuccess: refetchProvider,
    },
  )

  const { getNextAssetHubId } = useGetNextAssetHubId()

  const formComponents = [
    <MemepadFormStep1 form={formStep1} />,
    <MemepadFormStep2 form={formStep2} />,
    <MemepadFormStep3 form={formStep3} />,
  ]

  const formInstances = [formStep1, formStep2, formStep3]

  const isDirty = formInstances.some((form) => form.formState.isDirty)
  const isSubmitting = formInstances.some((form) => form.formState.isSubmitting)

  const setNextStep = (values: MemepadSummaryValues) => {
    setStep((prev) => prev + 1)
    setSummary((prev) => ({ ...prev, ...values }))
  }

  const submitNext = () => {
    if (step === 0) {
      return formStep1.handleSubmit(async (values) => {
        const nextId = summary?.id || (await getNextAssetHubId())
        const id = nextId.toString()
        const token = {
          ...values,
          id,
          isWhiteListed: false,
        }

        if (!summary?.id) {
          // create token on Assethub
          await createToken.mutateAsync(token)
          setSummary((prev) => ({ ...prev, ...token }))
        }

        // register token on Hydration
        const externalAsset: TExternalAsset = {
          ...token,
          supply: BN(token.supply),
        }
        const result = await registerToken.mutateAsync(externalAsset)

        // sync registered token with assethub XCM config
        const { assetId } = getInternalIdFromResult(result)
        const internalId = assetId?.toString() ?? ""
        const registeredAsset = externalAssetToRegisteredAsset(
          externalAsset,
          internalId,
        )
        syncAssethubXcmConfig(registeredAsset)

        setNextStep({
          ...values,
          ...registeredAsset,
        })
      })()
    }

    if (step === 1) {
      return formStep2.handleSubmit(async (values) => {
        const xcmAssetKey = createXcmAssetKey(
          summary?.id ?? "",
          summary?.symbol ?? "",
        )
        await xTransfer.mutateAsync({
          amount: parseFloat(values.amount),
          asset: xcmAssetKey,
          srcAddr: summary?.account ?? values.hydrationAddress,
          srcChain: MEMEPAD_XCM_SRC_CHAIN,
          dstAddr: values.hydrationAddress,
          dstChain: MEMEPAD_XCM_DST_CHAIN,
        })

        setNextStep(values)
      })()
    }

    if (step === 2) {
      return formStep3.handleSubmit(async (values) => {
        await createXykPool.mutateAsync({
          assetA: values.assetA,
          assetB: values.assetB,
        })
        setNextStep(values)
      })()
    }
  }

  const reset = () => {
    setStep(0)
    setSummary(null)
    formInstances.forEach((form) => form.reset())
  }

  const setAlert = useCallback((alert: MemepadAlert) => {
    setAlerts((prev) =>
      prev.some(({ key }) => key === alert.key) ? prev : [...prev, alert],
    )
  }, [])

  const clearAlert = useCallback((key: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.key !== key))
  }, [])

  const setSummaryValue = useCallback(
    <K extends keyof MemepadSummaryValues>(
      key: K,
      value: MemepadSummaryValues[K],
    ) => {
      setSummary((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const currentForm = formComponents[step]
  const isFinalized = step === formComponents.length

  const isLoading =
    isSubmitting ||
    createToken.isLoading ||
    registerToken.isLoading ||
    xTransfer.isLoading

  return {
    step,
    formStep1,
    formStep2,
    formStep3,
    currentForm,
    isFinalized,
    isDirty,
    summary,
    setSummaryValue,
    submitNext,
    reset,
    alerts,
    setAlert,
    clearAlert,
    isLoading,
  }
}

export type MemepadDryRunResult = {
  xcmDstFeeED: AssetAmount
  xcmSrcFee: AssetAmount
  xcmDstFee: AssetAmount
  createTokenFee: AssetAmount
  registerTokenFee: AssetAmount
  createXYKPoolFee: AssetAmount
}

const MEMEPAD_DRY_RUN_VALUES = {
  name: "DryRunToken",
  symbol: "DRT",
  deposit: "1",
  supply: "1000000",
  decimals: 12,
  origin: 1000,
  id: "1",
}

export const useMemepadDryRun = (
  options: { onSuccess?: (data: MemepadDryRunResult) => void } = {},
) => {
  const { api, assets } = useRpcProvider()
  const { data: assethubApi } = useExternalApi("assethub")
  const { account } = useAccount()
  const feePaymentAssets = useAccountFeePaymentAssets()
  const { feePaymentAssetId } = feePaymentAssets
  const spotPrice = useSpotPrice(assets.native.id, feePaymentAssetId)

  const feePaymentAssetSpotPrice = spotPrice.data?.spotPrice ?? BN_1

  const values = {
    ...MEMEPAD_DRY_RUN_VALUES,
    account: account?.address ?? "",
  }

  async function dryRun(): Promise<MemepadDryRunResult> {
    if (!api) throw new Error("API is not connected")
    if (!assethubApi) throw new Error("Asset Hub is not connected")
    if (!assethubNativeToken) throw new Error("Missing native token")
    if (!account) throw new Error("Missing account")

    const hydraNativeAsset = assets.getAsset(assets.native.id)
    const hydraFeePaymentAsset = assets.getAsset(
      feePaymentAssetId ?? assets.native.id,
    )

    const supply = BN(values.supply).shiftedBy(values.decimals).toString()
    const deposit = BN(values.deposit).shiftedBy(values.decimals).toString()
    const createTokenTx = assethubApi.tx.utility.batchAll([
      assethubApi.tx.assets.create(values.id, values.account, deposit),
      assethubApi.tx.assets.setMetadata(
        values.id,
        values.name,
        values.symbol,
        values.decimals,
      ),
      assethubApi.tx.assets.mint(values.id, values.account, supply),
    ])

    const createTokenPaymentInfo = await createTokenTx.paymentInfo(
      account.address,
    )

    const createTokenFee = new AssetAmount({
      amount: createTokenPaymentInfo.partialFee.toBigInt(),
      decimals: assethubNativeToken.decimals ?? 0,
      symbol: assethubNativeToken.asset.originSymbol,
      key: assethubNativeToken.asset.key,
      originSymbol: assethubNativeToken.asset.originSymbol,
    })

    const registerTokenTx = api.tx.assetRegistry.registerExternal(
      getParachainInputData({
        ...values,
        supply: BN(values.supply),
        isWhiteListed: false,
      }),
    )

    const registerTokenPaymentInfo = await registerTokenTx.paymentInfo(
      account.address,
    )

    const registerTokenFee = convertFeeToPaymentAsset({
      amount: registerTokenPaymentInfo.partialFee.toBigNumber(),
      nativeAsset: hydraNativeAsset,
      feePaymentAsset: hydraFeePaymentAsset,
      spotPrice: feePaymentAssetSpotPrice,
    })

    const xcmTransfer = await wallet.transfer(
      "pink",
      account.address,
      MEMEPAD_XCM_SRC_CHAIN,
      account.address,
      MEMEPAD_XCM_DST_CHAIN,
    )

    const xcmSrcFee = await xcmTransfer.estimateFee(1)

    const xcmDstChainFeeAssetId = xcmTransfer?.dstFee
      ? assethub.getAssetId(xcmTransfer.dstFee)
      : ""

    const xcmDstFeeEDResponse = await assethubApi.query.assets.asset<
      Option<PalletAssetsAssetDetails>
    >(xcmDstChainFeeAssetId)

    const xcmDstFeeEDAmount = xcmDstFeeEDResponse.unwrap().minBalance

    const xcmDstFeeED = new AssetAmount({
      amount: xcmDstFeeEDAmount.toBigInt(),
      decimals: xcmTransfer?.dstFee.decimals,
      symbol: xcmTransfer?.dstFee.symbol,
      key: xcmTransfer?.dstFee.key,
      originSymbol: xcmTransfer?.dstFee.symbol,
    })

    const createXYKPoolTx = api.tx.xyk.createPool("0", "1", "5", "1")
    const createXYKPoolPaymentInfo = await createXYKPoolTx.paymentInfo(
      account.address,
    )

    const createXYKPoolFee = convertFeeToPaymentAsset({
      amount: createXYKPoolPaymentInfo.partialFee.toBigNumber(),
      nativeAsset: hydraNativeAsset,
      feePaymentAsset: hydraFeePaymentAsset,
      spotPrice: feePaymentAssetSpotPrice,
    })

    return {
      xcmDstFeeED,
      xcmSrcFee,
      xcmDstFee: xcmTransfer.dstFee,
      createTokenFee,
      registerTokenFee,
      createXYKPoolFee,
    }
  }

  return useQuery(QUERY_KEYS.memepadDryRun, dryRun, {
    enabled:
      !!api &&
      !!assethubApi &&
      !!assethubNativeToken &&
      !!account &&
      feePaymentAssets.isSuccess &&
      spotPrice.isSuccess,
    retry: false,
    ...options,
  })
}

function convertFeeToPaymentAsset({
  amount,
  nativeAsset,
  feePaymentAsset,
  spotPrice,
}: {
  amount: BN
  nativeAsset: TAsset
  feePaymentAsset: TAsset
  spotPrice: BN
}) {
  const paymentFeeNative = BN(amount).shiftedBy(-nativeAsset.decimals)
  const paymentAsset =
    nativeAsset.id === feePaymentAsset.id ? nativeAsset : feePaymentAsset

  const amountFmt = paymentFeeNative
    .multipliedBy(spotPrice)
    .shiftedBy(paymentAsset.decimals)
    .decimalPlaces(0)

  return new AssetAmount({
    amount: BigInt(amountFmt.toString()),
    decimals: paymentAsset.decimals,
    symbol: paymentAsset.symbol,
    key: paymentAsset.id,
    originSymbol: paymentAsset.symbol,
  })
}
