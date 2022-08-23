import { css } from "styled-components"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Separator } from "components/Separator/Separator"
import { Box } from "components/Box/Box"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { BASILISK_ADDRESS_PREFIX } from "utils/network"
import { useBalances } from "api/balances"
import { WalletConnectAccountSelectAddress } from "sections/wallet/connect/accountSelect/item/address/WalletConnectAccountSelectAddress"
import { FC } from "react"

type Props = {
  address: string
  name: string
}

export const WalletConnectAccountSelectItem: FC<Props> = ({
  address,
  name,
}) => {
  const basiliskAddress = encodeAddress(
    decodeAddress(address),
    BASILISK_ADDRESS_PREFIX,
  )
  const kuramaAddress = address
  const native = useBalances(kuramaAddress)

  const { t } = useTranslation()

  return (
    <Box
      flex
      column
      p={16}
      gap={20}
      bg="backgroundGray800"
      css={css`
        border-radius: 12px;
      `}
    >
      <Box flex align="center" justify="space-between">
        <Text>{name}</Text>
        <Text>{t("value.bsx", { amount: native })}</Text>
      </Box>

      <Box flex column gap={12}>
        <WalletConnectAccountSelectAddress
          name={t("walletConnect.accountSelect.asset.network")}
          address={basiliskAddress}
        />
        <Separator />
        <WalletConnectAccountSelectAddress
          name={t("walletConnect.accountSelect.asset.parachain")}
          address={kuramaAddress}
        />
      </Box>
    </Box>
  )
}
