import { FC, ReactNode } from "react"

import { MoveRight, Warning } from "@/assets/icons"
import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"
import { getToken, px } from "@/utils"

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
    <Flex direction="column" gap={8}>
      <Flex justify="space-between" align="center">
        <Flex
          gap={2}
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
      <Text fw={400} fs={11} lh={px(15)} color={getToken("text.medium")}>
        {description}
      </Text>
    </Flex>
  )
}

type AssetPropertyChangedProps = {
  readonly previous: ReactNode
  readonly current: ReactNode
}

export const AssetPropertyChanged: FC<AssetPropertyChangedProps> = ({
  previous,
  current,
}) => {
  return (
    <Flex gap={6} align="center">
      <Text fw={600} fs="p5" color={getToken("text.high")}>
        {previous}
      </Text>
      <MoveRight sx={{ color: getToken("accents.danger.secondary") }} />
      <Text fw={600} fs="p5" color={getToken("text.high")}>
        {current}
      </Text>
    </Flex>
  )
}
