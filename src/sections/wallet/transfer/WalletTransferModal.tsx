import { u32 } from "@polkadot/types"
import { Modal } from "components/Modal/Modal"
import { PillSwitch } from "components/PillSwitch/PillSwitch"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { useState } from "react"

import { useTranslation } from "react-i18next"

import { WalletTransferSectionOnchain } from "sections/wallet/transfer/onchain/WalletTransferSectionOnchain"
import { WalletTransferSectionCrosschain } from "sections/wallet/transfer/crosschain/WalletTransferSectionCrosschain"
import { STopContentContainer } from "./WalletTransferModal.styled"
import { CloseButton, SecondaryButton } from "components/Modal/Modal.styled"
import { useMedia } from "react-use"
import { theme } from "theme"
import { CROSSCHAINS } from "./crosschain/WalletTransferSectionCrosschain.utils"
import { css } from "@emotion/react"

export function WalletTransferModal(props: {
  open: boolean
  onClose: () => void
  initialAsset: u32 | string
}) {
  const { t } = useTranslation()
  const [chain, setChain] = useState<"onchain" | "crosschain">("onchain")
  const [active, setActive] = useState<typeof CROSSCHAINS[number] | undefined>()

  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      containerStyles={
        !isDesktop
          ? {
              height: "calc(100vh - 75px)",
              "& > div": {
                background: theme.gradients.background,
              },
            }
          : undefined
      }
      withoutClose={!isDesktop}
      topContent={
        <STopContentContainer>
          {active && (
            <SecondaryButton
              icon={<ChevronRight css={{ transform: "rotate(180deg)" }} />}
              name="Back"
              onClick={() => setActive(undefined)}
              sx={{ display: ["inherit", "none"], top: "unset" }}
            />
          )}
          <PillSwitch
            options={[
              {
                value: "onchain" as const,
                label: t("wallet.assets.transfer.switch.onchain"),
              },
              {
                value: "crosschain" as const,
                label: t("wallet.assets.transfer.switch.bridge"),
              },
            ]}
            value={chain}
            onChange={setChain}
            css={css`
              left: 50%;
              transform: translate(-50%, 0);
            `}
          />
          <CloseButton
            icon={<CrossIcon />}
            onClick={props.onClose}
            name={t("modal.closeButton.name")}
            sx={{
              m: 0,
              display: ["inherit", "none"],
              top: "unset",
              right: 16,
              bg: "darkBlue700",
            }}
          />
        </STopContentContainer>
      }
    >
      <div sx={{ height: "100%" }}>
        {chain === "onchain" && (
          <WalletTransferSectionOnchain
            initialAsset={props.initialAsset}
            onClose={props.onClose}
          />
        )}

        {chain === "crosschain" && (
          <WalletTransferSectionCrosschain
            onClose={props.onClose}
            active={active}
            setActive={setActive}
          />
        )}
      </div>
    </Modal>
  )
}
