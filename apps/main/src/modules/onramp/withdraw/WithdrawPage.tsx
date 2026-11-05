import { Flex } from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useUnmount } from "react-use"

import { SOnrampPageContainer } from "@/modules/onramp/components/OnrampPageContainer.styled"
import { OnrampRedirect } from "@/modules/onramp/OnrampRedirect"
import { OnrampScreen } from "@/modules/onramp/types"
import { useWithdraw } from "@/modules/onramp/withdraw/hooks/useWithdraw"
import { WithdrawBank } from "@/modules/onramp/withdraw/steps/WithdrawBank"
import { WithdrawCexSelect } from "@/modules/onramp/withdraw/steps/WithdrawCexSelect"
import { WithdrawSuccess } from "@/modules/onramp/withdraw/steps/WithdrawSuccess"
import { WithdrawTransfer } from "@/modules/onramp/withdraw/steps/WithdrawTransfer"
import { WithdrawTransferOnchain } from "@/modules/onramp/withdraw/steps/WithdrawTransferOnchain"

export const WithdrawPage = () => {
  const { page, asset, reset, setAsset, setSuccess, paginateTo } = useWithdraw()

  useUnmount(reset)

  const isOnchain = asset?.withdrawalChain === HYDRATION_CHAIN_KEY

  return (
    <Flex direction="column" align="center">
      <SOnrampPageContainer
        open
        wide={page === OnrampScreen.WithdrawAssetSelect}
      >
        {page === OnrampScreen.MethodSelect && (
          <OnrampRedirect modal="withdraw" />
        )}

        {page === OnrampScreen.WithdrawAssetSelect && (
          <WithdrawCexSelect
            onAssetSelect={setAsset}
            onBack={() => paginateTo(OnrampScreen.MethodSelect)}
          />
        )}

        {page === OnrampScreen.WithdrawTransfer && (
          <>
            {isOnchain ? (
              <WithdrawTransferOnchain
                onTransferSuccess={setSuccess}
                onBack={() => paginateTo(OnrampScreen.WithdrawAssetSelect)}
              />
            ) : (
              <WithdrawTransfer
                onTransferSuccess={setSuccess}
                onBack={() => paginateTo(OnrampScreen.WithdrawAssetSelect)}
              />
            )}
          </>
        )}

        {page === OnrampScreen.WithdrawBank && (
          <WithdrawBank onBack={() => paginateTo(OnrampScreen.MethodSelect)} />
        )}

        {page === OnrampScreen.WithdrawSuccess && (
          <WithdrawSuccess onConfirm={reset} />
        )}
      </SOnrampPageContainer>
    </Flex>
  )
}
