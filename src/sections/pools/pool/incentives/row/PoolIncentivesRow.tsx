import { Box } from "components/Box/Box"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { FC, ReactNode } from "react"

type Props = {
  icon: ReactNode
  name: string
  value: string
}

export const PoolIncentivesRow: FC<Props> = ({ icon, name, value }) => (
  <Box flex acenter spread mb={13}>
    <Icon icon={icon} mr={10} size={28} />
    <Text color="white" fw={700}>
      {name}
    </Text>
    <Text ml={"auto"} fw={700} color="primary200">
      {value + "% APR"}
    </Text>
  </Box>
)
