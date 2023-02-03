import { Text } from "../../../components/Typography/Text/Text"
import { Heading } from "../../../components/Typography/Heading/Heading"
import { Separator } from "../../../components/Separator/Separator"
import { Trans, useTranslation } from "react-i18next"
import { useMemo } from "react"
import { BN_0 } from "../../../utils/constants"
import { separateBalance } from "../../../utils/balance"
import { css } from "@emotion/react"
import { theme } from "../../../theme"
import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { useAssetsTableData } from "./table/data/WalletAssetsTableData.utils"
import { useHydraPositionsData } from "./hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import BN from "bignumber.js"

interface WalletAssetsHeaderProps {
  disconnected?: boolean
}

export const WalletAssetsHeader = ({
  disconnected,
}: WalletAssetsHeaderProps) => {
  const { t } = useTranslation()

  const assets = useAssetsTableData(false)
  const positions = useHydraPositionsData()

  const amount = useMemo(() => {
    if (!positions.data) return BN_0

    return positions.data.reduce(
      (acc, { valueUSD }) => acc.plus(BN(valueUSD)),
      BN_0,
    )
  }, [positions.data])

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const totalUsd = useMemo(() => {
    if (assets) {
      return assets.data.reduce((acc, cur) => {
        if (!cur.totalUSD.isNaN()) {
          return acc.plus(cur.totalUSD)
        }
        return acc
      }, BN_0)
    }
    return BN_0
  }, [assets])

  return (
    <div
      sx={{
        flex: ["column", "row"],
        mb: [4, 57],
        align: ["start", "center"],
      }}
    >
      <div
        sx={{
          flex: ["row", "column"],
          justify: "space-between",
          align: ["center", "start"],
          mb: [15, 0],
          minWidth: ["100%", "30%"],
        }}
      >
        <Text color="brightBlue300" sx={{ fontSize: [14, 16], mb: [0, 14] }}>
          {t("wallet.assets.header.total")}
        </Text>

        {assets.isLoading || disconnected ? (
          <Skeleton
            enableAnimation={!disconnected}
            sx={{
              width: [97, 208],
              height: [27, 42],
            }}
          />
        ) : (
          <Heading as="h3" sx={{ fontSize: [19, 42], fontWeight: 500 }}>
            <Text
              font="ChakraPetch"
              fw={900}
              fs={[19, 42]}
              sx={{ display: "inline-block" }}
            >
              $
            </Text>
            <Trans
              t={t}
              i18nKey="wallet.assets.header.value"
              tOptions={{
                ...separateBalance(totalUsd, {
                  type: "dollar",
                }),
              }}
            >
              <span
                sx={{
                  fontSize: [19, 26],
                }}
                css={css`
                  color: rgba(${theme.rgbColors.white}, 0.4);
                `}
              />
            </Trans>
          </Heading>
        )}
      </div>
      <Separator
        sx={{
          mb: [15, 0],
          height: ["1px", "70px"],
        }}
        css={{ background: `rgba(${theme.rgbColors.white}, 0.12)` }}
        orientation={isDesktop ? "vertical" : "horizontal"}
      />

      <div
        sx={{
          flex: ["row", "column"],
          align: ["center", "end"],
          mb: [15, 0],
          minWidth: ["100%", "30%"],
        }}
      >
        <div
          sx={{
            flex: ["row", "column"],
            justify: "space-between",
            minWidth: ["100%", "30%"],
          }}
        >
          <Text color="brightBlue300" sx={{ fontSize: [14, 16], mb: [0, 14] }}>
            {t("wallet.assets.header.positions.total")}
          </Text>

          {positions.isLoading || disconnected ? (
            <Skeleton
              sx={{
                width: [97, 168],
                height: [27, 42],
              }}
              enableAnimation={!disconnected}
            />
          ) : (
            <Heading as="h3" sx={{ fontSize: [19, 42], fontWeight: 500 }}>
              <Text
                font="ChakraPetch"
                fw={900}
                fs={[19, 42]}
                sx={{ display: "inline-block" }}
              >
                $
              </Text>
              <Trans
                t={t}
                i18nKey="wallet.assets.header.value"
                tOptions={{
                  ...separateBalance(amount, {
                    type: "dollar",
                  }),
                }}
              >
                <span
                  sx={{
                    fontSize: [19, 26],
                  }}
                  css={css`
                    color: rgba(${theme.rgbColors.white}, 0.4);
                  `}
                />
              </Trans>
            </Heading>
          )}
        </div>
      </div>
    </div>
  )
}
