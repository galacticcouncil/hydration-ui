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
import { ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useMeasure } from "react-use"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { useAssets } from "@/providers/assetsProvider"

import { SContainer } from "./AvailableFarm.styled"
import { Farm } from "./AvailableFarms"

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

  const displayProgressBar = width > VISIBLE_PROGRESS_BAR_WIDTH
  const meta = getAssetWithFallback(farm.assetId)
  const isSelectable = !!onClick

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
            value: 100,
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
            value: 100000,
            total: 10000000,
          })}
        </Text>
      </Flex>
      {displayProgressBar ? (
        <ProgressBar
          value={40}
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
        {t("common:date.default", {
          value: new Date("2023-08-29"),
          format: "dd.MM.yyyy",
        })}
      </Text>
    </SContainer>
  )
}
