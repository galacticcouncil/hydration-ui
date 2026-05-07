import {
  Box,
  Flex,
  Paper,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { gigaUnstakePositionsQuery } from "@/api/gigaStake"
import { UnstakingPosition } from "@/modules/staking/gigaStaking/UnstakingPosition"
import { useRpcProvider } from "@/providers/rpcProvider"

export const UnstakingPositions: FC = () => {
  const { t } = useTranslation("staking")
  const { account } = useAccount()
  const rpc = useRpcProvider()

  const { data: pendingPosition } = useQuery(
    gigaUnstakePositionsQuery(rpc, account?.address ?? ""),
  )

  if (!pendingPosition) {
    return null
  }

  return (
    <Paper asChild>
      <Flex direction="column" py="l" gap="l">
        <Flex direction="column" gap="xs" px="l">
          <Text
            font="primary"
            fw={500}
            fs="h7"
            lh={1}
            color={getToken("text.high")}
          >
            {t("gigaStaking.unstakingPositions.title")}
          </Text>
          <Text fs="p5" lh="m" color={getToken("text.medium")}>
            {t("gigaStaking.unstakingPositions.description")}
          </Text>
        </Flex>

        <Separator />

        <Box px="l">
          <UnstakingPosition {...pendingPosition} />
        </Box>
      </Flex>
    </Paper>
  )
}
