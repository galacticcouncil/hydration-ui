import { SubSquare } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ExternalLink,
  Flex,
  Icon,
} from "@galacticcouncil/ui/components"
import { REFERENDA_URL } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { VoteModal } from "@/modules/staking/VoteModal"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

type Props = {
  readonly id: number
  readonly classId: number
  readonly voted: boolean
}

export const ReferendaFooter: FC<Props> = ({ id, classId, voted }) => {
  const { t } = useTranslation("staking")
  const { papi, dataEnv } = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const [voteOpen, setVoteOpen] = useState(false)

  const handleRemoveVote = () => {
    createTransaction({
      tx: papi.tx.ConvictionVoting.remove_vote({ class: classId, index: id }),
      invalidateQueries: [
        ["accountOpenGovVotes", account?.address ?? ""],
        ["openGovReferenda", dataEnv],
      ],
    })
  }

  return (
    <>
      <Flex direction="row" gap="s">
        {voted ? (
          <Button
            size="large"
            variant="secondary"
            sx={{ flex: 1 }}
            onClick={handleRemoveVote}
          >
            {t("referenda.item.removeVote")}
          </Button>
        ) : (
          <Button
            size="large"
            variant="primary"
            sx={{ flex: 1 }}
            onClick={() => setVoteOpen(true)}
          >
            {t("referenda.item.vote")}
          </Button>
        )}
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
