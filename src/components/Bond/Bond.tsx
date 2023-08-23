import { Button } from "components/Button/Button"
import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"
import { MouseEventHandler, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { SBond, SItem } from "./Bond.styled"
import { Icon } from "components/Icon/Icon"

type BondView = "card" | "list"

type Props = {
  view?: BondView
  icon: ReactNode
  title: string
  maturity: string
  endingIn: string
  discount: string
  onDetailClick: MouseEventHandler<HTMLButtonElement>
}

export const Bond = ({
  view,
  icon,
  title,
  maturity,
  endingIn,
  onDetailClick,
  discount,
}: Props) => {
  const { t } = useTranslation()

  const headingFs = view === "card" ? ([19, 26] as const) : ([19, 21] as const)

  return (
    <SBond view={view ?? "list"}>
      <div
        sx={{
          flex: "row",
          align: "center",
          gap: 16,
          mb: view === "card" ? 12 : [12, 0],
        }}
      >
        <Icon icon={icon} size={26} />
        <Heading fs={headingFs} lh={headingFs} sx={{ mt: 3 }}>
          {title}
        </Heading>
      </div>
      <SItem>
        <Text color="basic400" sx={{ mb: 4 }}>
          {t("bond.maturity")}
        </Text>
        <Text color="white">{maturity}</Text>
      </SItem>
      <SItem>
        <Text color="basic400" sx={{ mb: 4 }}>
          {t("bond.endingIn")}
        </Text>
        <Text color="white">{endingIn}</Text>
      </SItem>
      <SItem>
        <Text color="basic400" sx={{ mb: 4 }}>
          {t("bond.discount")}
        </Text>
        <Text color="white">{t("value.percentage", { value: discount })}</Text>
      </SItem>
      <Button
        fullWidth={true}
        onClick={onDetailClick}
        sx={{ mt: view === "card" ? 12 : [12, 0] }}
      >
        Details
      </Button>
    </SBond>
  )
}
