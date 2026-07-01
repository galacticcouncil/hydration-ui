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
import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { gigaUnstakePositionsQuery } from "@/api/gigaStake"
import { PendingPosition } from "@/modules/staking/gigaStaking/pendingPositions/PendingPosition"
import { useRpcProvider } from "@/providers/rpcProvider"

const MAX_ITEMS_PER_PAGE = 3

export const PendingPositions: FC = () => {
  const { t } = useTranslation("staking")
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const [currentPage, setCurrentPage] = useState(1)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const { data: pendingPositions = [] } = useQuery(
    gigaUnstakePositionsQuery(rpc, account?.address ?? ""),
  )

  const visiblePositions = pendingPositions.slice(
    (currentPage - 1) * MAX_ITEMS_PER_PAGE,
    currentPage * MAX_ITEMS_PER_PAGE,
  )

  const visiblePositionsLength = visiblePositions.length

  useEffect(() => {
    if (visiblePositionsLength === 0) {
      setCurrentPage(Math.max(1, currentPage - 1))
    }
  }, [visiblePositionsLength, currentPage])

  if (!pendingPositions.length) {
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

        <Flex direction="column" gap="m" px="l">
          {visiblePositions.map((position, index) => (
            <PendingPosition
              key={`${position.voteAtBlock}-${index}`}
              {...position}
            />
          ))}
        </Flex>

        {pendingPositions.length > MAX_ITEMS_PER_PAGE && (
          <Pagination
            totalPages={Math.ceil(pendingPositions.length / MAX_ITEMS_PER_PAGE)}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </Flex>
    </Paper>
  )
}
