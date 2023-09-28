import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import {
  SActionsContainer,
  SButtonOpen,
} from "sections/pools/pool/actions/PoolActions.styled"
import { SContainer, SGridContainer } from "sections/pools/pool/Pool.styled"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useMedia } from "react-use"
import { theme } from "theme"

const FARM_AMOUNT = 3

export const PoolSkeleton = ({
  length,
  index,
}: {
  length: number
  index: number
}) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <SContainer css={{ opacity: length <= index + 1 ? 0.7 : 1 }}>
      <SGridContainer>
        <div
          sx={{ flex: "column", width: ["auto", 300] }}
          css={{ gridArea: "details" }}
        >
          <div sx={{ flex: "row", justify: "space-between" }}>
            <div sx={{ flex: "column", gap: 10 }}>
              <Text fs={13} color="basic400">
                {t("liquidity.asset.title")}
              </Text>
              <div sx={{ flex: "row", align: "center", gap: 8, mb: 8 }}>
                <div>
                  <Skeleton circle width={27} height={27} />
                </div>
                <div
                  sx={{
                    flex: "column",
                    justify: "space-between",
                    gap: 2,
                    height: 29,
                  }}
                >
                  <Skeleton width={39} height={15} />
                  <Skeleton width={72} height={10} />
                </div>
              </div>
            </div>
            <div sx={{ flex: "column", gap: 10 }}>
              <Text fs={13} color="basic400">
                {t("liquidity.asset.details.price")}
              </Text>
              <Text>
                <Skeleton width={118} height={21} />
              </Text>
            </div>
          </div>

          <Separator sx={{ mt: [18, 34] }} />
        </div>

        {import.meta.env.VITE_FF_FARMS_ENABLED === "true" && (
          <div sx={{ minWidth: 200 }} css={{ gridArea: "incentives" }}>
            <Text fs={13} color="basic400" sx={{ mb: [0, 16] }}>
              {t("liquidity.asset.incentives.title")}
            </Text>
            {[...Array(isDesktop ? FARM_AMOUNT : 1)].map((_, farmIndex) => {
              return (
                <div
                  key={`${index}_${farmIndex}`}
                  sx={{
                    flex: "row",
                    justify: "space-between",
                    align: "center",
                    py: 12,
                  }}
                  css={{
                    " &:not(:last-child)": {
                      borderBottom: `1px solid rgba(${theme.rgbColors.primaryA15}, 0.06)`,
                    },
                  }}
                >
                  <div sx={{ flex: "row", gap: 8, align: "center" }}>
                    <Skeleton circle width={32} height={32} />
                    <Skeleton width={78} height={15} />
                  </div>
                  <div>
                    <Skeleton
                      width={isDesktop ? 78 : 118}
                      height={isDesktop ? 15 : 21}
                    />
                  </div>
                </div>
              )
            })}
            <Separator sx={{ mt: 18, display: ["inherit", "none"] }} />
          </div>
        )}

        <div
          sx={{ flex: "column", width: ["auto", 300], justify: "end" }}
          css={{ gridArea: "values" }}
        >
          <div sx={{ flex: "row", justify: "space-between" }}>
            <div sx={{ flex: "column", gap: 10 }}>
              <Text fs={13} color="basic400">
                {t("liquidity.asset.details.total")}
              </Text>
              <div sx={{ flex: "row", align: "center", gap: 8, mb: 8 }}>
                <Skeleton width={118} height={21} />
              </div>
            </div>
            <div sx={{ flex: "column", gap: 10 }}>
              <div sx={{ flex: "row", align: "center", gap: 6 }}>
                <Text fs={13} color="basic400">
                  {t("liquidity.asset.details.24hours")}
                </Text>
              </div>
              <Skeleton width={118} height={21} />
            </div>
          </div>
        </div>

        {isDesktop && (
          <SActionsContainer css={{ gridArea: "actions" }}>
            <Button fullWidth size="small" disabled>
              <div sx={{ flex: "row", align: "center", justify: "center" }}>
                <Icon icon={<PlusIcon />} sx={{ mr: 8 }} />
                {t("liquidity.asset.actions.addLiquidity")}
              </div>
            </Button>
            <SButtonOpen
              name="Expand"
              icon={<ChevronDown />}
              isActive={false}
              disabled
            />
          </SActionsContainer>
        )}
      </SGridContainer>
    </SContainer>
  )
}
