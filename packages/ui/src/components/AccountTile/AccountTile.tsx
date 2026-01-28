import { shortenAccountAddress } from "@galacticcouncil/utils"
import { FC } from "react"

import { AccountAvatar } from "@/components/AccountAvatar"
import { Flex, FlexProps } from "@/components/Flex"
import { Logo } from "@/components/Logo"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

import { SAccountTileContainer } from "./AccountTile.styled"

type Props = {
  readonly name: string
  readonly address: string
  readonly value?: string
  readonly active?: boolean
  readonly label?: string
  readonly className?: string
  readonly walletLogoSrc?: string
  readonly onClick?: () => void
} & FlexProps

export const AccountTile: FC<Props> = ({
  name,
  address,
  value,
  active,
  label,
  className,
  walletLogoSrc,
  onClick,
  ...props
}) => {
  return (
    <Flex
      direction="column"
      gap="s"
      onClick={onClick}
      as={onClick ? "button" : "div"}
      {...props}
    >
      {label && (
        <Text fw={500} fs="p5" lh={1.2} color={getToken("text.medium")}>
          {label}
        </Text>
      )}
      <SAccountTileContainer
        active={active}
        className={className}
        isInteractive={!!onClick}
      >
        <AccountAvatar address={address} />
        <Flex direction="column" gap="s">
          <Flex gap="s" align="center">
            {walletLogoSrc && <Logo size="extra-small" src={walletLogoSrc} />}
            <Text
              fw={500}
              fs="p3"
              lh={1}
              color={getToken("text.high")}
              truncate={160}
            >
              {name}
            </Text>
          </Flex>
          <Flex gap="xs">
            <Text fs="p5" color={getToken("text.medium")}>
              {shortenAccountAddress(address)}
            </Text>
          </Flex>
        </Flex>
        {value && (
          <Text fw={500} fs="p3" lh={1} color={getToken("text.high")}>
            {value}
          </Text>
        )}
      </SAccountTileContainer>
    </Flex>
  )
}
