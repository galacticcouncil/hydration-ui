import { EventDataFragment } from "@/codegen/__generated__/squid/graphql"

export type EventName = Capitalize<keyof EventDataFragment>
