import { FC, ReactNode } from "react"

import { MoveRight, Warning } from "@/assets/icons"
import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

type AssetWarningProps = {
  readonly title: string
  readonly description: string
  readonly titleInfo?: ReactNode
}

export const AssetWarning: FC<AssetWarningProps> = ({
  title,
  description,
  titleInfo,
}) => {
  return (
    <Flex direction="column" gap="base">
      <Flex justify="space-between" align="center">
        <Flex
          gap="xs"
          align="center"
          color={getToken("accents.danger.secondary")}
        >
          <Warning />
          <Text fw={500} fs="p5" lh={1.2}>
            {title}
          </Text>
        </Flex>
        {titleInfo}
      </Flex>
      <Text fw={400} fs="p6" lh="s" color={getToken("text.medium")}>
        {description}
      </Text>
    </Flex>
  )
}

type AssetPropertyChangedProps = {
  readonly previous: ReactNode | bigint
  readonly current: ReactNode | bigint
}

export const AssetPropertyChanged: FC<AssetPropertyChangedProps> = ({
  previous,
  current,
}) => {
  return (
    <Flex gap="s" align="center">
      <Text fw={600} fs="p5" color={getToken("text.high")}>
        {typeof previous === "bigint" ? previous.toString() : previous}
      </Text>
      <MoveRight sx={{ color: getToken("accents.danger.secondary") }} />
      <Text fw={600} fs="p5" color={getToken("text.high")}>
        {typeof current === "bigint" ? current.toString() : current}
      </Text>
    </Flex>
  )
}
