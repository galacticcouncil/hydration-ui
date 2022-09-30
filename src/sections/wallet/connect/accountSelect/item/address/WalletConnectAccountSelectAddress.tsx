import { css } from "styled-components"
import { Text } from "components/Typography/Text/Text"
import { Box } from "components/Box/Box"
import { FC } from "react"
import { shortenAccountAddress } from "utils/account"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"

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
    <Box
      flex
      align="center"
      gap={10}
      onClick={onClick}
      css={css`
        position: relative;
      `}
    >
      <Box
        flex
        align="center"
        justify="align"
        bg="backgroundGray1000"
        p={5}
        css={css`
          border-radius: 9999px;
        `}
      >
        <AccountAvatar address={address} theme={theme} size={32} />
      </Box>

      <Box
        flex
        column
        gap={3}
        css={css`
          overflow: hidden;
        `}
      >
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
      </Box>
    </Box>
  )
}
