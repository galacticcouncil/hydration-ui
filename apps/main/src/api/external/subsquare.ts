import { queryOptions } from "@tanstack/react-query"
import { millisecondsInMinute } from "date-fns/constants"
import z from "zod"

export const getSubsquareEndpoint = (address: string, indexerUrl: string) =>
  `${indexerUrl}/subsquare/users/${address}/referenda/votes?page_size=100&includes_title=1`

export enum SubsquareVoteState {
  Ongoing = "Ongoing",
  Killed = "Killed",
  Executed = "Executed",
  TimedOut = "TimedOut",
  Rejected = "Rejected",
  Confirming = "Confirming",
  Deciding = "Deciding",
  Approved = "Approved",
  Preparing = "Preparing",
}

const schema = z.object({
  items: z.array(
    z.object({
      referendumIndex: z.number(),
      balance: z.string(),
      aye: z.boolean(),
      conviction: z.number(),
      queryAt: z.number(),
      proposal: z.object({
        state: z.object({
          name: z.enum(SubsquareVoteState),
          indexer: z.object({
            blockHeight: z.number(),
          }),
        }),
      }),
    }),
  ),
})

export const accountVotesQuery = (address: string, indexerUrl: string) =>
  queryOptions({
    queryKey: ["subsquareAccountVotes", address],
    queryFn: async () => {
      const res = await fetch(getSubsquareEndpoint(address, indexerUrl))
      const data = await res.json()
      const parsed = schema.parse(data)
      return parsed
    },
    enabled: !!address,
    staleTime: millisecondsInMinute,
    gcTime: millisecondsInMinute,
  })
