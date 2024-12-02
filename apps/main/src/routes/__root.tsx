import { Flex, Text } from "@galacticcouncil/ui/components"
import { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createRootRouteWithContext,
  ScrollRestoration,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

import { MainLayout } from "@/modules/layout/MainLayout"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <Flex justify="center">
        <Text as="h1" font="Primary-Font" fs={40}>
          404 - Not Found
        </Text>
      </Flex>
    )
  },
})

function RootComponent() {
  return (
    <>
      <MainLayout />
      <ScrollRestoration />
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}
