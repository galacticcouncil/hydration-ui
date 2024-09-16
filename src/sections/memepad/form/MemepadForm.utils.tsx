import { AssetAmount } from "@galacticcouncil/xcm-core"
import { zodResolver } from "@hookform/resolvers/zod"
import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import {
  assethub,
  assethubNativeToken,
  CreateTokenValues,
  useAssetHubAssetRegistry,
  useAssetHubNativeBalance,
  useCreateAssetHubToken,
  useGetNextAssetHubId,
} from "api/external/assethub"
import { useAccountFeePaymentAssets } from "api/payments"
import { useRefetchProviderData } from "api/provider"
import { useSpotPrice } from "api/spotPrice"
import {
  createXcmAssetKey,
  syncAssethubXcmConfig,
  useCrossChainTransaction,
} from "api/xcm"
import BN from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useCreateXYKPool } from "sections/pools/modals/CreateXYKPool/CreateXYKPoolForm.utils"
import {
  getInternalIdFromResult,
  useRegisterToken,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { externalAssetToRegisteredAsset } from "sections/wallet/addToken/modal/AddTokenFormModal.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BN_0, BN_NAN, HYDRATION_PARACHAIN_ADDRESS } from "utils/constants"
import { QUERY_KEYS } from "utils/queryKeys"
import { noWhitespace, positive, required } from "utils/validators"
import { z } from "zod"
import { MemepadFormFields } from "./MemepadFormFields"
import { useUploadPendingFiles } from "components/FileUploader"
import { useAssets } from "providers/assets"

export const MEMEPAD_XCM_RELAY_CHAIN = "polkadot"
export const MEMEPAD_XCM_SRC_CHAIN = "assethub"
export const MEMEPAD_XCM_DST_CHAIN = "hydradx"

export const HYDRA_DOT_ASSET_ID = "5"
export const HYDRA_USDT_ASSET_ID = "10"

export const DOT_RELAY_CHAIN_ED = 1
export const DOT_RELAY_FEE_BUFFER = 0.1

export const DOT_AH_FEE_BUFFER = 0.7

export const DOT_HYDRATION_FEE_BUFFER = 0.01

const MAX_NAME_LENGTH = 20
const MAX_SYMBOL_LENGTH = 6
const MAX_DECIMALS_COUNT = 20
const MIN_XYK_POOL_SUPPLY = 2

const DEFAULT_DECIMALS_COUNT = 12
const DEFAULT_EXISTENTIAL_DEPOSIT = 1
const DEFAULT_DOT_SUPPLY = 10

const APILLON_BUCKET_UUID = import.meta.env.VITE_MEMEPAD_APILLON_BUCKET_UUID

export type MemepadFormValues = CreateTokenValues & {
  file: File | null
  internalId: string
  xykPoolAssetId: string
  xykPoolSupply: string
  origin: number
  allocatedSupply: string
}

export const useMemepadForm = ({
  validationDisabled,
}: {
  validationDisabled?: boolean
} = {}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { isLoaded } = useRpcProvider()
  const { getAsset } = useAssets()

  const { data: ahRegistry } = useAssetHubAssetRegistry()
  const { data: fees } = useMemepadEstimatedFees()

  const { symbols, names } = useMemo(() => {
    const assets = ahRegistry?.size ? [...ahRegistry.values()] : []
    return {
      names: assets.map((asset) => asset.name.toLowerCase()),
      symbols: assets.map((asset) => asset.symbol.toLowerCase()),
    }
  }, [ahRegistry])

  const dotMeta = isLoaded ? getAsset(HYDRA_DOT_ASSET_ID) : null
  const { data: dotBalanceData } = useAssetHubNativeBalance(account?.address)
  const dotBalance = dotBalanceData?.balance ?? BN_0
  const dotBalanceShifted = dotBalance.shiftedBy(-(dotMeta?.decimals ?? 10))

  const feeBufferTotal = BN(fees?.feeBuffer.amount.toString() ?? 0)
    .shiftedBy(-(fees?.feeBuffer.decimals ?? 0))
    .plus(DOT_RELAY_FEE_BUFFER)
    .plus(DOT_RELAY_CHAIN_ED)
    .plus(DOT_HYDRATION_FEE_BUFFER)

  return useForm<MemepadFormValues>({
    defaultValues: {
      id: "",
      name: "",
      symbol: "",
      file: null,
      deposit: DEFAULT_EXISTENTIAL_DEPOSIT.toString(),
      supply: "",
      allocatedSupply: "",
      decimals: DEFAULT_DECIMALS_COUNT,
      origin: assethub.parachainId,
      account: account?.address ?? "",
      internalId: "",
      xykPoolSupply: DEFAULT_DOT_SUPPLY.toString(),
      xykPoolAssetId: HYDRA_DOT_ASSET_ID,
    },
    mode: "onChange",
    resolver: (...args) => {
      const [values] = args

      if (validationDisabled) {
        return zodResolver(z.object({}))(...args)
      }

      const gt = createSupplyValidator("gt")
      const gte = createSupplyValidator("gte")

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
            )
            .pipe(noWhitespace),
          deposit: required.pipe(positive),
          supply: gt(
            values.deposit,
            t("memepad.form.error.minSupply", {
              minDeposit: values.deposit,
            }),
          ),
          xykPoolSupply: gte(
            MIN_XYK_POOL_SUPPLY,
            t("memepad.form.error.minXykSupply", {
              value: MIN_XYK_POOL_SUPPLY,
              symbol: dotMeta?.symbol,
            }),
          ).refine(
            (value) => BN(value).plus(feeBufferTotal).lte(dotBalanceShifted),
            t("memepad.form.error.balance", {
              value: BN(values.xykPoolSupply).plus(feeBufferTotal),
              symbol: dotMeta?.symbol,
            }),
          ),
          allocatedSupply: gt(
            values.deposit,
            t("memepad.form.error.minAllocatedSupply", {
              minDeposit: values.deposit,
            }),
          ),
          decimals: z.number().min(0).max(MAX_DECIMALS_COUNT),
          origin: z.number().min(0),
          account: required,
        }),
      )(...args)
    },
  })
}

enum MemepadStep {
  CREATE_TOKEN,
  REGISTER_TOKEN,
  TRANSFER_TOKEN,
  CREATE_XYK_POOL,
  SUMMARY,
}

const useMemepadSteps = (step: MemepadStep) => {
  const { t } = useTranslation()
  return useMemo(() => {
    const stepLabels = [
      t("memepad.form.step1.title"),
      t("memepad.form.step2.title"),
      t("memepad.form.step3.title"),
      t("memepad.form.step4.title"),
    ]

    function getSteps(step: number) {
      return stepLabels.map(
        (label, index) =>
          ({
            label,
            state: step === index ? "active" : step > index ? "done" : "todo",
          }) as const,
      )
    }
    return {
      steps: getSteps(step),
      getSteps,
    }
  }, [step, t])
}

export const useMemepad = () => {
  const { api } = useRpcProvider()
  const [step, setStep] = useState(MemepadStep.CREATE_TOKEN)
  const [supplyPerc, setSupplyPerc] = useState(50)
  const dotTransferredRef = useRef(false)
  const uploadPendingFiles = useUploadPendingFiles()

  const { addToken } = useUserExternalTokenStore()
  const refetchProvider = useRefetchProviderData()

  const form = useMemepadForm({
    validationDisabled: step !== MemepadStep.CREATE_TOKEN,
  })

  const { steps, getSteps } = useMemepadSteps(step)

  const createToken = useCreateAssetHubToken({
    steps: getSteps(MemepadStep.CREATE_TOKEN),
  })
  const registerToken = useRegisterToken({
    onSuccess: (internalId, asset) => {
      addToken(externalAssetToRegisteredAsset(asset, internalId))
      refetchProvider()
    },
    steps: getSteps(MemepadStep.REGISTER_TOKEN),
  })
  const xTransfer = useCrossChainTransaction({
    steps: getSteps(MemepadStep.TRANSFER_TOKEN),
  })
  const createXykPool = useCreateXYKPool({
    onSuccess: refetchProvider,
    steps: getSteps(MemepadStep.CREATE_XYK_POOL),
  })

  const { getNextAssetHubId } = useGetNextAssetHubId()

  const isDirty = form.formState.isDirty
  const isSubmitting = form.formState.isSubmitting

  const setNextStep = () => {
    setStep((prev) => prev + 1)
  }

  const formValues = form.getValues()

  const submit = () => {
    return form.handleSubmit(async (submittedValues) => {
      const values = {
        ...formValues,
        ...submittedValues,
      }

      let currentStep = step
      let internalId = values?.internalId ?? ""
      const nextId = values?.id || (await getNextAssetHubId())
      const id = nextId.toString()
      const token = {
        ...values,
        id,
        isWhiteListed: false,
      }

      // Create token on Assethub
      if (currentStep === 0) {
        await createToken.mutateAsync({
          id: token.id,
          name: token.name,
          symbol: token.symbol,
          deposit: token.deposit,
          supply: token.supply,
          decimals: token.decimals,
          account: token.account,
          dotAmount: BN(token.xykPoolSupply)
            .plus(DOT_RELAY_FEE_BUFFER)
            .plus(DOT_RELAY_CHAIN_ED)
            .toString(),
        })
        await waitForBalance(api, values.account, HYDRA_USDT_ASSET_ID)
        form.setValue("id", id)
        setNextStep()
        currentStep++
      }

      // Register token on Hydration
      if (currentStep === 1) {
        const result = await registerToken.mutateAsync(token)

        // Sync registered token with assethub XCM config
        const { assetId } = getInternalIdFromResult(result)
        internalId = assetId?.toString() ?? ""
        const registeredAsset = externalAssetToRegisteredAsset(
          token,
          internalId,
        )
        syncAssethubXcmConfig(registeredAsset)

        form.setValue("internalId", internalId)

        if (formValues.file instanceof File) {
          const fileExt = formValues.file.name.split(".").pop()
          const fileName = `${formValues.origin}_${id}_${internalId}.${fileExt}`
          await uploadPendingFiles({
            destination: {
              url: `http://localhost:3000/api/apillon/bucket/${APILLON_BUCKET_UUID}/upload`,
              params: {
                fileName,
              },
            },
          })
        }

        setNextStep()
        currentStep++
      }

      if (currentStep === 2) {
        // Transfer DOT from AH to Hydration
        if (!dotTransferredRef.current) {
          await xTransfer.mutateAsync({
            amount: BN(token.xykPoolSupply)
              .plus(DOT_HYDRATION_FEE_BUFFER)
              .toString(),
            asset: "dot",
            srcAddr: values?.account ?? "",
            srcChain: MEMEPAD_XCM_RELAY_CHAIN,
            dstAddr: values?.account ?? "",
            dstChain: MEMEPAD_XCM_DST_CHAIN,
          })

          dotTransferredRef.current = true
        }

        // Transfer created token to Hydration
        const xcmAssetKey = createXcmAssetKey(id, values.symbol)
        await xTransfer.mutateAsync({
          amount: BN(values.supply).minus(values.deposit).toString(),
          asset: xcmAssetKey,
          srcAddr: values?.account ?? "",
          srcChain: MEMEPAD_XCM_SRC_CHAIN,
          dstAddr: values?.account ?? "",
          dstChain: MEMEPAD_XCM_DST_CHAIN,
        })

        await waitForBalance(api, values.account, internalId)
        setNextStep()
        currentStep++
      }

      // Create XYK Pool
      if (currentStep === 3) {
        await createXykPool.mutateAsync({
          assetAId: internalId,
          assetBId: HYDRA_DOT_ASSET_ID,
          assetAAmount: values.allocatedSupply,
          assetBAmount: values.xykPoolSupply,
        })

        setNextStep()
        currentStep++
      }
    })()
  }

  const reset = () => {
    setStep(MemepadStep.CREATE_TOKEN)
    form.reset()
  }

  const formComponent = <MemepadFormFields form={form} />
  const isFinalized = step === MemepadStep.SUMMARY

  const isLoading =
    isSubmitting ||
    createToken.isLoading ||
    registerToken.isLoading ||
    xTransfer.isLoading

  return {
    form,
    step,
    steps,
    formComponent,
    isFinalized,
    isDirty,
    supplyPerc,
    setSupplyPerc,
    submit,
    reset,
    isLoading,
  }
}

export type MemepadEstimatedFeesResult = {
  feeBuffer: AssetAmount
}

export const useMemepadEstimatedFees = (
  options: { onSuccess?: (data: MemepadEstimatedFeesResult) => void } = {},
) => {
  const { isLoaded } = useRpcProvider()
  const { native } = useAssets()
  const { account } = useAccount()
  const feePaymentAssets = useAccountFeePaymentAssets()

  const nativeAssetId = isLoaded ? native.id : ""
  const feePaymentAssetId =
    account && feePaymentAssets?.feePaymentAssetId
      ? feePaymentAssets.feePaymentAssetId
      : nativeAssetId

  const { data: feeSpotPrice } = useSpotPrice(nativeAssetId, feePaymentAssetId)

  const { data: dotSpotPrice } = useSpotPrice(
    HYDRA_USDT_ASSET_ID,
    HYDRA_DOT_ASSET_ID,
  )

  const usdtDotSpotPrice = dotSpotPrice?.spotPrice ?? BN_NAN
  const hydraFeeSpotPrice = feeSpotPrice?.spotPrice ?? BN_NAN

  const address = account?.address || HYDRATION_PARACHAIN_ADDRESS

  async function dryRun(): Promise<MemepadEstimatedFeesResult> {
    const feeBufferUsdtAmount = BN(0.5)
    const feeBufferSlippage = BN(1.1) // 10%
    const feeBufferSafetyPerc = BN(1.1) // 10%
    const feeBufferAmount = feeBufferUsdtAmount
      .times(usdtDotSpotPrice)
      .times(feeBufferSlippage)
      .plus(DOT_AH_FEE_BUFFER)
      .times(feeBufferSafetyPerc)
      .decimalPlaces(1, BN.ROUND_UP)

    const feeBuffer = new AssetAmount({
      amount: BigInt(
        feeBufferAmount
          .shiftedBy(assethubNativeToken.decimals ?? 0)
          .decimalPlaces(0)
          .toString(),
      ),
      decimals: assethubNativeToken.decimals ?? 0,
      symbol: assethubNativeToken.asset.originSymbol,
      key: assethubNativeToken.asset.key,
      originSymbol: assethubNativeToken.asset.originSymbol,
    })

    return {
      feeBuffer,
    }
  }

  return useQuery(QUERY_KEYS.memepadDryRun(address), dryRun, {
    enabled:
      isLoaded &&
      !!address &&
      !hydraFeeSpotPrice.isNaN() &&
      !usdtDotSpotPrice.isNaN(),
    retry: false,
    ...options,
  })
}

function waitForBalance(
  api: ApiPromise,
  account: string,
  id: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const checkBalance = async () => {
      try {
        const res = await api.query.tokens.accounts(account, id)
        const balance = res.free.toBigNumber()

        if (balance.gt(0)) {
          resolve()
        } else {
          setTimeout(checkBalance, 2000)
        }
      } catch (error) {
        reject(error)
      }
    }

    checkBalance()
  })
}

function createSupplyValidator(method: "gt" | "gte" | "lt" | "lte") {
  return (amount: string | number, msg: string) =>
    required.pipe(positive).refine((value) => {
      const supply = BN(value)
      return supply.isFinite() && supply[method](amount)
    }, msg)
}
