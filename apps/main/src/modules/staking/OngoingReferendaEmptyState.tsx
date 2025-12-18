import ReferendaEmptyState from "@galacticcouncil/ui/assets/images/ReferendaEmptyState.webp"
import {
  Button,
  ExternalLink,
  Flex,
  Image,
  Paper,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { REFERENDA_HISTORY_URL } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"

export const OngoingReferendaEmptyState: FC = () => {
  const { t } = useTranslation("staking")

  return (
    <Paper py={getTokenPx("containers.paddings.primary")} px={30}>
      <Flex direction="column" gap={20} align="center">
        <EmptyState
          sx={{ maxWidth: "100%", pb: 0 }}
          icon={<Image src={ReferendaEmptyState} width={100} height={100} />}
          header={t("referenda.emptyState.header")}
          description={t("referenda.emptyState.description")}
        />
        <Button variant="emphasis" outline asChild>
          <ExternalLink href={REFERENDA_HISTORY_URL}>
            {t("referenda.openArchive")}
          </ExternalLink>
        </Button>
      </Flex>
    </Paper>
  )
}
