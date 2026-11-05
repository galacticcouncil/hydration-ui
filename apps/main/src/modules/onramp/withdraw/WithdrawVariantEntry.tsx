import { Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getChainId, HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import {
  useAccount,
  useWeb3Connect,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { ChainLogo } from "@/components/ChainLogo"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { OnrampScreen } from "@/modules/onramp/types"
import { WithdrawRouteSelect } from "@/modules/onramp/withdraw/components/WithdrawRouteSelect"
import { WithdrawSourceAccount } from "@/modules/onramp/withdraw/components/WithdrawSourceAccount"
import { useWithdrawDestinationOptions } from "@/modules/onramp/withdraw/hooks/useWithdrawDestinationOptions"
import {
  WithdrawAssetSelection,
  WithdrawDestinationOption,
} from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"
import {
  canUseWithdrawAccount,
  selectWithdrawSourceAccount,
} from "@/modules/onramp/withdraw/WithdrawOnchain.utils"
import { ChainAssetSelectButton } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelectButton"
import { useRpcProvider } from "@/providers/rpcProvider"

type WithdrawVariantEntryProps = {
  onSelect: (selection: WithdrawAssetSelection) => void
  onBack: () => void
  initialSelection?: WithdrawAssetSelection | null
}

export const WithdrawVariantEntry: FC<WithdrawVariantEntryProps> = ({
  onSelect,
  onBack,
  initialSelection,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const flow = useOnrampModal((state) => state.withdrawFlow)
  const { account } = useAccount()
  const accounts = useDepositAccounts()
  const source = selectWithdrawSourceAccount(account, accounts)
  const options = useWithdrawDestinationOptions()
  const selected = options.find(
    (option) =>
      option.sourceAssetKey === initialSelection?.sourceAssetKey &&
      option.destinationChainKey === initialSelection.destinationChainKey &&
      option.destinationAssetKey === initialSelection.destinationAssetKey,
  )
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const { papi } = useRpcProvider()
  const [selectingRoute, setSelectingRoute] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const select = (option: WithdrawDestinationOption) => {
    if (source) setAccount(source)
    onSelect({
      assetId: option.assetId,
      sourceAssetKey: option.sourceAssetKey,
      destinationChainKey: option.destinationChainKey,
      destinationAssetKey: option.destinationAssetKey,
    })
    if (!source && option.destinationChainKey !== HYDRATION_CHAIN_KEY)
      useOnrampModal
        .getState()
        .paginateWithdraw(OnrampScreen.WithdrawOnchainWallet)
  }
  if (connecting)
    return (
      <Web3ConnectPage
        neckwork={neckworkClient}
        papi={papi}
        mode={WalletMode.SubstrateEVM}
        accountFilter={canUseWithdrawAccount}
        meta={{
          title: t("withdraw.onchain.wallet.title"),
          description: t("withdraw.onchain.wallet.description"),
          closable: true,
        }}
        onBack={() => setConnecting(false)}
        onAccountSelect={(selected) => {
          if (!canUseWithdrawAccount(selected)) return
          setAccount(selected)
          setConnecting(false)
        }}
      />
    )
  if (flow === "guided" || selectingRoute)
    return (
      <WithdrawRouteSelect
        guided={flow === "guided"}
        initialSelection={initialSelection}
        onSelect={select}
        onBack={flow === "guided" ? onBack : () => setSelectingRoute(false)}
      />
    )
  return (
    <>
      <SOnrampStepHeader
        title={t("withdraw.quick.title")}
        description={t("withdraw.quick.description")}
        align="center"
        closable
        onBack={onBack}
      />
      <DepositScrollBody contained>
        <Stack
          gap="l"
          justify="flex-start"
          data-onramp-step="withdraw-quick-entry"
        >
          <Stack gap="base" justify="flex-start">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("withdraw.quick.assetNetwork")}
            </Text>
            <ChainAssetSelectButton
              fullWidth
              currentSelection={
                selected
                  ? {
                      asset: selected.sourceAsset,
                      chain: selected.destinationChain,
                    }
                  : null
              }
              aria-label={t("withdraw.quick.selectAssetNetwork")}
              onClick={() => setSelectingRoute(true)}
            />
          </Stack>
          <WithdrawSourceAccount
            account={source}
            onChange={() => setConnecting(true)}
          />
          <Flex justify="space-between" align="center">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("common:from")}
            </Text>
            <Flex gap="base" align="center">
              {hydration && (
                <ChainLogo
                  ecosystem={hydration.ecosystem}
                  chainId={getChainId(hydration)}
                />
              )}
              <Text fs="p4">Hydration</Text>
            </Flex>
          </Flex>
        </Stack>
      </DepositScrollBody>
    </>
  )
}
