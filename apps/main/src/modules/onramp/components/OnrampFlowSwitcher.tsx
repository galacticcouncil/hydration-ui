import {
  Button,
  Grid,
  TabsList,
  TabsTrigger,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createContext, FC, useContext } from "react"
import { createPortal } from "react-dom"

export const OnrampFlowSwitcherContext = createContext<HTMLElement | null>(null)

type OnrampFlowSwitcherProps = {
  label: string
  value: string
  options: { value: string; label: string }[]
  disabled?: boolean
}

export const OnrampFlowSwitcher: FC<OnrampFlowSwitcherProps> = ({
  label,
  value,
  options,
  disabled = false,
}) => {
  const container = useContext(OnrampFlowSwitcherContext)
  if (!container) return null

  // Keep the local tabs context and dialog focus trap while placing the tabs
  // outside the modal surface and its animated content viewport.
  return createPortal(
    <TabsList aria-label={label} asChild>
      <Grid
        gap="xs"
        columnTemplate={`repeat(${options.length}, max-content)`}
        width="max-content"
        maxWidth={["100%", "none"]}
        minWidth={0}
        flexShrink={0}
        sx={{ overflowX: ["auto", "visible"] }}
        p="xs"
        borderRadius="full"
        bg={getToken("surfaces.containers.dim.dimOnBg")}
      >
        {options.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            disabled={disabled}
            asChild
          >
            <Button
              size="small"
              sx={{ px: "m" }}
              disabled={disabled}
              variant={option.value === value ? "secondary" : "tertiary"}
            >
              {option.label}
            </Button>
          </TabsTrigger>
        ))}
      </Grid>
    </TabsList>,
    container,
  )
}
