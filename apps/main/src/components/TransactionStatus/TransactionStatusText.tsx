import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

export type TransactionStatusTextProps = {
  title: string
  description: string
}

export const TransactionStatusText: React.FC<TransactionStatusTextProps> = ({
  title,
  description,
}) => {
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      gap="base"
      maxWidth="5xl"
    >
      <Text as="h2" align="center" fs="h7" fw={500} font="primary">
        {title}
      </Text>
      <Text fs="p5" align="center" color={getToken("text.medium")}>
        {description}
      </Text>
    </Flex>
  )
}
