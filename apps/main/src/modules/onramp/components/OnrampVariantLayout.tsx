import { TabsContent } from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"

import { OnrampFlowSwitcher } from "./OnrampFlowSwitcher"
import {
  SOnrampVariantContent,
  SOnrampVariantRoot,
} from "./OnrampVariantLayout.styled"

type OnrampVariantLayoutProps = {
  value: string
  label: string
  options: { value: string; label: string }[]
  onValueChange: (value: string) => void
  disabled?: boolean
  desktopMinHeight?: number
  children: ReactNode
}

export const OnrampVariantLayout: FC<OnrampVariantLayoutProps> = ({
  value,
  label,
  options,
  onValueChange,
  disabled = false,
  desktopMinHeight,
  children,
}) => (
  <SOnrampVariantRoot
    desktopMinHeight={desktopMinHeight}
    value={value}
    activationMode="manual"
    onValueChange={(next) => {
      if (!disabled) onValueChange(next)
    }}
  >
    <TabsContent value={value} asChild>
      <SOnrampVariantContent direction="column" width="100%">
        {children}
      </SOnrampVariantContent>
    </TabsContent>
    <OnrampFlowSwitcher
      label={label}
      value={value}
      options={options}
      disabled={disabled}
    />
  </SOnrampVariantRoot>
)
