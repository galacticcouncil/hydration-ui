import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Separator } from "components/Separator/Separator"
import { Box } from "components/Box/Box"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { BASILISK_ADDRESS_PREFIX, NATIVE_ASSET_ID } from "utils/network"
import { useTokenBalance } from "api/balances"
import { SSelectItem } from "./WalletConnectAccountSelectItem.styled"
import { WalletConnectAccountSelectAddress } from "sections/wallet/connect/accountSelect/item/address/WalletConnectAccountSelectAddress"
import { FC } from "react"

type Props = {
  address: string
  name: string
  setAccount: () => void
}

export const WalletConnectAccountSelectItem: FC<Props> = ({
  address,
  name,
  setAccount,
}) => {
  const basiliskAddress = encodeAddress(
    decodeAddress(address),
    BASILISK_ADDRESS_PREFIX,
  )
  const kuramaAddress = address
  const { data } = useTokenBalance(NATIVE_ASSET_ID, kuramaAddress)

  const { t } = useTranslation()

  return (
    <SSelectItem onClick={setAccount}>
      <Box flex align="center" justify="space-between">
        <Text>{name}</Text>
        <Text>{t("value.bsx", { amount: data?.balance })}</Text>
      </Box>

      <Box flex column>
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
    </SSelectItem>
  )
}
