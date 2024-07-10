import { zodResolver } from "@hookform/resolvers/zod"
import {
  assethub,
  ASSETHUB_EXTERNAL_ASSET_SUFFIX,
  useGetNextAssetHubId,
} from "api/externalAssetRegistry/assethub"
import { useRefetchProviderData } from "api/provider"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { MemepadFormStep3 } from "sections/memepad/form/MemepadFormStep3"
import {
  CreateXYKPoolFormData,
  useCreateXYKPoolForm,
} from "sections/pools/modals/CreateXYKPool/CreateXYKPoolForm.utils"
import {
  CreateTokenValues,
  getInternalIdFromResult,
  TRegisteredAsset,
  useCreateToken,
  useRegisterToken,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { pick } from "utils/rx"
import { positive, required } from "utils/validators"
import { z } from "zod"
import { MemepadFormStep1 } from "./MemepadFormStep1"
import { MemepadFormStep2 } from "./MemepadFormStep2"
import { useCrossChainTransaction, xcmConfigService } from "api/xcm"
import { external } from "@galacticcouncil/apps"

export const MEMEPAD_XCM_SRC_CHAIN = "assethub"
export const MEMEPAD_XCM_DST_CHAIN = "hydradx"
export const DEFAULT_TOKEN_DECIMALS = 12

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
  const { account } = useAccount()

  return useForm<MemepadStep1Values>({
    defaultValues: {
      id: "",
      name: "",
      symbol: "",
      deposit: "",
      supply: "",
      decimals: DEFAULT_TOKEN_DECIMALS,
      origin: assethub.parachainId,
      account: account?.address ?? "",
    },
    resolver: zodResolver(
      z.object({
        name: required,
        symbol: required,
        deposit: positive,
        supply: positive,
        decimals: z.number().min(0).max(18),
        origin: z.number().min(0),
        account: required,
      }),
    ),
  })
}

export const useMemepadStep2Form = () => {
  const { account } = useAccount()

  return useForm<MemepadStep2Values>({
    defaultValues: {
      amount: "",
      hydrationAddress: account?.address ?? "",
    },
    resolver: zodResolver(
      z.object({
        amount: required,
        hydrationAddress: required,
      }),
    ),
  })
}

export const useMemepadForms = () => {
  const [step, setStep] = useState(0)
  const [summary, setSummary] = useState<MemepadSummaryValues | null>(null)
  const { account } = useAccount()

  const { addToken } = useUserExternalTokenStore()
  const refetchProvider = useRefetchProviderData()

  const formStep1 = useMemepadStep1Form()
  const formStep2 = useMemepadStep2Form()
  const formStep3 = useCreateXYKPoolForm(
    summary?.internalId,
    summary?.xykPoolAssetId,
  )

  const xcmTx = useCrossChainTransaction()
  const createToken = useCreateToken()
  const registerToken = useRegisterToken({
    onSuccess: (internalId, asset) => {
      addToken({
        ...pick(asset, ["name", "symbol", "decimals", "origin", "id"]),
        internalId,
      })
      refetchProvider()
    },
  })
  const { getNextAssetHubId } = useGetNextAssetHubId()

  const reset = () => {
    setStep(0)
    setSummary(null)
    formInstances.forEach((form) => form.reset())
  }

  const formComponents = [
    <MemepadFormStep1 form={formStep1} />,
    <MemepadFormStep2
      form={formStep2}
      assetId={summary?.internalId ?? ""}
      assetKey={buildExternalAssetKey(summary)}
      srcAddress={account?.address ?? ""}
      deposit={summary?.deposit ?? ""}
    />,
    <MemepadFormStep3
      form={formStep3}
      assetA={summary?.internalId}
      onAssetBSelect={(asset) =>
        setSummary((prev) => ({ ...prev, xykPoolAssetId: asset.id }))
      }
    />,
  ]

  const formInstances = [formStep1, formStep2, formStep3]

  const isDirty = formInstances.some((form) => form.formState.isDirty)
  const isSubmitted = formInstances.every((form) => form.formState.isSubmitted)

  const setNextStep = (values: MemepadSummaryValues) => {
    setStep((prev) => prev + 1)
    setSummary((prev) => ({ ...prev, ...values }))
  }

  const submitNext = () => {
    if (step === 0) {
      return formStep1.handleSubmit(async (values) => {
        const nextId = await getNextAssetHubId()
        const id = nextId.toString()
        const token = {
          ...values,
          id,
        }

        await createToken.mutateAsync(token)

        const result = await registerToken.mutateAsync(token)
        const { assetId } = getInternalIdFromResult(result)
        const internalId = assetId?.toString() ?? ""

        const registeredAsset: TRegisteredAsset = {
          ...pick(token, ["id", "decimals", "symbol", "name", "origin"]),
          internalId,
        }

        const assetData = external.buildAssetData(
          registeredAsset,
          ASSETHUB_EXTERNAL_ASSET_SUFFIX,
        )

        external.buildAssethubConfig(assetData, xcmConfigService)
        setNextStep({
          ...values,
          ...registeredAsset,
        })
      })()
    }

    if (step === 1) {
      return formStep2.handleSubmit(async (values) => {
        await xcmTx.mutateAsync({
          amount: parseFloat(values.amount),
          asset: buildExternalAssetKey(summary),
          srcAddr: summary?.account ?? values.hydrationAddress,
          srcChain: MEMEPAD_XCM_SRC_CHAIN,
          dstAddr: values.hydrationAddress,
          dstChain: MEMEPAD_XCM_DST_CHAIN,
        })

        setNextStep(values)
      })()
    }

    if (step === 2) {
      setNextStep({})
      return formStep3.handleSubmit((values) => {
        console.log(values)
        setNextStep(values)
      })()
    }
  }

  const currentForm = formComponents[step]
  const isFinalStep = step === formComponents.length

  const isLoading =
    createToken.isLoading || registerToken.isLoading || xcmTx.isLoading

  return {
    step,
    formStep1,
    formStep2,
    formStep3,
    currentForm,
    isFinalStep,
    isDirty,
    isSubmitted,
    summary,
    submitNext,
    reset,
    isLoading,
  }
}

function buildExternalAssetKey(summary: MemepadSummaryValues | null) {
  if (!summary) return ""
  return `${summary.symbol?.toLowerCase()}${ASSETHUB_EXTERNAL_ASSET_SUFFIX}${summary.id}`
}
