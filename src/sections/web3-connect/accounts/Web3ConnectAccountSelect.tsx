import { css } from "@emotion/react"
import CopyIcon from "assets/icons/CopyIcon.svg?react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useCopyToClipboard, useMedia } from "react-use"
import { shortenAccountAddress } from "utils/formatting"
import { theme as themeParams } from "theme"
import { WalletProviderType } from "sections/web3-connect/wallets"
import { availableNetworks } from "@polkadot/networks"

const hydradxInfo = availableNetworks.find((c) => c.network === "hydradx")

type Props = {
  name: string
  genesisHash?: `0x${string}`
  address: string
  onClick?: () => void
  provider?: WalletProviderType
  isProxy?: boolean
  hydraAddress?: string
}

const AccountInner = ({
  address,
  genesisHash,
  provider,
  name,
  isProxy,
}: Props) => {
  const { t } = useTranslation()
  const [, copy] = useCopyToClipboard()
  const isDesktop = useMedia(themeParams.viewport.gte.sm)

  return (
    <div
      sx={{ flex: "row", align: "center", gap: 10, justify: "space-between" }}
    >
      <div sx={{ flex: "row", align: "center", gap: 10 }}>
        <AccountAvatar
          address={address}
          genesisHash={genesisHash}
          provider={provider}
          size={32}
        />

        <div sx={{ flex: "column", gap: 2 }} css={{ overflow: "hidden" }}>
          <Text fw={500} fs={12}>
            {name}
          </Text>
          <Text
            fw={500}
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
          onClick={() => copy(address.toString())}
        />
      </InfoTooltip>
    </div>
  )
}

export const Web3ConnectAccountSelect = ({
  name,
  genesisHash,
  address,
  onClick,
  isProxy,
  provider,
  hydraAddress,
}: Props) => {
  return (
    <div
      onClick={onClick}
      sx={{ flex: "column", gap: 10 }}
      css={{ position: "relative" }}
    >
      <AccountInner
        name={name}
        genesisHash={genesisHash}
        address={address}
        isProxy={isProxy}
        provider={provider}
      />
      {hydraAddress && !!hydradxInfo && (
        <AccountInner
          name={hydradxInfo.displayName}
          genesisHash={hydradxInfo.genesisHash?.[0]}
          address={hydraAddress}
          provider={provider}
        />
      )}
    </div>
  )
}
