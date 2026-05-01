import {
  Flex,
  Pagination,
  Paper,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { gigaUnstakePositionsQuery } from "@/api/gigaStake"
import { UnstakingPosition } from "@/modules/staking/gigaStaking/UnstakingPosition"
import { useRpcProvider } from "@/providers/rpcProvider"

const MAX_ITEMS_PER_PAGE = 3

export const UnstakingPositions: FC = () => {
  const { t } = useTranslation("staking")
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const [currentPage, setCurrentPage] = useState(1)
  const { data: unstakingPositions } = useQuery(
    gigaUnstakePositionsQuery(rpc, account?.address ?? ""),
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const visiblePositions = unstakingPositions.slice(
    (currentPage - 1) * MAX_ITEMS_PER_PAGE,
    currentPage * MAX_ITEMS_PER_PAGE,
  )

  return (
    <Paper asChild>
      <Flex direction="column" py="l">
        <Flex direction="column" gap="xs" px="l" pb="l">
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

        <Flex direction="column" gap="m" px="l" pt="l">
          {visiblePositions.map((position) => (
            <UnstakingPosition
              key={`${position.unlock_at}-${position.amount}`}
              {...position}
            />
          ))}
        </Flex>

        <Pagination
          totalPages={Math.ceil(unstakingPositions.length / MAX_ITEMS_PER_PAGE)}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </Flex>
    </Paper>
  )
}
