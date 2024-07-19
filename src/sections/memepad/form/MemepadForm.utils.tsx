import { zodResolver } from "@hookform/resolvers/zod"
import {
  assethub,
  CreateTokenValues,
  useAssetHubAssetRegistry,
  useCreateAssetHubToken,
  useGetNextAssetHubId,
} from "api/external/assethub"
import { useRefetchProviderData } from "api/provider"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { MemepadFormStep3 } from "sections/memepad/form/MemepadFormStep3"
import {
  CreateXYKPoolFormData,
  useCreateXYKPool,
  useCreateXYKPoolForm,
} from "sections/pools/modals/CreateXYKPool/CreateXYKPoolForm.utils"
import {
  getInternalIdFromResult,
  TRegisteredAsset,
  useRegisterToken,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { pick } from "utils/rx"
import { positive, required } from "utils/validators"
import { z } from "zod"
import { MemepadFormStep1 } from "./MemepadFormStep1"
import { MemepadFormStep2 } from "./MemepadFormStep2"
import {
  createXcmAssetKey,
  syncAssethubXcmConfig,
  useCrossChainTransaction,
} from "api/xcm"
import { useTranslation } from "react-i18next"
import BigNumber from "bignumber.js"

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
            const supply = BigNumber(value)
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
      addToken({
        ...pick(asset, ["name", "symbol", "decimals", "origin", "id"]),
        internalId,
      })
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
        }

        if (!summary?.id) {
          // create token on Assethub
          await createToken.mutateAsync(token)
          setSummary((prev) => ({ ...prev, ...token }))
        }

        // register token on Hydration
        const result = await registerToken.mutateAsync(token)

        // sync registered token with assethub XCM config
        const { assetId } = getInternalIdFromResult(result)
        const internalId = assetId?.toString() ?? ""
        const registeredAsset: TRegisteredAsset = {
          ...pick(token, ["id", "decimals", "symbol", "name", "origin"]),
          internalId,
        }
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

  function reset() {
    setStep(0)
    setSummary(null)
    formInstances.forEach((form) => form.reset())
  }

  function setSummaryValue<K extends keyof MemepadSummaryValues>(
    key: K,
    value: MemepadSummaryValues[K],
  ) {
    setSummary((prev) => ({ ...prev, [key]: value }))
  }

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
    isLoading,
  }
}
