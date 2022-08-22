import { css } from "styled-components"
import { Text } from "components/Typography/Text/Text"
import { Box } from "components/Box/Box"
import Identicon from "@polkadot/react-identicon"

export function WalletConnectAccountSelectAddress(props: {
  name: string
  address: string
}) {
  return (
    <Box flex align="center" gap={10}>
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
        <Identicon size={32} value={props.address} />
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
          {props.name}
        </Text>
        <Text
          fw={600}
          fs={14}
          color="neutralGray300"
          css={css`
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `}
        >
          {props.address}
        </Text>
      </Box>
    </Box>
  )
}
