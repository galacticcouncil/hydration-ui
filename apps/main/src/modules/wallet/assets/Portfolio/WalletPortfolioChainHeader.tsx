import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Skeleton, Text } from "@galacticcouncil/ui/components"
import { HYDRATION_PARACHAIN_ID } from "@galacticcouncil/utils"
import { ComponentPropsWithoutRef, forwardRef } from "react"

import { ChainLogo } from "@/components/ChainLogo"
import { SPortfolioChainHeaderButton } from "@/modules/wallet/assets/Portfolio/WalletPortfolio.styled"

type Props = ComponentPropsWithoutRef<"button"> & {
  readonly totalDisplay: string
  readonly isLoading: boolean
  readonly isExpandable?: boolean
}

export const WalletPortfolioChainHeader = forwardRef<HTMLButtonElement, Props>(
  ({ totalDisplay, isLoading, isExpandable = false, ...props }, ref) => {
    return (
      <SPortfolioChainHeaderButton
        ref={ref}
        {...props}
        isExpandable={isExpandable}
      >
        <Flex align="center" gap="s">
          <ChainLogo chainId={HYDRATION_PARACHAIN_ID} size="extra-small" />
          <Text fs="p5" fw={600} lh={1.2} color="text.high">
            Hydration
          </Text>
        </Flex>
        {isExpandable && (
          <Flex align="center" gap="base">
            <Text fs="p6" fw={500} lh={1.4} color="text.high">
              {isLoading ? (
                <Skeleton width="4rem" height="1em" />
              ) : (
                totalDisplay
              )}
            </Text>
            <Icon size="s" component={ChevronDown} />
          </Flex>
        )}
      </SPortfolioChainHeaderButton>
    )
  },
)

WalletPortfolioChainHeader.displayName = "WalletPortfolioChainHeader"
