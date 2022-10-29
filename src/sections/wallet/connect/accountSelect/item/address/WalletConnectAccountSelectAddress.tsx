import { css } from "@emotion/react"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { shortenAccountAddress } from "utils/formatting"

type Props = {
  name: string
  theme: string
  address: string
  onClick?: () => void
}

export const WalletConnectAccountSelectAddress: FC<Props> = ({
  name,
  theme,
  address,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      sx={{ flex: "row", align: "center", gap: 10 }}
      css={{ position: "relative" }}
    >
      <div
        sx={{ p: 5, flex: "row", align: "center", bg: "backgroundGray1000" }}
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
          css={css`
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: var(--secondary-color);
          `}
        >
          {shortenAccountAddress(address, 12)}
        </Text>
      </div>
    </div>
  )
}
