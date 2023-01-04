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
import { useMedia } from "react-use"

interface WalletAssetsHeaderProps {
  data?: AssetsTableData[]
  isLoading?: boolean
  disabledAnimation?: boolean
}

export const WalletAssetsHeader: FC<WalletAssetsHeaderProps> = ({
  data,
  isLoading,
  disabledAnimation,
}) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

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
    <div
      sx={{
        flex: ["column", "row"],
        mb: [29, 57],
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

        {isLoading ? (
          <Skeleton
            enableAnimation={!disabledAnimation}
            sx={{
              width: [97, 208],
              height: [27, 42],
            }}
          />
        ) : (
          totalUsd && (
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
          )
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
            {t("wallet.assets.header.transferable")}
          </Text>

          {isLoading ? (
            <Skeleton
              sx={{
                width: [97, 168],
                height: [27, 42],
              }}
              enableAnimation={!disabledAnimation}
            />
          ) : (
            transferableUsd && (
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
                    ...separateBalance(transferableUsd, {
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
            )
          )}
        </div>
      </div>
    </div>
  )
}
