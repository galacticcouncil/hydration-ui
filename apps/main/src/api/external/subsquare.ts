import { queryOptions } from "@tanstack/react-query"
import { millisecondsInMinute } from "date-fns/constants"
import z from "zod"

export const getSubsquareEndpoint = (address: string) =>
  `https://orca-main-aggr-indx.indexer.hydration.cloud/proxy/subsquare/users/${address}/referenda/votes?page_size=100&includes_title=1`

export enum SubsquareVoteState {
  Ongoing = "Ongoing",
  Killed = "Killed",
  Executed = "Executed",
  TimedOut = "TimedOut",
  Rejected = "Rejected",
  Confirming = "Confirming",
  Deciding = "Deciding",
  Approved = "Approved",
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

export const accountVotesQuery = (address: string) =>
  queryOptions({
    queryKey: ["subsquareAccountVotes", address],
    queryFn: async () => {
      const res = await fetch(getSubsquareEndpoint(address))
      const data = await res.json()
      const parsed = schema.parse(data)
      return parsed
    },
    enabled: !!address,
    staleTime: millisecondsInMinute,
    gcTime: millisecondsInMinute,
  })
