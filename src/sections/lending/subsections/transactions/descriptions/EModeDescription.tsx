import { Text } from "components/Typography/Text/Text"
import { UserEModeFragment } from "graphql/__generated__/squid/graphql"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

export const EModeDescription: FC<UserEModeFragment> = ({ categoryId }) => {
  const { t } = useTranslation()
  const { eModes } = useAppDataContext()

  if (categoryId === null) {
    return null
  }

  const emode = eModes[categoryId]?.label
  const isEnabled = categoryId !== 0

  return (
    <Text fs={14}>
      {isEnabled
        ? t("lending.transactions.table.emodeEnabled", { emode })
        : t("lending.transactions.table.emodeDisabled", { emode })}
    </Text>
  )
}
