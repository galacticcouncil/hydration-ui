import { Box, Flex, Text } from "@/components"

export type ChartStatusProps = {
  icon: React.ReactNode
  message?: string
}

export const ChartStatus: React.FC<ChartStatusProps> = ({ icon, message }) => {
  return (
    <Flex direction="column" align="center" justify="center" maxWidth={200}>
      <Box sx={{ flexShrink: 0 }}>{icon}</Box>
      {message && (
        <Text align="center" fs="p3" fw={500}>
          {message}
        </Text>
      )}
    </Flex>
  )
}
