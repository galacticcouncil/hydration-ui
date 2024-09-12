import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { InvalidateOnBlock } from "components/InvalidateOnBlock"
import { ToastProvider } from "components/Toast/ToastProvider"
import { RpcProvider } from "providers/rpcProvider"
import { FC, PropsWithChildren } from "react"
import { SkeletonTheme } from "react-loading-skeleton"
import { theme } from "theme"
import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent } from "@lit-labs/react"
import { ProviderReloader } from "sections/provider/ProviderReloader"
import { MigrationProvider } from "sections/migration/MigrationProvider"

const AppsContextProvider = createComponent({
  tagName: "gc-context-provider",
  elementClass: Apps.ContextProvider,
  react: React,
})

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <MigrationProvider>
      <TooltipProvider>
        <RpcProvider>
          <ProviderReloader>
            <InvalidateOnBlock>
              <ToastProvider>
                <SkeletonTheme
                  baseColor={`rgba(${theme.rgbColors.white}, 0.12)`}
                  highlightColor={`rgba(${theme.rgbColors.white}, 0.24)`}
                  borderRadius={4}
                >
                  <AppsContextProvider>{children}</AppsContextProvider>
                </SkeletonTheme>
              </ToastProvider>
            </InvalidateOnBlock>
          </ProviderReloader>
        </RpcProvider>
      </TooltipProvider>
    </MigrationProvider>
  )
}
