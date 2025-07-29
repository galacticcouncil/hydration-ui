import { Switch } from "components/Switch/Switch"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const SplitSwitcher = ({
  value,
  title,
  onChange,
}: {
  value: boolean
  title: string
  onChange: (value: boolean) => void
}) => {
  const { t } = useTranslation()

  return (
    <div
      sx={{
        flex: "row",
        justify: "space-between",
        align: "center",
        mx: -24,
        mb: 12,
        px: 24,
        py: 8,
      }}
      css={{
        borderTop: "1px solid #1C2038",
        borderBottom: "1px solid #1C2038",
      }}
    >
      <Text fs={14} color="brightBlue300">
        {title}
      </Text>
      <Switch
        value={value}
        onCheckedChange={onChange}
        label={t("yes")}
        name={title}
      />
    </div>
  )
}
