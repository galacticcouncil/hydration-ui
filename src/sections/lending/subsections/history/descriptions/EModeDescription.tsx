import { Text } from "components/Typography/Text/Text"
import { UserEModeFragment } from "graphql/__generated__/squid/graphql"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

export const EModeDescription: FC<UserEModeFragment> = ({ categoryId }) => {
  const { t } = useTranslation()
  const { eModes } = useAppDataContext()

  if (categoryId === null) {
    return null
  }

  const emode = eModes?.[categoryId]?.label
  const isEnabled = categoryId !== 0

  return (
    <Text
      fs={14}
      sx={{
        flex: "row",
        justify: ["end", "start"],
        flexWrap: "wrap",
        gap: 4,
      }}
    >
      <Trans
        t={t}
        i18nKey={
          isEnabled
            ? "lending.history.table.emodeEnabled"
            : "lending.history.table.emodeDisabled"
        }
        values={{ emode }}
      >
        <span
          css={{
            whiteSpace: "nowrap",
          }}
        />
        <span sx={{ color: isEnabled ? "green500" : "red500" }} />
      </Trans>
    </Text>
  )
}
