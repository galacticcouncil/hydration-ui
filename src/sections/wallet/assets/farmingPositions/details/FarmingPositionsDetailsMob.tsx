import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { theme } from "theme"
import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { SActionButtonsContainer } from "sections/wallet/assets/table/actions/WalletAssetsTable.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { useSpotPrice } from "api/spotPrice"
import { BN_0, BN_1 } from "utils/constants"
import {
  FarmingTablePosition,
  isXYKPosition,
} from "sections/wallet/assets/farmingPositions/WalletFarmingPositions.utils"

type Props = {
  row: FarmingTablePosition
  onClose: () => void
}

export const FarmingPositionsDetailsMob = ({ row, onClose }: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const meta = assets.getAsset(row.assetId)

  const lrnaSpotPrice = useSpotPrice(assets.getAsset("1").id, row.assetId)

  const position = row.position
  const isXYK = isXYKPosition(position)

  const lrnaPositionPrice = isXYK
    ? BN_0
    : position.lrna.multipliedBy(lrnaSpotPrice.data?.spotPrice ?? BN_1)

  const { symbol, date } = row

  const tKey =
    !isXYK && position.lrna.gt(0)
      ? "wallet.assets.hydraPositions.data.valueLrna"
      : "wallet.assets.hydraPositions.data.value"

  return (
    <Modal open={!!row} isDrawer onClose={onClose} title="">
      <div>
        <div sx={{ pb: 30 }}>
          <AssetTableName {...row} id={row.assetId} large />
        </div>
        <Separator
          css={{ background: `rgba(${theme.rgbColors.alpha0}, 0.06)` }}
        />
        <div sx={{ flex: "row", justify: "space-between", py: 30, px: 8 }}>
          <div sx={{ flex: "column", gap: 4 }}>
            <Text fs={14} lh={16} color="whiteish500">
              {t("wallet.assets.hydraPositions.header.valueUSD")}
            </Text>

            <Text fs={14} lh={14} fw={500} color="white">
              {isXYK
                ? position.balances
                    .map((balance) =>
                      t("value.tokenWithSymbol", {
                        value: balance.amount,
                        symbol: balance.symbol,
                      }),
                    )
                    .join(" | ")
                : t("value.tokenWithSymbol", {
                    value: lrnaPositionPrice.plus(position.value),
                    symbol: meta?.symbol,
                  })}
            </Text>

            {!isXYK && lrnaPositionPrice.gt(0) && (
              <Text
                fs={14}
                lh={14}
                fw={500}
                color="brightBlue300"
                sx={{ flex: "row", align: "center", gap: 1 }}
              >
                <p sx={{ height: "min-content" }}>=</p>
                <Trans
                  i18nKey={tKey}
                  tOptions={{
                    value: position.value,
                    symbol,
                    lrna: position.lrna,
                    type: "token",
                  }}
                >
                  <br sx={{ display: ["none", "none"] }} />
                </Trans>
              </Text>
            )}
            <Text
              fs={12}
              lh={14}
              fw={500}
              css={{ color: `rgba(${theme.rgbColors.paleBlue}, 0.6)` }}
            >
              <DisplayValue value={position.valueDisplay} />
            </Text>
          </div>
        </div>
        <SActionButtonsContainer>
          {!isXYK && (
            <>
              <div sx={{ flex: "column", gap: 4, py: 20 }}>
                <Text fs={14} lh={16} color="whiteish500">
                  {t("wallet.assets.hydraPositions.header.providedAmount")}
                </Text>
                <Text fs={14} lh={14} color="white">
                  {t("value.tokenWithSymbol", {
                    value: position.amount,
                    symbol,
                  })}
                </Text>
                <Text fs={12} lh={17} color="whiteish500">
                  <DisplayValue value={position.amountDisplay} />
                </Text>
              </div>

              <Separator css={{ background: `rgba(158, 167, 186, 0.06)` }} />
            </>
          )}

          <div sx={{ flex: "column", gap: 4, py: 20 }}>
            <Text fs={14} lh={16} color="whiteish500">
              {t("wallet.assets.farmingPositions.header.date")}
            </Text>

            <Text fs={14} lh={14} fw={500} color="white">
              {t("wallet.assets.farmingPositions.data.date", {
                date,
              })}
            </Text>
          </div>
        </SActionButtonsContainer>
      </div>
    </Modal>
  )
}
