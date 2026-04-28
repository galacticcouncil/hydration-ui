import { SubSquare } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ExternalLink,
  Flex,
  Icon,
} from "@galacticcouncil/ui/components"
import { REFERENDA_URL } from "@galacticcouncil/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { VoteModal } from "@/modules/staking/VoteModal"

type Props = {
  readonly id: number
}

export const ReferendaFooter: FC<Props> = ({ id }) => {
  const { t } = useTranslation("staking")
  const [voteOpen, setVoteOpen] = useState(false)

  return (
    <>
      <Flex direction="row" gap="s">
        <Button
          size="large"
          variant="primary"
          sx={{ flex: 1 }}
          onClick={() => setVoteOpen(true)}
        >
          {t("referenda.item.vote")}
        </Button>
        <Button
          size="large"
          variant="secondary"
          outline
          asChild
          aria-label={t("referenda.item.openOnSubSquare")}
        >
          <ExternalLink href={REFERENDA_URL(id)}>
            <Icon component={SubSquare} />
          </ExternalLink>
        </Button>
      </Flex>
      <VoteModal
        referendumId={id}
        open={voteOpen}
        onClose={() => setVoteOpen(false)}
      />
    </>
  )
}
