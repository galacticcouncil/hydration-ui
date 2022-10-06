import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Separator } from "components/Separator/Separator"
import { Box } from "components/Box/Box"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { BASILISK_ADDRESS_PREFIX, NATIVE_ASSET_ID } from "utils/network"
import { useTokenBalance } from "api/balances"
import {
  SContainer,
  SSelectItem,
} from "./WalletConnectAccountSelectItem.styled"
import { WalletConnectAccountSelectAddress } from "sections/wallet/connect/accountSelect/item/address/WalletConnectAccountSelectAddress"
import { FC } from "react"
import { css } from "@emotion/react"
import { useAssetMeta } from "api/assetMeta"

type Props = {
  isActive: boolean
  address: string
  name: string
  provider: string
  setAccount: () => void
}

export const WalletConnectAccountSelectItem: FC<Props> = ({
  isActive,
  address,
  name,
  provider,
  setAccount,
}) => {
  const basiliskAddress = encodeAddress(
    decodeAddress(address),
    BASILISK_ADDRESS_PREFIX,
  )
  const kusamaAddress = address
  const { data } = useTokenBalance(NATIVE_ASSET_ID, kusamaAddress)
  const { data: meta } = useAssetMeta(NATIVE_ASSET_ID)

  const { t } = useTranslation()

  return (
    <SContainer isActive={isActive}>
      <SSelectItem isActive={isActive} onClick={setAccount}>
        <Box flex align="center" justify="space-between">
          <Text>{name}</Text>
          <Text>
            {t("value.bsx", {
              value: data?.balance,
              fixedPointScale: meta?.data?.decimals,
              decimalPlaces: 4,
            })}
          </Text>
        </Box>

        <Box
          flex
          column
          mt={12}
          css={css`
            gap: 12px;
          `}
        >
          <WalletConnectAccountSelectAddress
            name={t("walletConnect.accountSelect.asset.network")}
            address={basiliskAddress}
            theme="substrate"
          />
          <Separator
            color={isActive ? "primary200" : "backgroundGray700"}
            opacity={isActive ? 0.1 : 1}
          />
          <WalletConnectAccountSelectAddress
            name={t("walletConnect.accountSelect.asset.parachain")}
            address={kusamaAddress}
            theme={provider}
          />
        </Box>
      </SSelectItem>
    </SContainer>
  )
}
