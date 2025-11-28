import { Distribution } from "@galacticcouncil/ui/assets/icons"
import {
  Chip,
  Flex,
  Icon,
  Paper,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { addSeconds } from "date-fns"
import { ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useMeasure } from "react-use"

import { Farm } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"
import { useSecondsToLeft } from "@/modules/liquidity/components/Farms/Farms.utils"
import { useAssets } from "@/providers/assetsProvider"

import { SYieldOpportunityContainer } from "./AvailableFarm.styled"

const LONG_VARIANT_WIDTH = 550

type AvailableFarmProps = {
  farm: Farm
  className?: string
  onClick?: (farm: Farm) => void
}

export const AvailableFarm = ({
  farm,
  className,
  onClick,
}: AvailableFarmProps) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const [ref, { width }] = useMeasure<HTMLDivElement>()

  const secondsToLeft = useSecondsToLeft(farm.estimatedEndBlock)

  const isLongVariant = width > LONG_VARIANT_WIDTH
  const meta = getAssetWithFallback(farm.rewardCurrency)
  const isSelectable = !!onClick

  return (
    <SYieldOpportunityContainer
      ref={ref}
      role="button"
      as={isSelectable ? Paper : undefined}
      onClick={() => onClick?.(farm)}
      isSelectable={isSelectable}
      direction={isLongVariant ? "row" : "column"}
      sx={{
        p: getTokenPx([
          "containers.paddings.secondary",
          "containers.paddings.primary",
        ]),
      }}
      className={className}
    >
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={10}>
          <AssetLogo id={meta.id} />
          <Text color={getToken("text.high")} fs="p2" fw={600}>
            {meta.symbol}
          </Text>{" "}
        </Flex>

        <Flex align="center" gap={10}>
          <Chip variant="green" size="small">
            {t("liquidity.availableFarms.apr", {
              value: farm.apr,
            })}
          </Chip>
          {isSelectable && !isLongVariant ? (
            <Icon
              size={16}
              component={ChevronRight}
              sx={{ justifySelf: "flex-end" }}
            />
          ) : null}
        </Flex>
      </Flex>

      {!isLongVariant && <Separator />}

      <Flex align="center" gap={8}>
        <Icon
          component={Distribution}
          color={getToken("text.medium")}
          size={20}
        />
        <Text fs={14} fw={500} color={getToken("text.high")}>
          {t("liquidity.availableFarms.expectedEnd")}
        </Text>
        <Text
          fs="p3"
          fw={500}
          color={getToken("text.tint.secondary")}
          sx={{ justifySelf: "end", minWidth: 90 }}
        >
          {secondsToLeft
            ? t("common:date.default", {
                value: addSeconds(new Date(), secondsToLeft.toNumber()),
                format: "dd.MM.yyyy",
              })
            : "N/A"}
        </Text>
        {isSelectable && isLongVariant ? (
          <Icon
            size={16}
            component={ChevronRight}
            sx={{ justifySelf: "flex-end" }}
          />
        ) : null}
      </Flex>
    </SYieldOpportunityContainer>
  )
}
