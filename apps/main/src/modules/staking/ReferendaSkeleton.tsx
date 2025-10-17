import { SubSquare } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Grid,
  Icon,
  Skeleton,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  SReferenda,
  SReferendaProgress,
} from "@/modules/staking/Referenda.styled"
import { ReferendaSeparator } from "@/modules/staking/ReferendaSeparator"

export const ReferendaSkeleton: FC = () => {
  const { t } = useTranslation(["staking"])

  return (
    <SReferenda>
      <Skeleton sx={{ mb: 5 }} height={22} width={200} />
      <ReferendaSeparator />
      <Skeleton height={22} width="100%" />
      <Flex pt={10} pb={6} direction="column" gap={21}>
        <SReferendaProgress size="large">
          <Grid flex={1}>
            <Skeleton sx={{ lineHeight: "5px" }} />
          </Grid>
          <Grid flex={1}>
            <Skeleton sx={{ lineHeight: "5px" }} />
          </Grid>
        </SReferendaProgress>
        <SReferendaProgress size="small">
          <Grid flex={1}>
            <Skeleton sx={{ lineHeight: "5px" }} />
          </Grid>
        </SReferendaProgress>
      </Flex>
      <ReferendaSeparator />
      <Flex justify="flex-end">
        <Button size="large" disabled width="min-content">
          <Icon component={SubSquare} size={14} color="white" />
          {t("staking:referenda.item.cta")}
        </Button>
      </Flex>
    </SReferenda>
  )
}
