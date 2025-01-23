import { Trans, useTranslation } from "react-i18next"
import { useWalletAssetsTotals } from "sections/wallet/assets/WalletAssets.utils"
import BN from "bignumber.js"
import { DataValue, DataValueList } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { separateBalance } from "utils/balance"
import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"

type Props = { disconnected?: boolean }

export const WalletAssetsHeader = ({ disconnected }: Props) => {
  const { t } = useTranslation()
  const {
    isLoading,
    balanceTotal,
    assetsTotal,
    farmsTotal,
    lpTotal,
    borrowsTotal,
  } = useWalletAssetsTotals()

  return (
    <DataValueList separated sx={{ flexGrow: 1, mb: [24, 40] }}>
      <DataValue
        labelColor="brightBlue300"
        label={t("wallet.assets.header.networth")}
        size="large"
        isLoading={isLoading}
        disableSkeletonAnimation={disconnected}
      >
        <WalletAssetsHeaderDisplay value={balanceTotal} />
      </DataValue>
      <DataValue
        labelColor="brightBlue300"
        label={t("wallet.assets.header.assetsBalance")}
        size="large"
        isLoading={isLoading}
        disableSkeletonAnimation={disconnected}
      >
        <WalletAssetsHeaderDisplay value={assetsTotal} />
        {BN(borrowsTotal).gt(0) && (
          <Text fs={12} color="alpha0">
            {t("wallet.assets.header.assetsBorrowed", {
              value: borrowsTotal,
            })}
          </Text>
        )}
      </DataValue>
      <DataValue
        labelColor="brightBlue300"
        label={t("wallet.assets.header.liquidityBalance")}
        size="large"
        isLoading={isLoading}
        disableSkeletonAnimation={disconnected}
      >
        <WalletAssetsHeaderDisplay value={lpTotal} />
        {BN(farmsTotal).gt(0) && (
          <Text fs={12} color="alpha0">
            {t("wallet.assets.header.farmsBalance", {
              value: farmsTotal,
            })}
          </Text>
        )}
      </DataValue>
    </DataValueList>
  )
}

const WalletAssetsHeaderDisplay = ({ value }: { value: string }) => {
  const { t } = useTranslation()
  return (
    <Text tAlign={["right", "left"]} sx={{ fontSize: "inherit" }}>
      <DisplayValue
        value={
          <Trans
            t={t}
            i18nKey="wallet.assets.header.value"
            tOptions={{ ...separateBalance(BN(value), { type: "dollar" }) }}
          >
            <span css={{ color: `rgba(${theme.rgbColors.white}, 0.4);` }} />
          </Trans>
        }
      />
    </Text>
  )
}
