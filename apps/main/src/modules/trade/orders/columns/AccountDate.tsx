import { Flex, FlexProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly address: string | null
  readonly date: Date
  readonly align: FlexProps["align"]
}

export const AccountDate: FC<Props> = ({ address, date, align }) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" align={align}>
      <Text fw={500} fs="p6" lh="xs" color={getToken("text.high")}>
        {shortenAccountAddress(address ?? "")}
      </Text>
      <Text fw={500} fs="p6" lh="xs" color={getToken("text.medium")}>
        {t("date.datetime", { value: date })}
      </Text>
    </Flex>
  )
}
