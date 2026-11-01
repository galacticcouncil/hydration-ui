import {
  formatDestChainAddress,
  HYDRATION_CHAIN_KEY,
  isAddressValidOnHydration,
} from "@galacticcouncil/utils"
import { Account } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { useQuery } from "@tanstack/react-query"
import { useFormContext } from "react-hook-form"

import { depositRecipientQuery } from "@/api/deposit"
import { evmAccountBindingQuery } from "@/api/evm"
import { useHydrationAssetId } from "@/api/xcm"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { requiresEvmBinding } from "@/modules/xcm/transfer/utils/transfer"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useDepositRecipientReadiness = (candidate: Account | null) => {
  const rpc = useRpcProvider()
  const { watch } = useFormContext<XcmFormValues>()
  const [destAsset, srcAsset] = watch(["destAsset", "srcAsset"])
  const { selectedRoute } = useXcmProvider()
  const accounts = useDepositAccounts({ signersOnly: true })
  const eligibleAccounts = accounts.filter(
    (account) =>
      account.canUseOnHydration &&
      isAddressValidOnHydration(account.rawAddress),
  )
  const eligible = (account: Account) =>
    account.canUseOnHydration &&
    isAddressValidOnHydration(account.rawAddress) &&
    eligibleAccounts.some(
      (item) =>
        item.provider === account.provider && item.address === account.address,
    )
  const current = candidate && eligible(candidate) ? candidate : null
  const getAssetId = useHydrationAssetId()
  const { getAsset } = useAssets()
  const arrivingAsset = destAsset ?? selectedRoute?.destination.asset
  const assetId = arrivingAsset
    ? getAssetId(arrivingAsset, HYDRATION_CHAIN_KEY)
    : undefined
  const asset = assetId ? getAsset(assetId) : undefined
  const info = useQuery(depositRecipientQuery(rpc, current?.address ?? ""))
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY) ?? null
  const receiverAddress =
    current && hydration
      ? formatDestChainAddress(current.rawAddress, hydration)
      : ""
  const needsBinding = requiresEvmBinding(
    selectedRoute,
    hydration,
    receiverAddress,
  )
  const binding = useQuery(
    evmAccountBindingQuery(rpc, needsBinding ? receiverAddress : ""),
  )
  const needsAccountCheck = !!asset && asset.id !== "0" && !asset.isSufficient
  const readinessError =
    (needsAccountCheck && info.isError) || (needsBinding && binding.isError)
  const needsActivation =
    !!current &&
    !!asset &&
    asset.id !== "0" &&
    !asset.isSufficient &&
    !!info.data &&
    info.data.providers === 0 &&
    info.data.sufficients === 0
  const bindingActivation = needsBinding && binding.data === false
  const canContinue =
    !!current &&
    !needsActivation &&
    !bindingActivation &&
    (!needsAccountCheck || info.isSuccess) &&
    (!needsBinding || binding.data === true)
  const ready = !!selectedRoute && !!asset && canContinue && !readinessError
  const retry = () => {
    if (needsAccountCheck) void info.refetch()
    if (needsBinding) void binding.refetch()
  }

  return {
    eligibleAccounts,
    eligible,
    current,
    receiverAddress,
    arrivingAsset,
    asset,
    symbol: arrivingAsset?.originSymbol ?? srcAsset?.originSymbol,
    needsAccountCheck,
    needsActivation,
    bindingActivation,
    readinessError,
    ready,
    canContinue,
    retry,
    isFetching: info.isFetching || binding.isFetching,
  }
}
