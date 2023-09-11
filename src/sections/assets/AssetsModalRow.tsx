import { u32 } from "@polkadot/types"
import { useTokenBalance } from "api/balances"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { FC, useMemo } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { BN_10, BN_NAN } from "utils/constants"
import { useDisplayPrice } from "utils/displayAsset"
import { Maybe } from "utils/helpers"
import { SAssetRow } from "./AssetsModalRow.styled"
import { useAssetMeta } from "api/assetMeta"
import { getBondName } from "sections/trade/sections/bonds/Bonds.utils"
import { Bond } from "api/bonds"

interface AssetsModalRowProps {
  id: Maybe<u32 | string>
  onClick?: (asset: { id: string; symbol: string }) => void
  balanceId: string
  spotPriceId?: string
  bond?: Bond
  name?: string
}

export const AssetsModalRow: FC<AssetsModalRowProps> = ({
  id,
  balanceId,
  spotPriceId,
  name,
  onClick,
  bond,
}) => {
  const { account } = useAccountStore()
  const { t } = useTranslation()
  const meta = useAssetMeta(id)

  const balance = useTokenBalance(balanceId, account?.address)
  const spotPrice = useDisplayPrice(spotPriceId ?? balanceId)

  const nameDisplay = useMemo(() => {
    if (!meta.data) return undefined

    if (bond) {
      return {
        ticker: `${meta.data.symbol}b`,
        name: getBondName(
          meta.data?.symbol ?? "",
          new Date(bond.maturity),
          true,
        ),
      }
    }

    return {
      ticker: meta.data.symbol,
      name,
    }
  }, [meta.data, bond, name])

  const totalDisplay = useMemo(() => {
    if (balance.data && spotPrice.data) {
      return balance.data.balance
        .times(spotPrice.data.spotPrice)
        .div(BN_10.pow(meta.data?.decimals.toBigNumber() ?? 12))
    }
    return BN_NAN
  }, [meta.data?.decimals, balance.data, spotPrice.data])

  if (!meta.data || !nameDisplay || balance.data?.balance.isZero()) return null

  return (
    <SAssetRow
      onClick={() =>
        balanceId && onClick?.({ id: balanceId, symbol: nameDisplay.ticker })
      }
    >
      <div sx={{ display: "flex", align: "center" }}>
        <Icon
          icon={<AssetLogo id={meta.data.id} />}
          sx={{ mr: 10 }}
          size={30}
        />
        <div sx={{ mr: 6 }}>
          <Text fw={700} color="white" fs={16} lh={22}>
            {nameDisplay.ticker}
          </Text>
          <Text color="whiteish500" fs={12} lh={16}>
            {nameDisplay.name}
          </Text>
        </div>
      </div>
      {balance.data && (
        <div sx={{ display: "flex", flexDirection: "column", align: "end" }}>
          <Trans
            t={t}
            i18nKey="selectAssets.balance"
            tOptions={{
              balance: balance.data.balance,
              fixedPointScale: meta.data.decimals,
              numberSuffix: `${meta.data.symbol}`,
              type: "token",
            }}
          >
            <Text color="white" fs={14} lh={18} tAlign="right" />
          </Trans>

          <DollarAssetValue
            value={totalDisplay}
            wrapper={(children) => (
              <Text color="whiteish500" fs={12} lh={16}>
                {children}
              </Text>
            )}
          >
            <DisplayValue value={totalDisplay} />
          </DollarAssetValue>
        </div>
      )}
    </SAssetRow>
  )
}
