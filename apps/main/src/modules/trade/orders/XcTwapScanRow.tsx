import { SquareArrowOutUpRight } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ExternalLink,
  Flex,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DateText } from "@/components/RelativeDateText"
import {
  TransactionItemMobileAction,
  TransactionItemMobileContainer,
} from "@/components/TransactionItem/TransactionItemMobile"

type XcTwapScanRowProps = {
  readonly amount: string | null
  /** Unix ms */
  readonly timestamp: number | null
  readonly state: string | null
  /** Shows the state in the success colour, as for a finished step */
  readonly isStateSuccess?: boolean
  readonly link: string | null
}

export const XcTwapScanRow: FC<XcTwapScanRowProps> = ({
  amount,
  timestamp,
  state,
  isStateSuccess = false,
  link,
}) => {
  const { t } = useTranslation()

  return (
    <TransactionItemMobileContainer>
      <Flex justify="space-between" align="center" flex={1} p="l" gap="l">
        <Flex direction="column" gap="xs">
          <Text fw={500} fs="p4" lh={1} color={getToken("text.high")}>
            {amount ?? "-"}
          </Text>
          {timestamp !== null && (
            <DateText
              date={new Date(timestamp)}
              fw={500}
              fs="p6"
              lh={1.4}
              color={getToken("text.low")}
            />
          )}
        </Flex>
        {state && (
          <Text
            fw={500}
            fs="p4"
            lh={1}
            color={getToken(
              isStateSuccess ? "accents.success.emphasis" : "text.medium",
            )}
          >
            {state}
          </Text>
        )}
      </Flex>
      <TransactionItemMobileAction>
        {link && (
          <Button
            icon={SquareArrowOutUpRight}
            variant="transparent"
            aria-label={t("openInExplorer")}
            asChild
          >
            <ExternalLink href={link} />
          </Button>
        )}
      </TransactionItemMobileAction>
    </TransactionItemMobileContainer>
  )
}
