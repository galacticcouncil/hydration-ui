import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, SpinnerIcon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { ComponentPropsWithoutRef, forwardRef } from "react"

import { ChainLogo } from "@/components/ChainLogo"
import {
  SPortfolioChainHeaderButton,
  SPortfolioChainHeaderTotal,
} from "@/modules/portfolio/overview/PortfolioOverview.styled"

type Props = ComponentPropsWithoutRef<"button"> & {
  readonly name: string
  readonly chainId: string | number
  readonly chainKey?: string
  readonly ecosystem?: ChainEcosystem
  readonly totalDisplay?: string
  readonly isLoading: boolean
  readonly isExpandable?: boolean
  readonly replaceLogoWhenLoading?: boolean
}

export const PortfolioChainHeader = forwardRef<HTMLButtonElement, Props>(
  (
    {
      name,
      chainId,
      chainKey,
      ecosystem,
      totalDisplay,
      isLoading,
      isExpandable = false,
      replaceLogoWhenLoading = true,
      ...props
    },
    ref,
  ) => {
    const showLogoSpinner = isLoading && replaceLogoWhenLoading
    const showTotalSpinner = isLoading && !replaceLogoWhenLoading

    return (
      <SPortfolioChainHeaderButton
        ref={ref}
        {...props}
        isExpandable={isExpandable}
      >
        <Flex
          align="center"
          gap="s"
          color={isLoading ? getToken("text.medium") : undefined}
        >
          {showLogoSpinner ? (
            <SpinnerIcon size="xs" />
          ) : (
            <ChainLogo
              chainId={chainId}
              chainKey={chainKey}
              ecosystem={ecosystem}
              size="extra-small"
            />
          )}
          <Text
            fs="p5"
            fw={600}
            lh={1.2}
            color={isLoading ? getToken("text.medium") : getToken("text.high")}
          >
            {name}
          </Text>
        </Flex>
        {isExpandable && (
          <Flex align="center" gap="base">
            <SPortfolioChainHeaderTotal>
              {showTotalSpinner && (
                <Flex color={getToken("text.medium")}>
                  <SpinnerIcon size="s" />
                </Flex>
              )}
              {!isLoading && totalDisplay && (
                <Text fs="p6" fw={500} lh={1.4} color={getToken("text.high")}>
                  {totalDisplay}
                </Text>
              )}
            </SPortfolioChainHeaderTotal>
            <Icon size="s" component={ChevronDown} data-chevron />
          </Flex>
        )}
      </SPortfolioChainHeaderButton>
    )
  },
)

PortfolioChainHeader.displayName = "PortfolioChainHeader"
