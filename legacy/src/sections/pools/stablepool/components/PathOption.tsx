import { MouseEventHandler, ReactNode } from "react"
import { Icon } from "components/Icon/Icon"
import { Heading } from "components/Typography/Heading/Heading"
import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { SBlock } from "./PathOption.styled"
import { CheckBox } from "./CheckBox"
import { Badge } from "components/Badge/Badge"
import { useTranslation } from "react-i18next"

type Props = {
  selected: boolean
  onSelect: MouseEventHandler<HTMLDivElement>
  children: ReactNode
  heading: string
  subheading?: string
  icon: ReactNode
  disabled?: boolean
  isFarms?: boolean
}

export const PathOption = ({
  selected,
  onSelect,
  children,
  heading,
  subheading,
  icon,
  disabled,
  isFarms,
}: Props) => {
  const { t } = useTranslation()

  const color = disabled ? "whiteish500" : "white"

  return (
    <SBlock selected={selected} {...(!disabled && { onClick: onSelect })}>
      <div sx={{ flex: "row", justify: "space-between", gap: 4, mb: 26 }}>
        <div
          sx={{
            flex: "row",
            align: "center",
            flexWrap: "wrap",
            gap: 12,
            color: "white",
          }}
        >
          <Icon icon={icon} sx={{ color }} />
          <Heading fs={15} lh={20} fw={500} color={color}>
            {heading}
          </Heading>
          {isFarms && (
            <Badge>{t("farms.modal.joinedFarms.available.label")}</Badge>
          )}
        </div>
        <CheckBox disabled={disabled} selected={selected} />
      </div>
      {subheading && (
        <div
          css={{
            borderLeft: `1px solid ${theme.colors.white}`,
            marginBottom: 6,
            paddingLeft: 25,
          }}
          sx={{ color }}
        >
          <Text color={color}>{subheading}:</Text>
        </div>
      )}
      <div sx={{ color }}>{children}</div>
    </SBlock>
  )
}
