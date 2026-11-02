import { Wrench } from "@galacticcouncil/ui/assets/icons"
import { Button } from "@galacticcouncil/ui/components"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

export function Devtools() {
  return (
    <TanStackDevtools
      config={{
        customTrigger: () => (
          <Button
            icon={Wrench}
            variant="ghost"
            sx={{ position: "fixed", top: 0, left: 0 }}
          />
        ),
      }}
      plugins={[
        {
          name: "TanStack Query",
          render: <ReactQueryDevtoolsPanel />,
        },
        {
          name: "TanStack Router",
          render: <TanStackRouterDevtoolsPanel />,
        },
      ]}
    />
  )
}
