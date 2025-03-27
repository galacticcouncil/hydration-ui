import { Text } from "components/Typography/Text/Text"
import { AnchorHTMLAttributes, FC } from "react"
import { useTranslation } from "react-i18next"

export const CurrentDepositReadMore: FC = () => {
  const { t } = useTranslation()

  return (
    <Text
      fs={14}
      lh="1.4"
      color="basic100"
      css={{ textDecoration: "underline" }}
      as="a"
      {...({
        href: "#",
        target: "_blank",
        rel: "noopener noreferrer",
      } satisfies AnchorHTMLAttributes<HTMLAnchorElement>)}
    >
      {t("readMore")}
    </Text>
  )
}
