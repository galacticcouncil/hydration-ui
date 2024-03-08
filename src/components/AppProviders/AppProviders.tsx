import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { ToastProvider } from "components/Toast/ToastProvider"
import { FC, PropsWithChildren, Suspense, lazy } from "react"
import { SkeletonTheme } from "react-loading-skeleton"
import { theme } from "theme"
import HydraLogoFull from "assets/icons/HydraLogoFull.svg?react"
import { Spinner } from "components/Spinner/Spinner"

const RpcProvider = lazy(async () => ({
  default: (await import("providers/rpcProvider")).RpcProvider,
}))

const InvalidateOnBlock = lazy(async () => ({
  default: (await import("components/InvalidateOnBlock")).InvalidateOnBlock,
}))

const HydraSplash = () => {
  return (
    <div
      sx={{
        flex: "column",
        justify: "center",
        align: "center",
      }}
      css={{
        transform: "scale(2)",
        position: "fixed",
        inset: "0",
        height: "100vh",
        width: "100vw",
        zIndex: 1000,
      }}
    >
      <HydraLogoFull />
      <Spinner />
    </div>
  )
}

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <TooltipProvider>
      <Suspense fallback={<HydraSplash />}>
        <RpcProvider>
          <InvalidateOnBlock>
            <ToastProvider>
              <SkeletonTheme
                baseColor={`rgba(${theme.rgbColors.white}, 0.12)`}
                highlightColor={`rgba(${theme.rgbColors.white}, 0.24)`}
                borderRadius={4}
              >
                {children}
              </SkeletonTheme>
            </ToastProvider>
          </InvalidateOnBlock>
        </RpcProvider>
      </Suspense>
    </TooltipProvider>
  )
}
