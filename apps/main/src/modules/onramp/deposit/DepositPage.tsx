import { Flex } from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useUnmount } from "react-use"

import { SOnrampPageContainer } from "@/modules/onramp/components/OnrampPageContainer.styled"
import { useDeposit } from "@/modules/onramp/deposit/hooks/useDeposit"
import { DepositAsset } from "@/modules/onramp/deposit/steps/DepositAsset"
import { DepositBank } from "@/modules/onramp/deposit/steps/DepositBank"
import { DepositCexSelect } from "@/modules/onramp/deposit/steps/DepositCexSelect"
import { DepositSuccess } from "@/modules/onramp/deposit/steps/DepositSuccess"
import { DepositTransfer } from "@/modules/onramp/deposit/steps/DepositTransfer"
import { OnrampRedirect } from "@/modules/onramp/OnrampRedirect"
import { OnrampScreen } from "@/modules/onramp/types"

export const DepositPage = () => {
  const { asset, page, setAsset, setTransfer, setSuccess, reset, paginateTo } =
    useDeposit()

  const isMultiStepTransfer = asset
    ? asset.depositChain !== HYDRATION_CHAIN_KEY
    : false

  const isOnchain = [
    OnrampScreen.DepositOnchainWallet,
    OnrampScreen.DepositOnchainAsset,
    OnrampScreen.DepositOnchainForm,
  ].includes(page)

  useUnmount(() => {
    if (!isOnchain) reset()
  })

  if (isOnchain) return <OnrampRedirect modal="depositOnchain" />

  return (
    <Flex
      direction="column"
      align="center"
      data-onramp-page-picker={
        page === OnrampScreen.DepositAssetSelect ? "cex" : undefined
      }
    >
      <SOnrampPageContainer
        open
        boundedMobilePicker={page === OnrampScreen.DepositAssetSelect}
        wide={
          page === OnrampScreen.DepositAssetSelect ||
          page === OnrampScreen.DepositOnchainWallet ||
          page === OnrampScreen.DepositOnchainAsset
        }
      >
        {page === OnrampScreen.MethodSelect && (
          <OnrampRedirect modal="deposit" />
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
        {page === OnrampScreen.DepositSuccess && (
          <DepositSuccess onConfirm={reset} />
        )}
      </SOnrampPageContainer>
    </Flex>
  )
}
