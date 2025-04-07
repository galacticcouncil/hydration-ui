import { OpenGovReferendum, TAccountVote } from "api/democracy"
import { groupBy } from "utils/rx"

type OpenGovReferendumWithVoted = OpenGovReferendum & {
  readonly hasVoted: boolean
}

export const splitReferendaByVoted = (
  referendas: ReadonlyArray<OpenGovReferendum>,
  accountVotes: ReadonlyArray<TAccountVote>,
) => {
  const openGovWithVoted = referendas.map<OpenGovReferendumWithVoted>(
    (referendum) => {
      const hasVoted = accountVotes.some((vote) => vote.id === referendum.id)

      return { ...referendum, hasVoted }
    },
  )

  const openGovGroup = groupBy(openGovWithVoted, (referendum) =>
    String(referendum.hasVoted),
  )

  const openGovNonVoted = openGovGroup["false"] ?? []
  const openGovVoted = openGovGroup["true"] ?? []

  return {
    openGovNonVoted,
    openGovVoted,
  }
}
