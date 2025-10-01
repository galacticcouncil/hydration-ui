import { Distribution } from "@galacticcouncil/ui/assets/icons"
import {
  Chip,
  Flex,
  Icon,
  Paper,
  ProgressBar,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { addSeconds } from "date-fns"
import { ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useMeasure } from "react-use"

import { Farm } from "@/api/farms"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { useFarmCurrentPeriod } from "@/modules/liquidity/components/Farms/Farms.utils"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

import { SContainer } from "./AvailableFarm.styled"

const VISIBLE_PROGRESS_BAR_WIDTH = 350

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

  const { getSecondsToLeft } = useFarmCurrentPeriod()

  const secondsToLeft = getSecondsToLeft(farm.estimatedEndBlock)

  const displayProgressBar = width > VISIBLE_PROGRESS_BAR_WIDTH
  const meta = getAssetWithFallback(farm.rewardCurrency)
  const isSelectable = !!onClick

  const total = scaleHuman(farm.potMaxRewards, meta.decimals)
  const distributedRewards = scaleHuman(farm.distributedRewards, meta.decimals)

  const diff = Big(distributedRewards).div(total).mul(100).toFixed(2)

  return (
    <SContainer
      ref={ref}
      role="button"
      as={isSelectable ? Paper : undefined}
      onClick={() => onClick?.(farm)}
      isSelectable={isSelectable}
      className={className}
    >
      <Flex align="center" gap={10}>
        <AssetLabelFull asset={meta} withName={false} />
        <Chip variant="green" size="small">
          {t("common:percent", {
            value: farm.apr,
            prefix: "Up to ",
            suffix: " APR",
          })}
        </Chip>
      </Flex>

      {isSelectable ? (
        <Icon
          size={16}
          component={ChevronRight}
          sx={{ justifySelf: "flex-end" }}
        />
      ) : null}

      <Separator />

      <Flex align="center" gap={8}>
        <Icon
          component={Distribution}
          color={getToken("text.medium")}
          size={20}
        />
        <Text fs={14} fw={500} color={getToken("text.high")}>
          {t("liquidity.availableFarms.distributed", {
            value: distributedRewards,
            total,
          })}
        </Text>
      </Flex>
      {displayProgressBar ? (
        <ProgressBar
          value={Number(diff)}
          hideLabel
          color={getToken("text.medium")}
          sx={{ flex: 1 }}
        />
      ) : null}

      <Separator />

      <Flex align="center" gap={8}>
        <Icon
          component={Distribution}
          color={getToken("text.medium")}
          size={20}
        />
        <Text fs={14} fw={500} color={getToken("text.high")}>
          {t("liquidity.availableFarms.expectedEnd")}
        </Text>
      </Flex>

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
    </SContainer>
  )
}
