import { SubSquare } from "@galacticcouncil/ui/assets/icons"
import { Button, ExternalLink, Icon } from "@galacticcouncil/ui/components"
import { REFERENDA_URL } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly id: number
  readonly voted: boolean
}

export const ReferendaFooter: FC<Props> = ({ id, voted }) => {
  const { t } = useTranslation(["common", "staking"])

  return (
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
      <ExternalLink href={REFERENDA_URL(id)}>
        <Icon component={SubSquare} size={14} color="white" />
        {voted ? t("open") : t("staking:referenda.item.cta")}
      </ExternalLink>
    </Button>
  )
}
