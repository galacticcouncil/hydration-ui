import { Switch } from "components/Switch/Switch"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SSwitcherContainer } from "./SplitSwithcer.styled"

export const SplitSwitcher = ({
  value,
  title,
  className,
  onChange,
}: {
  value: boolean
  title: string
  className?: string
  onChange: (value: boolean) => void
}) => {
  const { t } = useTranslation()

  return (
    <SSwitcherContainer className={className}>
      <Text fs={14} color="brightBlue300">
        {title}
      </Text>
      <Switch
        value={value}
        onCheckedChange={onChange}
        label={t("yes")}
        name={title}
      />
    </SSwitcherContainer>
  )
}
