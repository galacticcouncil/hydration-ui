import { CalendarDays, SubSquare } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly end: Date
}

export const ReferendaFooter: FC<Props> = ({ end }) => {
  const { t } = useTranslation(["common", "staking"])

  return (
    <Flex justify="space-between" align="center">
      <Flex align="center" gap={8}>
        <Icon
          component={CalendarDays}
          size={20}
          color={getToken("surfaces.containers.low.onPrimary")}
        />
        <Text
          fw={500}
          fs={13}
          lh={1}
          color={getToken("surfaces.containers.low.onPrimary")}
        >
          {t("date.relative", { value: end })}
        </Text>
      </Flex>
      {/* TODO integrate */}
      <Button size="large">
        <Icon component={SubSquare} size={14} color="white" />
        {t("staking:referenda.item.cta")}
      </Button>
    </Flex>
  )
}
