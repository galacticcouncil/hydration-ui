import { Text } from "../../../components/Typography/Text/Text"
import { Heading } from "../../../components/Typography/Heading/Heading"
import { Separator } from "../../../components/Separator/Separator"
import { Trans, useTranslation } from "react-i18next"
import { AssetsTableData } from "./table/WalletAssetsTable.utils"
import { FC, useMemo } from "react"
import { BN_0 } from "../../../utils/constants"
import { separateBalance } from "../../../utils/balance"
import { css } from "@emotion/react"
import { theme } from "../../../theme"
import Skeleton from "react-loading-skeleton"

interface WalletAssetsHeaderProps {
  data?: AssetsTableData[]
  isLoading?: boolean
}

export const WalletAssetsHeader: FC<WalletAssetsHeaderProps> = ({
  data,
  isLoading,
}) => {
  const { t } = useTranslation()

  const totalUsd = useMemo(() => {
    if (data) {
      return data.reduce((acc, cur) => {
        if (!cur.totalUSD.isNaN()) {
          return acc.plus(cur.totalUSD)
        }
        return acc
      }, BN_0)
    }
    return null
  }, [data])

  const transferableUsd = useMemo(() => {
    if (data) {
      return data.reduce((acc, cur) => {
        if (!cur.transferableUSD.isNaN()) {
          return acc.plus(cur.transferableUSD)
        }
        return acc
      }, BN_0)
    }
  }, [data])

  return (
    <div sx={{ flex: ["column", "row"], mb: [29, 57], gap: [0, 132] }}>
      <div
        sx={{
          flex: ["row", "column"],
          justify: "space-between",
          align: ["center", "start"],
          mb: [15, 0],
        }}
      >
        <Text color="neutralGray300" sx={{ fontSize: [14, 16], mb: [0, 14] }}>
          {t("wallet.assets.header.total")}
        </Text>

        {isLoading ? (
          <Skeleton
            sx={{
              width: [97, 208],
              height: [27, 42],
            }}
          />
        ) : (
          totalUsd && (
            <Heading as="h3" sx={{ fontSize: [16, 52], fontWeight: 900 }}>
              <Trans
                t={t}
                i18nKey="wallet.assets.header.value"
                tOptions={{
                  ...separateBalance(totalUsd, {
                    numberPrefix: "$",
                    decimalPlaces: 2,
                  }),
                }}
              >
                <span
                  sx={{
                    fontSize: [16, 26],
                  }}
                  css={css`
                    color: rgba(${theme.rgbColors.white}, 0.4);
                  `}
                />
              </Trans>
            </Heading>
          )
        )}
      </div>
      <Separator sx={{ mb: 15, display: ["inherit", "none"] }} />

      <div
        sx={{
          flex: ["row", "column"],
          justify: "space-between",
          align: ["center", "start"],
          mb: [15, 0],
        }}
      >
        <Text color="neutralGray300" sx={{ fontSize: [14, 16], mb: [0, 14] }}>
          {t("wallet.assets.header.transferable")}
        </Text>

        {isLoading ? (
          <Skeleton
            sx={{
              width: [97, 168],
              height: [27, 42],
            }}
          />
        ) : (
          transferableUsd && (
            <Heading as="h3" sx={{ fontSize: [16, 52], fontWeight: 900 }}>
              <Trans
                t={t}
                i18nKey="wallet.assets.header.value"
                tOptions={{
                  ...separateBalance(transferableUsd, {
                    numberPrefix: "$",
                    decimalPlaces: 2,
                  }),
                }}
              >
                <span
                  sx={{
                    fontSize: [16, 26],
                  }}
                  css={css`
                    color: rgba(${theme.rgbColors.white}, 0.4);
                  `}
                />
              </Trans>
            </Heading>
          )
        )}
      </div>
    </div>
  )
}
