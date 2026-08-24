import { ChevronDown, Trash2 } from "@galacticcouncil/ui/assets/icons"
import {
  CollapsibleTrigger,
  Flex,
  Icon,
  SpinnerIcon,
  Stack,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { RefreshCw } from "lucide-react"
import { FC, MouseEvent } from "react"
import { useTranslation } from "react-i18next"

import { useRelativeDate } from "@/hooks/useRelativeDate"
import {
  STrackedWalletHeader,
  STrackedWalletHeaderChevronTrigger,
  STrackedWalletHeaderIdentity,
  STrackedWalletHeaderMainTrigger,
  STrackedWalletHeaderRefreshButton,
  STrackedWalletHeaderRemoveButton,
} from "@/modules/portfolio/overview/PortfolioOverview.styled"
import { TrackedWalletIdentity } from "@/modules/portfolio/tracked/TrackedWalletIdentity"

type Props = {
  readonly address: string
  readonly isRefreshing: boolean
  readonly lastUpdatedAt: number
  readonly onRefresh: () => void
  readonly onRemove: () => void
}

const RefreshTooltipContent: FC<{ readonly updatedAt: number }> = ({
  updatedAt,
}) => {
  const { t } = useTranslation("wallet")
  const relativeTime = useRelativeDate(new Date(updatedAt), {
    shortFormat: true,
  })

  return (
    <Stack gap="xs">
      <Text fw={600}>{t("myAssets.otherChains.refresh")}</Text>
      <Text color={getToken("text.medium")} tabularNums>
        {t("myAssets.tracked.lastUpdate", { relativeTime })}
      </Text>
    </Stack>
  )
}

const stopHeaderToggle = (event: MouseEvent) => {
  event.stopPropagation()
}

export const TrackedWalletHeader: FC<Props> = ({
  address,
  isRefreshing,
  lastUpdatedAt,
  onRefresh,
  onRemove,
}) => {
  const { t } = useTranslation("wallet")

  return (
    <CollapsibleTrigger asChild>
      <STrackedWalletHeader>
        <STrackedWalletHeaderIdentity>
          <STrackedWalletHeaderMainTrigger>
            <TrackedWalletIdentity
              address={address}
              glyphSize={16}
              fs="p6"
              fw={500}
              truncate={300}
            />
          </STrackedWalletHeaderMainTrigger>
          <Tooltip
            text={t("myAssets.tracked.manage.remove")}
            size="small"
            asChild
          >
            <STrackedWalletHeaderRemoveButton
              type="button"
              data-remove
              aria-label={t("myAssets.tracked.manage.remove")}
              onClick={(event) => {
                stopHeaderToggle(event)
                onRemove()
              }}
            >
              <Icon size="s" component={Trash2} />
            </STrackedWalletHeaderRemoveButton>
          </Tooltip>
        </STrackedWalletHeaderIdentity>
        <Flex align="center" gap="base" sx={{ flexShrink: 0 }}>
          <Tooltip
            text={
              lastUpdatedAt > 0 ? (
                <RefreshTooltipContent updatedAt={lastUpdatedAt} />
              ) : (
                t("myAssets.otherChains.refresh")
              )
            }
            size="small"
            asChild
          >
            <STrackedWalletHeaderRefreshButton
              size="small"
              variant="muted"
              outline
              aria-label={t("myAssets.otherChains.refresh")}
              disabled={isRefreshing}
              onClick={(event) => {
                stopHeaderToggle(event)
                onRefresh()
              }}
            >
              <Icon
                size="xs"
                component={isRefreshing ? SpinnerIcon : RefreshCw}
              />
            </STrackedWalletHeaderRefreshButton>
          </Tooltip>
          <STrackedWalletHeaderChevronTrigger data-chevron>
            <Icon size="s" component={ChevronDown} />
          </STrackedWalletHeaderChevronTrigger>
        </Flex>
      </STrackedWalletHeader>
    </CollapsibleTrigger>
  )
}
