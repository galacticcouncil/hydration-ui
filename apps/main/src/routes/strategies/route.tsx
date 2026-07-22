import { createFileRoute } from "@tanstack/react-router"
import { FC } from "react"

import { getPageMeta } from "@/config/navigation"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"

const StrategiesLayout: FC = () => {
  return <SubpageLayout hideSubpageMenu />
}

export const Route = createFileRoute("/strategies")({
  component: StrategiesLayout,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategies", i18n.t),
  }),
})
