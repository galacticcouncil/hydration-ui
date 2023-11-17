import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { InvalidateOnBlock } from "components/InvalidateOnBlock"
import { OnboardProvider } from "components/OnboardProvider/OnboardProvider"
import { ToastProvider } from "components/Toast/ToastProvider"
import { RpcProvider } from "providers/rpcProvider"
import { FC, PropsWithChildren } from "react"
import { SkeletonTheme } from "react-loading-skeleton"
import { Transactions } from "sections/transaction/Transactions"
import { theme } from "theme"

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  console.log("Preview App")
  return (
    <TooltipProvider>
      <RpcProvider>
        <OnboardProvider>
          <InvalidateOnBlock>
            <ToastProvider>
              <SkeletonTheme
                baseColor={`rgba(${theme.rgbColors.white}, 0.12)`}
                highlightColor={`rgba(${theme.rgbColors.white}, 0.24)`}
                borderRadius={4}
              >
                {children}
                <Transactions />
              </SkeletonTheme>
            </ToastProvider>
          </InvalidateOnBlock>
        </OnboardProvider>
      </RpcProvider>
    </TooltipProvider>
  )
}
