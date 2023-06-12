import { css } from "@emotion/react"
import { ReactComponent as CopyIcon } from "assets/icons/CopyIcon.svg"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useCopyToClipboard, useMedia } from "react-use"
import { shortenAccountAddress } from "utils/formatting"
import { theme as themeParams } from "theme"

type Props = {
  name: string
  theme: string
  address: string
  onClick?: () => void
  isProxy?: boolean
}

export const WalletConnectAccountSelectAddress = ({
  name,
  theme,
  address,
  onClick,
  isProxy,
}: Props) => {
  const { t } = useTranslation()
  const [, copy] = useCopyToClipboard()
  const isDesktop = useMedia(themeParams.viewport.gte.sm)

  return (
    <div
      onClick={onClick}
      sx={{ flex: "row", align: "center", gap: 10, justify: "space-between" }}
      css={{ position: "relative" }}
    >
      <div sx={{ flex: "row", align: "center" }}>
        <div
          sx={{ p: 5, flex: "row", align: "center" }}
          css={{ borderRadius: "9999px" }}
        >
          <AccountAvatar address={address} theme={theme} size={32} />
        </div>

        <div sx={{ flex: "column", gap: 3 }} css={{ overflow: "hidden" }}>
          <Text fw={600} fs={12}>
            {name}
          </Text>
          <Text
            fw={600}
            fs={14}
            color="basic300"
            css={css`
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: ${isProxy ? undefined : "var(--secondary-color)"};
            `}
          >
            {isDesktop ? address : shortenAccountAddress(address, 12)}
          </Text>
        </div>
      </div>

      <InfoTooltip
        text={t("wallet.header.copyAddress.hover")}
        textOnClick={t("wallet.header.copyAddress.click")}
      >
        <CopyIcon
          css={{
            cursor: "pointer",
            color: isProxy ? "white" : "var(--secondary-color)",
          }}
          onClick={(e) => {
            e.stopPropagation()
            copy(address.toString())
          }}
        />
      </InfoTooltip>
    </div>
  )
}
