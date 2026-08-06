import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, SpinnerIcon, Text } from "@galacticcouncil/ui/components"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { ComponentPropsWithoutRef, forwardRef } from "react"

import { ChainLogo } from "@/components/ChainLogo"
import { SPortfolioChainHeaderButton } from "@/modules/wallet/assets/Portfolio/WalletPortfolio.styled"

type Props = ComponentPropsWithoutRef<"button"> & {
  readonly name: string
  readonly chainId: string | number
  readonly ecosystem?: ChainEcosystem
  readonly totalDisplay?: string
  readonly isLoading: boolean
  readonly isExpandable?: boolean
}

export const WalletPortfolioChainHeader = forwardRef<HTMLButtonElement, Props>(
  (
    {
      name,
      chainId,
      ecosystem,
      totalDisplay,
      isLoading,
      isExpandable = false,
      ...props
    },
    ref,
  ) => {
    return (
      <SPortfolioChainHeaderButton
        ref={ref}
        {...props}
        isExpandable={isExpandable}
      >
        <Flex align="center" gap="s">
          <ChainLogo
            chainId={chainId}
            ecosystem={ecosystem}
            size="extra-small"
          />
          <Text fs="p5" fw={600} lh={1.2} color="text.high">
            {name}
          </Text>
        </Flex>
        {isExpandable && (
          <Flex align="center" gap="base">
            {isLoading ? (
              <SpinnerIcon size="s" />
            ) : (
              totalDisplay && (
                <Text fs="p6" fw={500} lh={1.4} color="text.high">
                  {totalDisplay}
                </Text>
              )
            )}
            <Icon size="s" component={ChevronDown} />
          </Flex>
        )}
      </SPortfolioChainHeaderButton>
    )
  },
)

WalletPortfolioChainHeader.displayName = "WalletPortfolioChainHeader"
