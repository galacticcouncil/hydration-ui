import { shortenAccountAddress } from "@galacticcouncil/utils"
import { FC } from "react"

import { AccountAvatar } from "@/components/AccountAvatar"
import { Flex } from "@/components/Flex"
import { Logo } from "@/components/Logo"
import { Text } from "@/components/Text"
import { getToken, getTokenPx, px } from "@/utils"

import { SAccountTileContainer } from "./AccountTile.styled"

type Props = {
  readonly name: string
  readonly address: string
  readonly value: string
  readonly active?: boolean
  readonly label?: string
  readonly className?: string
  readonly walletLogoSrc?: string
  readonly onClick?: () => void
}

export const AccountTile: FC<Props> = ({
  name,
  address,
  value,
  active,
  label,
  className,
  walletLogoSrc,
  onClick,
}) => {
  return (
    <Flex
      direction="column"
      gap={getTokenPx("containers.paddings.quint")}
      onClick={onClick}
      as={onClick ? "button" : "div"}
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
        <Flex direction="column" gap={4}>
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
            <Text fs="p5" lh={px(15)} color={getToken("text.medium")}>
              {shortenAccountAddress(address)}
            </Text>
          </Flex>
        </Flex>
        <Text fw={500} fs="p3" lh={1} color={getToken("text.high")}>
          {value}
        </Text>
      </SAccountTileContainer>
    </Flex>
  )
}
