import { ModalRoot } from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import { SOnrampFlowContent } from "@/modules/onramp/components/OnrampFlowContent.styled"
import { OnrampModalContent } from "@/modules/onramp/components/OnrampModalContent"
import { DepositFlowLayout } from "@/modules/onramp/deposit/components/DepositFlowLayout"
import { DepositOnchainModalContent } from "@/modules/onramp/deposit/components/DepositOnchainModalContent"
import { DepositManager } from "@/modules/onramp/deposit/DepositManager"
import { DepositJourneyMonitor } from "@/modules/onramp/deposit/preview/DepositJourneyMonitor"
import { DepositMethodSelect } from "@/modules/onramp/deposit/steps/DepositMethodSelect"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import {
  isWalletFirstWithdrawFlow,
  useOnrampModal,
} from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { WithdrawFlowLayout } from "@/modules/onramp/withdraw/components/WithdrawFlowLayout"
import { WithdrawMethodSelect } from "@/modules/onramp/withdraw/steps/WithdrawMethodSelect"
import { WithdrawAssetSelect } from "@/modules/onramp/withdraw/WithdrawAssetSelect"
import { WithdrawCexModalContent } from "@/modules/onramp/withdraw/WithdrawCexModalContent"
import { WithdrawConnectedAssets } from "@/modules/onramp/withdraw/WithdrawConnectedAssets"
import { WithdrawOnchain } from "@/modules/onramp/withdraw/WithdrawOnchain"
import { WithdrawVariantEntry } from "@/modules/onramp/withdraw/WithdrawVariantEntry"
import { BankDeposit } from "@/modules/ramp/BankDeposit"
import { BankWithdraw } from "@/modules/ramp/BankWithdraw"

export const OnrampModal = () => {
  const { t } = useTranslation("common")
  const modal = useOnrampModal((state) => state.modal)
  const depositFlow = useOnrampModal((state) => state.depositFlow)
  const depositEntryFlow = useOnrampModal((state) => state.depositEntryFlow)
  const walletFirstFlow = useOnrampModal((state) => state.walletFirstFlow)
  const withdrawFlow = useOnrampModal((state) => state.withdrawFlow)
  const setModal = useOnrampModal((state) => state.setModal)
  const openSelectedDepositFlow = useOnrampModal(
    (state) => state.openSelectedDepositFlow,
  )
  const selectWithdrawAsset = useOnrampModal(
    (state) => state.selectWithdrawAsset,
  )
  const openWithdrawCex = useOnrampModal((state) => state.openWithdrawCex)
  const withdrawAssetId = useOnrampModal((state) => state.withdrawAssetId)
  const withdrawPage = useOnrampModal((state) => state.withdrawPage)
  const withdrawSelection = useOnrampModal((state) => state.withdrawSelection)
  const openWithdrawOnchain = useOnrampModal(
    (state) => state.openWithdrawOnchain,
  )
  const page = useOnrampStore((state) => state.page)
  const phase = useDepositJourneyStore((state) => state.phase)
  const walletContentWidth = useOnrampModal((state) => state.walletContentWidth)
  const navigate = useNavigate()
  const router = useRouter()
  const close = () => setModal(null)
  const isOnchain =
    modal === "depositOnchain" || modal === "depositOnchainPreview"
  const isWithdrawOnchain = modal === "withdrawOnchain"
  const isWithdrawTransfer = modal === "withdrawAsset" || isWithdrawOnchain
  const isWithdraw =
    modal === "withdraw" ||
    modal === "withdrawAsset" ||
    isWithdrawOnchain ||
    modal === "withdrawCex" ||
    modal === "bankWithdraw"
  const isTransferFlow =
    modal === "withdrawAsset" ||
    isWithdrawOnchain ||
    modal === "withdrawCex" ||
    isOnchain
  const isSplitWalletConnection =
    isWithdrawOnchain &&
    withdrawFlow === "current" &&
    withdrawPage === OnrampScreen.WithdrawOnchainWallet
  const isSplitDepositConnection =
    modal === "depositOnchainPreview" && walletContentWidth !== null
  const contentWidth =
    modal === "depositOnchain" && page === OnrampScreen.DepositOnchainRecipient
      ? 650
      : (isWithdrawTransfer && !isWalletFirstWithdrawFlow(withdrawFlow)) ||
          (modal === "depositOnchainPreview" && depositFlow !== "preview")
        ? 520
        : isTransferFlow
          ? 600
          : 520
  const disableInteractOutside = isOnchain || isWithdraw

  useEffect(
    () =>
      router.subscribe("onBeforeNavigate", ({ pathChanged }) => {
        // Wallet selection syncs the account query parameter on the same page.
        if (pathChanged) setModal(null)
      }),
    [router, setModal],
  )

  const select = (page: OnrampScreen) => {
    if (page === OnrampScreen.DepositOnchainWallet) {
      openSelectedDepositFlow()
      return
    }
    useOnrampStore.getState().paginateTo(page)
    close()
    void navigate({ to: "/deposit" })
  }

  return (
    <>
      <ModalRoot
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) close()
        }}
      >
        <OnrampModalContent
          isOpen={modal !== null}
          stepKey={`${modal}:${isWithdraw ? withdrawPage : isOnchain ? (modal === "depositOnchainPreview" ? phase : page) : "method"}`}
          loadingTitle={t(isWithdraw ? "withdraw" : "deposit")}
          contentWidth={
            isSplitWalletConnection || isSplitDepositConnection
              ? (walletContentWidth ?? pxToRem(650))
              : pxToRem(contentWidth)
          }
          hasFlowSwitcher={
            isOnchain ||
            modal === "deposit" ||
            isWithdrawTransfer ||
            modal === "bankDeposit" ||
            modal === "bankWithdraw"
          }
          onClick={(event) => event.stopPropagation()}
          onInteractOutside={
            disableInteractOutside
              ? (event) => event.preventDefault()
              : undefined
          }
        >
          {modal === "deposit" && (
            <DepositFlowLayout
              flow={
                depositEntryFlow === "choice" ? "connected" : depositEntryFlow
              }
            >
              <DepositMethodSelect onSelect={select} />
            </DepositFlowLayout>
          )}
          {isOnchain && (
            <DepositOnchainModalContent
              flow={
                modal === "depositOnchainPreview"
                  ? depositFlow
                  : walletFirstFlow
              }
            />
          )}
          {modal === "bankDeposit" && (
            <BankDeposit onBack={() => setModal("deposit")} />
          )}
          {isWithdraw && (
            <SOnrampFlowContent direction="column" width="100%">
              {isWithdrawTransfer && (
                <WithdrawFlowLayout>
                  {modal === "withdrawAsset" ? (
                    withdrawFlow === "connected" ? (
                      <WithdrawConnectedAssets
                        onSelect={selectWithdrawAsset}
                        onBack={() => openWithdrawOnchain("connected")}
                      />
                    ) : withdrawFlow === "current" ? (
                      <WithdrawAssetSelect
                        initialDestinationChainKey={
                          withdrawSelection?.destinationChainKey
                        }
                        onSelect={selectWithdrawAsset}
                        onBack={() => setModal("withdraw")}
                      />
                    ) : (
                      <WithdrawVariantEntry
                        initialSelection={withdrawSelection}
                        onSelect={selectWithdrawAsset}
                        onBack={() => setModal("withdraw")}
                      />
                    )
                  ) : (
                    <WithdrawOnchain
                      key={withdrawFlow}
                      selectedAssetId={withdrawAssetId}
                      selectedRoute={withdrawSelection}
                    />
                  )}
                </WithdrawFlowLayout>
              )}
              {modal === "withdrawCex" && <WithdrawCexModalContent />}
              {modal === "withdraw" && (
                <WithdrawMethodSelect
                  onSelect={openWithdrawCex}
                  onOnchain={() => openWithdrawOnchain()}
                  onBank={() => setModal("bankWithdraw")}
                />
              )}
              {modal === "bankWithdraw" && (
                <BankWithdraw onBack={() => setModal("withdraw")} />
              )}
            </SOnrampFlowContent>
          )}
        </OnrampModalContent>
      </ModalRoot>
      <DepositManager />
      <DepositJourneyMonitor />
    </>
  )
}
