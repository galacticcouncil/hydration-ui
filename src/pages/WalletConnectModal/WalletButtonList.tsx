import { css } from "styled-components/macro"
import { ReactComponent as PolkadotLogo } from "assets/icons/PolkadotLogo.svg"
import { ReactComponent as TalismanLogo } from "assets/icons/TalismanLogo.svg"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { ReactComponent as DownloadIcon } from "assets/icons/DownloadIcon.svg"
import { ReactNode } from "react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { StyledWalletButton } from "./WalletButtonList.styled"
import { Box } from "components/Box/Box"

function WalletButton(props: {
  variant: "polkadot" | "talisman"
  status?: ReactNode
}) {
  let logo: ReactNode = null
  let title: ReactNode = null

  if (props.variant === "polkadot") {
    logo = <PolkadotLogo />
    title = "Polkadot"
  } else if (props.variant === "talisman") {
    logo = <TalismanLogo />
    title = "Talisman"
  }

  return (
    <StyledWalletButton variant={props.variant}>
      {logo}
      <Text fs={18} css={{ flexGrow: 1 }}>
        {title}
      </Text>
      {props.status && (
        <Text
          color="neutralGray300"
          fs={14}
          tAlign="right"
          css={css`
            display: flex;
            align-items: center;
            gap: 4px;
          `}
        >
          {props.status}
        </Text>
      )}
    </StyledWalletButton>
  )
}

export function WalletButtonList() {
  const { t } = useTranslation("translation")
  return (
    <Box flex column align="stretch" mt={8} gap={8}>
      <WalletButton
        variant="polkadot"
        status={
          <>
            {t("walletConnectModal.continue")}
            <ChevronRight />
          </>
        }
      />
      <WalletButton
        variant="talisman"
        status={
          <>
            {t("walletConnectModal.download")}
            <DownloadIcon />
          </>
        }
      />
    </Box>
  )
}
