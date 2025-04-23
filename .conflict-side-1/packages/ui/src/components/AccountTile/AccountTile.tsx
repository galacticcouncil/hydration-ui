import { shortenAccountAddress } from "@galacticcouncil/utils"
import { FC } from "react"

import { Identicon } from "@/assets/icons"
import { Flex } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { getToken, getTokenPx, px } from "@/utils"

import { SAccountTileContainer } from "./AccountTile.styled"

type Props = {
  readonly name: string
  readonly symbol: string
  readonly address: string
  readonly value: string
  readonly active?: boolean
  readonly label?: string
  readonly className?: string
  readonly onClick?: () => void
}

export const AccountTile: FC<Props> = ({
  name,
  symbol,
  address,
  value,
  active,
  label,
  className,
  onClick,
}) => {
  return (
    <Flex direction="column" gap={getTokenPx("containers.paddings.quint")}>
      {label && (
        <Text fw={500} fs="p5" lh={1.2} color={getToken("text.medium")}>
          {label}
        </Text>
      )}
      <SAccountTileContainer
        active={active}
        className={className}
        onClick={onClick}
      >
        <Icon component={Identicon} size={32} />
        <Flex direction="column" gap={4}>
          <Flex gap={4}>
            {/* TODO blockchain icon */}
            <Text fw={500} fs="p3" lh={1} color={getToken("text.high")}>
              {name}
            </Text>
          </Flex>
          <Flex gap={2}>
            <Text fw={500} fs="p5" lh={px(15)} color={getToken("text.high")}>
              {symbol}:
            </Text>
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
