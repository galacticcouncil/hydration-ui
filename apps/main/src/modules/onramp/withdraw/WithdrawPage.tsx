import { Flex, ModalContainer } from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useUnmount } from "react-use"

import { useWithdraw } from "@/modules/onramp/hooks/useWithdraw"
import { OnrampScreen } from "@/modules/onramp/types"
import { WithdrawBank } from "@/modules/onramp/withdraw/steps/WithdrawBank"
import { WithdrawCexSelect } from "@/modules/onramp/withdraw/steps/WithdrawCexSelect"
import { WithdrawMethodSelect } from "@/modules/onramp/withdraw/steps/WithdrawMethodSelect"
import { WithdrawSuccess } from "@/modules/onramp/withdraw/steps/WithdrawSuccess"
import { WithdrawTransfer } from "@/modules/onramp/withdraw/steps/WithdrawTransfer"
import { WithdrawTransferOnchain } from "@/modules/onramp/withdraw/steps/WithdrawTransferOnchain"

export const WithdrawPage = () => {
  const { page, asset, reset, setAsset, setSuccess, paginateTo } = useWithdraw()

  useUnmount(reset)

  const isOnchain = asset?.withdrawalChain === HYDRATION_CHAIN_KEY

  return (
    <Flex direction="column" align="center" pt={20}>
      <ModalContainer open>
        {page === OnrampScreen.MethodSelect && (
          <WithdrawMethodSelect onSelect={paginateTo} />
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
      </ModalContainer>
    </Flex>
  )
}
