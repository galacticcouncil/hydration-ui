import { useMoneyMarketData } from "@galacticcouncil/money-market/hooks"
import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

type Props = {
  readonly categoryId: number | null | undefined
}

export const EModeDescription: FC<Props> = ({ categoryId }) => {
  const { t } = useTranslation(["borrow"])
  const { eModes } = useMoneyMarketData()

  if (categoryId === null || categoryId === undefined) {
    return (
      <Text fs="p4" color={getToken("text.high")}>
        {t("borrow:history.table.emodeUpdated")}
      </Text>
    )
  }

  const emode = eModes?.[categoryId]?.label
  const isEnabled = categoryId !== 0

  return (
    <Flex
      align="center"
      gap="s"
      justify={["end", "start"]}
      sx={{ flexWrap: "wrap" }}
    >
      <Text fs="p4" color={getToken("text.high")}>
        <Trans
          t={t}
          i18nKey={
            isEnabled
              ? "borrow:history.table.emodeEnabled"
              : "borrow:history.table.emodeDisabled"
          }
          values={{ emode }}
        >
          <Text as="span" sx={{ whiteSpace: "nowrap" }} />
          <Text
            as="span"
            color={getToken(
              isEnabled
                ? "accents.success.emphasis"
                : "accents.danger.emphasis",
            )}
          />
        </Trans>
      </Text>
    </Flex>
  )
}
