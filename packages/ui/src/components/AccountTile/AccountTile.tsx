import { shortenAccountAddress } from "@galacticcouncil/utils"
import { FC } from "react"

import { AccountAvatar } from "@/components/AccountAvatar"
import { Flex, FlexProps } from "@/components/Flex"
import { Logo } from "@/components/Logo"
import { Text } from "@/components/Text"
import { getToken, getTokenPx, px } from "@/utils"

import { SAccountTileContainer } from "./AccountTile.styled"

type Props = {
  readonly name: string
  readonly address: string
  readonly value?: string
  readonly active?: boolean
  readonly label?: string
  readonly className?: string
  readonly walletLogoSrc?: string
  readonly shortenAddress?: boolean
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
  shortenAddress = true,
  ...props
}) => {
  return (
    <Flex
      direction="column"
      gap={getTokenPx("containers.paddings.quint")}
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
        <Flex direction="column" gap={4} sx={{ minWidth: 0 }}>
          <Flex gap={4} align="center">
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
          <Flex gap={2}>
            <Text fs="p5" lh={px(15)} truncate color={getToken("text.medium")}>
              {shortenAddress ? shortenAccountAddress(address) : address}
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
