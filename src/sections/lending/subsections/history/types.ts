import { EventDataFragment } from "graphql/__generated__/squid/graphql"

export type EventName = Capitalize<keyof EventDataFragment>
