import PortfolioWalletImage from "@galacticcouncil/ui/assets/images/NoFunds.png"
import {
  Alert,
  Button,
  Grid,
  Image,
  ModalFooter,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { SModalBody } from "@galacticcouncil/web3-connect/src/components/content/WalletManagementContent.styled"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import { useDepositWallets } from "@/modules/onramp/deposit/hooks/useDepositWallets"
import { DepositWalletList } from "@/modules/onramp/deposit/preview/components/DepositWalletList"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"

export const DepositSources = () => {
  const { t } = useTranslation("onramp")
  const wallets = useDepositWallets()
  const navigate = useNavigate()
  const checkSavedSources = useDepositJourneyStore(
    (state) => state.checkSavedSources,
  )
  const setPhase = useDepositJourneyStore((state) => state.setPhase)
  useEffect(() => {
    if (wallets.accounts.length && (checkSavedSources || wallets.isConnecting))
      setPhase("assets")
  }, [
    wallets.accounts.length,
    checkSavedSources,
    wallets.isConnecting,
    setPhase,
  ])
  const names = wallets.connectableGroups.map((group) => group.title).join(", ")
  const hasDetectedWallets = wallets.groups.length > 0
  const currentName = wallets.currentWallet?.title ?? ""
  const currentError = Object.values(wallets.errors).find(Boolean)
  const exchange = () => {
    useDepositJourneyStore.getState().leave()
    useOnrampStore.getState().paginateTo(OnrampScreen.DepositAssetSelect)
    useOnrampModal.getState().setModal(null)
    void navigate({ to: "/deposit" })
  }

  return (
    <>
      <SDepositStepHeader
        title={t("deposit.wallets.title")}
        align="center"
        closable
        onBack={() => useOnrampModal.getState().setModal("deposit")}
      />
      <SModalBody
        noPadding
        scrollable={false}
        display="flex"
        sx={{ minHeight: 0 }}
      >
        <Grid
          columnTemplate={["minmax(0, 1fr)", `${pxToRem(172)} minmax(0, 1fr)`]}
          gap="base"
          rowTemplate={["minmax(0, 1fr) auto", "minmax(0, 1fr)"]}
          width="100%"
          height={["100%", pxToRem(400)]}
          sx={{ minHeight: 0 }}
        >
          <Stack justify="flex-start" minWidth={0} sx={{ minHeight: 0 }}>
            <DepositWalletList />
          </Stack>
          <Stack
            p={["m", "xl"]}
            gap="m"
            justify="center"
            minWidth={0}
            overflow="auto"
            sx={{ minHeight: 0 }}
          >
            <Image
              src={PortfolioWalletImage}
              alt=""
              aria-hidden
              lazy={false}
              sx={{ size: "3xl", objectFit: "contain", mx: "auto" }}
            />
            <Text as="h3" fs="h7" fw={500}>
              {wallets.isConnecting
                ? t("deposit.wallets.approve", { wallet: currentName })
                : t(
                    hasDetectedWallets
                      ? "deposit.wallets.connectTitle"
                      : "deposit.wallets.noWallets",
                  )}
            </Text>
            <Text fs="p4" color={getToken("text.medium")}>
              {t(
                wallets.isConnecting
                  ? "deposit.wallets.approvalHint"
                  : hasDetectedWallets
                    ? "deposit.wallets.intro"
                    : "deposit.wallets.noWalletsDescription",
                { count: wallets.groups.length },
              )}
            </Text>
            {wallets.isConnecting && (
              <Text fs="p5" color={getToken("text.medium")}>
                {t("deposit.wallets.progress", {
                  current: Math.min(
                    wallets.completed + 1,
                    wallets.queue.length,
                  ),
                  total: wallets.queue.length,
                })}
              </Text>
            )}
            {currentError && (
              <Alert
                variant="warning"
                title={t("deposit.wallets.error")}
                description={currentError}
              />
            )}
          </Stack>
        </Grid>
      </SModalBody>
      <ModalFooter sx={{ flexDirection: "column", alignItems: "stretch" }}>
        {wallets.isConnecting ? (
          <Button variant="muted" onClick={wallets.skipCurrent}>
            {t("deposit.wallets.skip", { wallet: currentName })}
          </Button>
        ) : hasDetectedWallets && names ? (
          <Button onClick={wallets.connectAll}>
            {t("deposit.wallets.connectNamed", { wallets: names })}
          </Button>
        ) : !hasDetectedWallets ? (
          <Button
            onClick={() =>
              wallets.connectWallet(WalletProviderType.WalletConnect)
            }
          >
            {t("deposit.wallets.walletConnect")}
          </Button>
        ) : null}
        {wallets.accounts.length > 0 && (
          <Button onClick={() => setPhase("assets")}>
            {t("deposit.flow.sources.continue")}
          </Button>
        )}
        <Button variant="muted" onClick={exchange}>
          {t("deposit.flow.sources.cex")}
        </Button>
      </ModalFooter>
    </>
  )
}
