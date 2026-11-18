import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { FC, useLayoutEffect } from "react"
import { useUnmount } from "react-use"

import { crossChainConfigQuery, hydrationClientQuery } from "@/api/xcm"
import { useDeposit } from "@/modules/onramp/deposit/hooks/useDeposit"
import { DepositOnchain } from "@/modules/onramp/deposit/onchain/DepositOnchain"
import { DepositAsset } from "@/modules/onramp/deposit/steps/DepositAsset"
import { DepositBank } from "@/modules/onramp/deposit/steps/DepositBank"
import { DepositCexSelect } from "@/modules/onramp/deposit/steps/DepositCexSelect"
import { DepositMethodSelect } from "@/modules/onramp/deposit/steps/DepositMethodSelect"
import { DepositSuccess } from "@/modules/onramp/deposit/steps/DepositSuccess"
import { DepositTransfer } from "@/modules/onramp/deposit/steps/DepositTransfer"
import { useOnrampModalStore } from "@/modules/onramp/store/useOnrampModalStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { useRpcProvider } from "@/providers/rpcProvider"

export const DepositFlow: FC = () => {
  const { asset, page, setAsset, setTransfer, setSuccess, reset, paginateTo } =
    useDeposit()

  useUnmount(reset)

  // A preset skips method select; DepositOnchain applies it or stays on Holdings.
  useLayoutEffect(() => {
    if (useOnrampModalStore.getState().depositPreset)
      paginateTo(OnrampScreen.DepositOnchainHoldings)
  }, [paginateTo])

  // Warms the onchain step's suspense queries so it doesn't suspend the
  // modal into a blank frame, which React holds for at least 300ms
  const { sdk } = useRpcProvider()
  useQuery(crossChainConfigQuery(sdk))
  useQuery(hydrationClientQuery)

  const isMultiStepTransfer = asset
    ? asset.depositChain !== HYDRATION_CHAIN_KEY
    : false

  return (
    <>
      {page === OnrampScreen.MethodSelect && (
        <DepositMethodSelect onSelect={paginateTo} />
      )}

      {page === OnrampScreen.DepositAssetSelect && (
        <DepositCexSelect
          onAssetSelect={setAsset}
          onBack={() => paginateTo(OnrampScreen.MethodSelect)}
        />
      )}

      {page === OnrampScreen.DepositAsset && (
        <DepositAsset
          onDepositSuccess={isMultiStepTransfer ? setTransfer : setSuccess}
          onBack={() => paginateTo(OnrampScreen.DepositAssetSelect)}
        />
      )}

      {page === OnrampScreen.DepositTransfer && (
        <DepositTransfer
          onTransferSuccess={setSuccess}
          onBack={() => paginateTo(OnrampScreen.DepositAssetSelect)}
        />
      )}

      {page === OnrampScreen.DepositBank && (
        <DepositBank onBack={() => paginateTo(OnrampScreen.MethodSelect)} />
      )}
      {(page === OnrampScreen.DepositOnchainHoldings ||
        page === OnrampScreen.DepositOnchainForm ||
        page === OnrampScreen.DepositOnchainSubmitted) && (
        <DepositOnchain
          page={page}
          onBack={() => paginateTo(OnrampScreen.MethodSelect)}
        />
      )}

      {page === OnrampScreen.DepositSuccess && (
        <DepositSuccess onConfirm={reset} />
      )}
    </>
  )
}
