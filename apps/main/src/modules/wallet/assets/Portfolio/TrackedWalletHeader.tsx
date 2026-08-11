import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
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
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useRelativeDate } from "@/hooks/useRelativeDate"
import { TrackedWalletIdentity } from "@/modules/wallet/assets/Portfolio/TrackedWalletIdentity"
import {
  STrackedWalletHeader,
  STrackedWalletHeaderChevronTrigger,
  STrackedWalletHeaderMainTrigger,
  STrackedWalletHeaderRefreshButton,
} from "@/modules/wallet/assets/Portfolio/WalletPortfolio.styled"

type Props = {
  readonly address: string
  readonly open: boolean
  readonly isRefreshing: boolean
  readonly lastUpdatedAt: number
  readonly onRefresh: () => void
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

export const TrackedWalletHeader: FC<Props> = ({
  address,
  open,
  isRefreshing,
  lastUpdatedAt,
  onRefresh,
}) => {
  const { t } = useTranslation("wallet")

  return (
    <STrackedWalletHeader data-state={open ? "open" : "closed"}>
      <CollapsibleTrigger asChild>
        <STrackedWalletHeaderMainTrigger type="button">
          <TrackedWalletIdentity
            address={address}
            glyphSize={16}
            fs="p6"
            fw={500}
            truncate={300}
          />
        </STrackedWalletHeaderMainTrigger>
      </CollapsibleTrigger>
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
            onClick={onRefresh}
          >
            {isRefreshing ? (
              <SpinnerIcon size="small" />
            ) : (
              <RefreshCw size="s" />
            )}
          </STrackedWalletHeaderRefreshButton>
        </Tooltip>
        <CollapsibleTrigger asChild>
          <STrackedWalletHeaderChevronTrigger type="button">
            <Icon size="s" component={ChevronDown} />
          </STrackedWalletHeaderChevronTrigger>
        </CollapsibleTrigger>
      </Flex>
    </STrackedWalletHeader>
  )
}
