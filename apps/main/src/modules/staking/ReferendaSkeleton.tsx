import { SubSquare } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
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

export const ReferendaSkeleton: FC = () => {
  const { t } = useTranslation(["staking"])

  return (
    <SReferenda>
      <Box py="m" px="l">
        <Skeleton sx={{ mb: 5 }} height="m" width="12.5rem" />
      </Box>

      <Flex pt="base" pb="s" px="l" direction="column" gap="xl">
        <Skeleton height="m" width="100%" />
        <SReferendaProgress size="large">
          <Grid columns={2} gap="s" width="100%">
            <Skeleton sx={{ lineHeight: "5px" }} />
            <Skeleton sx={{ lineHeight: "5px" }} />
          </Grid>
        </SReferendaProgress>
        <SReferendaProgress size="small">
          <Grid flex={1}>
            <Skeleton sx={{ lineHeight: "5px" }} />
          </Grid>
        </SReferendaProgress>
      </Flex>

      <Flex justify="flex-end" py="m" px="l">
        <Button
          size="medium"
          variant="tertiary"
          outline
          disabled
          aria-label={t("referenda.item.openOnSubSquare")}
        >
          <Icon component={SubSquare} />
        </Button>
      </Flex>
    </SReferenda>
  )
}
