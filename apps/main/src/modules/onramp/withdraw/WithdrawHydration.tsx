import { Box, Flex, Stack, Stepper, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getChainId, HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import {
  useAccount,
  useWeb3Connect,
  WalletMode,
  Web3ConnectPage,
} from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { FC, useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { ChainLogo } from "@/components/ChainLogo"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { WithdrawRouteSelect } from "@/modules/onramp/withdraw/components/WithdrawRouteSelect"
import { WithdrawSourceAccount } from "@/modules/onramp/withdraw/components/WithdrawSourceAccount"
import { useWithdrawDestinationOptions } from "@/modules/onramp/withdraw/hooks/useWithdrawDestinationOptions"
import { WithdrawDestinationOption } from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"
import {
  canUseWithdrawAccount,
  selectWithdrawSourceAccount,
} from "@/modules/onramp/withdraw/WithdrawOnchain.utils"
import { WithdrawRecipientSelect } from "@/modules/onramp/withdraw/WithdrawRecipientSelect"
import { TransferPositionModal } from "@/modules/portfolio/overview/Transfer/TransferPositionModal"
import { ChainAssetSelectButton } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelectButton"
import { useRpcProvider } from "@/providers/rpcProvider"

type WithdrawHydrationProps = { assetId: string }

export const WithdrawHydration: FC<WithdrawHydrationProps> = ({ assetId }) => {
  const { t } = useTranslation(["onramp", "wallet", "common"])
  const { account } = useAccount()
  const { papi } = useRpcProvider()
  const connected = useDepositAccounts()
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const setModal = useOnrampModal((state) => state.setModal)
  const flow = useOnrampModal((state) => state.withdrawFlow)
  const pending = useOnrampModal((state) => state.withdrawPending)
  const setWalletContentWidth = useOnrampModal(
    (state) => state.setWalletContentWidth,
  )
  const selectedRoute = useOnrampModal((state) => state.withdrawSelection)
  const selectWithdrawAsset = useOnrampModal(
    (state) => state.selectWithdrawAsset,
  )
  const options = useWithdrawDestinationOptions()
  const [choosingWallet, setChoosingWallet] = useState(false)
  const [choosingRoute, setChoosingRoute] = useState(false)
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)!
  const source = selectWithdrawSourceAccount(account, connected)
  const sourceCurrent =
    source &&
    account?.provider === source.provider &&
    account.address === source.address
  useEffect(() => {
    if (!choosingWallet && sourceCurrent) return
    return () => setWalletContentWidth(null)
  }, [choosingWallet, sourceCurrent, setWalletContentWidth])
  const localRoute = options.find(
    (option) =>
      option.assetId === assetId &&
      option.destinationChainKey === HYDRATION_CHAIN_KEY &&
      (!selectedRoute ||
        (option.sourceAssetKey === selectedRoute.sourceAssetKey &&
          option.destinationAssetKey === selectedRoute.destinationAssetKey)),
  )
  const reportPending = useCallback((withdrawPending: boolean) => {
    useOnrampModal.setState({ withdrawPending })
  }, [])
  const back = () => {
    if (!useOnrampModal.getState().withdrawPending) setModal("withdrawAsset")
  }
  const chooseRoute = () => {
    if (!useOnrampModal.getState().withdrawPending) setChoosingRoute(true)
  }
  const chooseWallet = () => {
    if (!useOnrampModal.getState().withdrawPending) setChoosingWallet(true)
  }
  useEffect(() => {
    if (!pending && !choosingWallet && !sourceCurrent && source)
      setAccount(source)
  }, [pending, choosingWallet, sourceCurrent, source, setAccount])

  const selectRoute = (option: WithdrawDestinationOption) => {
    if (useOnrampModal.getState().withdrawPending) return
    const isSameRoute =
      localRoute?.sourceAssetKey === option.sourceAssetKey &&
      localRoute.destinationChainKey === option.destinationChainKey &&
      localRoute.destinationAssetKey === option.destinationAssetKey
    setChoosingRoute(false)
    if (isSameRoute) return
    selectWithdrawAsset({
      assetId: option.assetId,
      sourceAssetKey: option.sourceAssetKey,
      destinationChainKey: option.destinationChainKey,
      destinationAssetKey: option.destinationAssetKey,
      recipient: selectedRoute?.recipient,
    })
  }

  const walletSelector = (
    <Web3ConnectPage
      layout={flow === "connected" ? "split" : "page"}
      walletListVariant={flow === "connected" ? "connectedFirst" : "default"}
      onContentWidthChange={setWalletContentWidth}
      neckwork={neckworkClient}
      papi={papi}
      mode={WalletMode.SubstrateEVM}
      accountFilter={canUseWithdrawAccount}
      meta={{
        title: t("withdraw.onchain.wallet.title"),
        description: t("withdraw.onchain.wallet.description"),
        closable: true,
        hideAccountFilters: flow === "connected",
      }}
      onBack={() => {
        if (useOnrampModal.getState().withdrawPending) return
        if (source) setChoosingWallet(false)
        else back()
      }}
      onAccountSelect={(selected) => {
        if (useOnrampModal.getState().withdrawPending) return
        if (!canUseWithdrawAccount(selected)) return
        setAccount(selected)
        setChoosingWallet(false)
      }}
    />
  )

  if (!sourceCurrent || !source) return walletSelector

  return (
    <>
      {choosingRoute ? (
        <WithdrawRouteSelect
          editing
          destinationChainKey={HYDRATION_CHAIN_KEY}
          initialSelection={selectedRoute}
          onBack={() => {
            setChoosingRoute(false)
          }}
          onSelect={selectRoute}
        />
      ) : choosingWallet ? (
        walletSelector
      ) : null}
      <Box display={choosingRoute || choosingWallet ? "none" : "contents"}>
        <TransferPositionModal
          key={`${source.provider}:${source.address}:${assetId}`}
          assetId={assetId}
          defaultRecipient={selectedRoute?.recipient?.account}
          defaultAddress={selectedRoute?.recipient?.address}
          lockAsset={flow === "simple"}
          showTransferSummary
          inlineAssetSelection
          sourceAccount={source}
          onPendingChange={reportPending}
          onRecipientWidthChange={setWalletContentWidth}
          assetLabel={
            <Flex as="span" align="center" gap="s">
              {t("common:to")}
              <ChainLogo
                ecosystem={hydration.ecosystem}
                chainId={getChainId(hydration)}
                size="extra-small"
                alt={hydration.name}
              />
              <Text fs="p5" fw={500} color={getToken("text.high")}>
                {hydration.name}
              </Text>
            </Flex>
          }
          renderDestinationPicker={({ assetId, onBack, onSelect }) => {
            const route = options.find((option) => option.assetId === assetId)
            if (!route) return null
            return (
              <WithdrawRecipientSelect
                startInSplit
                sourceAssetKey={route.sourceAssetKey}
                onBack={onBack}
                onSelect={(selection) => {
                  if (!selection.recipient) return
                  if (selection.destinationChainKey === HYDRATION_CHAIN_KEY) {
                    onSelect(
                      selection.recipient.address,
                      selection.recipient.account,
                    )
                  } else {
                    selectWithdrawAsset(selection)
                  }
                }}
              />
            )
          }}
          onAssetClick={chooseRoute}
          header={(pending) => (
            <SOnrampStepHeader
              align="center"
              title={
                flow === "simple"
                  ? t("withdraw.quick.title")
                  : t("wallet:transfer.modal.title")
              }
              description={
                flow === "simple" ? t("withdraw.quick.description") : undefined
              }
              onBack={pending ? undefined : back}
              closable
              customHeader={
                flow !== "current" ? (
                  <Stack gap="l" pt="m" justify="flex-start">
                    {flow === "guided" && (
                      <Stepper
                        compact
                        steps={[
                          t("withdraw.guided.step.asset"),
                          t("withdraw.guided.step.network"),
                          t("withdraw.guided.step.withdraw"),
                        ]}
                        activeStepIndex={2}
                      />
                    )}
                    {flow === "simple" && (
                      <Stack gap="s" justify="flex-start">
                        <Text fs="p5" color={getToken("text.medium")}>
                          {t("withdraw.quick.assetNetwork")}
                        </Text>
                        <ChainAssetSelectButton
                          fullWidth
                          currentSelection={
                            localRoute
                              ? {
                                  asset: localRoute.sourceAsset,
                                  chain: localRoute.destinationChain,
                                }
                              : null
                          }
                          aria-label={t("withdraw.quick.selectAssetNetwork")}
                          disabled={pending}
                          onClick={chooseRoute}
                        />
                      </Stack>
                    )}
                    <WithdrawSourceAccount
                      account={source}
                      disabled={pending}
                      onChange={chooseWallet}
                    />
                  </Stack>
                ) : undefined
              }
            />
          )}
          onClose={() => setModal(null)}
        />
      </Box>
    </>
  )
}
