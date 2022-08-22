import { css } from "styled-components"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Separator } from "components/Separator/Separator"
import { Box } from "components/Box/Box"
import { encodeAddress, decodeAddress } from "@polkadot/util-crypto"
import { BASILISK_ADDRESS_PREFIX } from "utils/network"
import { useBalances } from "api/balances"
import { WalletAccountAddress } from "./WalletAccountAddress"

export function WalletAccountItem(props: { address: string; name: string }) {
  const basiliskAddress = encodeAddress(
    decodeAddress(props.address),
    BASILISK_ADDRESS_PREFIX,
  )
  const kuramaAddress = props.address
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
        <Text>{props.name}</Text>
        <Text>{t("value.bsx", { amount: native })}</Text>
      </Box>

      <Box flex column gap={12}>
        <WalletAccountAddress
          name={t("walletConnectModal.account.asset.network")}
          address={basiliskAddress}
        />
        <Separator />
        <WalletAccountAddress
          name={t("walletConnectModal.account.asset.parachain")}
          address={kuramaAddress}
        />
      </Box>
    </Box>
  )
}
