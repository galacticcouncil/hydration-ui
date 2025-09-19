import { CalendarDays, SubSquare } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ExternalLink,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly id: number
  readonly end: Date
  readonly voted: boolean
}

export const ReferendaFooter: FC<Props> = ({ id, end, voted }) => {
  const { t } = useTranslation(["common", "staking"])

  return (
    <Flex justify="space-between" align="center">
      <Flex
        align="center"
        gap={8}
        color={
          voted
            ? getToken("text.high")
            : getToken("surfaces.containers.low.onPrimary")
        }
      >
        <Icon component={CalendarDays} size={20} />
        <Text fw={500} fs={13} lh={1}>
          {t("date.relative", { value: end })}
        </Text>
      </Flex>
      <Button
        sx={{
          ...(!voted && {
            paddingInline: 32,
          }),
        }}
        size="large"
        variant={voted ? "tertiary" : "primary"}
        outline={voted}
        asChild
      >
        <ExternalLink href={`https://hydration.subsquare.io/referenda/${id}`}>
          <Icon component={SubSquare} size={14} color="white" />
          {voted ? t("open") : t("staking:referenda.item.cta")}
        </ExternalLink>
      </Button>
    </Flex>
  )
}
