import { SubScan } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  ExternalLink,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HYDRATION_CHAIN_KEY, subscan } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { AccountIdentity } from "@/components/AccountIdentity"
import type { MultisigDetailHistoryGroup } from "@/modules/multisig/MultisigDetailHistory.columns"
import {
  STimelineDot,
  STimelineRow,
  STimelineStack,
} from "@/modules/multisig/MultisigDetailHistoryTimeline.styled"
import { MultisigHistoryStatusChip } from "@/modules/multisig/MultisigHistoryStatusChip"

type Props = {
  group: MultisigDetailHistoryGroup
}

export const MultisigDetailHistoryTimeline: React.FC<Props> = ({ group }) => {
  const { t } = useTranslation()

  return (
    <STimelineStack gap="m">
      {group.events.map((event) => {
        const subscanHref = subscan.block(
          HYDRATION_CHAIN_KEY,
          event.call.blockHash,
        )

        return (
          <STimelineRow key={event.call.id}>
            <STimelineDot status={event.status} />

            {event.signerAddress ? (
              <AccountIdentity
                address={event.signerAddress}
                withSubscanLink={false}
                fs="p5"
                fw={600}
                truncate
                color={getToken("text.high")}
              />
            ) : (
              <Text fs="p5" color={getToken("text.medium")} truncate>
                {t("multisig.detail.history.timeline.unknownSigner")}
              </Text>
            )}

            <Text fs="p5" color={getToken("text.medium")} whiteSpace="nowrap">
              {event.timestamp
                ? t("date.datetime.short", {
                    value: new Date(event.timestamp),
                  })
                : "—"}
            </Text>

            <Flex justify="end">
              <MultisigHistoryStatusChip status={event.status} />
            </Flex>

            <Flex justify="end">
              <ButtonIcon asChild>
                <ExternalLink href={subscanHref}>
                  <Icon component={SubScan} size="m" />
                </ExternalLink>
              </ButtonIcon>
            </Flex>
          </STimelineRow>
        )
      })}
    </STimelineStack>
  )
}
