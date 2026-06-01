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

import { nativeTokenLocksQuery } from "@/api/balances"
import { accountOpenGovVotesQuery } from "@/api/democracy"
import { VoteModal } from "@/modules/staking/components/VoteModal/VoteModal"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"

type Props = {
  readonly id: number
  readonly classId: number
  readonly voted: boolean
  readonly isGigaStaking?: boolean
}

export const ReferendaFooter: FC<Props> = ({
  id,
  classId,
  voted,
  isGigaStaking,
}) => {
  const { t } = useTranslation("staking")
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { isBalanceLoading } = useAccountBalances()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const [voteOpen, setVoteOpen] = useState(false)

  const accountAddress = account?.address ?? ""

  const handleRemoveVote = () => {
    const toasts = {
      submitted: t("referenda.remove.toasts.submitted", {
        referendumId: id,
      }),
      success: t("referenda.remove.toasts.success", {
        referendumId: id,
      }),
    }
    createTransaction({
      tx: rpc.papi.tx.ConvictionVoting.remove_vote({
        class: classId,
        index: id,
      }),
      invalidateQueries: [
        accountOpenGovVotesQuery(rpc, accountAddress).queryKey,
        nativeTokenLocksQuery(rpc, accountAddress).queryKey,
      ],
      toasts,
    })
  }

  return (
    <>
      <Flex direction="row" justify="end" gap="s" p="l">
        {voted ? (
          <Button
            size="medium"
            variant="secondary"
            onClick={handleRemoveVote}
            minWidth={140}
            sx={{ flex: 1 }}
          >
            {t("referenda.item.removeVote")}
          </Button>
        ) : (
          <Button
            size="medium"
            variant="primary"
            onClick={() => setVoteOpen(true)}
            disabled={isBalanceLoading}
            minWidth={140}
            sx={{ flex: 1 }}
          >
            {t("referenda.item.vote")}
          </Button>
        )}
        <Button
          size="medium"
          variant="tertiary"
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
        isGigaStaking={isGigaStaking}
      />
    </>
  )
}
